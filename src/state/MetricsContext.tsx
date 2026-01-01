import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Metrics } from '../models/Metrics';
import { BreakRecommendation } from '../models/Recommendation';
import { FaceData } from '../components/CameraView';
import { fatigueDetector } from '../services/fatigueDetector';
import { recommendationEngine } from '../services/recommendationEngine';
import { MetricsStorage } from '../services/storageService';
import { useSession } from './SessionContext';
import { SessionState } from '../models/Session';

interface MetricsContextType {
  currentMetrics: Metrics | null;
  currentFatigueScore: number;
  baselineBlinkRate: number | null;
  currentRecommendation: BreakRecommendation | null;
  processFaceData: (faceData: FaceData) => void;
  acceptRecommendation: () => void;
  snoozeRecommendation: () => void;
  ignoreRecommendation: () => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

interface MetricsProviderProps {
  children: ReactNode;
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  const { session, currentState, acceptBreak, ignoreBreak } = useSession();
  const [currentMetrics, setCurrentMetrics] = useState<Metrics | null>(null);
  const [currentFatigueScore, setCurrentFatigueScore] = useState(0);
  const [baselineBlinkRate, setBaselineBlinkRate] = useState<number | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<BreakRecommendation | null>(null);

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

  // Evaluate recommendation rules periodically
  useEffect(() => {
    if (currentState !== SessionState.WORKING || !session) {
      return;
    }

    const evaluateRecommendations = async () => {
      try {
        // Get recent metrics from storage (last 30 data points = last 60 seconds at 0.5 fps)
        const recentMetrics = await MetricsStorage.getRecent(session.sessionId, 30);

        // Evaluate recommendation rules
        const recommendation = recommendationEngine.evaluate(
          session,
          recentMetrics,
          currentFatigueScore
        );

        if (recommendation) {
          setCurrentRecommendation(recommendation);
        }
      } catch (error) {
        console.error('Failed to evaluate recommendations:', error);
      }
    };

    // Evaluate every 3 seconds
    const interval = setInterval(evaluateRecommendations, 3000);

    return () => clearInterval(interval);
  }, [currentState, session, currentFatigueScore]);

  // Reset recommendation engine when session ends
  useEffect(() => {
    if (currentState === SessionState.IDLE) {
      recommendationEngine.reset();
      setCurrentRecommendation(null);
    }
  }, [currentState]);

  const processFaceData = async (faceData: FaceData) => {
    if (!fatigueDetector.isRunning()) return;

    const metrics = await fatigueDetector.processFaceData(faceData);
    if (metrics) {
      setCurrentMetrics(metrics);
    }
  };

  const acceptRecommendation = () => {
    if (!currentRecommendation) return;

    // Clear recommendation
    setCurrentRecommendation(null);

    // Trigger break in session
    acceptBreak();

    console.log('Break recommendation accepted');
  };

  const snoozeRecommendation = () => {
    if (!currentRecommendation) return;

    // Clear recommendation
    setCurrentRecommendation(null);

    // Snooze engine for 5 minutes
    recommendationEngine.snooze();

    console.log('Break recommendation snoozed for 5 minutes');
  };

  const ignoreRecommendation = () => {
    if (!currentRecommendation) return;

    // Clear recommendation
    setCurrentRecommendation(null);

    // Track ignored break in session
    ignoreBreak();

    console.log('Break recommendation ignored');
  };

  const value: MetricsContextType = {
    currentMetrics,
    currentFatigueScore,
    baselineBlinkRate,
    currentRecommendation,
    processFaceData,
    acceptRecommendation,
    snoozeRecommendation,
    ignoreRecommendation,
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
