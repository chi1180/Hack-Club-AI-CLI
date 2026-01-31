import type {
  CommandDefinition,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult } from "../../../types/commands/command.types";

/**
 * Quit/Exit command - Exits the CLI application
 */
export const quitCommand: CommandDefinition = {
  name: "quit",
  aliases: ["exit", "q"],
  description: "Exit the CLI",
  category: "system",

  async execute(): Promise<CommandResult> {
    return successResult([{ type: "exit" }]);
  },
};
