import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BreakRecommendation } from '../models/Recommendation';
import { COLORS } from '../utils/constants';

interface BreakRecommendationModalProps {
  recommendation: BreakRecommendation | null;
  onAccept: () => void;
  onSnooze: () => void;
  onIgnore: () => void;
}

export default function BreakRecommendationModal({
  recommendation,
  onAccept,
  onSnooze,
  onIgnore,
}: BreakRecommendationModalProps) {
  if (!recommendation) return null;

  // Get icon and color based on type
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'TIME_BASED':
        return { icon: '⏰', color: COLORS.primary };
      case 'EYE_STRAIN':
        return { icon: '👁️', color: COLORS.warning };
      case 'MOVEMENT':
        return { icon: '🚶', color: COLORS.success };
      case 'FATIGUE':
        return { icon: '😴', color: COLORS.danger };
      default:
        return { icon: '💡', color: COLORS.primary };
    }
  };

  const { icon, color } = getTypeInfo(recommendation.type);

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    } else if (minutes === 1) {
      return '1 minute';
    } else {
      return `${Math.round(minutes)} minutes`;
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onIgnore}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Break Recommended</Text>

          {/* Message */}
          <Text style={styles.message}>{recommendation.message}</Text>

          {/* Duration */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Suggested Duration:</Text>
            <Text style={[styles.durationValue, { color }]}>
              {formatDuration(recommendation.duration)}
            </Text>
          </View>

          {/* Priority indicator */}
          {recommendation.priority >= 4 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>⚠️ High Priority</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.ignoreButton} onPress={onIgnore}>
              <Text style={styles.ignoreButtonText}>Ignore</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.snoozeButton} onPress={onSnooze}>
              <Text style={styles.snoozeButtonText}>Snooze 5m</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.acceptButton, { backgroundColor: color }]} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Take Break</Text>
            </TouchableOpacity>
          </View>

          {/* Transparency note */}
          <Text style={styles.footnote}>
            💡 Tip: Accepting breaks improves your focus and reduces eye strain
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  urgentBadge: {
    backgroundColor: COLORS.danger + '20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  urgentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  ignoreButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    alignItems: 'center',
  },
  ignoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  snoozeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  snoozeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  acceptButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
});
