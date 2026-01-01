import { Session, SessionState, SessionEvent } from '../models/Session';

export interface SessionAction {
  type: SessionEvent;
  payload?: any;
}

export interface SessionMachineState {
  currentState: SessionState;
  session: Session | null;
  error: string | null;
}

export const initialSessionMachineState: SessionMachineState = {
  currentState: SessionState.IDLE,
  session: null,
  error: null,
};

// State machine transitions
const transitions: Record<SessionState, Partial<Record<SessionEvent, SessionState>>> = {
  [SessionState.IDLE]: {
    [SessionEvent.START_WORK]: SessionState.WORKING,
  },
  [SessionState.WORKING]: {
    [SessionEvent.START_BREAK]: SessionState.BREAK,
    [SessionEvent.PAUSE]: SessionState.PAUSED,
    [SessionEvent.END_SESSION]: SessionState.IDLE,
    [SessionEvent.ACCEPT_BREAK]: SessionState.BREAK,
  },
  [SessionState.BREAK]: {
    [SessionEvent.COMPLETE_BREAK]: SessionState.WORKING,
    [SessionEvent.END_SESSION]: SessionState.IDLE,
  },
  [SessionState.PAUSED]: {
    [SessionEvent.RESUME]: SessionState.WORKING,
    [SessionEvent.END_SESSION]: SessionState.IDLE,
  },
};

export function sessionReducer(
  state: SessionMachineState,
  action: SessionAction
): SessionMachineState {
  const { type, payload } = action;
  const currentState = state.currentState;

  // Check if transition is valid
  const nextState = transitions[currentState]?.[type];
  if (!nextState && type !== SessionEvent.IGNORE_BREAK) {
    return {
      ...state,
      error: `Invalid transition: ${type} from ${currentState}`,
    };
  }

  // Handle state transitions
  switch (type) {
    case SessionEvent.START_WORK: {
      const now = Date.now();
      const newSession: Session = {
        sessionId: payload.sessionId,
        startTs: now,
        endTs: null,
        workBlocksCompleted: 0,
        acceptedBreaks: 0,
        ignoredBreaks: 0,
        currentBlockStartTs: now,
      };
      return {
        currentState: SessionState.WORKING,
        session: newSession,
        error: null,
      };
    }

    case SessionEvent.PAUSE: {
      return {
        ...state,
        currentState: SessionState.PAUSED,
        error: null,
      };
    }

    case SessionEvent.RESUME: {
      return {
        ...state,
        currentState: SessionState.WORKING,
        session: state.session ? {
          ...state.session,
          currentBlockStartTs: Date.now(), // Reset block start time
        } : null,
        error: null,
      };
    }

    case SessionEvent.ACCEPT_BREAK: {
      return {
        ...state,
        currentState: SessionState.BREAK,
        session: state.session ? {
          ...state.session,
          acceptedBreaks: state.session.acceptedBreaks + 1,
        } : null,
        error: null,
      };
    }

    case SessionEvent.IGNORE_BREAK: {
      return {
        ...state,
        session: state.session ? {
          ...state.session,
          ignoredBreaks: state.session.ignoredBreaks + 1,
        } : null,
        error: null,
      };
    }

    case SessionEvent.COMPLETE_BREAK: {
      return {
        ...state,
        currentState: SessionState.WORKING,
        session: state.session ? {
          ...state.session,
          workBlocksCompleted: state.session.workBlocksCompleted + 1,
          currentBlockStartTs: Date.now(), // Start new work block
        } : null,
        error: null,
      };
    }

    case SessionEvent.END_SESSION: {
      const endedSession = state.session ? {
        ...state.session,
        endTs: Date.now(),
      } : null;

      return {
        currentState: SessionState.IDLE,
        session: endedSession, // Keep session for persistence, then clear
        error: null,
      };
    }

    default:
      return state;
  }
}

// Helper functions
export function canTransition(currentState: SessionState, event: SessionEvent): boolean {
  return transitions[currentState]?.[event] !== undefined || event === SessionEvent.IGNORE_BREAK;
}

export function getNextState(currentState: SessionState, event: SessionEvent): SessionState | null {
  return transitions[currentState]?.[event] || null;
}
