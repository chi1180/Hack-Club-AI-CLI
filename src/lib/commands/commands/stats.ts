import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";

/**
 * Stats command - View usage statistics
 */
export const statsCommand: CommandDefinition = {
  name: "stats",
  aliases: ["usage", "info"],
  description: "View usage statistics",
  category: "utility",

  async execute(_args: string[], context: CommandContext): Promise<CommandResult> {
    try {
      const stats = await context.ai._getStats();

      const lines = [
        "📊 Usage Statistics:",
        `  • Total requests: ${stats.totalRequests}`,
        `  • Total tokens: ${stats.totalTokens}`,
        `  • Session tokens: ${context.totalTokens}`,
        `  • Current model: ${context.currentModel}`,
        `  • Active chat: ${context.currentChatTitle}`,
        `  • Messages in chat: ${context.messages.length}`,
      ];

      return successResult([
        { type: "showInfo", message: lines.join("\n") },
      ]);
    } catch {
      return errorResult("Failed to fetch usage statistics");
    }
  },
};
