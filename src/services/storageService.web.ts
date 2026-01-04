import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../models/Session';
import { Metrics } from '../models/Metrics';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../models/UserSettings';
import { STORAGE_KEYS, DATA_RETENTION } from '../utils/constants';

// Web version: Use AsyncStorage instead of SQLite
const SESSIONS_KEY = '@sessions';
const METRICS_KEY = '@metrics';

// Initialize database schema (no-op on web)
export async function initializeDatabase(): Promise<void> {
  console.log('Web storage initialized (using AsyncStorage)');
}

// Session Storage
export const SessionStorage = {
  async create(session: Session): Promise<void> {
    const sessions = await this.getAll();
    sessions.push(session);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  async update(sessionId: string, updates: Partial<Session>): Promise<void> {
    const sessions = await this.getAll();
    const index = sessions.findIndex(s => s.sessionId === sessionId);
    if (index >= 0) {
      sessions[index] = { ...sessions[index], ...updates };
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  },

  async get(sessionId: string): Promise<Session | null> {
    const sessions = await this.getAll();
    return sessions.find(s => s.sessionId === sessionId) || null;
  },

  async getAll(): Promise<Session[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  },

  async delete(sessionId: string): Promise<void> {
    const sessions = await this.getAll();
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },

  async cleanup(): Promise<void> {
    const cutoffTime = Date.now() - DATA_RETENTION.DAYS_TO_KEEP * 24 * 60 * 60 * 1000;
    const sessions = await this.getAll();
    const filtered = sessions.filter(s => s.startTs > cutoffTime);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
  },
};

// Metrics Storage
export const MetricsStorage = {
  async create(metric: Metrics): Promise<void> {
    const metrics = await this.getAll();
    metrics.push(metric);
    // Keep only last 10000 metrics to avoid storage bloat
    const trimmed = metrics.slice(-10000);
    await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(trimmed));
  },

  async createBatch(metrics: Metrics[]): Promise<void> {
    const existing = await this.getAll();
    const combined = [...existing, ...metrics];
    const trimmed = combined.slice(-10000);
    await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(trimmed));
  },

  async getBySession(sessionId: string): Promise<Metrics[]> {
    const metrics = await this.getAll();
    return metrics.filter(m => m.sessionId === sessionId);
  },

  async getAll(): Promise<Metrics[]> {
    try {
      const data = await AsyncStorage.getItem(METRICS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  },

  async deleteBySession(sessionId: string): Promise<void> {
    const metrics = await this.getAll();
    const filtered = metrics.filter(m => m.sessionId !== sessionId);
    await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(filtered));
  },

  async cleanup(): Promise<void> {
    const cutoffTime = Date.now() - DATA_RETENTION.DAYS_TO_KEEP * 24 * 60 * 60 * 1000;
    const metrics = await this.getAll();
    const filtered = metrics.filter(m => m.ts > cutoffTime);
    await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(filtered));
  },
};

// Settings Storage
export const SettingsStorage = {
  async get(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_USER_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_USER_SETTINGS;
    }
  },

  async save(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  },

  async update(updates: Partial<UserSettings>): Promise<void> {
    const current = await this.get();
    const updated = { ...current, ...updates };
    await this.save(updated);
  },
};
