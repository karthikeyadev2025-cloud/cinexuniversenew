/* ─────────────────────────────────────────────
   SuperAdmin/ApiManager.tsx
   Configure AI provider API keys, test keys, view usage.
   ───────────────────────────────────────────── */

import { useState } from 'react'
import {
  Cpu, Eye, EyeOff,
  ChevronDown, ChevronUp,
  Trash2
} from 'lucide-react'
import { useApiConfigStore, type ApiCategory } from '../../stores/apiConfigStore'

const CATEGORY_LABELS: Record<ApiCategory, string> = {
  llm: 'Language Models',
  image: 'Image Generation',
  video: 'Video Generation',
  voice: 'Voice / TTS',
  music: 'Music Generation',
  translation: 'Translation',
  payment: 'Payment',
  database: 'Database',
  cdn: 'CDN',
  streaming: 'Streaming',
  email: 'Email',
  sms: 'SMS',
  storage: 'Storage',
  search: 'Search',
  analytics: 'Analytics',
  social: 'Social',
  calendar: 'Calendar',
}

export default function ApiManager() {
  const providers = useApiConfigStore((s) => s.providers)
  const usage = useApiConfigStore((s) => s.usage)
  const setApiKey = useApiConfigStore((s) => s.setApiKey)
  const toggleProvider = useApiConfigStore((s) => s.toggleProvider)
  const setModel = useApiConfigStore((s) => s.setModel)
  const updateCustomParam = useApiConfigStore((s) => s.updateCustomParam)
  const setMonthlyCap = useApiConfigStore((s) => s.setMonthlyCap)
  const testProvider = useApiConfigStore((s) => s.testProvider)
  const resetProvider = useApiConfigStore((s) => s.resetProvider)
  const resetAll = useApiConfigStore((s) => s.resetAll)

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<ApiCategory | 'all'>('all')

  const categories = Array.from(new Set(providers.map((p) => p.category)))

  const filtered = filter === 'all'
    ? providers
    : providers.filter((p) => p.category === filter)

  const toggleKey = (id: string) =>
    setVisibleKeys((p) => ({ ...p, [id]: !p[id] }))

  const toggleExpand = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-6 h-6 text-[#D4A853]" />
          <h1 className="font-cinzel text-2xl font-bold">API Manager</h1>
        </div>
        <p className="text-[#6B6B6B] text-sm font-inter mb-6">
          Add API keys for AI providers. One key unlocks every model in that provider.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#0F0F0F] border border-[#242424] rounded-xl p-4">
            <div className="text-xs text-[#6B6B6B] font-inter mb-1">Providers</div>
            <div className="text-xl font-cinzel text-[#F0F0F0]">{providers.length}</div>
          </div>
          <div className="bg-[#0F0F0F] border border-[#242424] rounded-xl p-4">
            <div className="text-xs text-[#6B6B6B] font-inter mb-1">Active</div>
            <div className="text-xl font-cinzel text-emerald-400">
              {providers.filter((p) => p.isEnabled && p.apiKey).length}
            </div>
          </div>
          <div className="bg-[#0F0F0F] border border-[#242424] rounded-xl p-4">
            <div className="text-xs text-[#6B6B6B] font-inter mb-1">Missing Keys</div>
            <div className="text-xl font-cinzel text-yellow-400">
              {providers.filter((p) => !p.apiKey).length}
            </div>
          </div>
          <div className="bg-[#0F0F0F] border border-[#242424] rounded-xl p-4">
            <div className="text-xs text-[#6B6B6B] font-inter mb-1">Usage Today</div>
            <div className="text-xl font-cinzel text-[#D4A853]">{usage.length}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-inter border transition-all ${
              filter === 'all'
                ? 'bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853]'
                : 'border-[#242424] text-[#A3A3A3] hover:border-[#333333]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-inter border transition-all ${
                filter === cat
                  ? 'bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853]'
                  : 'border-[#242424] text-[#A3A3A3] hover:border-[#333333]'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
          <button
            onClick={resetAll}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#242424] text-[#A3A3A3] text-xs font-inter hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Reset All
          </button>
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          {filtered.map((p) => {
            const isOpen = expanded[p.id]
            const keyVisible = visibleKeys[p.id]
            const hasKey = p.apiKey.trim().length > 0

            return (
              <div
                key={p.id}
                className="border border-[#242424] rounded-xl bg-[#0F0F0F] overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        background:
                          p.status === 'active'
                            ? '#34D399'
                            : p.status === 'error'
                            ? '#EF4444'
                            : '#6B6B6B',
                      }}
                    />
                    <div>
                      <div className="font-inter font-semibold text-sm text-[#F0F0F0]">
                        {p.name}
                      </div>
                      <div className="text-xs text-[#6B6B6B]">
                        {CATEGORY_LABELS[p.category]} · {p.models.length} models
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        p.isEnabled && hasKey
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#131313] text-[#6B6B6B] border-[#242424]'
                      }`}
                    >
                      {p.isEnabled && hasKey ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => toggleExpand(p.id)}
                      className="p-1.5 rounded-md hover:bg-[#181818] text-[#6B6B6B]"
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-[#242424] pt-4 space-y-4">
                    {/* API Key */}
                    <div>
                      <label className="block text-xs text-[#6B6B6B] font-inter mb-1.5">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={keyVisible ? 'text' : 'password'}
                            value={p.apiKey}
                            onChange={(e) => setApiKey(p.id, e.target.value)}
                            placeholder={`Paste ${p.name} API key…`}
                            className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm font-inter text-[#F0F0F0] placeholder:text-[#333333] outline-none focus:border-[#D4A853] transition-colors"
                          />
                        </div>
                        <button
                          onClick={() => toggleKey(p.id)}
                          className="px-3 py-2.5 rounded-lg border border-[#242424] text-[#A3A3A3] hover:border-[#333333] transition-colors"
                        >
                          {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => testProvider(p.id)}
                          className="px-3 py-2.5 rounded-lg border border-[#242424] text-[#A3A3A3] hover:border-[#D4A853] hover:text-[#D4A853] transition-colors text-sm font-inter"
                        >
                          Test
                        </button>
                      </div>
                    </div>

                    {/* Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#6B6B6B] font-inter mb-1.5">
                          Default Model
                        </label>
                        <select
                          value={p.model}
                          onChange={(e) => setModel(p.id, e.target.value)}
                          className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm font-inter text-[#F0F0F0] outline-none focus:border-[#D4A853]"
                        >
                          {p.models.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6B6B] font-inter mb-1.5">
                          Monthly Cap ($)
                        </label>
                        <input
                          type="number"
                          value={p.monthlyCap}
                          onChange={(e) => setMonthlyCap(p.id, Number(e.target.value))}
                          className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm font-inter text-[#F0F0F0] outline-none focus:border-[#D4A853]"
                        />
                      </div>
                    </div>

                    {/* Custom Params */}
                    <div>
                      <label className="block text-xs text-[#6B6B6B] font-inter mb-1.5">
                        Custom Parameters
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(p.customParams).map(([k, v]) => (
                          <div key={k} className="bg-[#131313] border border-[#242424] rounded-lg px-3 py-2">
                            <span className="text-[10px] text-[#6B6B6B] uppercase">{k}</span>
                            <input
                              value={String(v)}
                              onChange={(e) => updateCustomParam(p.id, k, e.target.value)}
                              className="w-full bg-transparent text-sm font-inter text-[#F0F0F0] outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => toggleProvider(p.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-inter border transition-all ${
                          p.isEnabled
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-[#131313] border-[#242424] text-[#A3A3A3]'
                        }`}
                      >
                        {p.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => resetProvider(p.id)}
                        className="px-3 py-2 rounded-lg text-xs font-inter border border-[#242424] text-[#A3A3A3] hover:border-red-500/30 hover:text-red-400 transition-all"
                      >
                        Reset
                      </button>
                    </div>
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
