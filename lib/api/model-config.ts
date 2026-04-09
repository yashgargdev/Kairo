import type { ApiKeys } from '@/hooks/use-api-keys'

export type Provider = keyof ApiKeys

export type ReasoningLevel = 'low' | 'medium' | 'high' | 'highest'
export type SpeedLevel     = 'slow' | 'medium' | 'fast' | 'fastest'

export interface ModelDef {
  id: string           // UI / routing key
  apiId: string        // actual ID sent to the provider API
  label: string
  provider: Provider
  group: string        // display group
  description: string
  reasoning?: ReasoningLevel
  speed?: SpeedLevel
  input?: string[]     // e.g. ['Text', 'Image']
  output?: string[]    // e.g. ['Text', 'Code']
  imageGen?: boolean   // true = image-generation model (hidden in normal chat)
}

export const MODELS: ModelDef[] = [
  // ── Google ────────────────────────────────────────────────────────────────
  {
    id: 'gemini-3.1-pro', apiId: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro',
    provider: 'google', group: 'Google',
    description: 'Complex reasoning, heavy agentic workflows',
    reasoning: 'high', speed: 'medium', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'gemini-3.1-flash-lite', apiId: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite',
    provider: 'google', group: 'Google',
    description: 'High-volume tasks, ultimate cost efficiency',
    reasoning: 'medium', speed: 'fastest', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'gemini-3-flash', apiId: 'gemini-3-flash', label: 'Gemini 3 Flash',
    provider: 'google', group: 'Google',
    description: 'High-speed multimodal tasks',
    reasoning: 'medium', speed: 'fast', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'gemini-2.5-pro', apiId: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro',
    provider: 'google', group: 'Google',
    description: 'Stable legacy production environments',
    reasoning: 'high', speed: 'medium', input: ['Text', 'Image'], output: ['Text'],
  },

  // ── OpenAI ───────────────────────────────────────────────────────────────
  {
    id: 'gpt-5.4', apiId: 'gpt-5.4', label: 'GPT-5.4',
    provider: 'openai', group: 'OpenAI',
    description: 'Broad professional capabilities',
    reasoning: 'highest', speed: 'medium', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'gpt-5.4-mini', apiId: 'gpt-5.4-mini', label: 'GPT-5.4 mini',
    provider: 'openai', group: 'OpenAI',
    description: 'Coding, sub-agents, computer use',
    reasoning: 'high', speed: 'fast', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'gpt-5.4-nano', apiId: 'gpt-5.4-nano', label: 'GPT-5.4 nano',
    provider: 'openai', group: 'OpenAI',
    description: 'High-throughput, simple automated tasks',
    reasoning: 'medium', speed: 'fastest', input: ['Text'], output: ['Text'],
  },
  {
    id: 'o3', apiId: 'o3', label: 'OpenAI o3',
    provider: 'openai', group: 'OpenAI',
    description: 'Ultimate reasoning, advanced math & STEM',
    reasoning: 'highest', speed: 'slow', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'o4-mini', apiId: 'o4-mini', label: 'OpenAI o4-mini',
    provider: 'openai', group: 'OpenAI',
    description: 'Fast, cost-efficient multi-step logic',
    reasoning: 'high', speed: 'fast', input: ['Text', 'Image'], output: ['Text'],
  },

  // ── Anthropic ────────────────────────────────────────────────────────────
  {
    id: 'claude-4-6-opus', apiId: 'claude-opus-4-6', label: 'Claude Opus 4.6',
    provider: 'anthropic', group: 'Anthropic',
    description: 'Maximum intelligence, complex coding & writing',
    reasoning: 'highest', speed: 'slow', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'claude-4-6-sonnet', apiId: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6',
    provider: 'anthropic', group: 'Anthropic',
    description: 'Balanced speed and high-level reasoning',
    reasoning: 'high', speed: 'medium', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'claude-4-5-haiku', apiId: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5',
    provider: 'anthropic', group: 'Anthropic',
    description: 'Near-frontier intelligence at high speed',
    reasoning: 'medium', speed: 'fastest', input: ['Text', 'Image'], output: ['Text'],
  },

  // ── Meta (via OpenRouter) ─────────────────────────────────────────────────
  {
    id: 'llama-4-maverick-400b', apiId: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick 400B',
    provider: 'openrouter', group: 'Meta',
    description: 'Open-weight deep reasoning, enterprise',
    reasoning: 'high', speed: 'medium', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'llama-4-scout-109b', apiId: 'meta-llama/llama-4-scout', label: 'Llama 4 Scout 109B',
    provider: 'openrouter', group: 'Meta',
    description: 'Ultra-long context windows',
    reasoning: 'medium', speed: 'fast', input: ['Text', 'Image'], output: ['Text'],
  },
  {
    id: 'llama-3.1-70b', apiId: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B',
    provider: 'openrouter', group: 'Meta',
    description: 'Standard open-weight deployments',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Text'],
  },

  // ── Groq ─────────────────────────────────────────────────────────────────
  {
    id: 'llama-4-maverick-400b-groq', apiId: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    label: 'Llama 4 Maverick (Groq)',
    provider: 'groq', group: 'Groq',
    description: 'Ultra-fast inference for deep reasoning',
    reasoning: 'high', speed: 'fastest', input: ['Text'], output: ['Text'],
  },
  {
    id: 'deepseek-r1-groq', apiId: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 (Groq)',
    provider: 'groq', group: 'Groq',
    description: 'Open-source reasoning at LPU speeds',
    reasoning: 'high', speed: 'fast', input: ['Text'], output: ['Text'],
  },
  {
    id: 'mixtral-8x7b-32768', apiId: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B',
    provider: 'groq', group: 'Groq',
    description: 'Fast, reliable mixture-of-experts',
    reasoning: 'medium', speed: 'fastest', input: ['Text'], output: ['Text'],
  },

  // ── Sarvam AI ─────────────────────────────────────────────────────────────
  {
    id: 'sarvam-105B', apiId: 'sarvam-105b', label: 'Sarvam 105B',
    provider: 'sarvam', group: 'Sarvam AI',
    description: 'Complex enterprise workflows, Indian languages',
    reasoning: 'high', speed: 'medium', input: ['Text'], output: ['Text'],
  },
  {
    id: 'sarvam-30B', apiId: 'sarvam-30b', label: 'Sarvam 30B',
    provider: 'sarvam', group: 'Sarvam AI',
    description: 'Real-time conversational & voice agents',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Text'],
  },
  {
    id: 'sarvam-m', apiId: 'sarvam-m', label: 'Sarvam-M',
    provider: 'sarvam', group: 'Sarvam AI',
    description: 'Multilingual mid-size model for Indian languages',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Text'],
  },

  // ── Image Generation ──────────────────────────────────────────────────────
  // Google
  {
    id: 'gemini-3.1-flash-image-preview', apiId: 'gemini-3.1-flash-image-preview',
    label: 'Gemini 3.1 Flash Image', provider: 'google', group: 'Google',
    description: 'High-volume fast generation & multimodal editing',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'gemini-3-pro-image-preview', apiId: 'gemini-3-pro-image-preview',
    label: 'Gemini 3 Pro Image', provider: 'google', group: 'Google',
    description: 'Professional assets with advanced prompt reasoning',
    reasoning: 'high', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'gemini-2.5-flash-image', apiId: 'gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image', provider: 'google', group: 'Google',
    description: 'High-speed optimised legacy visual tasks',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'imagen-4-ultra', apiId: 'imagen-4-ultra', label: 'Imagen 4 Ultra',
    provider: 'google', group: 'Google',
    description: 'Maximum photorealism and premium quality',
    reasoning: 'high', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'imagen-4-fast', apiId: 'imagen-4-fast', label: 'Imagen 4 Fast',
    provider: 'google', group: 'Google',
    description: 'Speed-optimised with strong value efficiency',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  // OpenAI
  {
    id: 'gpt-image-1.5', apiId: 'gpt-image-1.5', label: 'GPT Image 1.5',
    provider: 'openai', group: 'OpenAI',
    description: 'Top-tier quality and deep instruction following',
    reasoning: 'high', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'gpt-image-1-mini', apiId: 'gpt-image-1-mini', label: 'GPT Image 1 Mini',
    provider: 'openai', group: 'OpenAI',
    description: 'Budget and high-speed image option',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'dall-e-3', apiId: 'dall-e-3', label: 'DALL·E 3',
    provider: 'openai', group: 'OpenAI',
    description: 'Standard detailed image generation',
    reasoning: 'medium', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  // Stability AI
  {
    id: 'sd3.5-large', apiId: 'sd3.5-large', label: 'SD 3.5 Large',
    provider: 'stability', group: 'Stability AI',
    description: '8B parameter model for professional use at 1MP',
    reasoning: 'medium', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'sd3.5-large-turbo', apiId: 'sd3.5-large-turbo', label: 'SD 3.5 Large Turbo',
    provider: 'stability', group: 'Stability AI',
    description: 'Distilled high-quality (generates in 4 steps)',
    reasoning: 'medium', speed: 'fast', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'stable-image-ultra', apiId: 'stable-image-ultra', label: 'Stable Image Ultra',
    provider: 'stability', group: 'Stability AI',
    description: "Stability's premium absolute top-tier quality",
    reasoning: 'high', speed: 'slow', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
  {
    id: 'stable-image-core', apiId: 'stable-image-core', label: 'Stable Image Core',
    provider: 'stability', group: 'Stability AI',
    description: 'High-quality with minimal prompt engineering',
    reasoning: 'medium', speed: 'medium', input: ['Text'], output: ['Image'],
    imageGen: true,
  },
]

export const MODEL_MAP = new Map(MODELS.map(m => [m.id, m]))

export function getModelDef(modelId: string): ModelDef | undefined {
  return MODEL_MAP.get(modelId)
}

export function getProvider(modelId: string): Provider {
  return MODEL_MAP.get(modelId)?.provider ?? 'openrouter'
}

export function getApiId(modelId: string): string {
  return MODEL_MAP.get(modelId)?.apiId ?? modelId
}

export const CHAT_MODELS  = MODELS.filter(m => !m.imageGen)
export const IMAGE_MODELS = MODELS.filter(m =>  m.imageGen)

// Unique groups in display order (chat models only)
export const MODEL_GROUPS = [...new Set(CHAT_MODELS.map(m => m.group))]
// Unique groups for image models
export const IMAGE_MODEL_GROUPS = [...new Set(IMAGE_MODELS.map(m => m.group))]

export const PROVIDER_NAMES: Record<Provider, string> = {
  openai:      'OpenAI',
  anthropic:   'Anthropic',
  google:      'Google AI',
  groq:        'Groq',
  mistral:     'Mistral AI',
  openrouter:  'OpenRouter',
  sarvam:      'Sarvam AI',
  stability:   'Stability AI',
}
