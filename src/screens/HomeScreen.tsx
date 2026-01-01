import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Companion</Text>
      <Text style={styles.subtitle}>Privacy-First Mental Fatigue Management</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Start Work Session</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Sessions This Week</Text>
        <Text style={styles.statsValue}>0</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
