// Recommendation thresholds
export const RECOMMENDATION_THRESHOLDS = {
  TIME_THRESHOLD_MS: 50 * 60 * 1000,    // 50 minutes
  BLINK_RATE_DROP_PERCENT: 0.7,          // 30% drop threshold
  HIGH_FATIGUE_SCORE: 75,                // 0-100 scale
  SNOOZE_DURATION_MS: 5 * 60 * 1000,     // 5 minutes
};

// Break durations (in minutes)
export const BREAK_DURATIONS = {
  EYE_REST: 0.33,        // 20 seconds
  MOVEMENT: 3,
  HYDRATION: 1,
  FOCUS_RESET: 5,
};

// Session defaults
export const SESSION_DEFAULTS = {
  DEFAULT_WORK_MINUTES: 25,
  DEFAULT_BREAK_MINUTES: 5,
  BASELINE_CALIBRATION_MS: 2 * 60 * 1000,  // 2 minutes for baseline blink rate
};

// Camera processing
export const CAMERA_CONFIG = {
  FRAME_CAPTURE_INTERVAL_MS: 2000,    // Process at 0.5 fps
  METRICS_WINDOW_SIZE: 30,             // Keep last 30 data points (60 seconds)
};

// Storage
export const STORAGE_KEYS = {
  SETTINGS: '@settings',
  ONBOARDING_COMPLETE: '@onboarding_complete',
  LAST_SESSION_ID: '@last_session_id',
};

// Data retention
export const DATA_RETENTION = {
  DAYS_TO_KEEP: 30,
};

// Colors
export const COLORS = {
  primary: '#4A90E2',        // Calming blue
  secondary: '#50C878',      // Calming green
  background: '#F5F5F5',
  text: '#333333',
  textLight: '#666666',
  danger: '#E74C3C',
  warning: '#F39C12',
  success: '#27AE60',
  white: '#FFFFFF',
};
