import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";
import { joinArgs } from "../parser";

/**
 * Title command - Rename the current chat
 */
export const titleCommand: CommandDefinition = {
  name: "title",
  aliases: ["rename"],
  description: "Rename the current chat",
  usage: "/title <new title>",
  category: "chat",

  async execute(args: string[], context: CommandContext): Promise<CommandResult> {
    if (args.length === 0) {
      return errorResult("Usage: /title <new title>");
    }

    if (!context.currentChatId) {
      return errorResult("No active chat to rename");
    }

    const newTitle = joinArgs(args);

    try {
      await context.db._Chats.rename(context.currentChatId, newTitle);

      return successResult([{ type: "setChatTitle", title: newTitle }]);
    } catch {
      return errorResult("Failed to rename chat");
    }
  },
};
