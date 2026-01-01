import { Session } from '../models/Session';
import { Metrics } from '../models/Metrics';
import { BreakRecommendation } from '../models/Recommendation';
import { RECOMMENDATION_THRESHOLDS, BREAK_DURATIONS } from '../utils/constants';

interface RecommendationRule {
  id: string;
  condition: (session: Session, metrics: Metrics[], currentFatigueScore: number) => boolean;
  createRecommendation: () => BreakRecommendation;
  priority: number;
}

const RULES: RecommendationRule[] = [
  // Rule 1: Time threshold - worked continuously for 50+ minutes
  {
    id: 'TIME_THRESHOLD',
    priority: 2,
    condition: (session, metrics, fatigueScore) => {
      const workDuration = Date.now() - session.currentBlockStartTs;
      return workDuration > RECOMMENDATION_THRESHOLDS.TIME_THRESHOLD_MS;
    },
    createRecommendation: () => ({
      type: 'TIME_BASED',
      message: 'You\'ve been working for 50+ minutes continuously. Time for a break!',
      duration: BREAK_DURATIONS.FOCUS_RESET,
      priority: 2,
      timestamp: Date.now(),
    }),
  },

  // Rule 2: Blink rate drop - 30% below baseline
  {
    id: 'BLINK_RATE_DROP',
    priority: 3,
    condition: (session, metrics, fatigueScore) => {
      if (metrics.length < 5 || !session.baselineBlinkRate) return false;

      // Get recent metrics (last 5 data points = 10 seconds)
      const recentMetrics = metrics.slice(-5);
      const avgBlinkRate = recentMetrics.reduce((sum, m) => sum + (m.blinkRatePerMin || 0), 0) / recentMetrics.length;

      // Check if current blink rate is 30% below baseline
      return avgBlinkRate < session.baselineBlinkRate * RECOMMENDATION_THRESHOLDS.BLINK_RATE_DROP_PERCENT;
    },
    createRecommendation: () => ({
      type: 'EYE_STRAIN',
      message: 'Your blink rate dropped significantly. Rest your eyes for 20 seconds.',
      duration: BREAK_DURATIONS.EYE_REST,
      priority: 3,
      timestamp: Date.now(),
    }),
  },

  // Rule 3: High fatigue score
  {
    id: 'HIGH_FATIGUE_SCORE',
    priority: 4,
    condition: (session, metrics, fatigueScore) => {
      return fatigueScore > RECOMMENDATION_THRESHOLDS.HIGH_FATIGUE_SCORE;
    },
    createRecommendation: () => ({
      type: 'FATIGUE',
      message: 'High fatigue detected. Take a 3-minute movement break.',
      duration: BREAK_DURATIONS.MOVEMENT,
      priority: 4,
      timestamp: Date.now(),
    }),
  },
];

export class RecommendationEngine {
  private lastRecommendationTime: number = 0;
  private snoozedUntil: number = 0;
  private readonly MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between recommendations

  /**
   * Evaluate all rules and return highest priority recommendation
   */
  public evaluate(
    session: Session,
    metrics: Metrics[],
    currentFatigueScore: number
  ): BreakRecommendation | null {
    const now = Date.now();

    // Check if snoozed
    if (now < this.snoozedUntil) {
      return null;
    }

    // Check minimum interval between recommendations
    if (now - this.lastRecommendationTime < this.MIN_INTERVAL_MS) {
      return null;
    }

    // Evaluate all rules
    const triggeredRules = RULES.filter(rule =>
      rule.condition(session, metrics, currentFatigueScore)
    );

    if (triggeredRules.length === 0) {
      return null;
    }

    // Return highest priority recommendation
    const topRule = triggeredRules.sort((a, b) => b.priority - a.priority)[0];
    const recommendation = topRule.createRecommendation();

    this.lastRecommendationTime = now;

    console.log('Recommendation triggered:', recommendation.type);
    return recommendation;
  }

  /**
   * Snooze recommendations for specified duration
   */
  public snooze(durationMs: number = RECOMMENDATION_THRESHOLDS.SNOOZE_DURATION_MS): void {
    this.snoozedUntil = Date.now() + durationMs;
    console.log('Recommendations snoozed for', durationMs / 1000 / 60, 'minutes');
  }

  /**
   * Reset recommendation state (for new session)
   */
  public reset(): void {
    this.lastRecommendationTime = 0;
    this.snoozedUntil = 0;
  }

  /**
   * Check if currently snoozed
   */
  public isSnoozed(): boolean {
    return Date.now() < this.snoozedUntil;
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();
