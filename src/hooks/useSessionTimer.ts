import { useState, useEffect, useRef } from 'react';

export interface TimerConfig {
  durationMinutes: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface TimerState {
  remainingMs: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export interface TimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setDuration: (minutes: number) => void;
}

export function useSessionTimer(config: TimerConfig): [TimerState, TimerControls] {
  const { durationMinutes, onComplete, autoStart = false } = config;

  const [remainingMs, setRemainingMs] = useState(durationMinutes * 60 * 1000);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingMsRef = useRef<number>(durationMinutes * 60 * 1000);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && !isCompleted) {
      startTimeRef.current = Date.now();
      remainingMsRef.current = remainingMs;

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newRemaining = Math.max(0, remainingMsRef.current - elapsed);

        setRemainingMs(newRemaining);

        if (newRemaining === 0) {
          setIsRunning(false);
          setIsCompleted(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
        }
      }, 100); // Update every 100ms for smooth countdown

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunning, isCompleted, onComplete, remainingMs]);

  const start = () => {
    if (!isCompleted) {
      setIsRunning(true);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    if (!isCompleted) {
      setIsRunning(true);
    }
  };

  const reset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingMs(durationMinutes * 60 * 1000);
    remainingMsRef.current = durationMinutes * 60 * 1000;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const setDuration = (minutes: number) => {
    const newDuration = minutes * 60 * 1000;
    setRemainingMs(newDuration);
    remainingMsRef.current = newDuration;
    setIsCompleted(false);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return [
    { remainingMs, isRunning, isCompleted },
    { start, pause, resume, reset, setDuration },
  ];
}

// Utility function to format time
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
