import type {
  CommandDefinition,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult } from "../../../types/commands/command.types";

/**
 * Help command - Toggles the help display
 */
export const helpCommand: CommandDefinition = {
  name: "help",
  aliases: ["h", "?"],
  description: "Toggle command help display",
  category: "utility",

  async execute(): Promise<CommandResult> {
    return successResult([{ type: "toggleHelp" }]);
  },
};
