import { API_ENDPOINTS, IMAGE_GENERATIVE_MODELS } from "../../../config";
import {
  GenerateImageResponseSchema,
  type ImageGenerativeModel,
  type ImageGenerationOptions,
  type ImageGenerationResult,
  type ParsedImageData,
  type AspectRatio,
  type GenerateImageResponse,
} from "../../../types/ai/generateImage.types";
import { log } from "../../log";
import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Default model for image generation
 */
const DEFAULT_IMAGE_MODEL: ImageGenerativeModel =
  "google/gemini-2.5-flash-image";

/**
 * Default aspect ratio
 */
const DEFAULT_ASPECT_RATIO: AspectRatio = "1:1";

/**
 * Parse a base64 data URL into its components
 */
export function parseBase64DataUrl(dataUrl: string): ParsedImageData | null {
  // Match data URL pattern: data:image/png;base64,<data>
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);

  if (!match || !match[1] || !match[2]) {
    return null;
  }

  const mimeType: string = match[1];
  const base64Data: string = match[2];

  // Get file extension from mime type
  const extensionMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };

  const extension = extensionMap[mimeType] || "png";

  // Decode base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");

  return {
    mimeType,
    extension,
    base64Data,
    buffer,
  };
}

/**
 * Generate a unique filename based on timestamp
 */
function generateFilename(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .replace("Z", "");
  return `image_${timestamp}`;
}

/**
 * Ensure directory exists, create if it doesn't
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save image buffer to file
 */
async function saveImageToFile(
  buffer: Buffer,
  directory: string,
  filename: string,
  extension: string,
): Promise<string> {
  await ensureDirectory(directory);

  const fullFilename = `${filename}.${extension}`;
  const filePath = path.join(directory, fullFilename);

  await fs.writeFile(filePath, buffer);

  return filePath;
}

/**
 * Generate an image using the Hack Club AI API
 *
 * @param apiKey - API key for authentication
 * @param options - Image generation options
 * @returns ImageGenerationResult with generated image data
 */
export async function generateImage(
  apiKey: string,
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const {
    prompt,
    model = DEFAULT_IMAGE_MODEL,
    aspectRatio = DEFAULT_ASPECT_RATIO,
    temperature,
    systemPrompt,
    saveDirectory,
    filename,
  } = options;

  // Validate model
  const isValidModel = IMAGE_GENERATIVE_MODELS.includes(model);
  if (!isValidModel) {
    return {
      success: false,
      textContent: "",
      images: [],
      error: `Invalid model: ${model}. Please use one of: ${IMAGE_GENERATIVE_MODELS.join(", ")}`,
    };
  }

  // Build messages array
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [];

  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: prompt,
  });

  // Build request body
  const requestBody: Record<string, unknown> = {
    model,
    messages,
    modalities: ["image", "text"],
  };

  // Add image config for aspect ratio
  if (aspectRatio && aspectRatio !== "1:1") {
    requestBody.image_config = {
      aspect_ratio: aspectRatio,
    };
  }

  if (temperature !== undefined) {
    requestBody.temperature = temperature;
  }

  try {
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
      return {
        success: false,
        textContent: "",
        images: [],
        error: `API request failed (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();

    // Parse and validate response
    const parseResult = GenerateImageResponseSchema.safeParse(data);

    if (!parseResult.success) {
      log({
        tag: "warn",
        text: `Response validation warning: ${parseResult.error.message}`,
      });
      // Continue with raw data if validation fails - API might return slightly different format
    }

    const responseData: GenerateImageResponse = parseResult.success
      ? parseResult.data
      : (data as GenerateImageResponse);

    // Extract content from first choice
    const firstChoice = responseData.choices?.[0];
    if (!firstChoice) {
      return {
        success: false,
        textContent: "",
        images: [],
        error: "No response choices returned from API",
      };
    }

    const textContent = firstChoice.message?.content || "";
    const rawImages = firstChoice.message?.images || [];

    // Process images
    const processedImages: ImageGenerationResult["images"] = [];
    const baseFilename = filename || generateFilename();

    for (let i = 0; i < rawImages.length; i++) {
      const imageData = rawImages[i];
      const dataUrl = imageData?.image_url?.url;

      if (!dataUrl) {
        continue;
      }

      const parsed = parseBase64DataUrl(dataUrl);

      if (!parsed) {
        // If not a data URL, it might be a regular URL
        processedImages.push({
          dataUrl,
          mimeType: "image/unknown",
          base64Data: "",
        });
        continue;
      }

      const imageResult: ImageGenerationResult["images"][0] = {
        dataUrl,
        mimeType: parsed.mimeType,
        base64Data: parsed.base64Data,
      };

      // Save to file if directory is specified
      if (saveDirectory) {
        try {
          const imageFilename =
            rawImages.length > 1 ? `${baseFilename}_${i + 1}` : baseFilename;

          const savedPath = await saveImageToFile(
            parsed.buffer,
            saveDirectory,
            imageFilename,
            parsed.extension,
          );

          imageResult.savedPath = savedPath;
        } catch (saveError) {
          log({
            tag: "warn",
            text: `Failed to save image: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
          });
        }
      }

      processedImages.push(imageResult);
    }

    // Build usage info
    const usage = responseData.usage
      ? {
          promptTokens: responseData.usage.prompt_tokens,
          completionTokens: responseData.usage.completion_tokens,
          totalTokens: responseData.usage.total_tokens,
        }
      : undefined;

    return {
      success: true,
      textContent,
      images: processedImages,
      usage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    log({
      tag: "error",
      text: `Image generation failed: ${errorMessage}`,
    });

    return {
      success: false,
      textContent: "",
      images: [],
      error: errorMessage,
    };
  }
}

/**
 * Simple helper for quick image generation with minimal options
 *
 * @param apiKey - API key for authentication
 * @param prompt - Image description prompt
 * @param aspectRatio - Optional aspect ratio (default: "1:1")
 * @returns ImageGenerationResult
 */
export async function simpleGenerateImage(
  apiKey: string,
  prompt: string,
  aspectRatio?: AspectRatio,
): Promise<ImageGenerationResult> {
  return generateImage(apiKey, {
    prompt,
    aspectRatio,
  });
}

/**
 * Generate and save an image to a specified directory
 *
 * @param apiKey - API key for authentication
 * @param prompt - Image description prompt
 * @param saveDirectory - Directory to save the image
 * @param options - Additional options
 * @returns ImageGenerationResult with saved file paths
 */
export async function generateAndSaveImage(
  apiKey: string,
  prompt: string,
  saveDirectory: string,
  options?: Partial<Omit<ImageGenerationOptions, "prompt" | "saveDirectory">>,
): Promise<ImageGenerationResult> {
  return generateImage(apiKey, {
    prompt,
    saveDirectory,
    ...options,
  });
}
