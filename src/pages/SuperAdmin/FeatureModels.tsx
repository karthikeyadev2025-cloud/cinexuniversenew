/* ─────────────────────────────────────────────
   SuperAdmin/FeatureModels.tsx
   Assign AI providers & models per feature.
   Example: Pre-Visualization → Runway gen-4-turbo
   ───────────────────────────────────────────── */

import { useState, useMemo } from 'react'
import {
  Cpu, ChevronDown, ChevronUp, Save, RotateCcw,
  Zap, Gauge, Gem, Crown, AlertCircle, CheckCircle2,
  ArrowRight, SlidersHorizontal
} from 'lucide-react'
import { useApiConfigStore, type ApiCategory } from '../../stores/apiConfigStore'
import { useFeatureToggleStore } from '../../stores/featureToggleStore'
import {
  useFeatureModelStore,
  QUALITY_PRESETS,
  type FeatureModelAssignment
} from '../../stores/featureModelStore'

const PRESET_ICONS: Record<string, React.ReactNode> = {
  fast: <Zap className="w-4 h-4 text-yellow-400" />,
  balanced: <Gauge className="w-4 h-4 text-blue-400" />,
  quality: <Gem className="w-4 h-4 text-emerald-400" />,
  max: <Crown className="w-4 h-4 text-purple-400" />,
}

export default function FeatureModels() {
  const providers = useApiConfigStore((s) => s.providers)
  const features = useFeatureToggleStore((s) => s.features)
  const assignments = useFeatureModelStore((s) => s.assignments)
  const setAssignment = useFeatureModelStore((s) => s.setAssignment)
  const setQualityPreset = useFeatureModelStore((s) => s.setQualityPreset)
  const removeAssignment = useFeatureModelStore((s) => s.removeAssignment)
  const resetToDefaults = useFeatureModelStore((s) => s.resetToDefaults)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<'all' | ApiCategory>('all')
  const [savedFlash, setSavedFlash] = useState<string | null>(null)

  /* AI-capable features that are enabled */
  const aiFeatures = useMemo(
    () =>
      features.filter(
        (f) =>
          f.aiCategory &&
          f.enabled &&
          !f.id.startsWith('api_') &&
          !f.id.startsWith('feature_')
      ),
    [features]
  )

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? aiFeatures
        : aiFeatures.filter((f) => f.aiCategory === filter),
    [aiFeatures, filter]
  )

  const categoryOptions: { value: 'all' | ApiCategory; label: string }[] = [
    { value: 'all', label: 'All AI Features' },
    { value: 'llm', label: 'Text / LLM' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'voice', label: 'Voice' },
    { value: 'music', label: 'Music' },
  ]

  const toggleExpand = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }))

  const handleProviderChange = (featureId: string, providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    if (!provider) return
    const model = provider.model
    const existing = assignments.find((a) => a.featureId === featureId)
    setAssignment(featureId, providerId, model, existing?.qualityPreset || 'balanced', existing?.customOverrides)
    flashSaved(featureId)
  }

  const handleModelChange = (featureId: string, model: string) => {
    const existing = assignments.find((a) => a.featureId === featureId)
    if (!existing) return
    setAssignment(featureId, existing.providerId, model, existing.qualityPreset, existing.customOverrides)
    flashSaved(featureId)
  }

  const handlePresetChange = (featureId: string, preset: FeatureModelAssignment['qualityPreset']) => {
    setQualityPreset(featureId, preset)
    flashSaved(featureId)
  }

  const flashSaved = (id: string) => {
    setSavedFlash(id)
    setTimeout(() => setSavedFlash((c) => (c === id ? null : c)), 1200)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SlidersHorizontal className="w-6 h-6 text-[#D4A853]" />
          <h1 className="font-cinzel text-2xl font-bold text-[#F0F0F0]">
            Feature Model Assignment
          </h1>
        </div>
        <p className="text-[#6B6B6B] text-sm font-inter">
          Assign specific AI providers and models to each Cinex feature.
          Pre-Visualization can use Runway, while Storyboards use HunyuanVideo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2">
            <Cpu className="w-4 h-4 text-[#6B6B6B]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm font-inter text-[#F0F0F0] outline-none cursor-pointer"
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#131313]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] hover:text-[#F0F0F0] hover:border-[#333333] text-sm font-inter transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs text-[#6B6B6B]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{assignments.length} assigned</span>
            <span className="text-[#333333]">|</span>
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>{aiFeatures.length - assignments.length} unassigned</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((feature) => {
            const assignment = assignments.find((a) => a.featureId === feature.id)
            const provider = assignment
              ? providers.find((p) => p.id === assignment.providerId)
              : undefined
            const isOpen = expanded[feature.id]

            return (
              <div
                key={feature.id}
                className="border border-[#242424] rounded-xl bg-[#0F0F0F] overflow-hidden transition-all hover:border-[#333333]"
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpand(feature.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-[#D4A853]"
                      style={{ background: 'rgba(212,168,83,0.08)' }}
                    >
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-inter font-semibold text-[#F0F0F0] text-sm">
                        {feature.name}
                      </h3>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{feature.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {savedFlash === feature.id && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 animate-pulse">
                        <Save className="w-3 h-3" /> Saved
                      </span>
                    )}
                    {assignment ? (
                      <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-inter border border-emerald-500/20">
                        {provider?.name || assignment.providerId}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400 text-xs font-inter border border-yellow-500/20">
                        Unassigned
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#6B6B6B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
                    )}
                  </div>
                </button>

                {/* Expanded Controls */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-[#242424]">
                    <div className="pt-4 space-y-4">
                      {/* Provider Select */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-inter text-[#6B6B6B] mb-1.5">
                            AI Provider
                          </label>
                          <select
                            value={assignment?.providerId || ''}
                            onChange={(e) => handleProviderChange(feature.id, e.target.value)}
                            className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm font-inter text-[#F0F0F0] outline-none focus:border-[#D4A853] transition-colors"
                          >
                            <option value="" disabled>
                              Select provider…
                            </option>
                            {providers
                              .filter(
                                (p) =>
                                  p.category === feature.aiCategory &&
                                  p.isEnabled &&
                                  p.apiKey
                              )
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} {p.apiKey ? '' : '(no key)'}
                                </option>
                              ))}
                          </select>
                          {providers.filter((p) => p.category === feature.aiCategory && p.isEnabled && p.apiKey).length === 0 && (
                            <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              No enabled {feature.aiCategory} providers with API keys.
                            </p>
                          )}
                        </div>

                        {/* Model Select */}
                        <div>
                          <label className="block text-xs font-inter text-[#6B6B6B] mb-1.5">
                            Model
                          </label>
                          <select
                            value={assignment?.model || ''}
                            onChange={(e) => handleModelChange(feature.id, e.target.value)}
                            disabled={!provider}
                            className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm font-inter text-[#F0F0F0] outline-none focus:border-[#D4A853] transition-colors disabled:opacity-40"
                          >
                            <option value="" disabled>
                              Select model…
                            </option>
                            {(provider?.models || []).map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quality Preset */}
                      <div>
                        <label className="block text-xs font-inter text-[#6B6B6B] mb-2">
                          Quality Preset
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            Object.keys(QUALITY_PRESETS) as Array<
                              keyof typeof QUALITY_PRESETS
                            >
                          ).map((key) => {
                            const active = assignment?.qualityPreset === key
                            return (
                              <button
                                key={key}
                                onClick={() => handlePresetChange(feature.id, key as FeatureModelAssignment['qualityPreset'])}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-inter transition-all"
                                style={{
                                  borderColor: active ? '#D4A853' : '#242424',
                                  background: active ? 'rgba(212,168,83,0.08)' : '#131313',
                                  color: active ? '#D4A853' : '#A3A3A3',
                                }}
                              >
                                {PRESET_ICONS[key]}
                                <span>{QUALITY_PRESETS[key].label}</span>
                                <span className="text-[#6B6B6B] hidden sm:inline">
                                  — {QUALITY_PRESETS[key].desc}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Custom Overrides */}
                      {provider && (
                        <div>
                          <label className="block text-xs font-inter text-[#6B6B6B] mb-2">
                            Parameter Overrides
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(provider.customParams).map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-[#131313] border border-[#242424] rounded-lg px-3 py-2"
                              >
                                <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">
                                  {k}
                                </span>
                                <div className="text-sm font-inter text-[#F0F0F0] truncate">
                                  {String(v)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-[#6B6B6B] mt-1">
                            Override via Edge Function payload. Edit in API Manager for global changes.
                          </p>
                        </div>
                      )}

                      {/* Current Assignment Summary */}
                      {assignment && (
                        <div className="bg-[#131313] border border-[#242424] rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-1">
                            <ArrowRight className="w-3 h-3 text-[#D4A853]" />
                            Current routing:
                          </div>
                          <div className="flex items-center gap-2 text-sm font-inter">
                            <span className="text-[#F0F0F0]">{feature.name}</span>
                            <ArrowRight className="w-3 h-3 text-[#6B6B6B]" />
                            <span className="text-[#D4A853]">{provider?.name || assignment.providerId}</span>
                            <ArrowRight className="w-3 h-3 text-[#6B6B6B]" />
                            <span className="text-[#A3A3A3]">{assignment.model}</span>
                            <span
                              className="ml-auto px-1.5 py-0.5 rounded text-[10px] border"
                              style={{
                                borderColor:
                                  assignment.qualityPreset === 'fast'
                                    ? 'rgba(250,204,21,0.3)'
                                    : assignment.qualityPreset === 'max'
                                    ? 'rgba(168,85,247,0.3)'
                                    : assignment.qualityPreset === 'quality'
                                    ? 'rgba(52,211,153,0.3)'
                                    : 'rgba(59,130,246,0.3)',
                                color:
                                  assignment.qualityPreset === 'fast'
                                    ? '#FACC15'
                                    : assignment.qualityPreset === 'max'
                                    ? '#A855F7'
                                    : assignment.qualityPreset === 'quality'
                                    ? '#34D399'
                                    : '#3B82F6',
                              }}
                            >
                              {QUALITY_PRESETS[assignment.qualityPreset].label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Remove */}
                      {assignment && (
                        <button
                          onClick={() => removeAssignment(feature.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-inter transition-colors"
                        >
                          Remove assignment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#6B6B6B]">
            <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-inter text-sm">No AI features match this filter.</p>
            <p className="text-xs mt-1">Enable features in Feature Toggles first.</p>
          </div>
        )}
      </div>
    </div>
  )
}
