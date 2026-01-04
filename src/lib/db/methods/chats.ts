import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { DEFAULT_CHATS } from "../../../config";
import type { Chat, ChatsDB } from "../../../types/db.types";

export class Chats {
  readonly path: string;
  private db: Low<ChatsDB> | null;

  constructor(chatsPath: string) {
    this.path = chatsPath;
    this.db = null;
    JSONFilePreset<ChatsDB>(this.path, DEFAULT_CHATS).then((db) => {
      this.db = db;
    });
  }

  async update(key: keyof ChatsDB, value: ChatsDB[keyof ChatsDB]) {
    if (this.db) {
      await this.db.read();

      switch (key) {
        case "chats":
          this.db.data.chats = value as Chat[];
          break;
      }

      await this.db.write();
    }
  }
}
