import * as React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Session, SessionState, SessionEvent } from "../models/Session";
import {
  sessionReducer,
  initialSessionMachineState,
  SessionAction,
  SessionMachineState,
} from "../services/sessionStateMachine";
import { SessionStorage } from "../services/storageService";

interface SessionContextType {
  currentState: SessionState;
  session: Session | null;
  error: string | null;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  startBreak: () => void;
  completeBreak: () => void;
  acceptBreak: () => void;
  ignoreBreak: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [state, dispatch] = useReducer(
    sessionReducer,
    initialSessionMachineState
  );

  // Auto-save session to database whenever it changes
  useEffect(() => {
    if (state.session) {
      const saveSession = async () => {
        try {
          // Check if session exists in DB
          const existing = await SessionStorage.getById(
            state.session!.sessionId
          );

          if (existing) {
            // Update existing session
            await SessionStorage.update(state.session!);
          } else {
            // Insert new session
            await SessionStorage.insert(state.session!);
          }
        } catch (error) {
          console.error("Failed to save session:", error);
        }
      };

      saveSession();
    }
  }, [state.session]);

  const startSession = () => {
    const sessionId = uuidv4();
    dispatch({
      type: SessionEvent.START_WORK,
      payload: { sessionId },
    });
  };

  const pauseSession = () => {
    dispatch({ type: SessionEvent.PAUSE });
  };

  const resumeSession = () => {
    dispatch({ type: SessionEvent.RESUME });
  };

  const endSession = async () => {
    dispatch({ type: SessionEvent.END_SESSION });

    // Save final session state to database
    if (state.session) {
      try {
        await SessionStorage.update({
          ...state.session,
          endTs: Date.now(),
        });
      } catch (error) {
        console.error("Failed to save final session state:", error);
      }
    }
  };

  const startBreak = () => {
    dispatch({ type: SessionEvent.START_BREAK });
  };

  const completeBreak = () => {
    dispatch({ type: SessionEvent.COMPLETE_BREAK });
  };

  const acceptBreak = () => {
    dispatch({ type: SessionEvent.ACCEPT_BREAK });
  };

  const ignoreBreak = () => {
    dispatch({ type: SessionEvent.IGNORE_BREAK });
  };

  const value: SessionContextType = {
    currentState: state.currentState,
    session: state.session,
    error: state.error,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startBreak,
    completeBreak,
    acceptBreak,
    ignoreBreak,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
