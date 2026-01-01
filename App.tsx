import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SettingsProvider } from './src/state/SettingsContext';
import { SessionProvider } from './src/state/SessionContext';
import { MetricsProvider } from './src/state/MetricsContext';

export default function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <MetricsProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </MetricsProvider>
      </SessionProvider>
    </SettingsProvider>
  );
}
