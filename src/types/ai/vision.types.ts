import { z } from "zod";

// =============================================================================
// Vision-capable Models
// =============================================================================

/**
 * Models that support vision (image input)
 */
export type VisionCapableModel =
  | "google/gemini-2.5-flash"
  | "google/gemini-2.5-pro"
  | "google/gemini-2.0-flash"
  | "anthropic/claude-sonnet-4"
  | "anthropic/claude-3.5-sonnet"
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini";

export const VisionCapableModelSchema = z.enum([
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.0-flash",
  "anthropic/claude-sonnet-4",
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
]);

// =============================================================================
// Content Part Schemas
// =============================================================================

/**
 * Text content part
 */
export const TextContentPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

/**
 * Image URL content part
 */
export const ImageUrlContentPartSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    /**
     * URL of the image (can be a public URL or a base64 data URL)
     */
    url: z.string(),
  }),
});

/**
 * Union of content parts
 */
export const ContentPartSchema = z.union([
  TextContentPartSchema,
  ImageUrlContentPartSchema,
]);

/**
 * Message content can be a string or an array of content parts
 */
export const VisionMessageContentSchema = z.union([
  z.string(),
  z.array(ContentPartSchema),
]);

// =============================================================================
// Vision Message Schema
// =============================================================================

/**
 * Vision-enabled message schema
 */
export const VisionMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: VisionMessageContentSchema,
});

/**
 * Array of vision messages
 */
export const VisionMessagesSchema = z.array(VisionMessageSchema);

// =============================================================================
// Types
// =============================================================================

export type TextContentPart = z.infer<typeof TextContentPartSchema>;
export type ImageUrlContentPart = z.infer<typeof ImageUrlContentPartSchema>;
export type ContentPart = z.infer<typeof ContentPartSchema>;
export type VisionMessageContent = z.infer<typeof VisionMessageContentSchema>;
export type VisionMessage = z.infer<typeof VisionMessageSchema>;
export type VisionMessages = z.infer<typeof VisionMessagesSchema>;

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Image source type
 */
export type ImageSourceType = "url" | "file" | "base64";

/**
 * Image attachment for chat
 */
export interface ImageAttachment {
  /**
   * Source type of the image
   */
  type: ImageSourceType;

  /**
   * The image data
   * - For 'url': the public URL
   * - For 'file': the file path
   * - For 'base64': the base64-encoded data (with or without data URL prefix)
   */
  data: string;

  /**
   * Optional MIME type (required for base64 without data URL prefix)
   */
  mimeType?: string;

  /**
   * Original filename (for display purposes)
   */
  filename?: string;
}

/**
 * Options for vision chat
 */
export interface VisionChatOptions {
  /**
   * Model to use (must be vision-capable)
   */
  model: string;

  /**
   * Text prompt
   */
  prompt: string;

  /**
   * Images to analyze
   */
  images: ImageAttachment[];

  /**
   * Optional system prompt
   */
  systemPrompt?: string;

  /**
   * Enable streaming
   */
  stream?: boolean;

  /**
   * Temperature for generation
   */
  temperature?: number;

  /**
   * Maximum tokens to generate
   */
  max_tokens?: number;

  /**
   * Callback for streaming content
   */
  onContent?: (content: string) => void;
}

/**
 * Result from vision chat
 */
export interface VisionChatResult {
  /**
   * The assistant's response content
   */
  content: string;

  /**
   * Token usage information
   */
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };

  /**
   * Reason for completion
   */
  finishReason: string;
}

/**
 * Parsed file attachment from user input
 */
export interface ParsedFileAttachment {
  /**
   * The file path
   */
  path: string;

  /**
   * Whether the file exists
   */
  exists: boolean;

  /**
   * File size in bytes (if exists)
   */
  size?: number;

  /**
   * Detected MIME type
   */
  mimeType?: string;

  /**
   * Whether the file is an image
   */
  isImage: boolean;

  /**
   * Error message if file cannot be read
   */
  error?: string;
}

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
] as const;

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

/**
 * Check if a MIME type is a supported image type
 */
export function isSupportedImageType(mimeType: string): mimeType is SupportedImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType);
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
  const ext = extension.toLowerCase().replace(/^\./, "");
  const mimeMap: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  return mimeMap[ext] ?? null;
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string | null {
  const extMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
  };
  return extMap[mimeType] ?? null;
}
