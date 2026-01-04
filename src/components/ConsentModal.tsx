import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS } from "../utils/constants";

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({
  visible,
  onAccept,
  onDecline,
}: ConsentModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>📷 Camera Permission</Text>
            <Text style={styles.subtitle}>On-Device Fatigue Detection</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What We Do:</Text>
              <Text style={styles.bulletPoint}>
                ✓ Analyze your face every 2 seconds
              </Text>
              <Text style={styles.bulletPoint}>
                ✓ Detect blink rate and eye openness
              </Text>
              <Text style={styles.bulletPoint}>
                ✓ Calculate fatigue score (0-100)
              </Text>
              <Text style={styles.bulletPoint}>
                ✓ All processing happens ON YOUR DEVICE
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What We DON'T Do:</Text>
              <Text style={styles.bulletPoint}>
                ✗ Store or save any photos/videos
              </Text>
              <Text style={styles.bulletPoint}>
                ✗ Upload images to the cloud
              </Text>
              <Text style={styles.bulletPoint}>
                ✗ Identify or recognize your face
              </Text>
              <Text style={styles.bulletPoint}>
                ✗ Infer emotions or expressions
              </Text>
              <Text style={styles.bulletPoint}>
                ✗ Share data with employers
              </Text>
            </View>

            <View style={styles.privacyBox}>
              <Text style={styles.privacyTitle}>🔒 Privacy Guarantee</Text>
              <Text style={styles.privacyText}>
                Only numeric metrics (e.g., "blink rate: 15/min") are stored
                locally. No images leave your device. Ever.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.footnote}>
                You can disable camera access anytime in Settings. The app works
                fully without camera.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Accept & Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    paddingLeft: 8,
  },
  privacyBox: {
    backgroundColor: COLORS.primary + "15",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
