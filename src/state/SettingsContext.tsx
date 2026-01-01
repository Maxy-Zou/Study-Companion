import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../models/UserSettings';
import { SettingsStorage, initializeDatabase } from '../services/storageService';

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings and initialize database on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initializeDatabase();

        // Load settings
        let loadedSettings = await SettingsStorage.load();

        // Generate userId if not exists
        if (!loadedSettings.userId) {
          loadedSettings = {
            ...loadedSettings,
            userId: uuidv4(),
          };
          await SettingsStorage.save(loadedSettings);
        }

        setSettings(loadedSettings);
      } catch (error) {
        console.error('Failed to initialize settings:', error);
        // Use defaults on error
        setSettings({
          ...DEFAULT_USER_SETTINGS,
          userId: uuidv4(),
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const updateSettings = async (partial: Partial<UserSettings>) => {
    try {
      const updated = { ...settings, ...partial };
      await SettingsStorage.save(updated);
      setSettings(updated);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      const resetWithId = {
        ...DEFAULT_USER_SETTINGS,
        userId: settings.userId, // Preserve userId
      };
      await SettingsStorage.save(resetWithId);
      setSettings(resetWithId);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
