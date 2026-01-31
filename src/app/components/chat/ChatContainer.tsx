import { useState, useCallback, useEffect, useRef } from "react";
import { Box, Text, useApp } from "ink";
import { AI } from "../../../lib/ai/ai";
import { DB } from "../../../lib/db/db";
import { PALETTE, APP_DIRECTORY_NAME } from "../../../config";
import type {
  ChatContainerProps,
  DisplayMessage,
  ChatViewState,
} from "../../../types/components/chat.types";
import type { Message } from "../../../types/ai/chatCompletions.types";
import type { ImageGenerationResult } from "../../../types/ai/generateImage.types";
import {
  parseFileAttachment,
  getFileInfo,
} from "../../../lib/ai/methods/vision";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import StatusBar from "./StatusBar";
import CommandsHelp from "./CommandsHelp";
import { ImageGenerator } from "../image";
import path from "node:path";

/**
 * Generate a unique ID for messages
 */
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * View mode for the container
 */
type ViewMode = "chat" | "imageGenerator";

/**
 * Vision-capable models for image analysis
 */
const VISION_MODEL = "google/gemini-2.5-flash";

/**
 * ChatContainer - Main chat interface component
 */
export default function ChatContainer({
  initialModel = "qwen/qwen3-32b",
}: ChatContainerProps) {
  const { exit } = useApp();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [imagePrompt, setImagePrompt] = useState<string | undefined>(undefined);

  // State
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [viewState, setViewState] = useState<ChatViewState>("idle");
  const [currentModel] = useState(initialModel);
  const [totalTokens, setTotalTokens] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);

  // Current chat state
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("New Chat");

  // AI and DB instances
  const [ai] = useState(() => new AI());
  const [db] = useState(() => {
    const appPath = path.join(process.cwd(), APP_DIRECTORY_NAME);
    return new DB(appPath);
  });

  // Ref to track if init has run
  const initRan = useRef(false);

  /**
   * Create a new chat session
   */
  const createNewChat = useCallback(async () => {
    try {
      const chat = await db._Chats.create();
      setCurrentChatId(chat.id);
      setCurrentChatTitle(chat.title);
      setMessages([]);
      setTotalTokens(0);
      setError(null);
      return chat;
    } catch (_err) {
      setError("Failed to create new chat");
      return null;
    }
  }, [db]);

  /**
   * Save current message to chat history
   */
  const saveMessageToHistory = useCallback(
    async (role: "user" | "assistant" | "system", content: string) => {
      if (!currentChatId) return;

      try {
        await db._Chats.addMessage(currentChatId, role, content);
      } catch (_err) {
        // Silently fail - don't interrupt chat flow
      }
    },
    [currentChatId, db],
  );

  /**
   * Update chat title based on first message
   */
  const updateChatTitle = useCallback(
    async (firstUserMessage: string) => {
      if (!currentChatId) return;

      // Generate a simple title from the first message
      const title =
        firstUserMessage.length > 50
          ? firstUserMessage.substring(0, 47) + "..."
          : firstUserMessage;

      try {
        await db._Chats.rename(currentChatId, title);
        setCurrentChatTitle(title);
      } catch (_err) {
        // Silently fail
      }
    },
    [currentChatId, db],
  );

  /**
   * Initialize chat on first mount
   */
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    const initChat = async () => {
      // Try to get most recent chat or create a new one
      const recent = await db._Chats.getMostRecent();
      if (recent && recent.messages.length === 0) {
        // Resume empty recent chat
        setCurrentChatId(recent.id);
        setCurrentChatTitle(recent.title);
        setMessages([]);
      } else {
        // Create new chat
        const chat = await db._Chats.create();
        setCurrentChatId(chat.id);
        setCurrentChatTitle(chat.title);
        setMessages([]);
      }
    };

    initChat();
  }, [db]);

  /**
   * Handle image generation completion
   */
  const handleImageGenerationComplete = useCallback(
    (result: ImageGenerationResult | null) => {
      setViewMode("chat");
      setImagePrompt(undefined);

      if (result?.success) {
        // Add a system message about the generated image
        const imageMessage: DisplayMessage = {
          id: generateId(),
          role: "assistant",
          content: `🎨 Image generated successfully!\n${result.textContent || ""}\n${result.images
            .map((img) => (img.savedPath ? `📁 Saved: ${img.savedPath}` : ""))
            .filter(Boolean)
            .join("\n")}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, imageMessage]);

        // Save to chat history if we have an active chat
        if (currentChatId) {
          saveMessageToHistory("assistant", imageMessage.content);
        }

        // Update token count if available
        if (result.usage !== undefined) {
          const tokenCount = result.usage.totalTokens;
          setTotalTokens((prev) => prev + tokenCount);
        }
      } else if (result) {
        setError(result.error || "Image generation failed");
      }
    },
    [currentChatId, saveMessageToHistory],
  );

  /**
   * Handle image generation cancel
   */
  const handleImageGenerationCancel = useCallback(() => {
    setViewMode("chat");
    setImagePrompt(undefined);
  }, []);

  /**
   * Handle slash commands
   */
  const handleCommand = useCallback(
    async (command: string) => {
      const parts = command.trim().split(" ");
      const cmdName = parts[0]?.toLowerCase() ?? "";
      const args = parts.slice(1);

      switch (cmdName) {
        case "/quit":
        case "/exit":
        case "/q":
          exit();
          break;

        case "/clear":
          setMessages([]);
          setTotalTokens(0);
          setError(null);
          break;

        case "/new":
          await createNewChat();
          break;

        case "/help":
          setShowHelp((prev) => !prev);
          break;

        case "/image":
        case "/img":
        case "/generate": {
          // If there's a prompt after the command, use it
          const prompt = args.length > 0 ? args.join(" ") : undefined;
          setImagePrompt(prompt);
          setViewMode("imageGenerator");
          break;
        }

        case "/chats":
          if (args.length > 0 && args[0]?.toLowerCase() === "new") {
            await createNewChat();
          } else {
            // TODO: Implement chats list view
            const count = await db._Chats.count();
            setError(`You have ${count} saved chats. Chats view coming soon!`);
          }
          break;

        case "/star":
          if (currentChatId) {
            await db._Chats.toggleStar(currentChatId);
            setError("Chat starred!");
          }
          break;

        case "/title":
          if (args.length > 0 && currentChatId) {
            const newTitle = args.join(" ");
            await db._Chats.rename(currentChatId, newTitle);
            setCurrentChatTitle(newTitle);
          } else {
            setError("Usage: /title <new title>");
          }
          break;

        case "/export":
          if (currentChatId) {
            const markdown = await db._Chats.exportAsMarkdown(currentChatId);
            if (markdown) {
              // For now, just show success message
              setError("Export functionality coming soon!");
            }
          }
          break;

        case "/models":
          // TODO: Implement models view
          setError("Models view not implemented yet. Using: " + currentModel);
          break;

        case "/stats":
          // TODO: Implement stats view
          try {
            const stats = await ai._getStats();
            setError(
              `Total requests: ${stats.totalRequests}, Total tokens: ${stats.totalTokens}`,
            );
          } catch {
            setError("Failed to fetch stats");
          }
          break;

        default:
          setError(
            `Unknown command: ${command}. Type /help for available commands.`,
          );
      }
    },
    [exit, currentChatId, currentModel, db, ai, createNewChat],
  );

  /**
   * Handle user message submission with optional file attachment
   */
  const handleSubmit = useCallback(
    async (text: string) => {
      // Check for commands
      if (text.startsWith("/")) {
        await handleCommand(text);
        return;
      }

      // Clear any previous error
      setError(null);

      // Ensure we have a chat session
      if (!currentChatId) {
        const chat = await createNewChat();
        if (!chat) {
          setError("Failed to create chat session");
          return;
        }
      }

      // Check for @file attachment
      const { cleanedMessage, filePath } = parseFileAttachment(text);
      let hasImageAttachment = false;
      let displayContent = text;

      if (filePath) {
        // Validate the file
        const fileInfo = await getFileInfo(filePath);

        if (!fileInfo.exists) {
          setError(`File not found: ${filePath}`);
          return;
        }

        if (!fileInfo.isImage) {
          setError(
            `Unsupported file type. Supported: PNG, JPEG, GIF, WebP, BMP`,
          );
          return;
        }

        hasImageAttachment = true;
        displayContent = `📎 ${path.basename(filePath)}\n${cleanedMessage}`;
      }

      // Create user message
      const userMessage: DisplayMessage = {
        id: generateId(),
        role: "user",
        content: displayContent,
        timestamp: Date.now(),
      };

      // Create placeholder for assistant message
      const assistantMessage: DisplayMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      // Add messages to state
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setViewState("streaming");

      // Save user message to history
      await saveMessageToHistory("user", displayContent);

      // Update title if this is the first message
      if (messages.length === 0) {
        await updateChatTitle(cleanedMessage || text);
      }

      try {
        let fullContent = "";

        if (hasImageAttachment && filePath) {
          // Use vision API for image analysis
          const result = await ai._visionChat({
            model: VISION_MODEL,
            prompt: cleanedMessage || "What's in this image?",
            images: [{ type: "file", data: filePath }],
            stream: true,
            onContent: (chunk) => {
              fullContent += chunk;
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = fullContent;
                }
                return updated;
              });
            },
          });

          // Update token count if available
          if (result.usage.total_tokens > 0) {
            setTotalTokens((prev) => prev + result.usage.total_tokens);
          }
        } else {
          // Regular chat without image
          const apiMessages: Message[] = messages.map((m) => ({
            role: m.role,
            content: m.content,
          }));
          apiMessages.push({ role: "user", content: text });

          const result = await ai._chatStream({
            model: currentModel,
            messages: apiMessages,
            onContent: (chunk) => {
              fullContent += chunk;
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = fullContent;
                }
                return updated;
              });
            },
          });

          // Update token count if available
          if (result.usage.total_tokens > 0) {
            setTotalTokens((prev) => prev + result.usage.total_tokens);
          }
        }

        // Update final state
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.isStreaming = false;
          }
          return updated;
        });

        // Save assistant message to history
        await saveMessageToHistory("assistant", fullContent);

        setViewState("idle");
      } catch (err) {
        setViewState("error");
        setError(err instanceof Error ? err.message : "An error occurred");

        // Remove the failed assistant message
        setMessages((prev) => prev.slice(0, -1));
      }
    },
    [
      ai,
      currentModel,
      messages,
      currentChatId,
      createNewChat,
      saveMessageToHistory,
      updateChatTitle,
      handleCommand,
    ],
  );

  const isDisabled = viewState === "streaming" || viewState === "loading";

  // Render image generator if in that mode
  if (viewMode === "imageGenerator") {
    return (
      <ImageGenerator
        initialPrompt={imagePrompt}
        onComplete={handleImageGenerationComplete}
        onCancel={handleImageGenerationCancel}
      />
    );
  }

  return (
    <Box flexDirection="column" width="100%">
      {/* Status Bar */}
      <StatusBar
        model={currentModel}
        tokenCount={totalTokens}
        isStreaming={viewState === "streaming"}
      />

      {/* Chat Title */}
      <Box paddingX={1} marginBottom={1}>
        <Text color={PALETTE.dim}>Chat: </Text>
        <Text bold>{currentChatTitle}</Text>
        {currentChatId && (
          <Text color={PALETTE.dim}> ({messages.length} messages)</Text>
        )}
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <MessageList messages={messages} />
      </Box>

      {/* Error display */}
      {error && (
        <Box paddingX={1} marginBottom={1}>
          <Text color={PALETTE.error}>⚠ {error}</Text>
        </Box>
      )}

      {/* Input Box */}
      <Box paddingX={1}>
        <Box flexGrow={1}>
          <InputBox
            onSubmit={handleSubmit}
            disabled={isDisabled}
            placeholder={
              isDisabled
                ? "Waiting for response..."
                : "Type a message or /command... (use @file:path to attach image)"
            }
          />
        </Box>
      </Box>

      {/* Commands Help */}
      <CommandsHelp visible={showHelp && messages.length === 0} />
    </Box>
  );
}
