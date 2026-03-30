import { Box, Text } from "ink";
import { PALETTE } from "../../../config";

interface ChatHeaderProps {
  chatTitle: string;
  messageCount: number;
  model: string;
  tokenCount: number;
  isStreaming?: boolean;
}

export default function ChatHeader({
  chatTitle,
  messageCount,
  model,
  tokenCount,
  isStreaming = false,
}: ChatHeaderProps) {
  return (
    <Box
      borderStyle="single"
      borderColor={PALETTE.border}
      paddingX={1}
      justifyContent="space-between"
      width="100%"
      height={4}
    >
      {/* Left side - Chat Title */}
      <Box>
        <Text bold color={PALETTE.info}>
          {chatTitle}
        </Text>
        <Text color={PALETTE.dim}> ({messageCount} messages)</Text>
      </Box>

      {/* Right side - Metadata */}
      <Box>
        {isStreaming && (
          <Box marginRight={2}>
            <Text color={PALETTE.warning}>⟳ Streaming</Text>
          </Box>
        )}

        <Box marginRight={2}>
          <Text color={PALETTE.dim}>Model: </Text>
          <Text color={PALETTE.success}>{model}</Text>
        </Box>

        {tokenCount > 0 && (
          <Box>
            <Text color={PALETTE.dim}>Tokens: </Text>
            <Text color={PALETTE.highlight}>{tokenCount.toLocaleString()}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
