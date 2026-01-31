import { z } from "zod";

// =============================================================================
// Models
// =============================================================================

/**
 * Image generative models available in the Hack Club AI API
 * Note: Only `google/gemini-2.5-flash-image` is currently available
 */
export type ImageGenerativeModel = "google/gemini-2.5-flash-image";

export const ImageGenerativeModelSchema = z.enum([
  "google/gemini-2.5-flash-image",
]);

// =============================================================================
// Aspect Ratios
// =============================================================================

export type AspectRatio =
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "4:5"
  | "5:4"
  | "3:2"
  | "2:3"
  | "21:9";

export const AspectRatioSchema = z.enum([
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "4:5",
  "5:4",
  "3:2",
  "2:3",
  "21:9",
]);

export const ASPECT_RATIO_DESCRIPTIONS: Record<AspectRatio, string> = {
  "1:1": "Square (1024×1024)",
  "16:9": "Landscape Wide (1344×768)",
  "9:16": "Portrait Tall (768×1344)",
  "4:3": "Landscape Standard (1184×864)",
  "3:4": "Portrait Standard (864×1184)",
  "4:5": "Portrait (896×1152)",
  "5:4": "Landscape (1152×896)",
  "3:2": "Landscape Photo (1248×832)",
  "2:3": "Portrait Photo (832×1248)",
  "21:9": "Ultra Wide (1536×672)",
};

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Image configuration for aspect ratio
 */
export const ImageConfigSchema = z.object({
  aspect_ratio: AspectRatioSchema.optional(),
});

/**
 * Image generation request schema
 */
export const GenerateImageRequestSchema = z.object({
  /**
   * Model ID - must be an image-capable model
   */
  model: ImageGenerativeModelSchema,

  /**
   * Array of message objects
   */
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    }),
  ),

  /**
   * Required: Set to ["image", "text"] for image generation
   */
  modalities: z.tuple([z.literal("image"), z.literal("text")]),

  /**
   * Optional image configuration
   */
  image_config: ImageConfigSchema.optional(),

  /**
   * Controls randomness, 0-2 (default: 1.0)
   */
  temperature: z.number().min(0).max(2).optional(),

  /**
   * Maximum tokens to generate
   */
  max_tokens: z.number().optional(),

  /**
   * Enable streaming
   */
  stream: z.boolean().optional(),
});

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Image URL object in response
 */
export const ImageUrlSchema = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    /**
     * Base64 encoded image data URL (e.g., "data:image/png;base64,...")
     */
    url: z.string(),
  }),
});

/**
 * Response message with images
 */
export const ImageResponseMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string(),
  images: z.array(ImageUrlSchema).optional(),
});

/**
 * Choice in image generation response
 */
export const ImageChoiceSchema = z.object({
  index: z.number(),
  message: ImageResponseMessageSchema,
  finish_reason: z.string().nullable(),
});

/**
 * Usage information for image generation
 */
export const ImageUsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

/**
 * Complete image generation response schema
 */
export const GenerateImageResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(ImageChoiceSchema),
  usage: ImageUsageSchema.optional(),
});

// =============================================================================
// Types
// =============================================================================

export type ImageConfig = z.infer<typeof ImageConfigSchema>;
export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>;
export type ImageUrl = z.infer<typeof ImageUrlSchema>;
export type ImageResponseMessage = z.infer<typeof ImageResponseMessageSchema>;
export type ImageChoice = z.infer<typeof ImageChoiceSchema>;
export type ImageUsage = z.infer<typeof ImageUsageSchema>;
export type GenerateImageResponse = z.infer<typeof GenerateImageResponseSchema>;

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  /**
   * The prompt describing the image to generate
   */
  prompt: string;

  /**
   * Model to use for generation
   * @default "google/gemini-2.5-flash-image"
   */
  model?: ImageGenerativeModel;

  /**
   * Aspect ratio for the generated image
   * @default "1:1"
   */
  aspectRatio?: AspectRatio;

  /**
   * Temperature for generation (0-2)
   * @default 1.0
   */
  temperature?: number;

  /**
   * Optional system prompt for context
   */
  systemPrompt?: string;

  /**
   * Directory to save the generated image
   * If not provided, image data is returned but not saved
   */
  saveDirectory?: string;

  /**
   * Custom filename (without extension)
   * If not provided, a timestamp-based name is used
   */
  filename?: string;
}

/**
 * Result of image generation
 */
export interface ImageGenerationResult {
  /**
   * Whether the generation was successful
   */
  success: boolean;

  /**
   * Text content from the response (description, etc.)
   */
  textContent: string;

  /**
   * Array of generated images
   */
  images: {
    /**
     * Base64 data URL of the image
     */
    dataUrl: string;

    /**
     * Extracted mime type (e.g., "image/png")
     */
    mimeType: string;

    /**
     * Raw base64 data (without data URL prefix)
     */
    base64Data: string;

    /**
     * File path if saved to disk
     */
    savedPath?: string;
  }[];

  /**
   * Token usage information
   */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /**
   * Error message if generation failed
   */
  error?: string;
}

/**
 * Parsed image data from base64 data URL
 */
export interface ParsedImageData {
  mimeType: string;
  extension: string;
  base64Data: string;
  buffer: Buffer;
}
