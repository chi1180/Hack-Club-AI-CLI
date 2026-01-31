import type { Message } from "../ai/chatCompletions.types";

// =============================================================================
// Message Display Types
// =============================================================================

/**
 * Extended message type for UI display
 */
export interface DisplayMessage extends Message {
  id: string;
  timestamp: number;
  isStreaming?: boolean;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for MessageBubble component
 */
export interface MessageBubbleProps {
  message: DisplayMessage;
}

/**
 * Props for MessageList component
 */
export interface MessageListProps {
  messages: DisplayMessage[];
}

/**
 * Props for InputBox component
 */
export interface InputBoxProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Props for StatusBar component
 */
export interface StatusBarProps {
  model: string;
  tokenCount?: number;
  isStreaming?: boolean;
}

/**
 * Props for CommandsHelp component
 */
export interface CommandsHelpProps {
  visible?: boolean;
}

/**
 * Props for ChatContainer component
 */
export interface ChatContainerProps {
  initialModel?: string;
}

// =============================================================================
// Chat State Types
// =============================================================================

/**
 * Chat view state
 */
export type ChatViewState = "idle" | "loading" | "streaming" | "error";

/**
 * Chat context state
 */
export interface ChatState {
  messages: DisplayMessage[];
  viewState: ChatViewState;
  currentModel: string;
  error?: string;
}
