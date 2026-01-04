import * as React from "react";
import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import { useSession } from "../state/SessionContext";
import { SessionStorage } from "../services/storageService";
import { SessionState } from "../models/Session";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { startSession, currentState } = useSession();
  const [weeklySessionCount, setWeeklySessionCount] = useState(0);

  // Load weekly session count whenever screen comes into focus
  const loadStats = useCallback(async () => {
    try {
      const sessions = await SessionStorage.getAll();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentSessions = sessions.filter((s) => s.startTs > oneWeekAgo);
      setWeeklySessionCount(recentSessions.length);
    } catch (error) {
      console.error("Failed to load weekly sessions:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleStartSession = () => {
    startSession();
    // Navigate to Session screen
    (navigation as any).navigate("Session");
  };

  const isSessionActive = currentState !== SessionState.IDLE;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Companion</Text>
      <Text style={styles.subtitle}>
        Privacy-First Mental Fatigue Management
      </Text>

      <TouchableOpacity
        style={[styles.button, isSessionActive && styles.buttonDisabled]}
        onPress={handleStartSession}
        disabled={isSessionActive}
      >
        <Text style={styles.buttonText}>
          {isSessionActive ? "Session Active" : "Start Work Session"}
        </Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Sessions This Week</Text>
        <Text style={styles.statsValue}>{weeklySessionCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  statsContainer: {
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
