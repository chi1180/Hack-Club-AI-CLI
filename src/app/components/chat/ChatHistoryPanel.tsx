import { Box, Text, useInput } from "ink";
import { useEffect, useState, useCallback } from "react";
import { PALETTE } from "../../../config";
import type { Chat } from "../../../types/db/types";
import type { DB } from "../../../lib/db/db";

interface ChatHistoryPanelProps {
  db: DB;
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistoryPanel({
  db,
  currentChatId,
  onChatSelect,
  onNewChat,
}: ChatHistoryPanelProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const chatList = await db._Chats.listSorted();
      setChats(chatList);
    } catch (err) {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadChats();
    // Refresh every 2 seconds to show new chats
    const interval = setInterval(loadChats, 2000);
    return () => clearInterval(interval);
  }, [loadChats]);

  // Keyboard navigation (Ctrl+L to toggle focus on sidebar)
  useInput(
    (input, key) => {
      // Toggle sidebar focus with Ctrl+L
      if (key.ctrl && input === "l") {
        setIsFocused((prev) => !prev);
        return;
      }

      // Only process other keys when focused
      if (!isFocused) return;

      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(chats.length - 1, prev + 1));
      } else if (key.return && chats[selectedIndex]) {
        onChatSelect(chats[selectedIndex].id);
        setIsFocused(false);
      } else if (input === "n") {
        onNewChat();
        setIsFocused(false);
      } else if (key.escape) {
        setIsFocused(false);
      }
    },
    { isActive: true },
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box
      flexDirection="column"
      width={process.stdout.columns / 4}
      borderStyle="single"
      borderColor={isFocused ? PALETTE.highlight : PALETTE.border}
      paddingX={1}
      flexGrow={0}
      flexShrink={0}
    >
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color={isFocused ? PALETTE.highlight : PALETTE.info}>
          💬 Chats {isFocused && "★"}
        </Text>
        <Text color={PALETTE.dim}>({chats.length})</Text>
      </Box>

      {/* Navigation hint */}
      {isFocused && (
        <Box marginBottom={1}>
          <Text color={PALETTE.dim}>↑↓:Navigate Enter:Open N:New Esc:Exit</Text>
        </Box>
      )}

      {/* New Chat Button (visual only - actual new chat created on first message) */}
      <Box
        paddingY={0}
        paddingX={1}
        borderStyle="round"
        borderColor={PALETTE.success}
      >
        <Text color={PALETTE.success} bold>
          ⨁ New Chat (auto)
        </Text>
      </Box>

      {/* Chat List */}
      <Box flexDirection="column" flexGrow={1} overflowY="visible">
        {isLoading ? (
          <Text color={PALETTE.dim}>Loading...</Text>
        ) : chats.length === 0 ? (
          <Text color={PALETTE.dim}>No chats yet</Text>
        ) : (
          chats.map((chat, index) => {
            const isActive = chat.id === currentChatId;
            const isSelected = isFocused && index === selectedIndex;
            const messageCount = chat.messages.length;

            return (
              <Box
                key={chat.id}
                flexDirection="column"
                paddingX={1}
                paddingY={0}
                borderStyle={
                  isActive ? "round" : isSelected ? "round" : "single"
                }
                borderColor={
                  isActive
                    ? PALETTE.highlight
                    : isSelected
                      ? PALETTE.success
                      : PALETTE.dim
                }
              >
                <Box>
                  {chat.starred && <Text color={PALETTE.warning}>⭐ </Text>}
                  {isSelected && <Text color={PALETTE.success}>▶ </Text>}
                  <Text
                    bold={isActive}
                    color={
                      isActive
                        ? PALETTE.highlight
                        : isSelected
                          ? PALETTE.success
                          : PALETTE.info
                    }
                    wrap="truncate-end"
                  >
                    {chat.title.length > 20
                      ? chat.title.substring(0, 17) + "..."
                      : chat.title}
                  </Text>
                </Box>
                <Box justifyContent="space-between">
                  <Text color={PALETTE.dim} dimColor>
                    {messageCount} msg{messageCount !== 1 ? "s" : ""}
                  </Text>
                  <Text color={PALETTE.dim} dimColor>
                    {formatDate(chat.timestamp)}
                  </Text>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Tips / Notification Box */}
      <Box
        flexDirection="column"
        marginTop={1}
        paddingX={1}
        paddingY={0}
        borderStyle="round"
        borderColor={PALETTE.info}
      >
        <Text color={PALETTE.info} bold>
          💡 Quick Tips
        </Text>
        <Box flexDirection="column" marginTop={0}>
          <Text color={PALETTE.dim}>• Ctrl+L - Toggle sidebar</Text>
          <Text color={PALETTE.dim}>• /help - Show commands</Text>
          <Text color={PALETTE.dim}>• @file - Attach image</Text>
        </Box>
      </Box>
    </Box>
  );
}
