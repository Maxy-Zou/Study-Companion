import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Session } from '../models/Session';
import { Metrics } from '../models/Metrics';
import { COLORS } from '../utils/constants';
import { formatDuration, calculateAvgFatigueScore } from '../utils/statsAggregator';

interface SessionDetailModalProps {
  session: Session | null;
  metrics: Metrics[];
  visible: boolean;
  onClose: () => void;
}

export default function SessionDetailModal({
  session,
  metrics,
  visible,
  onClose,
}: SessionDetailModalProps) {
  if (!session) return null;

  const duration = session.endTs ? session.endTs - session.startTs : 0;
  const avgFatigue = calculateAvgFatigueScore(metrics);
  const totalBreaks = session.acceptedBreaks + session.ignoredBreaks;
  const acceptanceRate = totalBreaks > 0 ? Math.round((session.acceptedBreaks / totalBreaks) * 100) : 0;

  // Calculate metrics summary
  const avgBlinkRate =
    metrics.length > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + (m.blinkRatePerMin || 0), 0) / metrics.length
        )
      : 0;

  const avgEyeOpenness =
    metrics.length > 0
      ? (metrics.reduce((sum, m) => sum + (m.eyeOpennessAvg || 0), 0) / metrics.length).toFixed(2)
      : '0.00';

  const startDate = new Date(session.startTs);
  const endDate = session.endTs ? new Date(session.endTs) : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Time Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Started:</Text>
                <Text style={styles.infoValue}>
                  {startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ended:</Text>
                <Text style={styles.infoValue}>
                  {endDate
                    ? endDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'In progress'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duration:</Text>
                <Text style={[styles.infoValue, styles.highlight]}>{formatDuration(duration)}</Text>
              </View>
            </View>

            {/* Break Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breaks</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breaks Accepted:</Text>
                <Text style={[styles.infoValue, { color: COLORS.success }]}>
                  {session.acceptedBreaks}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Breaks Ignored:</Text>
                <Text style={[styles.infoValue, { color: COLORS.danger }]}>
                  {session.ignoredBreaks}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Acceptance Rate:</Text>
                <Text style={styles.infoValue}>{acceptanceRate}%</Text>
              </View>
            </View>

            {/* Fatigue Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fatigue Metrics</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Average Fatigue Score:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    styles.highlight,
                    {
                      color:
                        avgFatigue < 30
                          ? COLORS.success
                          : avgFatigue < 60
                          ? COLORS.warning
                          : COLORS.danger,
                    },
                  ]}
                >
                  {avgFatigue}/100
                </Text>
              </View>
              {session.baselineBlinkRate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Baseline Blink Rate:</Text>
                  <Text style={styles.infoValue}>{Math.round(session.baselineBlinkRate)}/min</Text>
                </View>
              )}
              {avgBlinkRate > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Avg Blink Rate:</Text>
                  <Text style={styles.infoValue}>{avgBlinkRate}/min</Text>
                </View>
              )}
              {parseFloat(avgEyeOpenness) > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Avg Eye Openness:</Text>
                  <Text style={styles.infoValue}>{avgEyeOpenness}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data Points:</Text>
                <Text style={styles.infoValue}>{metrics.length}</Text>
              </View>
            </View>

            {/* Session ID (for debugging) */}
            <View style={styles.debugSection}>
              <Text style={styles.debugText}>Session ID: {session.sessionId.substring(0, 8)}...</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  highlight: {
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  debugText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: 'monospace',
  },
});
