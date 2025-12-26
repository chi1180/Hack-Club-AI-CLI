import { Database } from "bun:sqlite";
import fs from "node:fs";
import type {
  ChatRow,
  ConfigRow,
  ImageRow,
  ThreadRow,
} from "../types/db.types";

// =============================================================================
// Database Class
// =============================================================================

export class DB {
  dbFileName: string;
  db: Database | null;

  constructor(dbFileName: string) {
    this.dbFileName = dbFileName;
    this.db = null;
  }

  exists(): boolean {
    return fs.existsSync(this.dbFileName);
  }

  connect(): void {
    this.db = new Database(this.dbFileName, {
      create: true,
    });
    this.dbInitialize();
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }

  private dbInitialize(): void {
    if (!this.db) return;

    // Config table - key-value store for app settings
    this.db.run(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Chats table - metadata for each chat session
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        summary TEXT,
        messageCount INTEGER DEFAULT 0,
        tokenCount INTEGER DEFAULT 0,
        isFavorite INTEGER DEFAULT 0,
        isArchived INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Threads table - actual message history for each chat
    this.db.run(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        messages TEXT DEFAULT '[]',
        FOREIGN KEY (id) REFERENCES chats(id) ON DELETE CASCADE
      )
    `);

    // Images table - generated images
    this.db.run(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        model TEXT NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT NOT NULL,
        images TEXT DEFAULT '[]',
        localPaths TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // Templates table - prompt templates
    this.db.run(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        variables TEXT DEFAULT '[]',
        usageCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Aliases table - command aliases
    this.db.run(`
      CREATE TABLE IF NOT EXISTS aliases (
        alias TEXT PRIMARY KEY,
        command TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Initialize default config values if not exist
    this.initializeDefaultConfig();
  }

  private initializeDefaultConfig(): void {
    if (!this.db) return;

    const defaults: Record<string, string> = {
      models: "[]",
      currentModel: "",
      totalChats: "0",
      totalRequests: "0",
      totalTokens: "0",
      totalPromptTokens: "0",
      totalCompletionTokens: "0",
      imageOutputDir: "",
      autoSave: "true",
    };

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
    `);

    for (const [key, value] of Object.entries(defaults)) {
      stmt.run(key, value);
    }
  }

  // =============================================================================
  // Config Methods
  // =============================================================================

  getConfig(key: string): string | null {
    if (!this.db) return null;
    const row = this.db
      .query<ConfigRow, [string]>("SELECT value FROM config WHERE key = ?")
      .get(key);
    return row?.value ?? null;
  }

  setConfig(key: string, value: string): void {
    if (!this.db) return;
    this.db.run("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", [
      key,
      value,
    ]);
  }

  getAllConfig(): Record<string, string> {
    if (!this.db) return {};
    const rows = this.db
      .query<ConfigRow, []>("SELECT key, value FROM config")
      .all();
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  // =============================================================================
  // Chat Methods
  // =============================================================================

  createChat(id: string, title: string, tags: string[] = []): void {
    if (!this.db) return;
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO chats (id, title, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [id, title, JSON.stringify(tags), now, now],
    );

    this.db.run(`INSERT INTO threads (id, messages) VALUES (?, '[]')`, [id]);
  }

  getChat(id: string): ChatRow | null {
    if (!this.db) return null;
    return (
      this.db
        .query<ChatRow, [string]>("SELECT * FROM chats WHERE id = ?")
        .get(id) ?? null
    );
  }

  getChatByTitle(title: string): ChatRow | null {
    if (!this.db) return null;
    return (
      this.db
        .query<ChatRow, [string]>("SELECT * FROM chats WHERE title = ?")
        .get(title) ?? null
    );
  }

  listChats(limit?: number, tags?: string[]): ChatRow[] {
    if (!this.db) return [];

    let query = "SELECT * FROM chats WHERE isArchived = 0";
    const params: (string | number)[] = [];

    if (tags && tags.length > 0) {
      // Filter by tags (check if any tag matches)
      const tagConditions = tags.map(() => "tags LIKE ?").join(" OR ");
      query += ` AND (${tagConditions})`;
      for (const tag of tags) {
        params.push(`%"${tag}"%`);
      }
    }

    query += " ORDER BY updatedAt DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }

    return this.db.query<ChatRow, (string | number)[]>(query).all(...params);
  }

  deleteChat(id: string): void {
    if (!this.db) return;
    this.db.run("DELETE FROM threads WHERE id = ?", [id]);
    this.db.run("DELETE FROM chats WHERE id = ?", [id]);
  }

  // =============================================================================
  // Thread Methods
  // =============================================================================

  getThread(id: string): ThreadRow | null {
    if (!this.db) return null;
    return (
      this.db
        .query<ThreadRow, [string]>("SELECT * FROM threads WHERE id = ?")
        .get(id) ?? null
    );
  }

  updateThreadMessages(id: string, messages: unknown[]): void {
    if (!this.db) return;
    this.db.run("UPDATE threads SET messages = ? WHERE id = ?", [
      JSON.stringify(messages),
      id,
    ]);

    // Update chat metadata
    const now = new Date().toISOString();
    this.db.run(
      "UPDATE chats SET messageCount = ?, updatedAt = ? WHERE id = ?",
      [messages.length, now, id],
    );
  }

  // =============================================================================
  // Image methods
  // =============================================================================

  createImage(
    id: string,
    model: string,
    prompt: string,
    content: string,
    images: string[],
    localPaths: string[] | null,
  ): void {
    if (!this.db) return;
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO images (id, model, prompt, content, images, localPaths, createdAt) VALUES (?, ?, ?, ?, ?, ? , ?)`,
      [
        id,
        model,
        prompt,
        content,
        JSON.stringify(images),
        JSON.stringify(localPaths),
        now,
      ],
    );
  }

  listImages(limit?: number): ImageRow[] {
    if (!this.db) return [];

    if (limit) {
      return this.db
        .query<
          ImageRow,
          [number]
        >(`SELECT * FROM images ORDER BY createdAt DESC LIMIT ?`)
        .all(limit);
    }

    return this.db
      .query<ImageRow, []>("SELECT * FROM images ORDER BY createdAt DESC")
      .all();
  }

  deleteImage(id: string): void {
    if (!this.db) return;
    this.db.run("DELETE FROM images WHERE id = ?", [id]);
  }
}
