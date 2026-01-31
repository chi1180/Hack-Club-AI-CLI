import { useMemo } from "react";
import { Box, Text } from "ink";
import { PALETTE } from "../../../config";
import type { CommandsHelpProps } from "../../../types/components/chat.types";
import { commandRegistry } from "../../../lib/commands";
import type { CommandCategory } from "../../../types/commands/command.types";

/**
 * Category display order and labels
 */
const CATEGORY_CONFIG: Record<
  CommandCategory,
  { label: string; order: number }
> = {
  chat: { label: "Chat", order: 1 },
  ai: { label: "AI", order: 2 },
  navigation: { label: "Navigation", order: 3 },
  utility: { label: "Utility", order: 4 },
  system: { label: "System", order: 5 },
};

const specialPrefixes = [
  { key: "@file:path", desc: "Attach image for analysis" },
];

/**
 * CommandsHelp - Displays available commands help
 * Dynamically pulls command list from the command registry
 */
export default function CommandsHelp({ visible = true }: CommandsHelpProps) {
  // Get commands from registry, grouped by category
  // Hooks must be called before any early returns
  const commandsByCategory = useMemo(() => {
    const commands = commandRegistry.getCommandList();
    const grouped = new Map<CommandCategory, typeof commands>();

    for (const cmd of commands) {
      const existing = grouped.get(cmd.category) ?? [];
      existing.push(cmd);
      grouped.set(cmd.category, existing);
    }

    // Sort categories by order
    const sortedCategories = Array.from(grouped.entries()).sort(
      ([a], [b]) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order,
    );

    return sortedCategories;
  }, []);

  // Flatten commands for simple display
  const allCommands = useMemo(() => {
    return commandsByCategory.flatMap(([_, cmds]) => cmds);
  }, [commandsByCategory]);

  // Early return after all hooks have been called
  if (!visible) return null;

  return (
    <Box
      borderStyle="single"
      borderColor={PALETTE.border}
      paddingX={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text bold color={PALETTE.highlight}>
          Commands
        </Text>
      </Box>

      <Box flexWrap="wrap" marginBottom={1}>
        {allCommands.map((cmd) => (
          <Box key={cmd.name} marginRight={2}>
            <Text color={PALETTE.info} bold>
              /{cmd.name}
            </Text>
            <Text color={PALETTE.dim}> {cmd.description}</Text>
          </Box>
        ))}
      </Box>

      <Box>
        <Text color={PALETTE.dim}>Special: </Text>
        {specialPrefixes.map((prefix) => (
          <Box key={prefix.key} marginRight={2}>
            <Text color={PALETTE.warning} bold>
              {prefix.key}
            </Text>
            <Text color={PALETTE.dim}> {prefix.desc}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
