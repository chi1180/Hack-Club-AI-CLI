import { describe, it, expect, beforeEach } from "bun:test";
import {
  parseCommand,
  isCommand,
  tokenize,
  joinArgs,
  CommandRegistry,
} from "../lib/commands";
import type {
  CommandDefinition,
  CommandContext,
} from "../types/commands/command.types";
import {
  successResult,
  errorResult,
  actionResult,
} from "../types/commands/command.types";

// =============================================================================
// Parser Tests
// =============================================================================

describe("Command Parser", () => {
  describe("isCommand", () => {
    it("returns true for strings starting with /", () => {
      expect(isCommand("/help")).toBe(true);
      expect(isCommand("/quit")).toBe(true);
      expect(isCommand("/image some prompt")).toBe(true);
    });

    it("returns true for strings with leading whitespace", () => {
      expect(isCommand("  /help")).toBe(true);
      expect(isCommand("\t/quit")).toBe(true);
    });

    it("returns false for regular messages", () => {
      expect(isCommand("hello world")).toBe(false);
      expect(isCommand("what is 1/2?")).toBe(false);
      expect(isCommand("")).toBe(false);
    });
  });

  describe("tokenize", () => {
    it("splits simple strings by whitespace", () => {
      expect(tokenize("hello world")).toEqual(["hello", "world"]);
      expect(tokenize("one two three")).toEqual(["one", "two", "three"]);
    });

    it("preserves quoted strings", () => {
      expect(tokenize('title "My Chat Title"')).toEqual([
        "title",
        "My Chat Title",
      ]);
      expect(tokenize("title 'Single Quoted'")); // Note: just testing it doesn't break
    });

    it("handles mixed quoted and unquoted", () => {
      expect(tokenize('cmd "quoted arg" unquoted')).toEqual([
        "cmd",
        "quoted arg",
        "unquoted",
      ]);
    });

    it("handles escaped quotes", () => {
      expect(tokenize('say "he said \\"hello\\""')).toEqual([
        "say",
        'he said "hello"',
      ]);
    });

    it("handles empty input", () => {
      expect(tokenize("")).toEqual([]);
      expect(tokenize("   ")).toEqual([]);
    });
  });

  describe("parseCommand", () => {
    it("parses simple commands", () => {
      const result = parseCommand("/help");
      expect(result).not.toBeNull();
      expect(result?.name).toBe("help");
      expect(result?.args).toEqual([]);
      expect(result?.raw).toBe("/help");
    });

    it("parses commands with arguments", () => {
      const result = parseCommand("/image a beautiful sunset");
      expect(result).not.toBeNull();
      expect(result?.name).toBe("image");
      expect(result?.args).toEqual(["a", "beautiful", "sunset"]);
    });

    it("parses commands with quoted arguments", () => {
      const result = parseCommand('/title "My New Chat Title"');
      expect(result).not.toBeNull();
      expect(result?.name).toBe("title");
      expect(result?.args).toEqual(["My New Chat Title"]);
    });

    it("converts command name to lowercase", () => {
      const result = parseCommand("/HELP");
      expect(result?.name).toBe("help");
    });

    it("returns null for non-commands", () => {
      expect(parseCommand("hello world")).toBeNull();
      expect(parseCommand("")).toBeNull();
    });
  });

  describe("joinArgs", () => {
    it("joins arguments with spaces", () => {
      expect(joinArgs(["hello", "world"])).toBe("hello world");
      expect(joinArgs(["one"])).toBe("one");
      expect(joinArgs([])).toBe("");
    });
  });
});

// =============================================================================
// Command Registry Tests
// =============================================================================

describe("CommandRegistry", () => {
  let registry: CommandRegistry;

  // Mock context for testing
  const mockContext: CommandContext = {
    ai: {} as CommandContext["ai"],
    db: {} as CommandContext["db"],
    currentChatId: "test-chat-id",
    currentChatTitle: "Test Chat",
    currentModel: "test-model",
    messages: [],
    totalTokens: 100,
  };

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe("register", () => {
    it("registers a command successfully", () => {
      const command: CommandDefinition = {
        name: "test",
        aliases: [],
        description: "Test command",
        category: "utility",
        execute: async () => successResult(),
      };

      registry.register(command);
      expect(registry.has("test")).toBe(true);
    });

    it("registers command with aliases", () => {
      const command: CommandDefinition = {
        name: "quit",
        aliases: ["exit", "q"],
        description: "Exit the CLI",
        category: "system",
        execute: async () => successResult([{ type: "exit" }]),
      };

      registry.register(command);
      expect(registry.has("quit")).toBe(true);
      expect(registry.has("exit")).toBe(true);
      expect(registry.has("q")).toBe(true);
    });

    it("throws error for duplicate command name", () => {
      const command: CommandDefinition = {
        name: "test",
        aliases: [],
        description: "Test",
        category: "utility",
        execute: async () => successResult(),
      };

      registry.register(command);
      expect(() => registry.register(command)).toThrow(
        'Command "test" is already registered',
      );
    });

    it("throws error for alias conflicting with command name", () => {
      const cmd1: CommandDefinition = {
        name: "help",
        aliases: [],
        description: "Help",
        category: "utility",
        execute: async () => successResult(),
      };

      const cmd2: CommandDefinition = {
        name: "other",
        aliases: ["help"],
        description: "Other",
        category: "utility",
        execute: async () => successResult(),
      };

      registry.register(cmd1);
      expect(() => registry.register(cmd2)).toThrow(
        'Alias "help" conflicts with existing command name',
      );
    });
  });

  describe("get", () => {
    beforeEach(() => {
      registry.register({
        name: "quit",
        aliases: ["exit", "q"],
        description: "Exit",
        category: "system",
        execute: async () => successResult([{ type: "exit" }]),
      });
    });

    it("gets command by name", () => {
      const cmd = registry.get("quit");
      expect(cmd).not.toBeUndefined();
      expect(cmd?.name).toBe("quit");
    });

    it("gets command by alias", () => {
      const cmd = registry.get("exit");
      expect(cmd).not.toBeUndefined();
      expect(cmd?.name).toBe("quit");
    });

    it("returns undefined for unknown command", () => {
      expect(registry.get("unknown")).toBeUndefined();
    });

    it("is case-insensitive", () => {
      expect(registry.get("QUIT")).not.toBeUndefined();
      expect(registry.get("Exit")).not.toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("returns all non-hidden commands", () => {
      registry.register({
        name: "visible",
        aliases: [],
        description: "Visible",
        category: "utility",
        execute: async () => successResult(),
      });

      registry.register({
        name: "hidden",
        aliases: [],
        description: "Hidden",
        category: "utility",
        hidden: true,
        execute: async () => successResult(),
      });

      const all = registry.getAll();
      expect(all.length).toBe(1);
      expect(all[0]?.name).toBe("visible");
    });

    it("includes hidden commands when requested", () => {
      registry.register({
        name: "hidden",
        aliases: [],
        description: "Hidden",
        category: "utility",
        hidden: true,
        execute: async () => successResult(),
      });

      const all = registry.getAll(true);
      expect(all.length).toBe(1);
    });
  });

  describe("getByCategory", () => {
    beforeEach(() => {
      registry.register({
        name: "chat1",
        aliases: [],
        description: "Chat 1",
        category: "chat",
        execute: async () => successResult(),
      });

      registry.register({
        name: "ai1",
        aliases: [],
        description: "AI 1",
        category: "ai",
        execute: async () => successResult(),
      });

      registry.register({
        name: "chat2",
        aliases: [],
        description: "Chat 2",
        category: "chat",
        execute: async () => successResult(),
      });
    });

    it("returns commands in specified category", () => {
      const chatCommands = registry.getByCategory("chat");
      expect(chatCommands.length).toBe(2);
      expect(chatCommands.every((cmd) => cmd.category === "chat")).toBe(true);
    });

    it("returns empty array for category with no commands", () => {
      const navCommands = registry.getByCategory("navigation");
      expect(navCommands.length).toBe(0);
    });
  });

  describe("execute", () => {
    it("executes command successfully", async () => {
      registry.register({
        name: "test",
        aliases: [],
        description: "Test",
        category: "utility",
        execute: async () => successResult([{ type: "showInfo", message: "OK" }]),
      });

      const result = await registry.execute("test", [], mockContext);
      expect(result.success).toBe(true);
      expect(result.actions[0]).toEqual({ type: "showInfo", message: "OK" });
    });

    it("passes arguments to command", async () => {
      registry.register({
        name: "echo",
        aliases: [],
        description: "Echo args",
        category: "utility",
        execute: async (args) =>
          successResult([{ type: "showInfo", message: args.join(" ") }]),
      });

      const result = await registry.execute("echo", ["hello", "world"], mockContext);
      expect(result.success).toBe(true);
      expect(result.actions[0]).toEqual({
        type: "showInfo",
        message: "hello world",
      });
    });

    it("returns error for unknown command", async () => {
      const result = await registry.execute("unknown", [], mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown command");
    });

    it("catches and reports command execution errors", async () => {
      registry.register({
        name: "failing",
        aliases: [],
        description: "Fails",
        category: "utility",
        execute: async () => {
          throw new Error("Something went wrong");
        },
      });

      const result = await registry.execute("failing", [], mockContext);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Something went wrong");
    });
  });

  describe("getCompletions", () => {
    beforeEach(() => {
      registry.register({
        name: "help",
        aliases: ["h"],
        description: "Help",
        category: "utility",
        execute: async () => successResult(),
      });

      registry.register({
        name: "history",
        aliases: [],
        description: "History",
        category: "chat",
        execute: async () => successResult(),
      });
    });

    it("returns completions matching prefix", () => {
      const completions = registry.getCompletions("he");
      expect(completions).toContain("help");
      expect(completions).not.toContain("history");
    });

    it("includes aliases in completions", () => {
      const completions = registry.getCompletions("h");
      expect(completions).toContain("help");
      expect(completions).toContain("h");
      expect(completions).toContain("history");
    });

    it("returns empty array for no matches", () => {
      const completions = registry.getCompletions("xyz");
      expect(completions.length).toBe(0);
    });
  });
});

// =============================================================================
// Result Helper Tests
// =============================================================================

describe("Result Helpers", () => {
  describe("successResult", () => {
    it("creates success result with no actions", () => {
      const result = successResult();
      expect(result.success).toBe(true);
      expect(result.actions).toEqual([]);
      expect(result.error).toBeUndefined();
    });

    it("creates success result with actions", () => {
      const actions = [{ type: "exit" as const }];
      const result = successResult(actions);
      expect(result.success).toBe(true);
      expect(result.actions).toEqual(actions);
    });
  });

  describe("errorResult", () => {
    it("creates error result", () => {
      const result = errorResult("Something went wrong");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong");
      expect(result.actions).toContainEqual({
        type: "setError",
        message: "Something went wrong",
      });
    });
  });

  describe("actionResult", () => {
    it("creates result with single action", () => {
      const result = actionResult({ type: "toggleHelp" });
      expect(result.success).toBe(true);
      expect(result.actions).toEqual([{ type: "toggleHelp" }]);
    });
  });
});
