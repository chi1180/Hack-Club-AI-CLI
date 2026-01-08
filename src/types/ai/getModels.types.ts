import * as t from "io-ts";

// Architecture codec
export const ArchitectureCodec = t.type({
  modality: t.string,
  input_modalities: t.array(t.string),
  output_modalities: t.array(t.string),
  tokenizer: t.string,
  instruct_type: t.union([t.string, t.null]),
});

export type Architecture = t.TypeOf<typeof ArchitectureCodec>;

// Pricing codec - all fields are string representations of numbers
// Some fields are optional depending on the model
export const PricingCodec = t.intersection([
  t.type({
    prompt: t.string,
    completion: t.string,
    request: t.string,
    image: t.string,
    web_search: t.string,
    internal_reasoning: t.string,
  }),
  t.partial({
    audio: t.string,
    input_cache_read: t.string,
    input_cache_write: t.string,
  }),
]);

export type Pricing = t.TypeOf<typeof PricingCodec>;

// Top provider codec
export const TopProviderCodec = t.type({
  context_length: t.number,
  max_completion_tokens: t.union([t.number, t.null]),
  is_moderated: t.boolean,
});

export type TopProvider = t.TypeOf<typeof TopProviderCodec>;

// Default parameters codec - all fields are optional and can be null
export const DefaultParametersCodec = t.partial({
  temperature: t.union([t.number, t.null]),
  top_p: t.union([t.number, t.null]),
  frequency_penalty: t.union([t.number, t.null]),
});

export type DefaultParameters = t.TypeOf<typeof DefaultParametersCodec>;

// Model codec
export const ModelCodec = t.type({
  id: t.string,
  canonical_slug: t.string,
  hugging_face_id: t.string,
  name: t.string,
  created: t.number,
  description: t.string,
  context_length: t.number,
  architecture: ArchitectureCodec,
  pricing: PricingCodec,
  top_provider: TopProviderCodec,
  per_request_limits: t.union([t.unknown, t.null]),
  supported_parameters: t.array(t.string),
  default_parameters: DefaultParametersCodec,
});

export type Model = t.TypeOf<typeof ModelCodec>;

// Models array codec
export const ModelsCodec = t.array(ModelCodec);

export type Models = t.TypeOf<typeof ModelsCodec>;

// API Response codec for getModels endpoint
export const GetModelsResponseCodec = t.type({
  data: ModelsCodec,
});

export type GetModelsResponse = t.TypeOf<typeof GetModelsResponseCodec>;
