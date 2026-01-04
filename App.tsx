import * as React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { SettingsProvider, useSettings } from "./src/state/SettingsContext";
import { SessionProvider } from "./src/state/SessionContext";
import { MetricsProvider } from "./src/state/MetricsContext";

// Loading component shown while database initializes
function AppContent() {
  const { loading } = useSettings();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A4C93" />
      </View>
    );
  }

  return (
    <SessionProvider>
      <MetricsProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </MetricsProvider>
    </SessionProvider>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
});
