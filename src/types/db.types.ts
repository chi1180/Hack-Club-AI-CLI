// =============================================================================
// Chats
// =============================================================================

export type ChatsDB = {
  chats: Chat[];
};

export interface Chat {
  id: string;
  timestamp: number;
  title: string;
  messages: (MessageFromUser | MessageFromAI)[];
  starred?: boolean;
}

export interface MessageFromUser {
  type: "message";
  role: "user";
  content: string;
  timestamp: number;
}

export interface MessageFromAI {
  role: "assistant";
  content: string;
  timestamp: number;
  model: string;
  id: string;
  status: "completed";
}

// =============================================================================
// Settings
// =============================================================================

export type SettingsDB = {
  models: ModelType[];
  lastUsedModel: string;
  showStatusBar: boolean;
  showCommandsHelp: boolean;
};

// Model architecture type
export interface ModelArchitecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string;
  instruct_type: string | null;
}

// Model pricing type
export interface ModelPricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
  audio?: string;
  web_search: string;
  internal_reasoning: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

// Model top provider type
export interface ModelTopProvider {
  context_length: number;
  max_completion_tokens: number;
  is_moderated: boolean;
}

// Model default parameters type
export interface ModelDefaultParameters {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
}

// Model type based on s.json structure
export interface ModelType {
  id: string;
  canonical_slug: string;
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: ModelArchitecture;
  pricing: ModelPricing;
  top_provider: ModelTopProvider;
  per_request_limits: unknown | null;
  supported_parameters: string[];
  default_parameters: ModelDefaultParameters;
  // Custom fields for UI
  starred?: boolean;
}
