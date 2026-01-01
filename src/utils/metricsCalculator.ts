import { Metrics } from '../models/Metrics';
import { FaceData } from '../components/CameraView';

interface EyeOpennessDataPoint {
  value: number;
  timestamp: number;
}

export class MetricsCalculator {
  private eyeOpennessHistory: EyeOpennessDataPoint[] = [];
  private readonly HISTORY_SIZE = 30; // Keep last 30 data points (60 seconds at 0.5 fps)
  private readonly BLINK_THRESHOLD = 0.3; // Eye openness below this is considered a blink
  private baselineBlinkRate: number | null = null;
  private baselineCalculated = false;

  /**
   * Add new face data and return calculated metrics
   */
  public processFaceData(faceData: FaceData, sessionId: string): Metrics {
    // Add to history
    this.eyeOpennessHistory.push({
      value: faceData.eyeOpennessAvg,
      timestamp: faceData.timestamp,
    });

    // Trim history to size
    if (this.eyeOpennessHistory.length > this.HISTORY_SIZE) {
      this.eyeOpennessHistory.shift();
    }

    // Calculate metrics
    const blinkRatePerMin = this.calculateBlinkRate();
    const fatigueScore = this.calculateFatigueScore(faceData.eyeOpennessAvg, blinkRatePerMin);

    // Calculate baseline after first 60 seconds (30 data points)
    if (!this.baselineCalculated && this.eyeOpennessHistory.length >= this.HISTORY_SIZE) {
      this.baselineBlinkRate = blinkRatePerMin;
      this.baselineCalculated = true;
      console.log('Baseline blink rate calculated:', this.baselineBlinkRate);
    }

    return {
      sessionId,
      ts: faceData.timestamp,
      blinkRatePerMin,
      yawnCount: 0, // Not implemented in MVP (MLKit limitation)
      eyeOpennessAvg: faceData.eyeOpennessAvg,
      fatigueScore,
    };
  }

  /**
   * Calculate blink rate from eye openness history
   * A blink is detected when eye openness drops below threshold then rises again
   */
  private calculateBlinkRate(): number {
    if (this.eyeOpennessHistory.length < 2) {
      return 0;
    }

    let blinkCount = 0;
    let wasBlinking = false;

    for (let i = 1; i < this.eyeOpennessHistory.length; i++) {
      const current = this.eyeOpennessHistory[i];
      const isBlinking = current.value < this.BLINK_THRESHOLD;

      // Detect blink: transition from not blinking to blinking back to not blinking
      if (wasBlinking && !isBlinking) {
        blinkCount++;
      }

      wasBlinking = isBlinking;
    }

    // Calculate time span
    const timeSpanMs = this.eyeOpennessHistory[this.eyeOpennessHistory.length - 1].timestamp -
                       this.eyeOpennessHistory[0].timestamp;
    const timeSpanMin = timeSpanMs / (60 * 1000);

    if (timeSpanMin === 0) return 0;

    return blinkCount / timeSpanMin;
  }

  /**
   * Calculate fatigue score (0-100, higher = more fatigued)
   * Based on:
   * - Low eye openness (tired eyes)
   * - Reduced blink rate compared to baseline
   */
  private calculateFatigueScore(eyeOpenness: number, currentBlinkRate: number): number {
    let score = 0;

    // Component 1: Low eye openness (0-50 points)
    // Normal eye openness is ~0.8-1.0, tired is ~0.5-0.7
    const eyeOpennessScore = Math.max(0, (1.0 - eyeOpenness) * 50);
    score += eyeOpennessScore;

    // Component 2: Blink rate deviation from baseline (0-50 points)
    if (this.baselineBlinkRate !== null) {
      const blinkRateRatio = currentBlinkRate / this.baselineBlinkRate;
      // Fatigue typically causes reduced blink rate
      if (blinkRateRatio < 1.0) {
        const blinkRateScore = (1.0 - blinkRateRatio) * 50;
        score += blinkRateScore;
      }
    }

    // Clamp to 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get recent metrics for visualization
   */
  public getRecentMetrics(): EyeOpennessDataPoint[] {
    return [...this.eyeOpennessHistory];
  }

  /**
   * Get baseline blink rate (calculated after first 2 minutes)
   */
  public getBaselineBlinkRate(): number | null {
    return this.baselineBlinkRate;
  }

  /**
   * Reset calculator (for new session)
   */
  public reset(): void {
    this.eyeOpennessHistory = [];
    this.baselineBlinkRate = null;
    this.baselineCalculated = false;
  }
}
