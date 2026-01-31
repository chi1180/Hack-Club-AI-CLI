import { Box, Text } from "ink";
import { PALETTE } from "../../../config";
import type { MessageListProps } from "../../../types/components/chat.types";
import MessageBubble from "./MessageBubble";

/**
 * MessageList - Displays a list of chat messages
 */
export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={PALETTE.dim}>
          No messages yet. Type a message to start chatting!
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </Box>
  );
}
