import { API_ENDPOINTS, IMAGE_GENERATIVE_MODELS } from "../../../config";
import type { ImageGenerativeModel } from "../../../types/ai/generateImage.types";
import { log } from "../../log";

export async function generateImage(
  apiKey: string,
  prompt: string,
  model: ImageGenerativeModel,
) {
  const isImageGenerativeModel = IMAGE_GENERATIVE_MODELS.includes(model);

  if (isImageGenerativeModel) {
    const requestBody = {
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["image", "text"],
    };

    const response = await fetch(API_ENDPOINTS.SINGLE_SHOT_CHAT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data;
  } else {
    log({
      tag: "error",
      text: `The selected model (${model}) does not support image generation.`,
    });
    log({
      tag: "info",
      text: `Please select one of the following image generative models: ${IMAGE_GENERATIVE_MODELS.join(", ")}`,
    });
  }
}
