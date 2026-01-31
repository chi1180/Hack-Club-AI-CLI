import type { AI } from "../../lib/ai/ai";
import type { DB } from "../../lib/db/db";
import type { DisplayMessage } from "../components/chat.types";

// =============================================================================
// Command Context Types
// =============================================================================

/**
 * Context passed to command executors
 * Contains all the state and utilities commands need to interact with the app
 */
export interface CommandContext {
  /** AI instance for API calls */
  ai: AI;
  /** Database instance for persistence */
  db: DB;
  /** Current chat ID */
  currentChatId: string | null;
  /** Current chat title */
  currentChatTitle: string;
  /** Current AI model */
  currentModel: string;
  /** Current messages in the chat */
  messages: DisplayMessage[];
  /** Total tokens used in the current session */
  totalTokens: number;
}

// =============================================================================
// Command Result Types
// =============================================================================

/**
 * Actions that a command can request
 */
export type CommandAction =
  | { type: "none" }
  | { type: "exit" }
  | { type: "clearMessages" }
  | { type: "clearTokens" }
  | { type: "clearError" }
  | { type: "setError"; message: string }
  | { type: "setMessages"; messages: DisplayMessage[] }
  | { type: "addMessage"; message: DisplayMessage }
  | { type: "toggleHelp" }
  | { type: "setViewMode"; mode: "chat" | "imageGenerator"; prompt?: string }
  | { type: "createNewChat" }
  | { type: "setChatId"; chatId: string }
  | { type: "setChatTitle"; title: string }
  | { type: "setModel"; model: string }
  | { type: "showInfo"; message: string };

/**
 * Result returned by command execution
 */
export interface CommandResult {
  /** Whether the command executed successfully */
  success: boolean;
  /** Actions to perform after command execution */
  actions: CommandAction[];
  /** Optional error message if command failed */
  error?: string;
}

// =============================================================================
// Command Definition Types
// =============================================================================

/**
 * Command category for grouping in help display
 */
export type CommandCategory =
  | "chat"
  | "ai"
  | "navigation"
  | "utility"
  | "system";

/**
 * Definition of a slash command
 */
export interface CommandDefinition {
  /** Primary command name (without slash) */
  name: string;
  /** Alternative names/aliases for the command */
  aliases: string[];
  /** Short description for help display */
  description: string;
  /** Detailed usage information */
  usage?: string;
  /** Category for grouping */
  category: CommandCategory;
  /** Whether this command is visible in help (default: true) */
  hidden?: boolean;
  /** Execute the command */
  execute: (args: string[], context: CommandContext) => Promise<CommandResult>;
}

/**
 * Parsed command from user input
 */
export interface ParsedCommand {
  /** The command name (without slash, lowercase) */
  name: string;
  /** Arguments passed to the command */
  args: string[];
  /** Original raw input */
  raw: string;
}

// =============================================================================
// Command Registry Types
// =============================================================================

/**
 * Interface for the command registry
 */
export interface ICommandRegistry {
  /** Register a new command */
  register(command: CommandDefinition): void;
  /** Get a command by name or alias */
  get(nameOrAlias: string): CommandDefinition | undefined;
  /** Get all registered commands */
  getAll(): CommandDefinition[];
  /** Get commands by category */
  getByCategory(category: CommandCategory): CommandDefinition[];
  /** Check if a command exists */
  has(nameOrAlias: string): boolean;
  /** Execute a command by name with args */
  execute(
    nameOrAlias: string,
    args: string[],
    context: CommandContext,
  ): Promise<CommandResult>;
}

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Helper to create a simple success result
 */
export function successResult(
  actions: CommandAction[] = [],
): CommandResult {
  return { success: true, actions };
}

/**
 * Helper to create a simple error result
 */
export function errorResult(error: string): CommandResult {
  return {
    success: false,
    actions: [{ type: "setError", message: error }],
    error,
  };
}

/**
 * Helper to create a single action result
 */
export function actionResult(action: CommandAction): CommandResult {
  return { success: true, actions: [action] };
}
