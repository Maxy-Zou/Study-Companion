export interface UserSettings {
  cameraEnabled: boolean;
  defaultWorkMinutes: number;           // Default: 25
  defaultBreakMinutes: number;          // Default: 5
  privacyAckVersion: string;            // e.g., "1.0"
  notificationsEnabled: boolean;
  userId: string;                       // Generated UUID
  azureTelemetryEnabled: boolean;       // Default: false
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  cameraEnabled: false,
  defaultWorkMinutes: 25,
  defaultBreakMinutes: 5,
  privacyAckVersion: '1.0',
  notificationsEnabled: true,
  userId: '',  // Will be generated on first run
  azureTelemetryEnabled: false,
};
