import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult, errorResult } from "../../../types/commands/command.types";

/**
 * Models command - View and select AI models
 */
export const modelsCommand: CommandDefinition = {
  name: "models",
  aliases: ["model", "m"],
  description: "View available AI models",
  usage: "/models [list|set <model>]",
  category: "ai",

  async execute(args: string[], context: CommandContext): Promise<CommandResult> {
    const subCommand = args[0]?.toLowerCase();

    switch (subCommand) {
      case "list":
      case undefined: {
        // Fetch and display available models
        try {
          const models = await context.ai._getModels();

          if (models.length === 0) {
            return successResult([
              { type: "showInfo", message: "No models available" },
            ]);
          }

          // Format model list
          const modelList = models
            .slice(0, 15) // Limit to first 15 for display
            .map((model) => `  • ${model.id}`)
            .join("\n");

          const moreCount = models.length > 15 ? models.length - 15 : 0;
          const moreText = moreCount > 0 ? `\n  ... and ${moreCount} more` : "";

          return successResult([
            {
              type: "showInfo",
              message: `📦 Available Models:\n${modelList}${moreText}\n\nCurrent: ${context.currentModel}`,
            },
          ]);
        } catch {
          return errorResult("Failed to fetch models from API");
        }
      }

      case "set": {
        const modelName = args[1];

        if (!modelName) {
          return errorResult("Usage: /models set <model-name>");
        }

        // Validate the model exists
        try {
          const models = await context.ai._getModels();
          const modelExists = models.some(
            (m) => m.id.toLowerCase() === modelName.toLowerCase(),
          );

          if (!modelExists) {
            return errorResult(
              `Model "${modelName}" not found. Use /models list to see available models.`,
            );
          }

          return successResult([
            { type: "setModel", model: modelName },
            { type: "showInfo", message: `✓ Model changed to: ${modelName}` },
          ]);
        } catch {
          return errorResult("Failed to validate model");
        }
      }

      case "current": {
        return successResult([
          { type: "showInfo", message: `Current model: ${context.currentModel}` },
        ]);
      }

      default:
        return errorResult(
          `Unknown subcommand: ${subCommand}. Usage: /models [list|set <model>|current]`,
        );
    }
  },
};
