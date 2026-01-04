import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useSettings } from "../state/SettingsContext";
import ConsentModal from "../components/ConsentModal";

// Conditionally import Camera (only on native platforms)
let Camera: any;
if (Platform.OS !== "web") {
  Camera = require("expo-camera").Camera;
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleCameraToggle = async (value: boolean) => {
    if (value && !settings.cameraEnabled) {
      // Show consent modal when enabling camera
      setShowConsentModal(true);
    } else {
      // Directly disable camera
      await updateSettings({ cameraEnabled: false });
    }
  };

  const handleConsentAccept = async () => {
    setShowConsentModal(false);

    // On web, camera not available
    if (Platform.OS === "web") {
      Alert.alert(
        "Camera Not Available",
        "Camera features only work on mobile apps.",
        [{ text: "OK" }]
      );
      return;
    }

    // Request OS-level camera permission
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      await updateSettings({ cameraEnabled: true });
    } else {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings to use fatigue detection.",
        [{ text: "OK" }]
      );
    }
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
  };

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Camera Fatigue Detection</Text>
            <Text style={styles.settingDescription}>
              On-device face analysis for blink rate tracking
            </Text>
          </View>
          <Switch
            value={settings.cameraEnabled}
            onValueChange={handleCameraToggle}
            trackColor={{ false: "#CCC", true: COLORS.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Sync to Cloud</Text>
            <Text style={styles.settingDescription}>
              Upload anonymized metrics to Azure (optional)
            </Text>
          </View>
          <Switch
            value={settings.azureTelemetryEnabled}
            onValueChange={(value) =>
              handleToggle("azureTelemetryEnabled", value)
            }
            trackColor={{ false: "#CCC", true: COLORS.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Break Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified when it's time for a break
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              handleToggle("notificationsEnabled", value)
            }
            trackColor={{ false: "#CCC", true: COLORS.primary }}
          />
        </View>
      </View>

      <View style={styles.privacyNotice}>
        <Text style={styles.privacyTitle}>🔒 Privacy First</Text>
        <Text style={styles.privacyText}>
          All camera processing happens on your device. No images are ever
          stored or uploaded.
        </Text>
      </View>

      <ConsentModal
        visible={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  privacyNotice: {
    backgroundColor: COLORS.primary + "15",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
