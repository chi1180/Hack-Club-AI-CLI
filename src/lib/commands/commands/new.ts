import type {
  CommandDefinition,
  CommandResult,
} from "../../../types/commands/command.types";
import { successResult } from "../../../types/commands/command.types";

/**
 * New command - Creates a new chat session
 */
export const newCommand: CommandDefinition = {
  name: "new",
  aliases: [],
  description: "Start a new chat",
  category: "chat",

  async execute(): Promise<CommandResult> {
    return successResult([{ type: "createNewChat" }]);
  },
};
