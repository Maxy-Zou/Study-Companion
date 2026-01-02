import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { COLORS } from '../utils/constants';
import { useSettings } from '../state/SettingsContext';

// Conditionally import Camera (only on native platforms)
let Camera: any;
if (Platform.OS !== 'web') {
  Camera = require('expo-camera').Camera;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const { updateSettings } = useSettings();

  const handleCameraEnable = async () => {
    // On web, camera not available
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera Not Available',
        'Camera features only work on mobile apps. You can still use the app with timer-based breaks.',
        [{ text: 'OK', onPress: () => setCurrentStep(2) }]
      );
      return;
    }

    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status === 'granted') {
      await updateSettings({ cameraEnabled: true });
      setCurrentStep(2);
    } else {
      Alert.alert(
        'Camera Permission Denied',
        'You can enable camera later in Settings.',
        [{ text: 'OK', onPress: () => setCurrentStep(2) }]
      );
    }
  };

  const handleSkipCamera = () => {
    setCurrentStep(2);
  };

  const handleComplete = async () => {
    // Save work/break durations
    await updateSettings({
      defaultWorkMinutes: workMinutes,
      defaultBreakMinutes: breakMinutes,
      privacyAckVersion: '1.0',
    });

    onComplete();
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>Welcome to Study Companion</Text>
      <Text style={styles.subtitle}>Privacy-First Mental Fatigue Management</Text>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🧠</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Adaptive Break Recommendations</Text>
            <Text style={styles.featureDescription}>
              Get personalized break suggestions based on your actual fatigue levels
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👁️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Optional Fatigue Detection</Text>
            <Text style={styles.featureDescription}>
              Track blink rate and eye openness for smarter recommendations
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>100% Private</Text>
            <Text style={styles.featureDescription}>
              All processing happens on your device. No images stored or uploaded.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentStep(1)}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPrivacy = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🔒</Text>
      <Text style={styles.title}>Your Privacy Matters</Text>
      <Text style={styles.subtitle}>Camera is optional and 100% on-device</Text>

      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>What We Do:</Text>
        <Text style={styles.privacyItem}>✓ Analyze your face every 2 seconds (optional)</Text>
        <Text style={styles.privacyItem}>✓ Calculate blink rate and eye openness</Text>
        <Text style={styles.privacyItem}>✓ Process everything on your device</Text>
        <Text style={styles.privacyItem}>✓ Store only numeric metrics (never images)</Text>
      </View>

      <View style={[styles.privacyBox, styles.privacyDanger]}>
        <Text style={styles.privacyTitle}>What We DON'T Do:</Text>
        <Text style={styles.privacyItem}>✗ Store or save photos/videos</Text>
        <Text style={styles.privacyItem}>✗ Upload images to the cloud</Text>
        <Text style={styles.privacyItem}>✗ Share data with anyone</Text>
        <Text style={styles.privacyItem}>✗ Identify or recognize you</Text>
      </View>

      <Text style={styles.cameraQuestion}>Enable camera for fatigue detection?</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkipCamera}>
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCameraEnable}>
          <Text style={styles.primaryButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>⚙️</Text>
      <Text style={styles.title}>Customize Your Sessions</Text>
      <Text style={styles.subtitle}>Set your preferred work and break durations</Text>

      <View style={styles.settingsContainer}>
        <Text style={styles.settingLabel}>Work Duration</Text>
        <View style={styles.durationPicker}>
          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => setWorkMinutes(Math.max(5, workMinutes - 5))}
          >
            <Text style={styles.durationButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationValue}>{workMinutes}</Text>
            <Text style={styles.durationUnit}>minutes</Text>
          </View>
          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => setWorkMinutes(Math.min(90, workMinutes + 5))}
          >
            <Text style={styles.durationButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.settingLabel}>Break Duration</Text>
        <View style={styles.durationPicker}>
          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => setBreakMinutes(Math.max(1, breakMinutes - 1))}
          >
            <Text style={styles.durationButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationValue}>{breakMinutes}</Text>
            <Text style={styles.durationUnit}>minutes</Text>
          </View>
          <TouchableOpacity
            style={styles.durationButton}
            onPress={() => setBreakMinutes(Math.min(30, breakMinutes + 1))}
          >
            <Text style={styles.durationButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.settingsNote}>You can change these anytime in Settings</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.primaryButtonText}>Start Using Study Companion</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderPrivacy();
      case 2:
        return renderSettings();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[styles.dot, currentStep === step && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  privacyBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  privacyDanger: {
    borderLeftColor: COLORS.danger,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  privacyItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  cameraQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  settingsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 20,
  },
  durationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  durationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  durationDisplay: {
    marginHorizontal: 40,
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  durationUnit: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  settingsNote: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textLight,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
});
