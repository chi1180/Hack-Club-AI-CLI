import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";

/**
 * Chats command - Manage chat sessions
 */
export const chatsCommand: CommandDefinition = {
  name: "chats",
  aliases: ["conversations", "history"],
  description: "List and manage saved chats",
  usage: "/chats [new|list]",
  category: "chat",

  async execute(args: string[], context: CommandContext): Promise<CommandResult> {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
      case "new":
        return successResult([{ type: "createNewChat" }]);

      case "list":
      case undefined: {
        // Get chat count for now
        try {
          const count = await context.db._Chats.count();
          return successResult([
            {
              type: "showInfo",
              message: `You have ${count} saved chat${count !== 1 ? "s" : ""}. Full chats view coming soon!`,
            },
          ]);
        } catch {
          return errorResult("Failed to retrieve chat count");
        }
      }

      default:
        return errorResult(
          `Unknown subcommand: ${subCommand}. Usage: /chats [new|list]`,
        );
    }
  },
};
