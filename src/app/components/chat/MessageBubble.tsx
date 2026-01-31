import { Box, Text } from "ink";
import { PALETTE } from "../../../config";
import type { MessageBubbleProps } from "../../../types/components/chat.types";

/**
 * MessageBubble - Displays a single chat message
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isAssistant = message.role === "assistant";

  // Role label styling
  const getRoleLabel = () => {
    if (isUser) {
      return (
        <Text bold color="#74C0FC">
          You
        </Text>
      );
    }
    if (isSystem) {
      return (
        <Text bold color={PALETTE.warning}>
          System
        </Text>
      );
    }
    return (
      <Text bold color="#51CF66">
        AI
      </Text>
    );
  };

  // Message content styling
  const getContentColor = () => {
    if (isSystem) return PALETTE.dim;
    return undefined; // default color
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Role label */}
      <Box>
        {getRoleLabel()}
        {message.isStreaming && (
          <Text color={PALETTE.dim}> ●</Text>
        )}
      </Box>

      {/* Message content */}
      <Box marginLeft={2} flexDirection="column">
        <Text color={getContentColor()} wrap="wrap">
          {message.content}
          {message.isStreaming && message.content === "" && (
            <Text color={PALETTE.dim}>...</Text>
          )}
        </Text>
      </Box>
    </Box>
  );
}
