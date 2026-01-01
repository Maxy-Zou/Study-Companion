import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../models/Session';
import { Metrics } from '../models/Metrics';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../models/UserSettings';
import { STORAGE_KEYS, DATA_RETENTION } from '../utils/constants';

// SQLite Database
const db = SQLite.openDatabaseSync('fatigue_tracker.db');

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  try {
    // Create sessions table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        start_ts INTEGER NOT NULL,
        end_ts INTEGER,
        work_blocks_completed INTEGER DEFAULT 0,
        accepted_breaks INTEGER DEFAULT 0,
        ignored_breaks INTEGER DEFAULT 0,
        baseline_blink_rate REAL
      );
    `);

    // Create metrics table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        ts INTEGER NOT NULL,
        blink_rate_per_min REAL,
        yawn_count INTEGER DEFAULT 0,
        eye_openness_avg REAL,
        fatigue_score REAL,
        self_report INTEGER,
        FOREIGN KEY(session_id) REFERENCES sessions(session_id)
      );
    `);

    // Create indexes
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_metrics_session ON metrics(session_id);
    `);
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_metrics_ts ON metrics(ts);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Session Storage
export const SessionStorage = {
  async insert(session: Session): Promise<void> {
    try {
      db.runSync(
        `INSERT INTO sessions (session_id, start_ts, end_ts, work_blocks_completed, accepted_breaks, ignored_breaks, baseline_blink_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.sessionId,
          session.startTs,
          session.endTs,
          session.workBlocksCompleted,
          session.acceptedBreaks,
          session.ignoredBreaks,
          session.baselineBlinkRate || null,
        ]
      );
    } catch (error) {
      console.error('Session insert error:', error);
      throw error;
    }
  },

  async update(session: Session): Promise<void> {
    try {
      db.runSync(
        `UPDATE sessions
         SET end_ts = ?, work_blocks_completed = ?, accepted_breaks = ?, ignored_breaks = ?, baseline_blink_rate = ?
         WHERE session_id = ?`,
        [
          session.endTs,
          session.workBlocksCompleted,
          session.acceptedBreaks,
          session.ignoredBreaks,
          session.baselineBlinkRate || null,
          session.sessionId,
        ]
      );
    } catch (error) {
      console.error('Session update error:', error);
      throw error;
    }
  },

  async getById(sessionId: string): Promise<Session | null> {
    try {
      const result = db.getFirstSync<Session>(
        'SELECT * FROM sessions WHERE session_id = ?',
        [sessionId]
      );
      return result || null;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  },

  async getAll(): Promise<Session[]> {
    try {
      const results = db.getAllSync<Session>(
        'SELECT * FROM sessions ORDER BY start_ts DESC'
      );
      return results;
    } catch (error) {
      console.error('Session getAll error:', error);
      return [];
    }
  },

  async getRecent(limit: number = 10): Promise<Session[]> {
    try {
      const results = db.getAllSync<Session>(
        'SELECT * FROM sessions ORDER BY start_ts DESC LIMIT ?',
        [limit]
      );
      return results;
    } catch (error) {
      console.error('Session getRecent error:', error);
      return [];
    }
  },

  async deleteOld(): Promise<void> {
    try {
      const cutoffDate = Date.now() - (DATA_RETENTION.DAYS_TO_KEEP * 24 * 60 * 60 * 1000);
      db.runSync('DELETE FROM sessions WHERE start_ts < ?', [cutoffDate]);
      console.log('Old sessions deleted');
    } catch (error) {
      console.error('Session deleteOld error:', error);
    }
  },
};

// Metrics Storage
export const MetricsStorage = {
  async insert(metric: Metrics): Promise<void> {
    try {
      db.runSync(
        `INSERT INTO metrics (session_id, ts, blink_rate_per_min, yawn_count, eye_openness_avg, fatigue_score, self_report)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          metric.sessionId,
          metric.ts,
          metric.blinkRatePerMin,
          metric.yawnCount,
          metric.eyeOpennessAvg,
          metric.fatigueScore,
          metric.selfReport || null,
        ]
      );
    } catch (error) {
      console.error('Metrics insert error:', error);
      throw error;
    }
  },

  async insertBatch(metrics: Metrics[]): Promise<void> {
    try {
      db.withTransactionSync(() => {
        for (const metric of metrics) {
          db.runSync(
            `INSERT INTO metrics (session_id, ts, blink_rate_per_min, yawn_count, eye_openness_avg, fatigue_score, self_report)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              metric.sessionId,
              metric.ts,
              metric.blinkRatePerMin,
              metric.yawnCount,
              metric.eyeOpennessAvg,
              metric.fatigueScore,
              metric.selfReport || null,
            ]
          );
        }
      });
    } catch (error) {
      console.error('Metrics insertBatch error:', error);
      throw error;
    }
  },

  async getBySessionId(sessionId: string): Promise<Metrics[]> {
    try {
      const results = db.getAllSync<Metrics>(
        'SELECT * FROM metrics WHERE session_id = ? ORDER BY ts ASC',
        [sessionId]
      );
      return results;
    } catch (error) {
      console.error('Metrics getBySessionId error:', error);
      return [];
    }
  },

  async getRecent(sessionId: string, limit: number = 30): Promise<Metrics[]> {
    try {
      const results = db.getAllSync<Metrics>(
        'SELECT * FROM metrics WHERE session_id = ? ORDER BY ts DESC LIMIT ?',
        [sessionId, limit]
      );
      return results.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Metrics getRecent error:', error);
      return [];
    }
  },

  async deleteBySessionId(sessionId: string): Promise<void> {
    try {
      db.runSync('DELETE FROM metrics WHERE session_id = ?', [sessionId]);
    } catch (error) {
      console.error('Metrics deleteBySessionId error:', error);
    }
  },

  async deleteOld(): Promise<void> {
    try {
      const cutoffDate = Date.now() - (DATA_RETENTION.DAYS_TO_KEEP * 24 * 60 * 60 * 1000);
      db.runSync('DELETE FROM metrics WHERE ts < ?', [cutoffDate]);
      console.log('Old metrics deleted');
    } catch (error) {
      console.error('Metrics deleteOld error:', error);
    }
  },
};

// Settings Storage (AsyncStorage)
export const SettingsStorage = {
  async save(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Settings save error:', error);
      throw error;
    }
  },

  async load(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_USER_SETTINGS;
    } catch (error) {
      console.error('Settings load error:', error);
      return DEFAULT_USER_SETTINGS;
    }
  },

  async update(partial: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.load();
      const updated = { ...current, ...partial };
      await this.save(updated);
    } catch (error) {
      console.error('Settings update error:', error);
      throw error;
    }
  },
};

// Onboarding Storage
export const OnboardingStorage = {
  async isComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('Onboarding check error:', error);
      return false;
    }
  },

  async setComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Onboarding setComplete error:', error);
      throw error;
    }
  },
};
