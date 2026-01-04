import type { ChatCompletionsRequest } from "./chatCompletions.types";

export type ImageGenerativeModel =
  | "google/gemini-2.5-flash-image-preview"
  | "google/gemini-3-pro-image-preview";

// =============================================================================
// Request
// =============================================================================

/**
 * @abstract The structure of image generation request. Extends the structure of completion chat request
 */
export interface GenerateImageRequest extends ChatCompletionsRequest {
  /**
   * @type ImageGenerativeModel
   * @requires Yes
   * @description only image generative models assignable
   */
  model: ImageGenerativeModel;
  modalities: string[];
  image_config: {
    aspect_ratio: string;
  };
}
