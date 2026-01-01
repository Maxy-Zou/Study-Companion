import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/state/SettingsContext';
import { SessionProvider } from './src/state/SessionContext';

export default function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </SessionProvider>
    </SettingsProvider>
  );
}
