import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SESSION_DEFAULTS } from '../utils/constants';
import { useSession } from '../state/SessionContext';
import { useSettings } from '../state/SettingsContext';
import { SessionState } from '../models/Session';
import { useSessionTimer, formatTime } from '../hooks/useSessionTimer';

export default function SessionScreen() {
  const navigation = useNavigation();
  const { currentState, pauseSession, resumeSession, endSession, completeBreak } = useSession();
  const { settings } = useSettings();

  // Determine timer duration based on current state
  const isBreak = currentState === SessionState.BREAK;
  const timerDuration = isBreak ? settings.defaultBreakMinutes : settings.defaultWorkMinutes;

  const [timerState, timerControls] = useSessionTimer({
    durationMinutes: timerDuration,
    autoStart: true,
    onComplete: () => {
      if (isBreak) {
        // Break completed, return to work
        completeBreak();
      } else {
        // Work block completed, could trigger break recommendation here
        Alert.alert('Work Block Complete', 'Time for a break!');
      }
    },
  });

  // Reset timer when switching between work/break
  useEffect(() => {
    timerControls.setDuration(timerDuration);
    if (currentState === SessionState.WORKING || currentState === SessionState.BREAK) {
      timerControls.start();
    }
  }, [currentState]);

  // Handle pause/resume based on session state
  useEffect(() => {
    if (currentState === SessionState.PAUSED && timerState.isRunning) {
      timerControls.pause();
    } else if (currentState === SessionState.WORKING && !timerState.isRunning && !timerState.isCompleted) {
      timerControls.resume();
    }
  }, [currentState]);

  const handlePauseResume = () => {
    if (currentState === SessionState.PAUSED) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleEnd = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: () => {
            endSession();
            navigation.navigate('Home' as never);
          },
        },
      ]
    );
  };

  if (currentState === SessionState.IDLE) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Active Session</Text>
        <Text style={styles.subtitle}>Start a session from the Home screen</Text>
      </View>
    );
  }

  const timerLabel = isBreak ? 'Break Time' : currentState === SessionState.PAUSED ? 'Paused' : 'Work Time';
  const pauseButtonText = currentState === SessionState.PAUSED ? 'Resume' : 'Pause';

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(timerState.remainingMs)}</Text>
        <Text style={styles.timerLabel}>{timerLabel}</Text>
      </View>

      <View style={styles.fatigueContainer}>
        <Text style={styles.fatigueLabel}>Fatigue Level</Text>
        <Text style={styles.fatigueValue}>Low</Text>
        <Text style={styles.fatigueSubtext}>(Camera disabled)</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.pauseButton]}
          onPress={handlePauseResume}
        >
          <Text style={styles.buttonText}>{pauseButtonText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.endButton]} onPress={handleEnd}>
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
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
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
  fatigueSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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
