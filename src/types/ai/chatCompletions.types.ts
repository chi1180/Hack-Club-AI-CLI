export interface MessageObject {
  role: "system" | "user" | "assistant";
  content: string;
}

// =============================================================================
// Request
// =============================================================================

/**
 * @abstract The request structure for chat completions API
 */
export interface ChatCompletionsRequest {
  /**
   * @type string
   * @requires Yes
   * @description Model ID (e.g., `qwen/qwen3-32b`)
   */
  model: string;

  /**
   * @type array
   * @requires Yes
   * @description Array of message objects
   */
  message: MessageObject[];

  /**
   * @type boolean
   * @requires No
   * @description Enable streaming (default: `false`)
   */
  stream: boolean;

  /**
   * @type number
   * @requires No
   * @description Controls randomness, 0-2 (default: `1.0`)
   */
  temperature: number;

  /**
   * @type number
   * @requires No
   * @desci@description Maximum tokens to generate
   */
  max_tokens: number;

  /**
   * @type number
   * @requires No
   * @description Nucleus sampling (default: `1.0`)
   */
  top_p: number;
}

// =============================================================================
// Response
// =============================================================================

/**
 * @abstract The structure of response from chat completions API
 */
export interface ChatCompletionsResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: {
    index: number;
    message: MessageObject;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
