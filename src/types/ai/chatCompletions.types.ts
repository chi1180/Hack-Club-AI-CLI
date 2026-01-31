import { z } from "zod";

// =============================================================================
// Message Schemas
// =============================================================================

/**
 * Message role schema
 */
export const MessageRoleSchema = z.enum(["system", "user", "assistant"]);

/**
 * Basic message schema for chat completions
 */
export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string(),
});

/**
 * Array of messages schema
 */
export const MessagesSchema = z.array(MessageSchema);

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Chat completions request schema
 */
export const ChatCompletionsRequestSchema = z.object({
  /**
   * Model ID (e.g., `qwen/qwen3-32b`)
   */
  model: z.string(),

  /**
   * Array of message objects
   */
  messages: MessagesSchema,

  /**
   * Enable streaming (default: `false`)
   */
  stream: z.boolean().optional().default(false),

  /**
   * Controls randomness, 0-2 (default: `1.0`)
   */
  temperature: z.number().min(0).max(2).optional(),

  /**
   * Maximum tokens to generate
   */
  max_tokens: z.number().optional(),

  /**
   * Nucleus sampling (default: `1.0`)
   */
  top_p: z.number().min(0).max(1).optional(),
});

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Response message schema
 */
export const ResponseMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string(),
});

/**
 * Choice schema for non-streaming response
 */
export const ChoiceSchema = z.object({
  index: z.number(),
  message: ResponseMessageSchema,
  finish_reason: z.string(),
});

/**
 * Usage schema
 */
export const UsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});

/**
 * Chat completions response schema
 */
export const ChatCompletionsResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChoiceSchema),
  usage: UsageSchema,
});

// =============================================================================
// Streaming Response Schemas
// =============================================================================

/**
 * Delta schema for streaming response
 */
export const DeltaSchema = z.object({
  role: z.literal("assistant").optional(),
  content: z.string().optional(),
});

/**
 * Streaming choice schema
 */
export const StreamingChoiceSchema = z.object({
  index: z.number(),
  delta: DeltaSchema,
  finish_reason: z.string().nullable(),
});

/**
 * Streaming chunk schema
 */
export const StreamingChunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(StreamingChoiceSchema),
});

// =============================================================================
// Types
// =============================================================================

export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Messages = z.infer<typeof MessagesSchema>;

export type ChatCompletionsRequest = z.infer<
  typeof ChatCompletionsRequestSchema
>;
export type ResponseMessage = z.infer<typeof ResponseMessageSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type Usage = z.infer<typeof UsageSchema>;
export type ChatCompletionsResponse = z.infer<
  typeof ChatCompletionsResponseSchema
>;

export type Delta = z.infer<typeof DeltaSchema>;
export type StreamingChoice = z.infer<typeof StreamingChoiceSchema>;
export type StreamingChunk = z.infer<typeof StreamingChunkSchema>;

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Options for chat function
 */
export interface ChatOptions {
  model: string;
  messages: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  onChunk?: (chunk: StreamingChunk) => void;
  onContent?: (content: string) => void;
}

/**
 * Result from non-streaming chat
 */
export interface ChatResult {
  content: string;
  usage: Usage;
  finishReason: string;
}
