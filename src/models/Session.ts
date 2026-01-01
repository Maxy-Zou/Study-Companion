export interface Session {
  sessionId: string;                    // UUID
  startTs: number;                      // Unix timestamp (ms)
  endTs: number | null;
  workBlocksCompleted: number;
  acceptedBreaks: number;
  ignoredBreaks: number;
  baselineBlinkRate?: number;           // Calculated in first 2 min
  currentBlockStartTs: number;
}

export enum SessionState {
  IDLE = 'IDLE',           // No active session
  WORKING = 'WORKING',     // Work block in progress
  BREAK = 'BREAK',         // Break time
  PAUSED = 'PAUSED'        // User paused session
}

export enum SessionEvent {
  START_WORK = 'START_WORK',
  COMPLETE_WORK_BLOCK = 'COMPLETE_WORK_BLOCK',
  START_BREAK = 'START_BREAK',
  COMPLETE_BREAK = 'COMPLETE_BREAK',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  END_SESSION = 'END_SESSION',
  ACCEPT_BREAK = 'ACCEPT_BREAK',
  IGNORE_BREAK = 'IGNORE_BREAK',
}
