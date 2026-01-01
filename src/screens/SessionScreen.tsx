import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';

export default function SessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>25:00</Text>
        <Text style={styles.timerLabel}>Work Time</Text>
      </View>

      <View style={styles.fatigueContainer}>
        <Text style={styles.fatigueLabel}>Fatigue Level</Text>
        <Text style={styles.fatigueValue}>Low</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.pauseButton]}>
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.endButton]}>
          <Text style={styles.buttonText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timerLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 10,
  },
  fatigueContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  fatigueLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  fatigueValue: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.success,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  endButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
