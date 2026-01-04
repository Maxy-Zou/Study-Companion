import { useState, useEffect, useRef } from 'react';

// --- Interfaces ---

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

// --- Hook ---

export function useSessionTimer(
  config: TimerConfig
): [TimerState, TimerControls] {
  const { durationMinutes, onComplete, autoStart = false } = config;

  // --- State (UI only) ---
  const [remainingMs, setRemainingMs] = useState(
    durationMinutes * 60 * 1000
  );
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  // --- Refs (logic source of truth) ---
  const timeRef = useRef(durationMinutes * 60 * 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevDurationRef = useRef<number>(durationMinutes);

  // --- Sync ONLY when duration actually changes ---
  useEffect(() => {
    if (prevDurationRef.current !== durationMinutes) {
      prevDurationRef.current = durationMinutes;

      const newTime = durationMinutes * 60 * 1000;
      timeRef.current = newTime;

      setRemainingMs(newTime);
      setIsCompleted(false);
      setIsRunning(false);
    }
  }, [durationMinutes]);

  // --- Timer loop ---
  useEffect(() => {
    console.log('timer running:', isRunning);
    
    if (!isRunning) return;

    let lastTick = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      timeRef.current = Math.max(0, timeRef.current - delta);
      setRemainingMs(timeRef.current);

      if (timeRef.current <= 0) {
        setIsRunning(false);
        setIsCompleted(true);
        onComplete?.();
        clearInterval(intervalRef.current!);
      }
    }, 100);

    return () => {
      console.log('timer stopped');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete]);

  // --- Controls ---

  const start = () => {
    if (!isCompleted) setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    if (!isCompleted) setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    setIsCompleted(false);

    const originalTime = durationMinutes * 60 * 1000;
    timeRef.current = originalTime;
    setRemainingMs(originalTime);
  };

  const setDuration = (minutes: number) => {
    setIsRunning(false);
    setIsCompleted(false);

    const newTime = minutes * 60 * 1000;
    prevDurationRef.current = minutes;
    timeRef.current = newTime;
    setRemainingMs(newTime);
  };

  return [
    { remainingMs, isRunning, isCompleted },
    { start, pause, resume, reset, setDuration },
  ];
}

// --- Utility ---

export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
}

// import { useState, useEffect, useRef } from 'react';

// export interface TimerConfig {
//   durationMinutes: number;
//   onComplete?: () => void;
//   autoStart?: boolean;
// }

// export interface TimerState {
//   remainingMs: number;
//   isRunning: boolean;
//   isCompleted: boolean;
// }

// export interface TimerControls {
//   start: () => void;
//   pause: () => void;
//   resume: () => void;
//   reset: () => void;
//   setDuration: (minutes: number) => void;
// }

// export function useSessionTimer(config: TimerConfig): [TimerState, TimerControls] {
//   const { durationMinutes, onComplete, autoStart = false } = config;

//   const [remainingMs, setRemainingMs] = useState(durationMinutes * 60 * 1000);
//   const [isRunning, setIsRunning] = useState(autoStart);
//   const [isCompleted, setIsCompleted] = useState(false);

//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const startTimeRef = useRef<number>(Date.now());
//   const remainingMsRef = useRef<number>(durationMinutes * 60 * 1000);

//   // Cleanup interval on unmount
//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   // Timer tick
//   useEffect(() => {
//     if (isRunning && !isCompleted) {
//       // mark start time and base remaining from ref
//       startTimeRef.current = Date.now();

//       // Ensure the ref reflects the latest remaining value
//       remainingMsRef.current = remainingMs;

//       intervalRef.current = setInterval(() => {
//         const elapsed = Date.now() - startTimeRef.current;
//         const newRemaining = Math.max(0, remainingMsRef.current - elapsed);

//         // update both state and ref so pause/resume see latest value
//         setRemainingMs(newRemaining);
//         remainingMsRef.current = newRemaining;

//         if (newRemaining === 0) {
//           setIsRunning(false);
//           setIsCompleted(true);
//           if (intervalRef.current) {
//             clearInterval(intervalRef.current);
//             intervalRef.current = null;
//           }
//           onComplete?.();
//         }
//       }, 100); // Update every 100ms for smooth countdown

//       return () => {
//         if (intervalRef.current) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//         }
//       };
//     }
//     // We intentionally omit `remainingMs` from deps to avoid recreating interval on every tick
//   }, [isRunning, isCompleted, onComplete]);

//   const start = () => {
//     if (!isCompleted) {
//       setIsRunning(true);
//     }
//   };

//   const pause = () => {
//     // capture current remaining time so resume uses correct base
//     remainingMsRef.current = remainingMs;
//     setIsRunning(false);
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   }; 

//   const resume = () => {
//     if (!isCompleted) {
//       // ensure start time resets and interval starts from remainingMsRef
//       startTimeRef.current = Date.now();
//       remainingMsRef.current = remainingMs;
//       setIsRunning(true);
//     }
//   };

//   const reset = () => {
//     setIsRunning(false);
//     setIsCompleted(false);
//     setRemainingMs(durationMinutes * 60 * 1000);
//     remainingMsRef.current = durationMinutes * 60 * 1000;
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   const setDuration = (minutes: number) => {
//     const newDuration = minutes * 60 * 1000;
//     setRemainingMs(newDuration);
//     remainingMsRef.current = newDuration;
//     setIsCompleted(false);
//     setIsRunning(false);
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   };

//   return [
//     { remainingMs, isRunning, isCompleted },
//     { start, pause, resume, reset, setDuration },
//   ];
// }

// // Utility function to format time
// export function formatTime(ms: number): string {
//   const totalSeconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
// }
