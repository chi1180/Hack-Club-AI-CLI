import { API_KEY_NAME } from "../../config";
import type { AIStats } from "../../types/ai/stats.types";
import type { GetModelsResponse } from "../../types/ai/getModels.types";
import type {
  ChatOptions,
  ChatResult,
} from "../../types/ai/chatCompletions.types";
import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  AspectRatio,
} from "../../types/ai/generateImage.types";
import type {
  VisionChatOptions,
  VisionChatResult,
} from "../../types/ai/vision.types";
import { log } from "../log";
import { getModels } from "./methods/getModels";
import { getStats } from "./methods/getStats";
import { chat, chatStream, simpleChat } from "./methods/chat";
import {
  generateImage,
  simpleGenerateImage,
  generateAndSaveImage,
} from "./methods/generateImage";
import {
  visionChat,
  simpleVisionChat,
  analyzeImageUrl,
} from "./methods/vision";

export class AI {
  private readonly API_TOKEN: string;

  // Chat methods
  _getModels: () => Promise<GetModelsResponse["data"]>;
  _getStats: () => Promise<AIStats>;
  _chat: (options: ChatOptions) => Promise<ChatResult>;
  _chatStream: (options: ChatOptions) => Promise<ChatResult>;
  _simpleChat: (
    model: string,
    userMessage: string,
    systemPrompt?: string,
  ) => Promise<string>;

  // Image generation methods
  _generateImage: (
    options: ImageGenerationOptions,
  ) => Promise<ImageGenerationResult>;
  _simpleGenerateImage: (
    prompt: string,
    aspectRatio?: AspectRatio,
  ) => Promise<ImageGenerationResult>;
  _generateAndSaveImage: (
    prompt: string,
    saveDirectory: string,
    options?: Partial<Omit<ImageGenerationOptions, "prompt" | "saveDirectory">>,
  ) => Promise<ImageGenerationResult>;

  // Vision methods
  _visionChat: (options: VisionChatOptions) => Promise<VisionChatResult>;
  _simpleVisionChat: (
    prompt: string,
    imagePath: string,
    model?: string,
  ) => Promise<string>;
  _analyzeImageUrl: (
    prompt: string,
    imageUrl: string,
    model?: string,
  ) => Promise<string>;

  constructor() {
    // get API token from environment variable
    const token = process.env[API_KEY_NAME];
    if (token) {
      this.API_TOKEN = token;
    } else {
      log({
        tag: "error",
        text: `API token not found. Please set the ${API_KEY_NAME} environment variable.`,
      });
      process.exit(1);
    }

    // assign chat methods
    this._getModels = getModels;
    this._getStats = () => getStats(this.API_TOKEN);
    this._chat = (options: ChatOptions) => chat(this.API_TOKEN, options);
    this._chatStream = (options: ChatOptions) =>
      chatStream(this.API_TOKEN, options);
    this._simpleChat = (
      model: string,
      userMessage: string,
      systemPrompt?: string,
    ) => simpleChat(this.API_TOKEN, model, userMessage, systemPrompt);

    // assign image generation methods
    this._generateImage = (options: ImageGenerationOptions) =>
      generateImage(this.API_TOKEN, options);
    this._simpleGenerateImage = (prompt: string, aspectRatio?: AspectRatio) =>
      simpleGenerateImage(this.API_TOKEN, prompt, aspectRatio);
    this._generateAndSaveImage = (
      prompt: string,
      saveDirectory: string,
      options?: Partial<
        Omit<ImageGenerationOptions, "prompt" | "saveDirectory">
      >,
    ) => generateAndSaveImage(this.API_TOKEN, prompt, saveDirectory, options);

    // assign vision methods
    this._visionChat = (options: VisionChatOptions) =>
      visionChat(this.API_TOKEN, options);
    this._simpleVisionChat = (
      prompt: string,
      imagePath: string,
      model?: string,
    ) => simpleVisionChat(this.API_TOKEN, prompt, imagePath, model);
    this._analyzeImageUrl = (
      prompt: string,
      imageUrl: string,
      model?: string,
    ) => analyzeImageUrl(this.API_TOKEN, prompt, imageUrl, model);
  }
}
