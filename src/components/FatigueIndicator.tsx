import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

interface FatigueIndicatorProps {
  score: number; // 0-100
  cameraEnabled: boolean;
}

export default function FatigueIndicator({ score, cameraEnabled }: FatigueIndicatorProps) {
  // Determine color and label based on score
  const getFatigueLevel = (score: number): { label: string; color: string } => {
    if (score < 30) {
      return { label: 'Low', color: COLORS.success };
    } else if (score < 60) {
      return { label: 'Moderate', color: COLORS.warning };
    } else {
      return { label: 'High', color: COLORS.danger };
    }
  };

  const { label, color } = getFatigueLevel(score);

  // Calculate gauge fill percentage
  const fillPercentage = Math.min(100, Math.max(0, score));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fatigue Level</Text>

      {/* Gauge bar */}
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBackground}>
          <View
            style={[
              styles.gaugeFill,
              {
                width: `${fillPercentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.gaugeLabels}>
          <Text style={styles.gaugeLabelText}>0</Text>
          <Text style={styles.gaugeLabelText}>50</Text>
          <Text style={styles.gaugeLabelText}>100</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusValue, { color }]}>{label}</Text>
        {!cameraEnabled && (
          <Text style={styles.statusSubtext}>(Camera disabled)</Text>
        )}
        {cameraEnabled && score < 30 && (
          <Text style={styles.statusSubtext}>You're doing great!</Text>
        )}
      </View>

      {/* Score */}
      {cameraEnabled && (
        <Text style={styles.scoreText}>Score: {Math.round(score)}/100</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  gaugeContainer: {
    width: '80%',
    marginBottom: 16,
  },
  gaugeBackground: {
    height: 12,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.3s ease',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gaugeLabelText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  scoreText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
