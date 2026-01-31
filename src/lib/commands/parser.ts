import type { ParsedCommand } from "../../types/commands/command.types";

/**
 * Check if a string starts with a command prefix
 */
export function isCommand(input: string): boolean {
  return input.trim().startsWith("/");
}

/**
 * Parse a command string into its components
 *
 * @example
 * parseCommand("/image a beautiful sunset")
 * // => { name: "image", args: ["a", "beautiful", "sunset"], raw: "/image a beautiful sunset" }
 *
 * @example
 * parseCommand("/title \"My New Title\"")
 * // => { name: "title", args: ["My New Title"], raw: "/title \"My New Title\"" }
 */
export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();

  if (!isCommand(trimmed)) {
    return null;
  }

  // Remove the leading slash
  const withoutSlash = trimmed.slice(1);

  // Parse respecting quoted strings
  const tokens = tokenize(withoutSlash);

  if (tokens.length === 0) {
    return null;
  }

  const name = tokens[0]?.toLowerCase() ?? "";
  const args = tokens.slice(1);

  return {
    name,
    args,
    raw: input,
  };
}

/**
 * Tokenize a string, respecting quoted strings
 *
 * @example
 * tokenize('title "My Chat Title" extra')
 * // => ["title", "My Chat Title", "extra"]
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuotes = false;
  let quoteChar: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const prevChar = i > 0 ? input[i - 1] : null;

    // Handle escape sequences
    if (char === "\\" && i + 1 < input.length) {
      const nextChar = input[i + 1];
      if (nextChar === '"' || nextChar === "'" || nextChar === "\\") {
        current += nextChar;
        i++; // Skip the next character
        continue;
      }
    }

    // Handle quote start/end
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = null;
        continue;
      }
    }

    // Handle whitespace
    if (!inQuotes && /\s/.test(char ?? "")) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  // Add the last token if any
  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Join remaining arguments into a single string
 * Useful for commands like /title where everything after the command is the title
 */
export function joinArgs(args: string[]): string {
  return args.join(" ");
}

/**
 * Parse a boolean-like argument
 */
export function parseBoolean(arg: string | undefined): boolean | undefined {
  if (!arg) return undefined;

  const lower = arg.toLowerCase();
  if (["true", "yes", "1", "on"].includes(lower)) return true;
  if (["false", "no", "0", "off"].includes(lower)) return false;

  return undefined;
}

/**
 * Parse a number argument
 */
export function parseNumber(arg: string | undefined): number | undefined {
  if (!arg) return undefined;

  const num = Number(arg);
  return Number.isNaN(num) ? undefined : num;
}

/**
 * Extract a flag from args (e.g., --force, -f)
 * Returns [hasFlag, remainingArgs]
 */
export function extractFlag(
  args: string[],
  flag: string,
  shortFlag?: string,
): [boolean, string[]] {
  const longFlag = flag.startsWith("--") ? flag : `--${flag}`;
  const short = shortFlag
    ? shortFlag.startsWith("-")
      ? shortFlag
      : `-${shortFlag}`
    : null;

  let hasFlag = false;
  const remaining: string[] = [];

  for (const arg of args) {
    if (arg === longFlag || (short && arg === short)) {
      hasFlag = true;
    } else {
      remaining.push(arg);
    }
  }

  return [hasFlag, remaining];
}

/**
 * Extract a key-value option from args (e.g., --model=gpt-4, --model gpt-4)
 * Returns [value, remainingArgs]
 */
export function extractOption(
  args: string[],
  option: string,
  shortOption?: string,
): [string | undefined, string[]] {
  const longOpt = option.startsWith("--") ? option : `--${option}`;
  const shortOpt = shortOption
    ? shortOption.startsWith("-")
      ? shortOption
      : `-${shortOption}`
    : null;

  let value: string | undefined;
  const remaining: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? "";

    // Check for --option=value format
    if (arg.startsWith(`${longOpt}=`)) {
      value = arg.slice(longOpt.length + 1);
      continue;
    }

    if (shortOpt && arg.startsWith(`${shortOpt}=`)) {
      value = arg.slice(shortOpt.length + 1);
      continue;
    }

    // Check for --option value format
    if (arg === longOpt || (shortOpt && arg === shortOpt)) {
      if (i + 1 < args.length) {
        value = args[i + 1];
        i++; // Skip the next arg
        continue;
      }
    }

    remaining.push(arg);
  }

  return [value, remaining];
}
