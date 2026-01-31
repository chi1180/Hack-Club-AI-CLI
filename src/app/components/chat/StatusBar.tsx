import { Box, Text } from "ink";
import { PALETTE } from "../../../config";
import type { StatusBarProps } from "../../../types/components/chat.types";

/**
 * StatusBar - Displays current model and status information
 */
export default function StatusBar({
  model,
  tokenCount,
  isStreaming = false,
}: StatusBarProps) {
  return (
    <Box
      borderStyle="single"
      borderColor={PALETTE.border}
      paddingX={1}
      justifyContent="space-between"
    >
      {/* Left side - Model info */}
      <Box>
        <Text color={PALETTE.dim}>Model: </Text>
        <Text color={PALETTE.info} bold>
          {model}
        </Text>
      </Box>

      {/* Right side - Status and token count */}
      <Box>
        {isStreaming && (
          <Box marginRight={2}>
            <Text color={PALETTE.warning}>⟳ Streaming</Text>
          </Box>
        )}

        {tokenCount !== undefined && tokenCount > 0 && (
          <Box>
            <Text color={PALETTE.dim}>Tokens: </Text>
            <Text color={PALETTE.success}>{tokenCount.toLocaleString()}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
