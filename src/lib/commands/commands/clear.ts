import type {
  CommandDefinition,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult } from "../../../types/commands/command.types";

/**
 * Clear command - Clears chat messages and resets state
 */
export const clearCommand: CommandDefinition = {
  name: "clear",
  aliases: ["cls"],
  description: "Clear chat messages",
  category: "chat",

  async execute(): Promise<CommandResult> {
    return successResult([
      { type: "clearMessages" },
      { type: "clearTokens" },
      { type: "clearError" },
    ]);
  },
};
