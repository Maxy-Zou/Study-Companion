import { Session } from '../models/Session';
import { Metrics } from '../models/Metrics';

export interface SessionStats {
  totalSessions: number;
  totalWorkMinutes: number;
  avgSessionDuration: number;
  breakAcceptanceRate: number;
  avgFatigueScore: number;
  totalAcceptedBreaks: number;
  totalIgnoredBreaks: number;
}

export interface DailyFatigueData {
  date: string; // YYYY-MM-DD format
  avgFatigueScore: number;
  sessionCount: number;
}

/**
 * Calculate aggregate statistics for a list of sessions
 */
export function calculateSessionStats(sessions: Session[]): SessionStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalWorkMinutes: 0,
      avgSessionDuration: 0,
      breakAcceptanceRate: 0,
      avgFatigueScore: 0,
      totalAcceptedBreaks: 0,
      totalIgnoredBreaks: 0,
    };
  }

  let totalDuration = 0;
  let totalAcceptedBreaks = 0;
  let totalIgnoredBreaks = 0;

  for (const session of sessions) {
    if (session.endTs) {
      totalDuration += session.endTs - session.startTs;
    }
    totalAcceptedBreaks += session.acceptedBreaks;
    totalIgnoredBreaks += session.ignoredBreaks;
  }

  const totalBreaks = totalAcceptedBreaks + totalIgnoredBreaks;
  const breakAcceptanceRate = totalBreaks > 0 ? (totalAcceptedBreaks / totalBreaks) * 100 : 0;
  const avgSessionDuration = totalDuration / sessions.length / (1000 * 60); // Convert to minutes

  return {
    totalSessions: sessions.length,
    totalWorkMinutes: Math.round(totalDuration / (1000 * 60)),
    avgSessionDuration: Math.round(avgSessionDuration),
    breakAcceptanceRate: Math.round(breakAcceptanceRate),
    avgFatigueScore: 0, // Will be calculated with metrics
    totalAcceptedBreaks,
    totalIgnoredBreaks,
  };
}

/**
 * Calculate average fatigue score from metrics
 */
export function calculateAvgFatigueScore(metrics: Metrics[]): number {
  if (metrics.length === 0) return 0;

  const sum = metrics.reduce((acc, m) => acc + m.fatigueScore, 0);
  return Math.round(sum / metrics.length);
}

/**
 * Group sessions by date and calculate daily average fatigue
 */
export function calculateDailyFatigueData(
  sessions: Session[],
  metricsMap: Map<string, Metrics[]>
): DailyFatigueData[] {
  const dailyData = new Map<string, { totalFatigue: number; count: number; sessionCount: number }>();

  for (const session of sessions) {
    const date = new Date(session.startTs).toISOString().split('T')[0]; // YYYY-MM-DD
    const metrics = metricsMap.get(session.sessionId) || [];

    if (!dailyData.has(date)) {
      dailyData.set(date, { totalFatigue: 0, count: 0, sessionCount: 0 });
    }

    const dayData = dailyData.get(date)!;
    dayData.sessionCount += 1;

    for (const metric of metrics) {
      dayData.totalFatigue += metric.fatigueScore;
      dayData.count += 1;
    }
  }

  // Convert to array and calculate averages
  const result: DailyFatigueData[] = [];
  for (const [date, data] of dailyData.entries()) {
    result.push({
      date,
      avgFatigueScore: data.count > 0 ? Math.round(data.totalFatigue / data.count) : 0,
      sessionCount: data.sessionCount,
    });
  }

  // Sort by date
  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

/**
 * Get last N days of sessions
 */
export function getRecentSessions(sessions: Session[], days: number): Session[] {
  const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions.filter((s) => s.startTs >= cutoffDate);
}

/**
 * Format duration in milliseconds to readable string
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format timestamp to readable date/time
 */
export function formatSessionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
