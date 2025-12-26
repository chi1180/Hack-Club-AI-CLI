import { Box, Text, Newline, useInput } from "ink";
import { useAppContext } from "../../hooks/useAppContext";
import Log from "../../components/log";

// =============================================================================
// Types
// =============================================================================

interface HelpScreenProps {
  command?: string;
}

// =============================================================================
// Help Data
// =============================================================================

interface CommandHelp {
  description: string;
  subCommands?: Record<
    string,
    {
      description: string;
      args?: string[];
      flags?: Record<string, string>;
    }
  >;
}

const COMMANDS: Record<string, CommandHelp> = {
  chat: {
    description: "Chat with AI",
    subCommands: {
      new: {
        description: "Start a new chat",
        args: ["[title]"],
        flags: {
          "--tmp": "Temporary chat (no saving)",
          "--tags": "Comma-separated tags for the chat",
        },
      },
      list: {
        description: "List all existing chats",
        args: ["[limit]"],
        flags: {
          "--tags": "Filter by tags",
        },
      },
      delete: {
        description: "Delete an existing chat",
        args: ["[title]"],
      },
      search: {
        description: "Search in local chat history",
        args: ["<query>"],
      },
      export: {
        description: "Export chat to file",
        args: ["[title]"],
        flags: {
          "--format":
            "Export format: markdown, json, or txt (default: markdown)",
          "--output": "Output directory path (default: ./exports/)",
        },
      },
      summarize: {
        description: "Generate summary of a chat",
        args: ["[title]"],
      },
    },
  },
  image: {
    description: "Generate images with AI",
    subCommands: {
      generate: {
        description: "Generate new images",
        args: ["<prompt>"],
        flags: {
          "--output": "Local directory to save images",
        },
      },
      list: {
        description: "List all generated images",
        args: ["[limit]"],
      },
      delete: {
        description: "Delete an existing image",
        args: ["[image_id...]"],
      },
      analyze: {
        description: "Analyze an image with AI",
        args: ["<path>"],
        flags: {
          "--prompt":
            'Additional prompt for analysis (default: "What\'s in this image?")',
        },
      },
    },
  },
  search: {
    description: "Search with AI",
    subCommands: {
      web: {
        description: "Perform a web search",
        args: ["<query>"],
      },
    },
  },
  model: {
    description: "Manage AI models",
    subCommands: {
      list: {
        description: "List all available AI models",
      },
      use: {
        description: "Set the current AI model",
        args: ["<model_id>"],
      },
      add: {
        description: "Add new AI models",
        args: ["<model_id...>"],
      },
      remove: {
        description: "Remove an existing AI model",
        args: ["<model_id...>"],
      },
      info: {
        description: "Get information about the AI model",
        args: ["[model_id]"],
      },
    },
  },
  template: {
    description: "Manage prompt templates",
    subCommands: {
      create: {
        description: "Create a new template",
        args: ["<name>"],
      },
      use: {
        description: "Use an existing template",
        args: ["[name]"],
      },
      list: {
        description: "List all templates",
      },
      delete: {
        description: "Delete a template",
        args: ["[name]"],
      },
    },
  },
  alias: {
    description: "Manage command aliases",
    subCommands: {
      set: {
        description: "Create a new alias",
        args: ["<alias>", "<command>"],
      },
      list: {
        description: "List all aliases",
      },
      delete: {
        description: "Delete an alias",
        args: ["[alias]"],
      },
    },
  },
  stats: {
    description: "Show usage statistics",
    subCommands: {
      "": {
        description: "Display usage statistics",
        flags: {
          "--model": "Filter by model ID",
          "--date": "Filter by date (YYYY-MM format)",
        },
      },
    },
  },
  context: {
    description: "Context-aware conversation mode",
    subCommands: {
      start: {
        description: "Start context mode (all commands share context)",
      },
      end: {
        description: "End context mode",
      },
    },
  },
  config: {
    description: "Manage application configuration",
    subCommands: {
      show: {
        description: "Show current configuration and usage statistics",
      },
      set: {
        description: "Set a configuration value",
        args: ["<key>", "<value>"],
      },
      get: {
        description: "Get a configuration value",
        args: ["<key>"],
      },
    },
  },
  help: {
    description: "Show help information about this app",
    subCommands: {
      "": {
        description: "Show help for specific command",
        args: ["[command]"],
      },
    },
  },
  exit: {
    description: "Exit the application",
  },
};

// =============================================================================
// Helper Components
// =============================================================================

function CommandOverview() {
  return (
    <Box flexDirection="column">
      <Log tag="info" text="Available Commands" />
      <Newline />
      {Object.entries(COMMANDS).map(([name, cmd]) => (
        <Box key={name} marginLeft={2}>
          <Text color="cyan" bold>
            /{name}
          </Text>
          <Text color="gray"> - {cmd.description}</Text>
        </Box>
      ))}
      <Newline />
      <Text color="gray">
        Use /help [command] for more details on a specific command.
      </Text>
    </Box>
  );
}

function CommandDetail({ command }: { command: string }) {
  const cmd = COMMANDS[command];

  if (!cmd) {
    return (
      <Box flexDirection="column">
        <Log tag="error" text={`Unknown command: /${command}`} />
        <Newline />
        <Text color="gray">Use /help to see all available commands.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan" bold>
          /{command}
        </Text>
        <Text color="gray"> - {cmd.description}</Text>
      </Box>
      <Newline />

      {cmd.subCommands && Object.keys(cmd.subCommands).length > 0 && (
        <>
          <Text bold>Subcommands:</Text>
          {Object.entries(cmd.subCommands).map(([subName, sub]) => (
            <Box
              key={subName}
              flexDirection="column"
              marginLeft={2}
              marginTop={1}
            >
              <Box>
                <Text color="yellow">{subName ? subName : "(default)"}</Text>
                {sub.args && sub.args.length > 0 && (
                  <Text color="gray"> {sub.args.join(" ")}</Text>
                )}
              </Box>
              <Box marginLeft={2}>
                <Text color="gray">{sub.description}</Text>
              </Box>
              {sub.flags && Object.keys(sub.flags).length > 0 && (
                <Box flexDirection="column" marginLeft={2}>
                  {Object.entries(sub.flags).map(([flag, desc]) => (
                    <Box key={flag}>
                      <Text color="magenta">{flag}</Text>
                      <Text color="gray"> - {desc}</Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </>
      )}

      <Newline />
      <Text color="gray">Press Ctrl+C or type /exit to quit.</Text>
    </Box>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function HelpScreen({ command }: HelpScreenProps) {
  const { goBack } = useAppContext();

  // キー入力を処理
  useInput((input, key) => {
    // Enter, Escape, q で戻る
    if (key.return || key.escape || input.toLowerCase() === "q") {
      goBack();
    }
  });

  return (
    <Box flexDirection="column">
      {command ? <CommandDetail command={command} /> : <CommandOverview />}
      <Newline />
      <Box>
        <Text color="gray">Press Enter, Escape, or 'q' to go back...</Text>
      </Box>
    </Box>
  );
}
