import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

interface CameraViewProps {
  enabled: boolean;
  onFaceData?: (data: FaceData) => void;
}

export interface FaceData {
  eyeOpennessAvg: number;  // 0.0-1.0 scale
  timestamp: number;
}

// Web version of CameraView - camera features not available on web
export default function CameraView({ enabled }: CameraViewProps) {
  return (
    <View style={styles.disabledContainer}>
      <Text style={styles.disabledText}>Camera Not Available</Text>
      <Text style={styles.disabledSubtext}>Camera features only work on mobile apps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
