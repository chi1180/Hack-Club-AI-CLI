import { API_ENDPOINTS } from "../../../config";
import {
  type ImageAttachment,
  type VisionChatOptions,
  type VisionChatResult,
  type ContentPart,
  type VisionMessage,
  getMimeTypeFromExtension,
  isSupportedImageType,
} from "../../../types/ai/vision.types";
import {
  ChatCompletionsResponseSchema,
  StreamingChunkSchema,
  type ChatCompletionsResponse,
} from "../../../types/ai/chatCompletions.types";
import { log } from "../../log";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Read a file and convert it to a base64 data URL
 */
async function fileToBase64DataUrl(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const buffer = await fs.readFile(absolutePath);
  const base64 = buffer.toString("base64");

  // Get MIME type from extension
  const ext = path.extname(filePath);
  const mimeType = getMimeTypeFromExtension(ext) ?? "image/png";

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Check if a file exists and is readable
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    await fs.access(absolutePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert an ImageAttachment to an image_url content part
 */
async function attachmentToContentPart(
  attachment: ImageAttachment,
): Promise<ContentPart> {
  let url: string;

  switch (attachment.type) {
    case "url":
      // Use URL directly
      url = attachment.data;
      break;

    case "file":
      // Read file and convert to base64
      if (!(await fileExists(attachment.data))) {
        throw new Error(`File not found: ${attachment.data}`);
      }
      url = await fileToBase64DataUrl(attachment.data);
      break;

    case "base64":
      // Check if it already has the data URL prefix
      if (attachment.data.startsWith("data:")) {
        url = attachment.data;
      } else {
        // Add the data URL prefix
        const mimeType = attachment.mimeType ?? "image/png";
        url = `data:${mimeType};base64,${attachment.data}`;
      }
      break;

    default:
      throw new Error(`Unknown attachment type: ${attachment.type}`);
  }

  return {
    type: "image_url",
    image_url: { url },
  };
}

/**
 * Build vision messages with images
 */
async function buildVisionMessages(
  options: VisionChatOptions,
): Promise<VisionMessage[]> {
  const messages: VisionMessage[] = [];

  // Add system prompt if provided
  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt,
    });
  }

  // Build content parts for user message
  const contentParts: ContentPart[] = [];

  // Add text prompt
  contentParts.push({
    type: "text",
    text: options.prompt,
  });

  // Add images
  for (const image of options.images) {
    const imagePart = await attachmentToContentPart(image);
    contentParts.push(imagePart);
  }

  // Add user message with content parts
  messages.push({
    role: "user",
    content: contentParts,
  });

  return messages;
}

/**
 * Vision chat - send images to vision-capable models for analysis
 *
 * @param apiKey - API key for authentication
 * @param options - Vision chat options
 * @returns VisionChatResult with the assistant's analysis
 */
export async function visionChat(
  apiKey: string,
  options: VisionChatOptions,
): Promise<VisionChatResult> {
  // Validate that we have at least one image
  if (!options.images || options.images.length === 0) {
    throw new Error("At least one image is required for vision chat");
  }

  // Build messages with images
  const messages = await buildVisionMessages(options);

  // Build request body
  const requestBody: Record<string, unknown> = {
    model: options.model,
    messages,
    stream: options.stream ?? false,
  };

  if (options.temperature !== undefined) {
    requestBody.temperature = options.temperature;
  }

  if (options.max_tokens !== undefined) {
    requestBody.max_tokens = options.max_tokens;
  }

  // Handle streaming vs non-streaming
  if (options.stream && options.onContent) {
    return visionChatStream(apiKey, requestBody, options.onContent);
  }

  // Non-streaming request
  const response = await fetch(API_ENDPOINTS.SINGLE_SHOT_CHAT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Vision API request failed (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();

  // Parse and validate response
  const parseResult = ChatCompletionsResponseSchema.safeParse(data);

  if (!parseResult.success) {
    log({
      tag: "warn",
      text: `Response validation warning: ${parseResult.error.message}`,
    });
  }

  const responseData: ChatCompletionsResponse = parseResult.success
    ? parseResult.data
    : (data as ChatCompletionsResponse);
  const firstChoice = responseData.choices?.[0];

  if (!firstChoice) {
    throw new Error("No response choices returned from API");
  }

  return {
    content: firstChoice.message?.content ?? "",
    usage: responseData.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    finishReason: firstChoice.finish_reason ?? "unknown",
  };
}

/**
 * Vision chat with streaming
 */
async function visionChatStream(
  apiKey: string,
  requestBody: Record<string, unknown>,
  onContent: (content: string) => void,
): Promise<VisionChatResult> {
  // Enable streaming
  requestBody.stream = true;

  const response = await fetch(API_ENDPOINTS.SINGLE_SHOT_CHAT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Vision API request failed (${response.status}): ${errorText}`,
    );
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  let fullContent = "";
  let finishReason = "stop";

  // Read the stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE events
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed === "data: [DONE]") {
        continue;
      }

      if (trimmed.startsWith("data: ")) {
        const jsonStr = trimmed.slice(6);

        try {
          const chunk = JSON.parse(jsonStr);
          const parseResult = StreamingChunkSchema.safeParse(chunk);
          const chunkData = parseResult.success ? parseResult.data : chunk;

          const delta = chunkData.choices?.[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            onContent(delta.content);
          }

          const reason = chunkData.choices?.[0]?.finish_reason;
          if (reason) {
            finishReason = reason;
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }

  return {
    content: fullContent,
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
    finishReason,
  };
}

/**
 * Simple vision chat helper
 *
 * @param apiKey - API key for authentication
 * @param prompt - Text prompt describing what to analyze
 * @param imagePath - Path to the image file
 * @param model - Model to use (default: google/gemini-2.5-flash)
 * @returns The assistant's analysis
 */
export async function simpleVisionChat(
  apiKey: string,
  prompt: string,
  imagePath: string,
  model: string = "google/gemini-2.5-flash",
): Promise<string> {
  const result = await visionChat(apiKey, {
    model,
    prompt,
    images: [{ type: "file", data: imagePath }],
  });

  return result.content;
}

/**
 * Analyze an image from URL
 *
 * @param apiKey - API key for authentication
 * @param prompt - Text prompt describing what to analyze
 * @param imageUrl - Public URL of the image
 * @param model - Model to use (default: google/gemini-2.5-flash)
 * @returns The assistant's analysis
 */
export async function analyzeImageUrl(
  apiKey: string,
  prompt: string,
  imageUrl: string,
  model: string = "google/gemini-2.5-flash",
): Promise<string> {
  const result = await visionChat(apiKey, {
    model,
    prompt,
    images: [{ type: "url", data: imageUrl }],
  });

  return result.content;
}

/**
 * Parse file path from @file syntax in user message
 * Returns the file path and the cleaned message
 */
export function parseFileAttachment(message: string): {
  cleanedMessage: string;
  filePath: string | null;
} {
  // Match @file:path or @file:"path with spaces" or @file:'path with spaces'
  const patterns = [/@file:"([^"]+)"/g, /@file:'([^']+)'/g, /@file:(\S+)/g];

  let filePath: string | null = null;
  let cleanedMessage = message;

  for (const pattern of patterns) {
    const match = pattern.exec(message);
    if (match?.[1]) {
      filePath = match[1];
      cleanedMessage = message.replace(match[0], "").trim();
      break;
    }
  }

  return { cleanedMessage, filePath };
}

/**
 * Check if a file path points to a supported image
 */
export async function isImageFile(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = getMimeTypeFromExtension(ext);

  if (!mimeType) return false;

  return isSupportedImageType(mimeType);
}

/**
 * Get file info for attachment
 */
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean;
  size?: number;
  mimeType?: string;
  isImage: boolean;
}> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  try {
    const stats = await fs.stat(absolutePath);
    const ext = path.extname(filePath);
    const mimeType = getMimeTypeFromExtension(ext);
    const isImage = mimeType ? isSupportedImageType(mimeType) : false;

    return {
      exists: true,
      size: stats.size,
      mimeType: mimeType ?? undefined,
      isImage,
    };
  } catch {
    return {
      exists: false,
      isImage: false,
    };
  }
}
