/* ─────────────────────────────────────────────
   featureModelStore.ts — Per-Feature AI Model Assignment
   Assign a specific provider + model to each Cinex feature.
   Example:
     pre_visualization  → runway      → gen-4-turbo
     storyboarding      → replicate   → black-forest-labs/flux-1.1-pro
     script_doctor      → openai      → gpt-4o
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useApiConfigStore, type ApiCategory, type ApiProvider } from './apiConfigStore'
import { useFeatureToggleStore } from './featureToggleStore'

/* ─── Types ─── */
export interface FeatureModelAssignment {
  featureId: string
  providerId: string
  model: string
  customOverrides: Record<string, any>
  qualityPreset: 'fast' | 'balanced' | 'quality' | 'max'
}

export interface ModelPreset {
  id: string
  label: string
  description: string
  suggestedFeatures: string[]
}

/* ─── Built-in Presets ─── */
export const QUALITY_PRESETS: Record<string, { label: string; desc: string }> = {
  fast: { label: 'Fast', desc: 'Lowest cost, quickest generation. Good for drafts.' },
  balanced: { label: 'Balanced', desc: 'Middle ground for cost vs quality.' },
  quality: { label: 'Quality', desc: 'Higher fidelity. Best for client review.' },
  max: { label: 'Maximum', desc: 'Best possible output. Higher cost & time.' },
}

/* ─── Default Assignments ─── */
const defaultAssignments: FeatureModelAssignment[] = [
  /* Video features */
  { featureId: 'pre_visualization', providerId: 'runway', model: 'gen-4-turbo', qualityPreset: 'quality', customOverrides: { duration: 5 } },
  { featureId: 'storyboarding', providerId: 'replicate-video', model: 'tencent/HunyuanVideo', qualityPreset: 'balanced', customOverrides: { duration: 3 } },
  { featureId: 'lookbook', providerId: 'replicate-image', model: 'black-forest-labs/flux-1.1-pro', qualityPreset: 'quality', customOverrides: { width: 1024, height: 1024 } },
  { featureId: 'ai_voice_over', providerId: 'elevenlabs', model: 'eleven_multilingual_v2', qualityPreset: 'quality', customOverrides: {} },
  { featureId: 'ai_music', providerId: 'replicate-music', model: 'meta/musicgen', qualityPreset: 'balanced', customOverrides: { duration: 15 } },
  { featureId: 'subtitle_ai', providerId: 'openai-gpt4o', model: 'gpt-4o', qualityPreset: 'fast', customOverrides: {} },
  { featureId: 'script_doctor', providerId: 'openai-gpt4o', model: 'gpt-4o', qualityPreset: 'quality', customOverrides: {} },
  { featureId: 'scene_treatment', providerId: 'openai-gpt4o', model: 'gpt-4o', qualityPreset: 'quality', customOverrides: {} },
  { featureId: 'casting_ai', providerId: 'openai-gpt4o', model: 'gpt-4o-mini', qualityPreset: 'balanced', customOverrides: {} },
  { featureId: 'location_scout', providerId: 'groq', model: 'llama-3.1-70b-versatile', qualityPreset: 'fast', customOverrides: {} },
  { featureId: 'screenwriting', providerId: 'openai-gpt4o', model: 'gpt-4o', qualityPreset: 'balanced', customOverrides: {} },
  { featureId: 'script_breakdown', providerId: 'openai-gpt4o', model: 'gpt-4o-mini', qualityPreset: 'fast', customOverrides: {} },
  { featureId: 'color_ai', providerId: 'replicate-image', model: 'luma/photon', qualityPreset: 'quality', customOverrides: {} },
  { featureId: 'vfx_ai', providerId: 'replicate-image', model: 'stability-ai/stable-diffusion-3.5-large', qualityPreset: 'quality', customOverrides: {} },
]

/* ─── Store ─── */
interface FeatureModelState {
  assignments: FeatureModelAssignment[]
  getAssignment: (featureId: string) => FeatureModelAssignment | undefined
  setAssignment: (featureId: string, providerId: string, model: string, preset?: FeatureModelAssignment['qualityPreset'], overrides?: Record<string, any>) => void
  setQualityPreset: (featureId: string, preset: FeatureModelAssignment['qualityPreset']) => void
  setCustomOverride: (featureId: string, key: string, value: any) => void
  removeAssignment: (featureId: string) => void
  resetToDefaults: () => void
  getProviderForFeature: (featureId: string) => { provider?: ApiProvider; model: string; fullParams: Record<string, any> } | null
}

export const useFeatureModelStore = create<FeatureModelState>()(
  persist(
    (set, get) => ({
      assignments: defaultAssignments,

      getAssignment: (featureId) =>
        get().assignments.find((a) => a.featureId === featureId),

      setAssignment: (featureId, providerId, model, preset = 'balanced', overrides = {}) =>
        set((s) => {
          const existing = s.assignments.find((a) => a.featureId === featureId)
          const next: FeatureModelAssignment = existing
            ? { ...existing, providerId, model, qualityPreset: preset, customOverrides: { ...existing.customOverrides, ...overrides } }
            : { featureId, providerId, model, qualityPreset: preset, customOverrides: overrides }
          return {
            assignments: existing
              ? s.assignments.map((a) => (a.featureId === featureId ? next : a))
              : [...s.assignments, next],
          }
        }),

      setQualityPreset: (featureId, preset) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.featureId === featureId ? { ...a, qualityPreset: preset } : a
          ),
        })),

      setCustomOverride: (featureId, key, value) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.featureId === featureId
              ? { ...a, customOverrides: { ...a.customOverrides, [key]: value } }
              : a
          ),
        })),

      removeAssignment: (featureId) =>
        set((s) => ({
          assignments: s.assignments.filter((a) => a.featureId !== featureId),
        })),

      resetToDefaults: () => set({ assignments: defaultAssignments }),

      /* Resolve the actual provider + merged params for a feature */
      getProviderForFeature: (featureId) => {
        const assignment = get().getAssignment(featureId)
        if (!assignment) return null

        const provider = useApiConfigStore.getState().getProvider(assignment.providerId)
        if (!provider) return null

        // Merge: provider defaults → assignment customOverrides
        const fullParams: Record<string, any> = {
          ...provider.customParams,
          ...assignment.customOverrides,
          model: assignment.model,
          version: assignment.model, // Replicate uses version
        }

        // Apply quality preset tweaks
        if (assignment.qualityPreset === 'fast') {
          if (provider.category === 'image' || provider.category === 'video') {
            fullParams.quality = 'low'
            fullParams.steps = Math.max(10, (fullParams.steps || 30) - 15)
          }
          if (provider.category === 'llm') {
            fullParams.max_tokens = Math.min(1024, fullParams.max_tokens || 4096)
            fullParams.temperature = 0.9
          }
        }
        if (assignment.qualityPreset === 'max') {
          if (provider.category === 'image' || provider.category === 'video') {
            fullParams.quality = 'high'
            fullParams.steps = Math.min(80, (fullParams.steps || 30) + 20)
          }
          if (provider.category === 'llm') {
            fullParams.max_tokens = Math.max(4096, fullParams.max_tokens || 4096)
            fullParams.temperature = 0.3
          }
        }

        return { provider, model: assignment.model, fullParams }
      },
    }),
    { name: 'cinex-feature-models', version: 1 }
  )
)

/* ─── Convenience: get AI-capable features ─── */
export function getAiFeatures() {
  return useFeatureToggleStore.getState().features.filter((f) => f.aiCategory && f.enabled)
}

/* ─── Convenience: get providers for a category ─── */
export function getProvidersForAiCategory(category: ApiCategory) {
  return useApiConfigStore.getState().getProvidersByCategory(category).filter((p) => p.isEnabled && p.apiKey)
}
