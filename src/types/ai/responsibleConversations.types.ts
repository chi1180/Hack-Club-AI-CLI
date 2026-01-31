import type { Message } from "./chatCompletions.types";

/**
 * @abstract The structure of message content for Responses API
 */
export interface ContentObject {
  /**
   * @description Message content from user input
   */
  user: {
    type: "input_text";
    text: string;
  };

  /**
   * @description Message content from assistant
   */
  assistant: {
    type: "output_text";
    text: string;
  };
}

/**
 * @abstract The structure of message object for Responses API
 */
export interface StructuredMessageObject {
  /**
   * @description Structure of request message
   */
  request: {
    type: "message";
    role: "user";
    content: ContentObject["user"][];
  };

  /**
   * @description Structure of response message
   */
  response: {
    type: "message";
    id: string;
    status: "completed" | "in_progress" | "failed";
    role: "assistant";
    content: ContentObject["assistant"][];
  };
}

// =============================================================================
// Responses API Request
// =============================================================================

/**
 * Simple string input for Responses API
 */
export interface ResponsesSimpleRequest {
  model: string;
  input: string;
  stream?: boolean;
  max_output_tokens?: number;
  temperature?: number;
  top_p?: number;
}

/**
 * Structured message input for Responses API
 */
export interface ResponsesStructuredRequest {
  model: string;
  input: (
    | StructuredMessageObject["request"]
    | StructuredMessageObject["response"]
  )[];
  stream?: boolean;
  max_output_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export type ResponsesRequest =
  | ResponsesSimpleRequest
  | ResponsesStructuredRequest;

// =============================================================================
// Responses API Response
// =============================================================================

export interface ResponsesOutput {
  type: "message";
  id: string;
  status: "completed" | "in_progress" | "failed";
  role: "assistant";
  content: {
    type: "output_text";
    text: string;
    annotations: unknown[];
  }[];
}

export interface ResponsesUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface ResponsesResponse {
  id: string;
  object: "response";
  created_at: number;
  model: string;
  output: ResponsesOutput[];
  usage: ResponsesUsage;
  status: "completed" | "in_progress" | "failed";
}
