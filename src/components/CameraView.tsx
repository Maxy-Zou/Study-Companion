import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { COLORS, CAMERA_CONFIG } from '../utils/constants';

// Try to import camera modules - will fail in Expo Go
let ExpoCameraView: any = null;
let useCameraPermissions: any = () => [null, () => {}];
let FaceDetector: any = null;

try {
  const CameraModule = require('expo-camera');
  ExpoCameraView = CameraModule.CameraView;
  useCameraPermissions = CameraModule.useCameraPermissions;
} catch (e) {
  console.log('Camera not available in Expo Go');
}

try {
  FaceDetector = require('expo-face-detector');
} catch (e) {
  console.log('Face detector not available in Expo Go');
}

interface CameraViewProps {
  enabled: boolean;
  onFaceData?: (data: FaceData) => void;
}

export interface FaceData {
  eyeOpennessAvg: number;  // 0.0-1.0 scale
  timestamp: number;
}

export default function CameraView({ enabled, onFaceData }: CameraViewProps) {
  // If camera modules not available (Expo Go), show message
  if (!ExpoCameraView || !FaceDetector) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>Camera Not Available</Text>
        <Text style={styles.disabledSubtext}>
          Requires development build. Using timer-only mode.
        </Text>
      </View>
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [hasError, setHasError] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const processingRef = useRef(false);
  const faceDetectedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Request permission when enabled
  useEffect(() => {
    if (enabled && !permission?.granted) {
      requestPermission();
    }
  }, [enabled]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (faceDetectedTimeoutRef.current) {
        clearTimeout(faceDetectedTimeoutRef.current);
      }
    };
  }, []);

  const handleFacesDetected = ({ faces }: any) => {
    if (processingRef.current || !enabled || !onFaceData) return;

    processingRef.current = true;
    setTimeout(() => {
      processingRef.current = false;
    }, CAMERA_CONFIG.FRAME_CAPTURE_INTERVAL_MS);

    if (faces.length === 0) {
      // No face detected - set indicator to red
      setFaceDetected(false);
      return;
    }

    // Face detected - set indicator to green
    setFaceDetected(true);

    // Reset indicator after 3 seconds if no new faces detected
    if (faceDetectedTimeoutRef.current) {
      clearTimeout(faceDetectedTimeoutRef.current);
    }
    faceDetectedTimeoutRef.current = setTimeout(() => {
      setFaceDetected(false);
    }, 3000);

    // Use first detected face
    const face = faces[0];

    // Extract eye openness (expo-face-detector provides probabilities)
    const leftEyeOpen = face.leftEyeOpenProbability ?? 0.5;
    const rightEyeOpen = face.rightEyeOpenProbability ?? 0.5;
    const eyeOpennessAvg = (leftEyeOpen + rightEyeOpen) / 2;

    const faceData: FaceData = {
      eyeOpennessAvg,
      timestamp: Date.now(),
    };

    onFaceData(faceData);
  };

  if (!enabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>Camera Disabled</Text>
        <Text style={styles.disabledSubtext}>Enable in Settings for fatigue detection</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>Camera Permission Denied</Text>
        <Text style={styles.disabledSubtext}>Please enable in Settings</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>Camera Error</Text>
        <Text style={styles.disabledSubtext}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView
        style={styles.camera}
        facing="front"
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: CAMERA_CONFIG.FRAME_CAPTURE_INTERVAL_MS,
          tracking: true,
        }}
        onMountError={(error) => {
          console.error('Camera mount error:', error);
          setHasError(true);
          Alert.alert('Camera Error', 'Failed to initialize camera. Using timer-only mode.');
        }}
      />
      {/* Face detection indicator */}
      <View style={styles.indicatorContainer}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: faceDetected ? COLORS.success : COLORS.danger },
          ]}
        />
        <Text style={styles.indicatorText}>
          {faceDetected ? 'Face detected' : 'No face'}
        </Text>
      </View>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Analyzing fatigue...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.text,
  },
  camera: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
    alignItems: 'center',
  },
  overlayText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '500',
  },
  disabledContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  disabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  disabledSubtext: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
