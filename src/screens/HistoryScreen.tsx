import * as React from "react";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import { Session } from "../models/Session";
import { Metrics } from "../models/Metrics";
import { SessionStorage, MetricsStorage } from "../services/storageService";
import {
  calculateSessionStats,
  calculateDailyFatigueData,
  calculateAvgFatigueScore,
  getRecentSessions,
  formatDuration,
  formatSessionDate,
} from "../utils/statsAggregator";
import MetricsChart from "../components/MetricsChart";
import SessionDetailModal from "../components/SessionDetailModal";

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [metricsMap, setMetricsMap] = useState<Map<string, Metrics[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Reload data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all sessions
      const allSessions = await SessionStorage.getAll();

      // Filter to completed sessions only
      const completedSessions = allSessions.filter((s) => s.endTs !== null);
      setSessions(completedSessions);

      // Load metrics for each session
      const metricsData = new Map<string, Metrics[]>();
      for (const session of completedSessions) {
        const metrics = await MetricsStorage.getBySessionId(session.sessionId);
        metricsData.set(session.sessionId, metrics);
      }
      setMetricsMap(metricsData);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for last 7 days
  const recentSessions = getRecentSessions(sessions, 7);
  const stats = calculateSessionStats(recentSessions);

  // Calculate average fatigue score from all metrics
  const allMetrics: Metrics[] = [];
  for (const metrics of metricsMap.values()) {
    allMetrics.push(...metrics);
  }
  const avgFatigue = calculateAvgFatigueScore(allMetrics);

  // Prepare chart data
  const dailyFatigueData = calculateDailyFatigueData(
    recentSessions,
    metricsMap
  );

  const renderSessionItem = ({ item }: { item: Session }) => {
    const duration = item.endTs ? item.endTs - item.startTs : 0;
    const metrics = metricsMap.get(item.sessionId) || [];
    const sessionFatigue = calculateAvgFatigueScore(metrics);

    return (
      <TouchableOpacity
        style={styles.sessionCard}
        onPress={() => {
          setSelectedSession(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>
            {formatSessionDate(item.startTs)}
          </Text>
          <Text style={styles.sessionDuration}>{formatDuration(duration)}</Text>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Fatigue</Text>
            <Text
              style={[
                styles.sessionStatValue,
                {
                  color:
                    sessionFatigue < 30
                      ? COLORS.success
                      : sessionFatigue < 60
                      ? COLORS.warning
                      : COLORS.danger,
                },
              ]}
            >
              {sessionFatigue}
            </Text>
          </View>

          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Breaks Accepted</Text>
            <Text style={styles.sessionStatValue}>{item.acceptedBreaks}</Text>
          </View>

          <View style={styles.sessionStat}>
            <Text style={styles.sessionStatLabel}>Breaks Ignored</Text>
            <Text style={styles.sessionStatValue}>{item.ignoredBreaks}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  const hasData = sessions.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Session History</Text>

      {/* Summary Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sessions</Text>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Duration</Text>
          <Text style={styles.statValue}>{stats.avgSessionDuration} min</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Break Acceptance</Text>
          <Text style={styles.statValue}>{stats.breakAcceptanceRate}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Fatigue</Text>
          <Text style={styles.statValue}>
            {avgFatigue > 0 ? avgFatigue : "-"}
          </Text>
        </View>
      </View>

      {/* Fatigue Trend Chart */}
      {hasData && (
        <MetricsChart data={dailyFatigueData} title="7-Day Fatigue Trend" />
      )}

      {/* Session List */}
      {hasData ? (
        <View style={styles.sessionListContainer}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => item.sessionId}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No sessions yet</Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySubtext}>
            Start your first work session to see stats
          </Text>
        </View>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        metrics={
          selectedSession ? metricsMap.get(selectedSession.sessionId) || [] : []
        }
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedSession(null);
        }}
      />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  sessionListContainer: {
    marginTop: 10,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  sessionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sessionStat: {
    alignItems: "center",
  },
  sessionStatLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  sessionStatValue: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
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
