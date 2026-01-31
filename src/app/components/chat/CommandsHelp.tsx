import { Box, Text } from "ink";
import { PALETTE } from "../../../config";
import type { CommandsHelpProps } from "../../../types/components/chat.types";

/**
 * CommandsHelp - Displays available commands help
 */
export default function CommandsHelp({ visible = true }: CommandsHelpProps) {
  if (!visible) return null;

  const commands = [
    { key: "/new", desc: "New chat" },
    { key: "/chats", desc: "List conversations" },
    { key: "/image", desc: "Generate image" },
    { key: "/models", desc: "Switch AI model" },
    { key: "/stats", desc: "View usage stats" },
    { key: "/title", desc: "Rename chat" },
    { key: "/star", desc: "Star/unstar chat" },
    { key: "/clear", desc: "Clear messages" },
    { key: "/help", desc: "Toggle this help" },
    { key: "/quit", desc: "Exit CLI" },
  ];

  const specialPrefixes = [
    { key: "@file:path", desc: "Attach image for analysis" },
  ];

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
        {commands.map((cmd) => (
          <Box key={cmd.key} marginRight={2}>
            <Text color={PALETTE.info} bold>
              {cmd.key}
            </Text>
            <Text color={PALETTE.dim}> {cmd.desc}</Text>
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
