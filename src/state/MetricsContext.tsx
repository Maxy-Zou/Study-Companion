import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Metrics } from '../models/Metrics';
import { FaceData } from '../components/CameraView';
import { fatigueDetector } from '../services/fatigueDetector';
import { useSession } from './SessionContext';
import { SessionState } from '../models/Session';

interface MetricsContextType {
  currentMetrics: Metrics | null;
  currentFatigueScore: number;
  baselineBlinkRate: number | null;
  processFaceData: (faceData: FaceData) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

interface MetricsProviderProps {
  children: ReactNode;
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  const { session, currentState } = useSession();
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
  const [currentFatigueScore, setCurrentFatigueScore] = useState(0);
  const [baselineBlinkRate, setBaselineBlinkRate] = useState<number | null>(null);

  // Start/stop fatigue detector based on session state
  useEffect(() => {
    const isWorkingOrBreak =
      currentState === SessionState.WORKING || currentState === SessionState.BREAK;

    if (isWorkingOrBreak && session) {
      // Start detector
      fatigueDetector.start(session.sessionId);
    } else if (currentState === SessionState.IDLE) {
      // Stop detector and clear state
      fatigueDetector.stop();
      setCurrentMetrics(null);
      setCurrentFatigueScore(0);
      setBaselineBlinkRate(null);
    }

    return () => {
      if (currentState === SessionState.IDLE) {
        fatigueDetector.stop();
      }
    };
  }, [currentState, session]);

  // Update fatigue score periodically
  useEffect(() => {
    if (currentState !== SessionState.WORKING && currentState !== SessionState.BREAK) {
      return;
    }

    const interval = setInterval(() => {
      if (fatigueDetector.isRunning()) {
        const score = fatigueDetector.getCurrentFatigueScore();
        setCurrentFatigueScore(score);

        const baseline = fatigueDetector.getBaselineBlinkRate();
        if (baseline !== null) {
          setBaselineBlinkRate(baseline);
        }
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [currentState]);

  const processFaceData = async (faceData: FaceData) => {
    if (!fatigueDetector.isRunning()) return;

    const metrics = await fatigueDetector.processFaceData(faceData);
    if (metrics) {
      setCurrentMetrics(metrics);
    }
  };

  const value: MetricsContextType = {
    currentMetrics,
    currentFatigueScore,
    baselineBlinkRate,
    processFaceData,
  };

  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}

export function useMetrics(): MetricsContextType {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return context;
}
