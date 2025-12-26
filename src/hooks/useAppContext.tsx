import { createContext, useContext, useReducer, type ReactNode } from "react";
import { useApp } from "ink";
import type {
  AppState,
  AppAction,
  AppContextValue,
  Screen,
} from "../types/app.types";
import type { DB } from "../lib/db";

// =============================================================================
// Initial State
// =============================================================================

const initialState: AppState = {
  screen: { type: "init" },
  db: null,
  isDbReady: false,
  error: null,
};

// =============================================================================
// Reducer
// =============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, screen: action.screen, error: null };

    case "GO_BACK":
      // Back action always returns to main screen
      return { ...state, screen: { type: "main" }, error: null };

    case "SET_DB":
      return { ...state, db: action.db, isDbReady: true };

    case "SET_DB_READY":
      return { ...state, isDbReady: action.ready };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "EXIT":
      return { ...state, screen: { type: "exit" } };

    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const AppContext = createContext<AppContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface AppProviderProps {
  children: ReactNode;
  initialScreen?: Screen;
}

export function AppProvider({ children, initialScreen }: AppProviderProps) {
  const { exit: inkExit } = useApp();

  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    screen: initialScreen ?? initialState.screen,
  });

  const contextValue: AppContextValue = {
    state,

    navigate: (screen: Screen) => {
      dispatch({ type: "NAVIGATE", screen });
    },

    goBack: () => {
      dispatch({ type: "GO_BACK" });
    },

    setDB: (db: DB) => {
      dispatch({ type: "SET_DB", db });
    },

    setError: (error: string | null) => {
      dispatch({ type: "SET_ERROR", error });
    },

    clearError: () => {
      dispatch({ type: "SET_ERROR", error: null });
    },

    exit: () => {
      dispatch({ type: "EXIT" });
      // 少し待ってから実際に終了
      setTimeout(() => {
        inkExit();
      }, 100);
    },
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// =============================================================================
// Selector Hooks - 特定の状態だけを取得するフック
// =============================================================================

export function useCurrentScreen(): Screen {
  const { state } = useAppContext();
  return state.screen;
}

export function useDB(): DB | null {
  const { state } = useAppContext();
  return state.db;
}

export function useIsDbReady(): boolean {
  const { state } = useAppContext();
  return state.isDbReady;
}

export function useError(): string | null {
  const { state } = useAppContext();
  return state.error;
}
