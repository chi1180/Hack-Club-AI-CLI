import type {
  CommandDefinition,
  CommandContext,
  CommandResult,
  CommandCategory,
  ICommandRegistry,
} from "../../types/commands/command.types";
import { errorResult } from "../../types/commands/command.types";

/**
 * Command Registry - Manages all registered slash commands
 *
 * Provides:
 * - Command registration
 * - Lookup by name or alias
 * - Categorized listing
 * - Command execution
 */
export class CommandRegistry implements ICommandRegistry {
  /** Map of command names to definitions */
  private commands: Map<string, CommandDefinition> = new Map();
  /** Map of aliases to primary command names */
  private aliases: Map<string, string> = new Map();

  /**
   * Register a new command
   * @throws Error if command name or alias conflicts with existing command
   */
  register(command: CommandDefinition): void {
    const name = command.name.toLowerCase();

    // Check for name conflicts
    if (this.commands.has(name)) {
      throw new Error(`Command "${name}" is already registered`);
    }

    if (this.aliases.has(name)) {
      throw new Error(
        `Command name "${name}" conflicts with an existing alias`,
      );
    }

    // Register the command
    this.commands.set(name, command);

    // Register aliases
    for (const alias of command.aliases) {
      const lowerAlias = alias.toLowerCase();

      if (this.commands.has(lowerAlias)) {
        throw new Error(
          `Alias "${lowerAlias}" conflicts with existing command name`,
        );
      }

      if (this.aliases.has(lowerAlias)) {
        throw new Error(`Alias "${lowerAlias}" is already registered`);
      }

      this.aliases.set(lowerAlias, name);
    }
  }

  /**
   * Get a command by name or alias
   */
  get(nameOrAlias: string): CommandDefinition | undefined {
    const lower = nameOrAlias.toLowerCase();

    // Try direct lookup first
    const direct = this.commands.get(lower);
    if (direct) {
      return direct;
    }

    // Try alias lookup
    const primaryName = this.aliases.get(lower);
    if (primaryName) {
      return this.commands.get(primaryName);
    }

    return undefined;
  }

  /**
   * Get all registered commands (excluding hidden ones by default)
   */
  getAll(includeHidden = false): CommandDefinition[] {
    const all = Array.from(this.commands.values());

    if (includeHidden) {
      return all;
    }

    return all.filter((cmd) => !cmd.hidden);
  }

  /**
   * Get commands by category
   */
  getByCategory(category: CommandCategory): CommandDefinition[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Check if a command exists
   */
  has(nameOrAlias: string): boolean {
    return this.get(nameOrAlias) !== undefined;
  }

  /**
   * Execute a command by name with args
   */
  async execute(
    nameOrAlias: string,
    args: string[],
    context: CommandContext,
  ): Promise<CommandResult> {
    const command = this.get(nameOrAlias);

    if (!command) {
      return errorResult(
        `Unknown command: /${nameOrAlias}. Type /help for available commands.`,
      );
    }

    try {
      return await command.execute(args, context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Command execution failed";
      return errorResult(`Error executing /${command.name}: ${message}`);
    }
  }

  /**
   * Get command names that start with a given prefix (for autocomplete)
   */
  getCompletions(prefix: string): string[] {
    const lower = prefix.toLowerCase();
    const completions: Set<string> = new Set();

    // Check command names
    for (const name of this.commands.keys()) {
      if (name.startsWith(lower)) {
        completions.add(name);
      }
    }

    // Check aliases
    for (const alias of this.aliases.keys()) {
      if (alias.startsWith(lower)) {
        completions.add(alias);
      }
    }

    return Array.from(completions).sort();
  }

  /**
   * Get a formatted help string for all commands
   */
  getHelpText(): string {
    const categories: CommandCategory[] = [
      "chat",
      "ai",
      "navigation",
      "utility",
      "system",
    ];
    const lines: string[] = ["Available Commands:", ""];

    for (const category of categories) {
      const commands = this.getByCategory(category);
      if (commands.length === 0) continue;

      // Capitalize category name
      const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
      lines.push(`  ${categoryTitle}:`);

      for (const cmd of commands) {
        const aliases =
          cmd.aliases.length > 0 ? ` (${cmd.aliases.join(", ")})` : "";
        lines.push(`    /${cmd.name}${aliases} - ${cmd.description}`);
      }

      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Get a list of all command info for UI display
   */
  getCommandList(): Array<{
    name: string;
    aliases: string[];
    description: string;
    category: CommandCategory;
    usage?: string;
  }> {
    return this.getAll().map((cmd) => ({
      name: cmd.name,
      aliases: cmd.aliases,
      description: cmd.description,
      category: cmd.category,
      usage: cmd.usage,
    }));
  }

  /**
   * Clear all registered commands (useful for testing)
   */
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }
}

/**
 * Global command registry instance
 */
export const commandRegistry = new CommandRegistry();
