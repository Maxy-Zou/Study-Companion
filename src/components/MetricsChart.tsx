import * as React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { COLORS } from "../utils/constants";
import { DailyFatigueData } from "../utils/statsAggregator";

interface MetricsChartProps {
  data: DailyFatigueData[];
  title?: string;
}

export default function MetricsChart({
  data,
  title = "7-Day Fatigue Trend",
}: MetricsChartProps) {
  const screenWidth = Dimensions.get("window").width - 40; // Account for padding

  // Prepare chart data
  const prepareChartData = () => {
    if (data.length === 0) {
      // Show empty state with placeholder data
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    // Get last 7 days
    const last7Days = data.slice(-7);

    // Create labels from dates (show day of week)
    const labels = last7Days.map((d) => {
      const date = new Date(d.date);
      return date
        .toLocaleDateString("en-US", { weekday: "short" })
        .substring(0, 3);
    });

    // Extract fatigue scores
    const fatigueScores = last7Days.map((d) => d.avgFatigueScore);

    return {
      labels,
      datasets: [
        {
          data: fatigueScores,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Purple gradient
          strokeWidth: 3,
        },
      ],
    };
  };

  const chartData = prepareChartData();
  const hasData = data.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: COLORS.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: "", // solid line
            stroke: "#E0E0E0",
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        fromZero
        yAxisSuffix=""
        yAxisInterval={1}
        segments={4}
      />

      {!hasData && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No session data yet</Text>
          <Text style={styles.emptySubtext}>
            Start a session to see your fatigue trends
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.success }]}
          />
          <Text style={styles.legendText}>Low Fatigue (0-30)</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.warning }]}
          />
          <Text style={styles.legendText}>Moderate (30-60)</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.danger }]}
          />
          <Text style={styles.legendText}>High (60-100)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
