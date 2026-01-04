import * as React from "react";
import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { COLORS } from "../utils/constants";
import { useSettings } from "../state/SettingsContext";

// Screens
import HomeScreen from "../screens/HomeScreen";
import SessionScreen from "../screens/SessionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import OnboardingScreen from "../screens/OnboardingScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { settings, updateSettings } = useSettings();
  const [showOnboarding, setShowOnboarding] = useState(
    !settings.privacyAckVersion
  );

  const handleOnboardingComplete = async () => {
    // Mark onboarding as complete
    await updateSettings({ privacyAckVersion: "1.0" });
    setShowOnboarding(false);
  };

  // Show onboarding if user hasn't completed it
  if (showOnboarding) {
    return (
      <NavigationContainer>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: "#E5E5E5",
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "Home",
            headerTitle: "Study Companion",
          }}
        />
        <Tab.Screen
          name="Session"
          component={SessionScreen}
          options={{
            tabBarLabel: "Session",
            headerTitle: "Active Session",
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: "History",
            headerTitle: "Session History",
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: "Settings",
            headerTitle: "Settings",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
