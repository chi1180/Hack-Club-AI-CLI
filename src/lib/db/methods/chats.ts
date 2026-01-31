import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { DEFAULT_CHATS } from "../../../config";
import type { Chat, ChatMessage, ChatsDB } from "../../../types/db/types";

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export class Chats {
  readonly path: string;
  private db: Low<ChatsDB> | null;
  private initPromise: Promise<void>;

  constructor(chatsPath: string) {
    this.path = chatsPath;
    this.db = null;
    this.initPromise = this.init();
  }

  /**
   * Initialize the database
   */
  private async init(): Promise<void> {
    this.db = await JSONFilePreset<ChatsDB>(this.path, DEFAULT_CHATS);
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureDb(): Promise<Low<ChatsDB>> {
    await this.initPromise;
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    await this.db.read();
    return this.db;
  }

  // ===========================================================================
  // CRUD Operations
  // ===========================================================================

  /**
   * Create a new chat
   */
  async create(title?: string): Promise<Chat> {
    const db = await this.ensureDb();

    const chat: Chat = {
      id: generateId(),
      timestamp: Date.now(),
      title: title || "New Chat",
      messages: [],
      starred: false,
    };

    db.data.chats.unshift(chat); // Add to beginning
    await db.write();

    return chat;
  }

  /**
   * Get a chat by ID
   */
  async get(id: string): Promise<Chat | undefined> {
    const db = await this.ensureDb();
    return db.data.chats.find((chat) => chat.id === id);
  }

  /**
   * Get all chats
   */
  async list(): Promise<Chat[]> {
    const db = await this.ensureDb();
    return db.data.chats;
  }

  /**
   * Get all chats sorted by timestamp (newest first)
   */
  async listSorted(): Promise<Chat[]> {
    const db = await this.ensureDb();
    return [...db.data.chats].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get starred chats
   */
  async listStarred(): Promise<Chat[]> {
    const db = await this.ensureDb();
    return db.data.chats.filter((chat) => chat.starred);
  }

  /**
   * Search chats by title or message content
   */
  async search(query: string): Promise<Chat[]> {
    const db = await this.ensureDb();
    const lowerQuery = query.toLowerCase();

    return db.data.chats.filter((chat) => {
      // Search in title
      if (chat.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // Search in messages
      return chat.messages.some((msg) =>
        msg.content.toLowerCase().includes(lowerQuery),
      );
    });
  }

  /**
   * Update a chat's properties
   */
  async update(
    id: string,
    updates: Partial<Omit<Chat, "id" | "messages">>,
  ): Promise<Chat | undefined> {
    const db = await this.ensureDb();
    const chatIndex = db.data.chats.findIndex((chat) => chat.id === id);

    if (chatIndex === -1) {
      return undefined;
    }

    const chat = db.data.chats[chatIndex];
    if (chat) {
      Object.assign(chat, updates);
      await db.write();
      return chat;
    }

    return undefined;
  }

  /**
   * Delete a chat by ID
   */
  async delete(id: string): Promise<boolean> {
    const db = await this.ensureDb();
    const initialLength = db.data.chats.length;
    db.data.chats = db.data.chats.filter((chat) => chat.id !== id);

    if (db.data.chats.length < initialLength) {
      await db.write();
      return true;
    }

    return false;
  }

  /**
   * Delete all chats
   */
  async deleteAll(): Promise<void> {
    const db = await this.ensureDb();
    db.data.chats = [];
    await db.write();
  }

  // ===========================================================================
  // Message Operations
  // ===========================================================================

  /**
   * Add a message to a chat
   */
  async addMessage(
    chatId: string,
    role: "user" | "assistant" | "system",
    content: string,
  ): Promise<ChatMessage | undefined> {
    const db = await this.ensureDb();
    const chat = db.data.chats.find((c) => c.id === chatId);

    if (!chat) {
      return undefined;
    }

    const message: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
    };

    chat.messages.push(message);
    chat.timestamp = Date.now(); // Update chat timestamp
    await db.write();

    return message;
  }

  /**
   * Add multiple messages to a chat
   */
  async addMessages(
    chatId: string,
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ): Promise<ChatMessage[] | undefined> {
    const db = await this.ensureDb();
    const chat = db.data.chats.find((c) => c.id === chatId);

    if (!chat) {
      return undefined;
    }

    const newMessages: ChatMessage[] = messages.map((msg) => ({
      id: generateMessageId(),
      role: msg.role,
      content: msg.content,
      timestamp: Date.now(),
    }));

    chat.messages.push(...newMessages);
    chat.timestamp = Date.now();
    await db.write();

    return newMessages;
  }

  /**
   * Update a message in a chat
   */
  async updateMessage(
    chatId: string,
    messageId: string,
    content: string,
  ): Promise<ChatMessage | undefined> {
    const db = await this.ensureDb();
    const chat = db.data.chats.find((c) => c.id === chatId);

    if (!chat) {
      return undefined;
    }

    const message = chat.messages.find((m) => m.id === messageId);
    if (!message) {
      return undefined;
    }

    message.content = content;
    await db.write();

    return message;
  }

  /**
   * Delete a message from a chat
   */
  async deleteMessage(chatId: string, messageId: string): Promise<boolean> {
    const db = await this.ensureDb();
    const chat = db.data.chats.find((c) => c.id === chatId);

    if (!chat) {
      return false;
    }

    const initialLength = chat.messages.length;
    chat.messages = chat.messages.filter((m) => m.id !== messageId);

    if (chat.messages.length < initialLength) {
      await db.write();
      return true;
    }

    return false;
  }

  /**
   * Get messages from a chat
   */
  async getMessages(chatId: string): Promise<ChatMessage[] | undefined> {
    const chat = await this.get(chatId);
    return chat?.messages;
  }

  // ===========================================================================
  // Convenience Methods
  // ===========================================================================

  /**
   * Rename a chat
   */
  async rename(id: string, title: string): Promise<Chat | undefined> {
    return this.update(id, { title });
  }

  /**
   * Toggle star status
   */
  async toggleStar(id: string): Promise<Chat | undefined> {
    const chat = await this.get(id);
    if (!chat) {
      return undefined;
    }
    return this.update(id, { starred: !chat.starred });
  }

  /**
   * Get the most recent chat
   */
  async getMostRecent(): Promise<Chat | undefined> {
    const db = await this.ensureDb();
    if (db.data.chats.length === 0) {
      return undefined;
    }
    return db.data.chats.reduce((latest, chat) =>
      chat.timestamp > latest.timestamp ? chat : latest,
    );
  }

  /**
   * Get chat count
   */
  async count(): Promise<number> {
    const db = await this.ensureDb();
    return db.data.chats.length;
  }

  /**
   * Check if a chat exists
   */
  async exists(id: string): Promise<boolean> {
    const chat = await this.get(id);
    return chat !== undefined;
  }

  /**
   * Duplicate a chat
   */
  async duplicate(id: string): Promise<Chat | undefined> {
    const original = await this.get(id);
    if (!original) {
      return undefined;
    }

    const db = await this.ensureDb();

    const newChat: Chat = {
      id: generateId(),
      timestamp: Date.now(),
      title: `${original.title} (copy)`,
      messages: original.messages.map((msg) => ({
        ...msg,
        id: generateMessageId(),
        timestamp: Date.now(),
      })),
      starred: false,
    };

    db.data.chats.unshift(newChat);
    await db.write();

    return newChat;
  }

  /**
   * Export a chat as a simple object (for JSON export)
   */
  async exportChat(id: string): Promise<object | undefined> {
    const chat = await this.get(id);
    if (!chat) {
      return undefined;
    }

    return {
      title: chat.title,
      createdAt: new Date(chat.timestamp).toISOString(),
      starred: chat.starred,
      messages: chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString(),
      })),
    };
  }

  /**
   * Export a chat as Markdown
   */
  async exportAsMarkdown(id: string): Promise<string | undefined> {
    const chat = await this.get(id);
    if (!chat) {
      return undefined;
    }

    const lines: string[] = [
      `# ${chat.title}`,
      "",
      `*Created: ${new Date(chat.timestamp).toLocaleString()}*`,
      chat.starred ? "*⭐ Starred*" : "",
      "",
      "---",
      "",
    ];

    for (const msg of chat.messages) {
      const roleLabel =
        msg.role === "user"
          ? "**You:**"
          : msg.role === "assistant"
            ? "**AI:**"
            : "**System:**";

      lines.push(roleLabel);
      lines.push("");
      lines.push(msg.content);
      lines.push("");
    }

    return lines.join("\n");
  }

  // ===========================================================================
  // Legacy Support
  // ===========================================================================

  /**
   * Update entire chats array (legacy method)
   */
  async updateAll(chats: Chat[]): Promise<void> {
    const db = await this.ensureDb();
    db.data.chats = chats;
    await db.write();
  }
}
