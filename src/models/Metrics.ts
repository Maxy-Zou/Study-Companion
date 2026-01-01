export interface Metrics {
  sessionId: string;
  ts: number;                           // Unix timestamp (ms)
  blinkRatePerMin: number | null;       // null if camera disabled
  yawnCount: number;                    // Always 0 for MVP (MLKit limitation)
  eyeOpennessAvg: number | null;        // 0.0-1.0 scale
  fatigueScore: number;                 // 0-100 (100 = most fatigued)
  selfReport?: number;                  // 1-5 scale (if manual check-in)
}
