/**
 * Command System
 *
 * Provides a modular, extensible slash command system for the CLI.
 *
 * Usage:
 *   import { commandRegistry, parseCommand, isCommand } from './commands';
 *
 *   // Check if input is a command
 *   if (isCommand(input)) {
 *     const parsed = parseCommand(input);
 *     if (parsed) {
 *       const result = await commandRegistry.execute(parsed.name, parsed.args, context);
 *       // Handle result.actions
 *     }
 *   }
 */

import { commandRegistry, CommandRegistry } from "./registry";
import { isCommand, parseCommand, tokenize, joinArgs } from "./parser";

// Import all command definitions
import {
  quitCommand,
  clearCommand,
  newCommand,
  helpCommand,
  imageCommand,
  chatsCommand,
  starCommand,
  titleCommand,
  exportCommand,
  modelsCommand,
  statsCommand,
} from "./commands";

// Re-export types
export type {
  CommandDefinition,
  CommandContext,
  CommandResult,
  CommandAction,
  CommandCategory,
  ParsedCommand,
  ICommandRegistry,
} from "../../types/commands/command.types";

// Re-export helpers
export {
  successResult,
  errorResult,
  actionResult,
} from "../../types/commands/command.types";

// Re-export parser utilities
export { isCommand, parseCommand, tokenize, joinArgs };

// Re-export registry
export { commandRegistry, CommandRegistry };

/**
 * Register all built-in commands
 * Call this once during application initialization
 */
export function registerBuiltinCommands(): void {
  // System commands
  commandRegistry.register(quitCommand);
  commandRegistry.register(helpCommand);

  // Chat commands
  commandRegistry.register(clearCommand);
  commandRegistry.register(newCommand);
  commandRegistry.register(chatsCommand);
  commandRegistry.register(starCommand);
  commandRegistry.register(titleCommand);
  commandRegistry.register(exportCommand);

  // AI commands
  commandRegistry.register(imageCommand);
  commandRegistry.register(modelsCommand);

  // Utility commands
  commandRegistry.register(statsCommand);
}

/**
 * Initialize the command system
 * Registers all built-in commands and returns the registry
 */
export function initializeCommands(): CommandRegistry {
  registerBuiltinCommands();
  return commandRegistry;
}
