import { API_ENDPOINTS } from "../../../config";
import {
  GetModelsResponseSchema,
  type GetModelsResponse,
} from "../../../types/ai/getModels.types";
import { log } from "../../log";

export async function getModels(): Promise<GetModelsResponse["data"]> {
  log({
    tag: "info",
    text: "Fetching available models from API...",
  });

  const response = await fetch(API_ENDPOINTS.LIST_MODELS);
  if (!response.ok) {
    log({
      tag: "error",
      text: `Failed to fetch models: ${response.status} ${response.statusText}`,
    });
    process.exit(1);
  }

  log({
    tag: "success",
    text: "Successfully fetched models from API.",
  });
  const data = await response.json();
  const result = GetModelsResponseSchema.parse(data);

  return result.data;
}
