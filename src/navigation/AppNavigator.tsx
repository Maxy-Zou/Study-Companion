import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../utils/constants';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SessionScreen from '../screens/SessionScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            headerTitle: 'Study Companion',
          }}
        />
        <Tab.Screen
          name="Session"
          component={SessionScreen}
          options={{
            tabBarLabel: 'Session',
            headerTitle: 'Active Session',
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarLabel: 'History',
            headerTitle: 'Session History',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Settings',
            headerTitle: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
