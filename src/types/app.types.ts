import type { DB } from "../lib/db";

// =============================================================================
// Screen Types - 各画面の状態を表す
// =============================================================================

export type Screen =
  | { type: "init" }
  | { type: "main" }
  | { type: "chat"; chatId?: string; isNew?: boolean }
  | { type: "image" }
  | { type: "search" }
  | { type: "model" }
  | { type: "template" }
  | { type: "alias" }
  | { type: "stats" }
  | { type: "config" }
  | { type: "help"; command?: string }
  | { type: "exit" };

// =============================================================================
// App State - アプリ全体の状態
// =============================================================================

export interface AppState {
  screen: Screen;
  db: DB | null;
  isDbReady: boolean;
  error: string | null;
}

// =============================================================================
// App Context - コンポーネント間で共有するコンテキスト
// =============================================================================

export interface AppContextValue {
  state: AppState;
  // Navigation
  navigate: (screen: Screen) => void;
  goBack: () => void;
  // DB
  setDB: (db: DB) => void;
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  // Exit
  exit: () => void;
}

// =============================================================================
// Action Types - useReducer用のアクション
// =============================================================================

export type AppAction =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "GO_BACK" }
  | { type: "SET_DB"; db: DB }
  | { type: "SET_DB_READY"; ready: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "EXIT" };

// =============================================================================
// Command Types - コマンドパース用
// =============================================================================

export interface ParsedCommand {
  command: string;
  subCommand?: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

// =============================================================================
// Flow Props - 各フロー共通のProps
// =============================================================================

export interface FlowProps {
  onComplete: () => void;
  onCancel: () => void;
}
