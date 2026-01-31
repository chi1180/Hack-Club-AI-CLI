import { test, expect, describe } from "bun:test";
import { Chats } from "../lib/db/methods/chats";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Helper to create isolated test environment
 */
function createTestEnv() {
  const testDir = path.join(
    os.tmpdir(),
    `hackclubaicli-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  );
  fs.mkdirSync(testDir, { recursive: true });
  const chatsPath = path.join(testDir, "chats.json");
  const chats = new Chats(chatsPath);

  const cleanup = () => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  };

  return { testDir, chatsPath, chats, cleanup };
}

/**
 * Chats class methods test
 */
describe("Chats class methods test", () => {
  describe("CRUD operations", () => {
    test("create should create a new chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Test Chat");

        expect(chat).toBeDefined();
        expect(chat.id).toStartWith("chat_");
        expect(chat.title).toBe("Test Chat");
        expect(chat.messages).toEqual([]);
        expect(chat.starred).toBe(false);
      } finally {
        cleanup();
      }
    });

    test("create without title should use default title", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create();

        expect(chat.title).toBe("New Chat");
      } finally {
        cleanup();
      }
    });

    test("get should return a chat by ID", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const created = await chats.create("Get Test");
        const retrieved = await chats.get(created.id);

        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(created.id);
        expect(retrieved?.title).toBe("Get Test");
      } finally {
        cleanup();
      }
    });

    test("get should return undefined for non-existent ID", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const result = await chats.get("non-existent-id");

        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    test("list should return all chats", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Chat 1");
        await chats.create("Chat 2");
        await chats.create("Chat 3");

        const all = await chats.list();

        expect(all.length).toBe(3);
      } finally {
        cleanup();
      }
    });

    test("listSorted should return chats sorted by timestamp", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Oldest");
        await new Promise((r) => setTimeout(r, 10));
        await chats.create("Middle");
        await new Promise((r) => setTimeout(r, 10));
        await chats.create("Newest");

        const sorted = await chats.listSorted();

        expect(sorted[0]?.title).toBe("Newest");
        expect(sorted[2]?.title).toBe("Oldest");
      } finally {
        cleanup();
      }
    });

    test("update should modify chat properties", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Original Title");
        const updated = await chats.update(chat.id, { title: "Updated Title" });

        expect(updated?.title).toBe("Updated Title");

        const retrieved = await chats.get(chat.id);
        expect(retrieved?.title).toBe("Updated Title");
      } finally {
        cleanup();
      }
    });

    test("delete should remove a chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("To Delete");
        const deleted = await chats.delete(chat.id);

        expect(deleted).toBe(true);

        const retrieved = await chats.get(chat.id);
        expect(retrieved).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    test("delete should return false for non-existent ID", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const deleted = await chats.delete("non-existent-id");

        expect(deleted).toBe(false);
      } finally {
        cleanup();
      }
    });

    test("deleteAll should remove all chats", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Chat 1");
        await chats.create("Chat 2");

        await chats.deleteAll();

        const all = await chats.list();
        expect(all.length).toBe(0);
      } finally {
        cleanup();
      }
    });
  });

  describe("Message operations", () => {
    test("addMessage should add a message to a chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Message Test");
        const message = await chats.addMessage(chat.id, "user", "Hello!");

        expect(message).toBeDefined();
        expect(message?.id).toStartWith("msg_");
        expect(message?.role).toBe("user");
        expect(message?.content).toBe("Hello!");
      } finally {
        cleanup();
      }
    });

    test("addMessage should return undefined for non-existent chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const result = await chats.addMessage("non-existent", "user", "Hello!");

        expect(result).toBeUndefined();
      } finally {
        cleanup();
      }
    });

    test("addMessages should add multiple messages", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Multi Message Test");
        const messages = await chats.addMessages(chat.id, [
          { role: "user", content: "Hi!" },
          { role: "assistant", content: "Hello! How can I help?" },
        ]);

        expect(messages?.length).toBe(2);

        const retrieved = await chats.get(chat.id);
        expect(retrieved?.messages.length).toBe(2);
      } finally {
        cleanup();
      }
    });

    test("updateMessage should modify message content", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Update Message Test");
        const msg = await chats.addMessage(chat.id, "user", "Original");
        const updated = await chats.updateMessage(
          chat.id,
          msg!.id,
          "Updated content",
        );

        expect(updated?.content).toBe("Updated content");
      } finally {
        cleanup();
      }
    });

    test("deleteMessage should remove a message", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Delete Message Test");
        const msg = await chats.addMessage(chat.id, "user", "To delete");

        const deleted = await chats.deleteMessage(chat.id, msg!.id);
        expect(deleted).toBe(true);

        const retrieved = await chats.get(chat.id);
        expect(retrieved?.messages.length).toBe(0);
      } finally {
        cleanup();
      }
    });

    test("getMessages should return all messages from a chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Get Messages Test");
        await chats.addMessage(chat.id, "user", "Message 1");
        await chats.addMessage(chat.id, "assistant", "Message 2");

        const messages = await chats.getMessages(chat.id);

        expect(messages?.length).toBe(2);
      } finally {
        cleanup();
      }
    });
  });

  describe("Convenience methods", () => {
    test("rename should change chat title", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Old Name");
        await chats.rename(chat.id, "New Name");

        const retrieved = await chats.get(chat.id);
        expect(retrieved?.title).toBe("New Name");
      } finally {
        cleanup();
      }
    });

    test("toggleStar should toggle starred status", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Star Test");
        expect(chat.starred).toBe(false);

        await chats.toggleStar(chat.id);
        let retrieved = await chats.get(chat.id);
        expect(retrieved?.starred).toBe(true);

        await chats.toggleStar(chat.id);
        retrieved = await chats.get(chat.id);
        expect(retrieved?.starred).toBe(false);
      } finally {
        cleanup();
      }
    });

    test("listStarred should return only starred chats", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat1 = await chats.create("Starred");
        await chats.create("Not Starred");
        await chats.toggleStar(chat1.id);

        const starred = await chats.listStarred();

        expect(starred.length).toBe(1);
        expect(starred[0]?.title).toBe("Starred");
      } finally {
        cleanup();
      }
    });

    test("getMostRecent should return the latest chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Older");
        await new Promise((r) => setTimeout(r, 10));
        await chats.create("Newer");

        const recent = await chats.getMostRecent();

        expect(recent?.title).toBe("Newer");
      } finally {
        cleanup();
      }
    });

    test("count should return the number of chats", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Chat 1");
        await chats.create("Chat 2");

        const count = await chats.count();

        expect(count).toBe(2);
      } finally {
        cleanup();
      }
    });

    test("exists should check if a chat exists", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Exists Test");

        expect(await chats.exists(chat.id)).toBe(true);
        expect(await chats.exists("non-existent")).toBe(false);
      } finally {
        cleanup();
      }
    });

    test("search should find chats by title", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        await chats.create("Apple Pie Recipe");
        await chats.create("Banana Bread");
        await chats.create("Cherry Cake");

        const results = await chats.search("Banana");

        expect(results.length).toBe(1);
        expect(results[0]?.title).toBe("Banana Bread");
      } finally {
        cleanup();
      }
    });

    test("search should find chats by message content", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("General Chat");
        await chats.addMessage(chat.id, "user", "Tell me about TypeScript");

        const results = await chats.search("TypeScript");

        expect(results.length).toBe(1);
      } finally {
        cleanup();
      }
    });

    test("duplicate should create a copy of a chat", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const original = await chats.create("Original");
        await chats.addMessage(original.id, "user", "Hello");

        const copy = await chats.duplicate(original.id);

        expect(copy).toBeDefined();
        expect(copy?.title).toBe("Original (copy)");
        expect(copy?.messages.length).toBe(1);
        expect(copy?.id).not.toBe(original.id);
      } finally {
        cleanup();
      }
    });
  });

  describe("Export methods", () => {
    test("exportChat should return chat as object", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Export Test");
        await chats.addMessage(chat.id, "user", "Test message");

        const exported = (await chats.exportChat(chat.id)) as {
          title: string;
          messages: { role: string; content: string }[];
        };

        expect(exported).toBeDefined();
        expect(exported.title).toBe("Export Test");
        expect(exported.messages.length).toBe(1);
      } finally {
        cleanup();
      }
    });

    test("exportAsMarkdown should return chat as markdown", async () => {
      const { chats, cleanup } = createTestEnv();
      try {
        const chat = await chats.create("Markdown Export");
        await chats.addMessage(chat.id, "user", "Hello!");
        await chats.addMessage(chat.id, "assistant", "Hi there!");

        const markdown = await chats.exportAsMarkdown(chat.id);

        expect(markdown).toBeDefined();
        expect(markdown).toContain("# Markdown Export");
        expect(markdown).toContain("**You:**");
        expect(markdown).toContain("Hello!");
        expect(markdown).toContain("**AI:**");
        expect(markdown).toContain("Hi there!");
      } finally {
        cleanup();
      }
    });
  });

  describe("Persistence", () => {
    test("chats should persist to disk", async () => {
      const { chatsPath, chats, cleanup } = createTestEnv();
      try {
        await chats.create("Persistent Chat");

        // Create a new instance pointing to the same file
        const chats2 = new Chats(chatsPath);
        await new Promise((r) => setTimeout(r, 100));

        const all = await chats2.list();
        expect(all.length).toBe(1);
        expect(all[0]?.title).toBe("Persistent Chat");
      } finally {
        cleanup();
      }
    });
  });
});
