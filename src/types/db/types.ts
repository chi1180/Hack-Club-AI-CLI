import type { Message } from "../ai/chatCompletions.types";
import type { Model } from "../ai/getModels.types";

// =============================================================================
// Settings DB
// =============================================================================

export type ModelType = Model;

export interface SettingsDB {
  models: ModelType[];
  lastUsedModel: string;
  showStatusBar: boolean;
  showCommandsHelp: boolean;
}

// =============================================================================
// Chats DB
// =============================================================================

export type ChatsDB = {
  chats: Chat[];
};

export interface ChatMessage extends Message {
  id: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  timestamp: number;
  title: string;
  messages: ChatMessage[];
  starred?: boolean;
}
