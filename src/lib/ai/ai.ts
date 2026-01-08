import { API_KEY_NAME } from "../../config";
import type { AIStats } from "../../types/ai/stats.types";
import type { ModelType } from "../../types/db/types";
import { log } from "../log";
import { getModels } from "./methods/getModels";
import { getStats } from "./methods/getStats";

export class AI {
  private readonly API_TOKEN: string;

  // methods
  _getModels: () => Promise<ModelType[]>;
  _getStats: (apiToken: string) => Promise<AIStats>; // it can write as `typeof getStats` but for clarity, we define the function signature here

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

    // assign methods
    this._getModels = getModels;
    this._getStats = () => getStats(this.API_TOKEN);
  }
}
