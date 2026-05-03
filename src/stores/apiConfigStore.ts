/* ─────────────────────────────────────────────
   apiConfigStore.ts — Central AI Provider Registry
   One API key per provider. Model selection is handled
   per-feature via featureModelStore.ts.
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ─── Types ─── */
export type ApiCategory =
  | 'llm' | 'image' | 'video' | 'voice' | 'music'
  | 'translation' | 'payment' | 'database' | 'cdn'
  | 'streaming' | 'email' | 'sms' | 'storage'
  | 'search' | 'analytics' | 'social' | 'calendar'

export interface ApiProvider {
  id: string
  name: string
  category: ApiCategory
  baseUrl: string
  apiKey: string
  model: string
  models: string[]
  customParams: Record<string, any>
  isEnabled: boolean
  monthlyCap: number
  monthlyUsed: number
  lastTested: string | null
  status: 'active' | 'error' | 'untested'
}

export interface ApiUsageRecord {
  providerId: string
  featureId: string
  model: string
  tokens?: number
  cost: number
  timestamp: string
  success: boolean
  error?: string
}

/* ─── Default Providers ─── */
const defaultProviders: ApiProvider[] = [
  /* ── LLM ── */
  {
    id: 'openai-gpt4o',
    name: 'OpenAI GPT-4o',
    category: 'llm',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    customParams: { temperature: 0.7, max_tokens: 4096 },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'replicate-llm',
    name: 'Replicate (LLM)',
    category: 'llm',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: '',
    model: 'meta/llama-3.1-405b-instruct',
    models: [
      'meta/llama-3.1-405b-instruct',
      'meta/llama-3-70b-instruct',
      'mistralai/mixtral-8x22b-instruct',
      'anthropic/claude-3.5-sonnet',
      'google/gemma-2-27b-it',
    ],
    customParams: { temperature: 0.7, max_tokens: 4096, version: 'meta/llama-3.1-405b-instruct' },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    category: 'llm',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: '',
    model: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    customParams: { max_tokens: 4096 },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'groq',
    name: 'Groq (Fast Inference)',
    category: 'llm',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: '',
    model: 'llama-3.1-70b-versatile',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    customParams: { temperature: 0.7, max_tokens: 4096 },
    isEnabled: false,
    monthlyCap: 200,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },

  /* ── Image ── */
  {
    id: 'replicate-image',
    name: 'Replicate (Image)',
    category: 'image',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: '',
    model: 'black-forest-labs/flux-1.1-pro',
    models: [
      'black-forest-labs/flux-1.1-pro',
      'black-forest-labs/flux-schnell',
      'stability-ai/stable-diffusion-3.5-large',
      'stability-ai/stable-diffusion-3.5-large-turbo',
      'luma/photon-flash',
      'luma/photon',
      'recraft-ai/recraft-v3',
    ],
    customParams: { width: 1024, height: 1024, version: 'black-forest-labs/flux-1.1-pro' },
    isEnabled: false,
    monthlyCap: 200,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'openai-dalle',
    name: 'OpenAI DALL-E',
    category: 'image',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'dall-e-3',
    models: ['dall-e-3', 'dall-e-2'],
    customParams: { size: '1024x1024', quality: 'standard' },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'stability-ai',
    name: 'Stability AI',
    category: 'image',
    baseUrl: 'https://api.stability.ai/v2beta',
    apiKey: '',
    model: 'stable-image-ultra',
    models: ['stable-image-ultra', 'stable-image-core', 'sd3-large', 'sd3-medium'],
    customParams: { width: 1024, height: 1024 },
    isEnabled: false,
    monthlyCap: 150,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },

  /* ── Video ── */
  {
    id: 'replicate-video',
    name: 'Replicate (Video)',
    category: 'video',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: '',
    model: 'wavespeedai/wan-2.1-t2v-14b',
    models: [
      'wavespeedai/wan-2.1-t2v-14b',
      'luma/ray-flash-2-7b',
      'genmo/mochi-1',
      'tencent/HunyuanVideo',
      'lightx2v/LingNa',
      'alibaba-pai/wan2.1-t2v-14b-720p',
    ],
    customParams: { duration: 5, ratio: '16:9', version: 'wavespeedai/wan-2.1-t2v-14b' },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'kling-video',
    name: 'Kling AI',
    category: 'video',
    baseUrl: 'https://api.klingai.com/v1',
    apiKey: '',
    model: 'kling-v1.6',
    models: ['kling-v1.6', 'kling-v1.5', 'kling-v1-standard'],
    customParams: { duration: 5, ratio: '16:9' },
    isEnabled: false,
    monthlyCap: 50,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'luma-video',
    name: 'Luma Dream Machine',
    category: 'video',
    baseUrl: 'https://api.lumalabs.ai/v1',
    apiKey: '',
    model: 'dream-machine-1.6',
    models: ['dream-machine-1.6', 'dream-machine-1.5'],
    customParams: { duration: 5, ratio: '16:9' },
    isEnabled: false,
    monthlyCap: 50,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'runway',
    name: 'Runway ML',
    category: 'video',
    baseUrl: 'https://api.runwayml.com/v1',
    apiKey: '',
    model: 'gen-4-turbo',
    models: ['gen-4-turbo', 'gen-4', 'gen-3-alpha-turbo', 'gen-3-alpha'],
    customParams: { duration: 5, ratio: '16:9' },
    isEnabled: false,
    monthlyCap: 50,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },

  /* ── Voice ── */
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'voice',
    baseUrl: 'https://api.elevenlabs.io/v1',
    apiKey: '',
    model: 'eleven_multilingual_v2',
    models: ['eleven_multilingual_v2', 'eleven_flash_v2_5', 'eleven_turbo_v2_5'],
    customParams: { voice_id: 'pNInz6obpgDQGcFmaJgB', stability: 0.5, similarity_boost: 0.75 },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'replicate-voice',
    name: 'Replicate (Voice)',
    category: 'voice',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: '',
    model: 'jaaari/kokoro-82M',
    models: ['jaaari/kokoro-82M', 'lucataco/xtts-v2', 'suno-ai/bark'],
    customParams: { version: 'jaaari/kokoro-82M' },
    isEnabled: false,
    monthlyCap: 100,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },

  /* ── Music ── */
  {
    id: 'replicate-music',
    name: 'Replicate (Music)',
    category: 'music',
    baseUrl: 'https://api.replicate.com/v1',
    apiKey: '',
    model: 'meta/musicgen',
    models: ['meta/musicgen', 'suno-ai/suno-bark', 'riffusion/riffusion'],
    customParams: { duration: 10, version: 'meta/musicgen' },
    isEnabled: false,
    monthlyCap: 50,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
  {
    id: 'suno',
    name: 'Suno AI',
    category: 'music',
    baseUrl: 'https://api.suno.ai/v1',
    apiKey: '',
    model: 'v3.5',
    models: ['v3.5', 'v3', 'v2'],
    customParams: { duration: 30 },
    isEnabled: false,
    monthlyCap: 50,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },

  /* ── Other ── */
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'llm',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
    customParams: { temperature: 0.7, max_tokens: 4096 },
    isEnabled: false,
    monthlyCap: 200,
    monthlyUsed: 0,
    lastTested: null,
    status: 'untested',
  },
]

/* ─── Store ─── */
interface ApiConfigState {
  providers: ApiProvider[]
  usage: ApiUsageRecord[]
  getProvider: (id: string) => ApiProvider | undefined
  getProvidersByCategory: (cat: ApiCategory) => ApiProvider[]
  getEnabledProviders: () => ApiProvider[]
  setApiKey: (id: string, key: string) => void
  setModel: (id: string, model: string) => void
  toggleProvider: (id: string) => void
  updateCustomParam: (id: string, key: string, value: any) => void
  setMonthlyCap: (id: string, cap: number) => void
  recordUsage: (record: ApiUsageRecord) => void
  testProvider: (id: string) => Promise<boolean>
  resetProvider: (id: string) => void
  resetAll: () => void
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      providers: defaultProviders,
      usage: [],

      getProvider: (id) => get().providers.find((p) => p.id === id),
      getProvidersByCategory: (cat) => get().providers.filter((p) => p.category === cat),
      getEnabledProviders: () => get().providers.filter((p) => p.isEnabled && p.apiKey.trim().length > 0),

      setApiKey: (id, key) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, apiKey: key, status: key ? 'untested' : p.status } : p
          ),
        })),

      setModel: (id, model) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id
              ? { ...p, model, customParams: { ...p.customParams, version: model } }
              : p
          ),
        })),

      toggleProvider: (id) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
          ),
        })),

      updateCustomParam: (id, key, value) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, customParams: { ...p.customParams, [key]: value } } : p
          ),
        })),

      setMonthlyCap: (id, cap) =>
        set((s) => ({
          providers: s.providers.map((p) => (p.id === id ? { ...p, monthlyCap: cap } : p)),
        })),

      recordUsage: (record) =>
        set((s) => {
          const next = [...s.usage, record]
          if (next.length > 5000) next.shift()
          return { usage: next }
        }),

      testProvider: async (id) => {
        const p = get().getProvider(id)
        if (!p || !p.apiKey) return false
        // In production, call a Supabase Edge Function to test the key
        try {
          set((s) => ({
            providers: s.providers.map((x) => (x.id === id ? { ...x, status: 'active', lastTested: new Date().toISOString() } : x)),
          }))
          return true
        } catch {
          set((s) => ({
            providers: s.providers.map((x) => (x.id === id ? { ...x, status: 'error', lastTested: new Date().toISOString() } : x)),
          }))
          return false
        }
      },

      resetProvider: (id) =>
        set((s) => ({
          providers: s.providers.map((p) => {
            if (p.id !== id) return p
            const d = defaultProviders.find((x) => x.id === id)
            return d ? { ...d, apiKey: '', status: 'untested', lastTested: null, monthlyUsed: 0 } : p
          }),
        })),

      resetAll: () => set({ providers: defaultProviders.map((d) => ({ ...d, apiKey: '', status: 'untested', lastTested: null, monthlyUsed: 0 })), usage: [] }),
    }),
    { name: 'cinex-api-config', version: 2 }
  )
)
