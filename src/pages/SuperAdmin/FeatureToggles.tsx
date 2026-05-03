/* ─────────────────────────────────────────────
   SuperAdmin/FeatureToggles.tsx
   Enable/disable platform features.
   Disabled features show "Coming Soon" via guard.
   ───────────────────────────────────────────── */

import { useState } from 'react'
import {
  ToggleLeft, CheckCircle2, XCircle, RotateCcw,
  Zap, Film, Users, Palette,
  Lock, Globe, ChevronDown, ChevronUp
} from 'lucide-react'
import { useFeatureToggleStore, type FeatureCategory } from '../../stores/featureToggleStore'

const CATEGORY_META: Record<FeatureCategory, { label: string; icon: React.ReactNode; color: string }> = {
  pre_production: { label: 'Pre-Production', icon: <Film className="w-4 h-4" />, color: '#D4A853' },
  ai_tools: { label: 'AI Tools', icon: <Zap className="w-4 h-4" />, color: '#3B82F6' },
  collaboration: { label: 'Collaboration', icon: <Users className="w-4 h-4" />, color: '#34D399' },
  post_production: { label: 'Post-Production', icon: <Palette className="w-4 h-4" />, color: '#A855F7' },
  admin: { label: 'Admin', icon: <Lock className="w-4 h-4" />, color: '#F43F5E' },
  integration: { label: 'Integration', icon: <Globe className="w-4 h-4" />, color: '#F97316' },
}

export default function FeatureToggles() {
  const features = useFeatureToggleStore((s) => s.features)
  const toggle = useFeatureToggleStore((s) => s.toggle)
  const enableAll = useFeatureToggleStore((s) => s.enableAll)
  const disableAll = useFeatureToggleStore((s) => s.disableAll)
  const reset = useFeatureToggleStore((s) => s.reset)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    pre_production: true,
    ai_tools: true,
    collaboration: false,
    post_production: false,
    admin: false,
    integration: false,
  })

  const toggleCat = (cat: FeatureCategory) =>
    setExpanded((p) => ({ ...p, [cat]: !p[cat] }))

  const categories: FeatureCategory[] = [
    'pre_production',
    'ai_tools',
    'collaboration',
    'post_production',
    'admin',
    'integration',
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <ToggleLeft className="w-6 h-6 text-[#D4A853]" />
          <h1 className="font-cinzel text-2xl font-bold">Feature Toggles</h1>
        </div>
        <p className="text-[#6B6B6B] text-sm font-inter mb-6">
          Enable features for users. Disabled features show a "Coming Soon" page automatically.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => enableAll()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-inter hover:bg-emerald-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Enable All
          </button>
          <button
            onClick={() => disableAll()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter hover:bg-red-500/20 transition-all"
          >
            <XCircle className="w-4 h-4" />
            Disable All
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] text-sm font-inter hover:border-[#333333] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="ml-auto text-xs text-[#6B6B6B] font-inter">
            <span className="text-emerald-400">{features.filter((f) => f.enabled).length}</span> enabled
            <span className="mx-2 text-[#333333]">|</span>
            <span className="text-red-400">{features.filter((f) => !f.enabled).length}</span> disabled
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catFeatures = features.filter((f) => f.category === cat)
            const meta = CATEGORY_META[cat]
            const isOpen = expanded[cat]

            return (
              <div
                key={cat}
                className="border border-[#242424] rounded-xl bg-[#0F0F0F] overflow-hidden"
              >
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${meta.color}15`, color: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <h3 className="font-inter font-semibold text-sm">{meta.label}</h3>
                      <p className="text-xs text-[#6B6B6B]">
                        {catFeatures.filter((f) => f.enabled).length} / {catFeatures.length} enabled
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#6B6B6B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-[#242424]">
                    {catFeatures.map((f) => {
                      const adminLocked = f.id.startsWith('api_') || f.id.startsWith('feature_') || f.id.startsWith('plans') || f.id.startsWith('users') || f.id.startsWith('analytics')
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#131313] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: f.enabled ? '#34D399' : '#6B6B6B',
                              }}
                            />
                            <div>
                              <div className="text-sm font-inter text-[#F0F0F0]">
                                {f.name}
                                {f.requiresBackend && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                    Backend
                                  </span>
                                )}
                                {f.aiCategory && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    AI
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#6B6B6B]">{f.description}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggle(f.id)}
                            disabled={adminLocked}
                            className="relative w-11 h-6 rounded-full transition-colors disabled:opacity-30"
                            style={{
                              background: f.enabled ? '#D4A853' : '#333333',
                            }}
                          >
                            <span
                              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                              style={{
                                transform: f.enabled ? 'translateX(20px)' : 'translateX(0)',
                              }}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
