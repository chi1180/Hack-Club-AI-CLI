import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";

/**
 * Star command - Toggle star status on current chat
 */
export const starCommand: CommandDefinition = {
  name: "star",
  aliases: ["favorite", "fav"],
  description: "Star/unstar the current chat",
  category: "chat",

  async execute(_args: string[], context: CommandContext): Promise<CommandResult> {
    if (!context.currentChatId) {
      return errorResult("No active chat to star");
    }

    try {
      const isStarred = await context.db._Chats.toggleStar(context.currentChatId);
      const message = isStarred ? "⭐ Chat starred!" : "Chat unstarred";

      return successResult([{ type: "showInfo", message }]);
    } catch {
      return errorResult("Failed to toggle star status");
    }
  },
};
