// =============================================================================
// App
// =============================================================================

import type { DefaultSettingsType } from "./types/config.types";

export const APP_NAME = "Hack Club AI CLI";
export const APP_DIRECTORY_NAME = ".hackclubaicli";
export const APP_SETTINGS_FILE_NAME = "settings.json";
export const APP_DB_FILE_NAME = "hackcubaicli-db";
export const API_ENDPOINTS = {
  LIST_MODELS: "https://ai.hackclub.com/proxy/v1/models",
};

// =============================================================================
// Settings
// =============================================================================

export const DEFAULT_SETTINGS: DefaultSettingsType = {
  models: [],
  lastUsedModel: "qwen/qwen3-32b",
  showStatusBar: true,
  showCommandsHelp: true,
};

// =============================================================================
// AI
// =============================================================================

export const TITLING = {
  model: "qwen/qwen3-next-80b-a3b-instruct",
  conversation_amount: {
    head: 2,
    tail: 3,
  }, // if the amount of conversation is more than 10 messages, use only the first 2 and last 3 messages for titling
};

// =============================================================================
// Component
// =============================================================================

export const HERO_TEXT = APP_NAME.toUpperCase();

export const PALETTE = {
  // status
  error: "#FF6B6B",
  success: "#51CF66",
  warning: "#FFD93D",
  info: "#74C0FC",

  // UI elements
  border: "#495057",
  highlight: "#FFA94D",
  dim: "#868E96",
};
