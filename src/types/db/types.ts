// =============================================================================
// Chats DB
// =============================================================================

export type ChatsDB = {
  chats: Chat[];
};

export interface Chat {
  id: string;
  timestamp: number;
  title: string;
  messages: []; // TODO: define message type
  starred?: boolean;
}
