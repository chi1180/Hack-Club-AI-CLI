import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";

/**
 * Export command - Export the current chat to various formats
 */
export const exportCommand: CommandDefinition = {
  name: "export",
  aliases: ["save"],
  description: "Export the current chat",
  usage: "/export [markdown|json]",
  category: "chat",

  async execute(args: string[], context: CommandContext): Promise<CommandResult> {
    if (!context.currentChatId) {
      return errorResult("No active chat to export");
    }

    const format = args[0]?.toLowerCase() ?? "markdown";

    try {
      switch (format) {
        case "markdown":
        case "md": {
          const markdown = await context.db._Chats.exportAsMarkdown(
            context.currentChatId,
          );

          if (markdown) {
            // For now, just show success message
            // TODO: Actually save to file or clipboard
            return successResult([
              {
                type: "showInfo",
                message: "📋 Export functionality coming soon! Chat can be exported as Markdown.",
              },
            ]);
          }

          return errorResult("Failed to generate Markdown export");
        }

        case "json": {
          // TODO: Implement JSON export
          return successResult([
            {
              type: "showInfo",
              message: "📋 JSON export coming soon!",
            },
          ]);
        }

        default:
          return errorResult(
            `Unknown format: ${format}. Supported formats: markdown, json`,
          );
      }
    } catch {
      return errorResult("Failed to export chat");
    }
  },
};
