import { API_ENDPOINTS } from "../../../config";
import {
  ChatCompletionsResponseSchema,
  StreamingChunkSchema,
  type ChatOptions,
  type ChatResult,
  type Message,
  type StreamingChunk,
} from "../../../types/ai/chatCompletions.types";
import { log } from "../../log";

/**
 * Send a chat completion request (non-streaming)
 */
export async function chat(
  apiToken: string,
  options: ChatOptions
): Promise<ChatResult> {
  const { model, messages, temperature, max_tokens, top_p } = options;

  const requestBody = {
    model,
    messages,
    stream: false,
    ...(temperature !== undefined && { temperature }),
    ...(max_tokens !== undefined && { max_tokens }),
    ...(top_p !== undefined && { top_p }),
  };

  const response = await fetch(API_ENDPOINTS.SINGLE_SHOT_CHAT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log({
      tag: "error",
      text: `Chat API error: ${response.status} ${response.statusText} - ${errorText}`,
    });
    throw new Error(`Chat API error: ${response.status}`);
  }

  const data = await response.json();
  const result = ChatCompletionsResponseSchema.parse(data);

  return {
    content: result.choices[0]?.message.content ?? "",
    usage: result.usage,
    finishReason: result.choices[0]?.finish_reason ?? "unknown",
  };
}

/**
 * Send a chat completion request with streaming
 */
export async function chatStream(
  apiToken: string,
  options: ChatOptions
): Promise<ChatResult> {
  const { model, messages, temperature, max_tokens, top_p, onChunk, onContent } =
    options;

  const requestBody = {
    model,
    messages,
    stream: true,
    ...(temperature !== undefined && { temperature }),
    ...(max_tokens !== undefined && { max_tokens }),
    ...(top_p !== undefined && { top_p }),
  };

  const response = await fetch(API_ENDPOINTS.SINGLE_SHOT_CHAT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log({
      tag: "error",
      text: `Chat API error: ${response.status} ${response.statusText} - ${errorText}`,
    });
    throw new Error(`Chat API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let finishReason = "unknown";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();

          if (data === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const streamChunk = StreamingChunkSchema.parse(parsed);

            // Call onChunk callback if provided
            if (onChunk) {
              onChunk(streamChunk);
            }

            // Extract content from delta
            const deltaContent = streamChunk.choices[0]?.delta.content;
            if (deltaContent) {
              fullContent += deltaContent;

              // Call onContent callback if provided
              if (onContent) {
                onContent(deltaContent);
              }
            }

            // Check for finish reason
            const reason = streamChunk.choices[0]?.finish_reason;
            if (reason) {
              finishReason = reason;
            }
          } catch {
            // Skip invalid JSON chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: fullContent,
    usage: {
      prompt_tokens: 0, // Not available in streaming mode
      completion_tokens: 0,
      total_tokens: 0,
    },
    finishReason,
  };
}

/**
 * Simple chat helper - sends a single message and returns the response
 */
export async function simpleChat(
  apiToken: string,
  model: string,
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  const messages: Message[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: userMessage });

  const result = await chat(apiToken, { model, messages });
  return result.content;
}
