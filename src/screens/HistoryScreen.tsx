import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/constants';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Session History</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sessions</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Duration</Text>
          <Text style={styles.statValue}>0 min</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Break Acceptance</Text>
          <Text style={styles.statValue}>0%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Fatigue</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No sessions yet</Text>
        <Text style={styles.emptySubtext}>Start your first work session to see stats</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
