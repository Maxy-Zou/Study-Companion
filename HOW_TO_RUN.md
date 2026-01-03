# How to Run Study Companion

## Quick Start

### Prerequisites
- Node.js v20.15.1 or higher
- npm 10.7.0 or higher
- Xcode (for iOS development)
- Expo Go app installed on your iOS device (optional, for physical device testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Study-Companion
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```
Note: `--legacy-peer-deps` is required due to react-dom version conflicts

### Running the App

#### iOS Simulator (Recommended for Development)
```bash
npm run ios
```
or
```bash
npx expo start --ios
```

This will:
- Start the Metro bundler
- Launch the iOS Simulator
- Open the app automatically

#### iOS Physical Device
```bash
npx expo start
```
Then scan the QR code with your iPhone camera or Expo Go app.

#### Web Browser
```bash
npm run web
```
Note: Camera features are disabled on web for privacy

#### Android Emulator
```bash
npm run android
```

### Stopping the Server

Press `Ctrl+C` in the terminal, or:
```bash
lsof -ti:8081 | xargs kill
```

## For ML Backend Team

### API Integration Points

The frontend expects these endpoints from your ML backend:

#### 1. Fatigue Detection API
**Endpoint:** POST `/api/fatigue-detect`
**Request Body:**
```json
{
  "image": "base64-encoded-image-string",
  "sessionId": "uuid-string"
}
```
**Response:**
```json
{
  "fatigueScore": 0.75,
  "confidence": 0.92,
  "features": {
    "eyeOpenness": 0.3,
    "yawnDetected": false,
    "headPose": "forward"
  },
  "recommendation": "BREAK_RECOMMENDED" | "CONTINUE"
}
```

#### 2. Session Analysis API
**Endpoint:** GET `/api/session/{sessionId}/analysis`
**Response:**
```json
{
  "productivity": 0.85,
  "focusScore": 0.78,
  "breakEffectiveness": 0.92,
  "insights": [
    "Peak focus at 10-11 AM",
    "Break recommendations improved alertness by 35%"
  ]
}
```

### Configuration

ML backend URL is configured in:
```
src/services/fatigueDetector.ts
```

To update the backend endpoint:
```typescript
const ML_BACKEND_URL = 'http://localhost:5000'; // Change this
```

### Testing ML Integration

1. Start your ML backend server
2. Update the backend URL in `fatigueDetector.ts`
3. Run the app: `npm run ios`
4. Grant camera permissions when prompted
5. Start a study session
6. Monitor console logs for API calls:
```bash
npx expo start --ios | grep "ML Backend"
```

### Camera Access

**Important:** Camera is OFF by default for privacy. Users must explicitly enable it in Settings.

Flow:
1. User opens app → sees onboarding about privacy
2. User navigates to Settings → toggles "Enable Camera"
3. App requests camera permissions
4. Camera activates only during active study sessions

### Data Flow

```
User Study Session
    ↓
Camera captures frame (every 3-5 seconds)
    ↓
Base64 encode image
    ↓
POST to ML Backend /api/fatigue-detect
    ↓
Receive fatigue score
    ↓
If score > threshold → Show break recommendation
    ↓
Log metrics to local SQLite database
```

### Local Database Schema

Session data is stored in SQLite:

**sessions table:**
```sql
CREATE TABLE sessions (
  sessionId TEXT PRIMARY KEY,
  startTs INTEGER,
  endTs INTEGER,
  duration INTEGER,
  state TEXT
);
```

**metrics table:**
```sql
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY,
  sessionId TEXT,
  timestamp INTEGER,
  fatigueScore REAL,
  eyeOpenness REAL,
  yawnCount INTEGER
);
```

Access database file at:
```
~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Library/LocalDatabase/SQLite/study-companion.db
```

### Common Issues

**Issue:** "Network request failed" when calling ML backend
**Solution:**
- Ensure ML backend is running
- Use `http://localhost:5000` for iOS Simulator
- Use your computer's local IP (e.g., `http://192.168.1.100:5000`) for physical devices

**Issue:** Camera not working
**Solution:**
- Check Settings → Enable Camera is turned ON
- Verify camera permissions granted
- Note: Camera doesn't work in Expo Go on iOS - requires custom development build

**Issue:** "crypto.getRandomValues() not supported"
**Solution:** Already fixed - ensure `react-native-get-random-values` import is first in `index.ts`

### Development Tips

1. **Hot Reload:** Shake device or press `Cmd+D` in simulator → Enable Fast Refresh
2. **Debug Menu:** Shake device or `Cmd+D` → Open debug menu
3. **Logs:** `npx expo start --ios` shows all console.log output
4. **Clear Cache:** `npx expo start --clear` if seeing stale data

### Production Build

For production iOS build:
```bash
eas build --platform ios
```

For production Android build:
```bash
eas build --platform android
```

Note: Requires Expo EAS account setup

## Contact

For issues with the frontend app, contact the main developer.
For ML backend integration issues, coordinate between teams.
