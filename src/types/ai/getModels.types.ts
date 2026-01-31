import { z } from "zod";

// =============================================================================
// Schema
// =============================================================================

/**
 * Architecture schema
 */
export const ArchitectureSchema = z.object({
  modality: z.string(),
  input_modalities: z.array(z.string()),
  output_modalities: z.array(z.string()),
  tokenizer: z.string(),
  instruct_type: z.string().nullable(),
});

/**
 * Pricing schema
 * @description all fields are string representations of numbers. Some fields are optional depending on the model
 */
export const PricingSchema = z.object({
  prompt: z.string(),
  completion: z.string(),
  request: z.string().optional(),
  image: z.string().optional(),
  web_search: z.string().optional(),
  internal_reasoning: z.string().optional(),
  audio: z.string().optional(),
  input_cache_read: z.string().optional(),
  input_cache_write: z.string().optional(),
});

/**
 * Top provider schema
 */
export const TopProviderSchema = z.object({
  context_length: z.number(),
  max_completion_tokens: z.number().nullable(),
  is_moderated: z.boolean(),
});

/**
 * Default parameters schema
 * @description all fields are optional and can be null
 */
export const DefaultParametersSchema = z.object({
  temperature: z.number().nullable().optional(),
  top_p: z.number().nullable().optional(),
  frequency_penalty: z.number().nullable().optional(),
});

/**
 * Model schema
 */
export const ModelSchema = z.object({
  id: z.string(),
  canonical_slug: z.string(),
  hugging_face_id: z.string(),
  name: z.string(),
  created: z.number(),
  description: z.string(),
  context_length: z.number(),
  architecture: ArchitectureSchema,
  pricing: PricingSchema,
  top_provider: TopProviderSchema,
  per_request_limits: z.unknown().nullable(),
  supported_parameters: z.array(z.string()),
  default_parameters: DefaultParametersSchema,
});

/**
 * Models array schema
 */
export const ModelsSchema = z.array(ModelSchema);

/**
 * API Response schema for getModels endpoint
 */
export const GetModelsResponseSchema = z.object({
  data: ModelsSchema,
});

// =============================================================================
// Types
// =============================================================================

export type Architecture = z.infer<typeof ArchitectureSchema>;
export type Pricing = z.infer<typeof PricingSchema>;
export type TopProvider = z.infer<typeof TopProviderSchema>;
export type DefaultParameters = z.infer<typeof DefaultParametersSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type Models = z.infer<typeof ModelsSchema>;
export type GetModelsResponse = z.infer<typeof GetModelsResponseSchema>;
