/* ─────────────────────────────────────────────
   apiService.ts — Universal AI API Service
   Routes calls through Supabase Edge Functions.
   Reads per-feature model assignments from featureModelStore.
   ───────────────────────────────────────────── */

import { useApiConfigStore, type ApiCategory } from '../stores/apiConfigStore'
import { useFeatureModelStore } from '../stores/featureModelStore'

export interface ApiRequest {
  featureId: string
  prompt?: string
  imageUrl?: string
  audioUrl?: string
  options?: Record<string, any>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: { tokens?: number; cost?: number; duration?: number }
}

/* ─── Supabase Edge Function base URL ─── */
const EDGE_BASE = import.meta.env.VITE_SUPABASE_EDGE_URL || '/functions/v1'

/* ─── Main Call ─── */
export async function callApi<T = any>(
  category: ApiCategory,
  request: ApiRequest,
  fallbackProviderId?: string
): Promise<ApiResponse<T>> {
  const { featureId, prompt, options = {} } = request

  /* 1. Resolve provider via feature model assignment */
  const resolved = useFeatureModelStore.getState().getProviderForFeature(featureId)

  let provider = resolved?.provider
  let model = resolved?.model
  let params = resolved?.fullParams || {}

  /* 2. Fallback to generic provider if no assignment */
  if (!provider) {
    const enabled = useApiConfigStore.getState().getEnabledProviders().filter((p) => p.category === category)
    if (enabled.length === 0) {
      return { success: false, error: `No enabled ${category} provider. Please configure API keys.` }
    }
    if (fallbackProviderId) {
      provider = enabled.find((p) => p.id === fallbackProviderId) || enabled[0]
    } else {
      provider = enabled[0]
    }
    model = provider.model
    params = { ...provider.customParams, model }
  }

  if (!provider?.apiKey || !model) {
    return { success: false, error: `Provider ${provider?.name || 'unknown'} has no API key or model.` }
  }

  /* 3. Merge request options */
  const payload = {
    provider: provider.id,
    model,
    prompt,
    ...params,
    ...options,
  }

  /* 4. Route to Edge Function by category */
  const functionName = mapCategoryToEdgeFunction(category)
  const url = `${EDGE_BASE}/${functionName}`

  try {
    const start = performance.now()
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const duration = performance.now() - start

    if (!res.ok) {
      const text = await res.text()
      return { success: false, error: `Edge Function error ${res.status}: ${text}` }
    }

    const data = await res.json()

    /* 5. Record usage */
    useApiConfigStore.getState().recordUsage({
      providerId: provider.id,
      featureId,
      model,
      cost: estimateCost(category, provider.id, data),
      timestamp: new Date().toISOString(),
      success: true,
    })

    return {
      success: true,
      data,
      usage: { duration, cost: estimateCost(category, provider.id, data) },
    }
  } catch (err: any) {
    useApiConfigStore.getState().recordUsage({
      providerId: provider.id,
      featureId,
      model,
      cost: 0,
      timestamp: new Date().toISOString(),
      success: false,
      error: err.message,
    })
    return { success: false, error: err.message }
  }
}

/* ─── Category → Edge Function mapping ─── */
function mapCategoryToEdgeFunction(cat: ApiCategory): string {
  const map: Record<string, string> = {
    llm: 'ai-proxy',
    image: 'ai-image',
    video: 'ai-video',
    voice: 'ai-voice',
    music: 'ai-music',
    translation: 'ai-proxy',
  }
  return map[cat] || 'ai-proxy'
}

/* ─── Cost estimation (USD) ─── */
function estimateCost(_category: ApiCategory, providerId: string, _data: any): number {
  const rough: Record<string, number> = {
    'openai-gpt4o': 0.005,
    'openai-gpt4o-mini': 0.0006,
    'anthropic-claude': 0.008,
    'groq': 0.0005,
    'deepseek': 0.0007,
    'replicate-llm': 0.0008,
    'replicate-image': 0.03,
    'replicate-video': 0.05,
    'replicate-voice': 0.002,
    'replicate-music': 0.01,
    'openai-dalle': 0.04,
    'stability-ai': 0.03,
    'kling-video': 0.08,
    'luma-video': 0.06,
    'runway': 0.15,
    'elevenlabs': 0.003,
    'suno': 0.02,
  }
  return rough[providerId] || 0.01
}

/* ─── Shorthand callers ─── */
export function callLLM(featureId: string, prompt: string, opts?: Record<string, any>) {
  return callApi('llm', { featureId, prompt, options: opts })
}

export function callImage(featureId: string, prompt: string, opts?: Record<string, any>) {
  return callApi('image', { featureId, prompt, options: opts })
}

export function callVideo(featureId: string, prompt: string, opts?: Record<string, any>) {
  return callApi('video', { featureId, prompt, options: opts })
}

export function callVoice(featureId: string, prompt: string, opts?: Record<string, any>) {
  return callApi('voice', { featureId, prompt, options: opts })
}

export function callMusic(featureId: string, prompt: string, opts?: Record<string, any>) {
  return callApi('music', { featureId, prompt, options: opts })
}
