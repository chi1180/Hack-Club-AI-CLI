import { API_ENDPOINTS } from "../../../config";
import type { AIStats } from "../../../types/ai/stats.types";

export async function getStats(apiToken: string) {
  const response = await fetch(API_ENDPOINTS.TOKEN_STATS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  });
  const data = (await response.json()) as AIStats;
  return data;
}
