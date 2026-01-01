export interface BreakRecommendation {
  type: 'TIME_BASED' | 'EYE_STRAIN' | 'MOVEMENT' | 'FATIGUE';
  message: string;                      // User-facing explanation
  duration: number;                     // Minutes
  priority: number;                     // 1-5 (5 = most urgent)
  timestamp: number;
}
