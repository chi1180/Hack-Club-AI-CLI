import type {
  CommandDefinition,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult } from "../../../types/commands/command.types";
import { joinArgs } from "../parser";

/**
 * Image command - Opens the image generator
 */
export const imageCommand: CommandDefinition = {
  name: "image",
  aliases: ["img", "generate"],
  description: "Generate an image with AI",
  usage: "/image [prompt]",
  category: "ai",

  async execute(args: string[]): Promise<CommandResult> {
    // If there's a prompt after the command, use it
    const prompt = args.length > 0 ? joinArgs(args) : undefined;

    return successResult([
      { type: "setViewMode", mode: "imageGenerator", prompt },
    ]);
  },
};
