import { useState, useCallback } from 'react'
import {
  Scissors, FileText, Download,
  ChevronDown, ChevronUp, Eye, X, RefreshCw,
  Layers, Film, Users
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'

/* ─── Color map ─── */
const tagColors: Record<string, string> = {
  scene: 'border-l-[#F2C94C] text-[#F2C94C]',
  cast: 'border-l-[#2D9CDB] text-[#2D9CDB]',
  props: 'border-l-[#27AE60] text-[#27AE60]',
  location: 'border-l-[#9B59B6] text-[#9B59B6]',
  wardrobe: 'border-l-[#E91E63] text-[#E91E63]',
  equipment: 'border-l-[#E67E22] text-[#E67E22]',
  vfx: 'border-l-[#E74C3C] text-[#E74C3C]',
}

const tagBg: Record<string, string> = {
  scene: 'bg-[#F2C94C]/10',
  cast: 'bg-[#2D9CDB]/10',
  props: 'bg-[#27AE60]/10',
  location: 'bg-[#9B59B6]/10',
  wardrobe: 'bg-[#E91E63]/10',
  equipment: 'bg-[#E67E22]/10',
  vfx: 'bg-[#E74C3C]/10',
}

/* ─── Camera Diagram Data ─── */
interface CameraDiagram {
  name: string
  desc: string
  svg: React.ReactNode
}

const cameraDiagrams: CameraDiagram[] = [
  {
    name: 'Wide Shot',
    desc: 'Full scene view',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <line x1="10" y1="75" x2="110" y2="75" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
        <line x1="10" y1="5" x2="110" y2="5" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
        <rect x="35" y="25" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <circle cx="60" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M35 42 L85 42" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
        <path d="M20 60 L100 60" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x="60" y="70" textAnchor="middle" fontSize="5" fill="currentColor">WS</text>
      </svg>
    ),
  },
  {
    name: 'Medium Shot',
    desc: 'Subject from waist up',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <rect x="40" y="15" width="40" height="50" fill="none" stroke="currentColor" strokeWidth="2" rx="2" />
        <circle cx="60" cy="28" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="50" y1="38" x2="70" y2="38" stroke="currentColor" strokeWidth="1" />
        <line x1="52" y1="38" x2="52" y2="65" stroke="currentColor" strokeWidth="1" />
        <line x1="68" y1="38" x2="68" y2="65" stroke="currentColor" strokeWidth="1" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">MS</text>
      </svg>
    ),
  },
  {
    name: 'Close-Up',
    desc: 'Face fills frame',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <circle cx="60" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="52" cy="35" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="68" cy="35" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M48 48 Q60 58 72 48" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">CU</text>
      </svg>
    ),
  },
  {
    name: 'Over-Shoulder',
    desc: 'Behind one subject looking at another',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <path d="M10 80 Q15 30 35 40" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
        <circle cx="28" cy="38" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="85" cy="35" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="80" cy="32" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="90" cy="32" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M75 42 Q85 48 95 42" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M35 40 L75 35" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 2" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">OTS</text>
      </svg>
    ),
  },
  {
    name: 'POV',
    desc: 'Character point of view',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <circle cx="60" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="25" y1="40" x2="95" y2="40" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2" />
        <line x1="60" y1="5" x2="60" y2="75" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">POV</text>
      </svg>
    ),
  },
  {
    name: 'Aerial',
    desc: 'Bird eye view',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <rect x="30" y="20" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="1" rx="1" />
        <line x1="30" y1="20" x2="90" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="90" y1="20" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx="60" cy="40" r="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
        <path d="M50 15 L60 5 L70 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">Aerial</text>
      </svg>
    ),
  },
]

/* ─── Component ─── */
export default function ScriptBreakdown() {
  const project = useProjectStore((s) => s.getActiveProject())
  const syncFromScript = useProjectStore((s) => s.syncFromScript)
  const scenes = project?.scenes || []
  const breakdownElements = project?.breakdownElements || []

  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(scenes.map((s) => s.id)))
  const [activeFilter, setActiveFilter] = useState<string | 'all'>('all')
  const [selectedDiagram, setSelectedDiagram] = useState<CameraDiagram | null>(null)

  const runBreakdown = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      syncFromScript()
      setExpanded(new Set(scenes.map((s) => s.id)))
      setLoading(false)
    }, 1200)
  }, [syncFromScript, scenes])

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const exportCSV = useCallback(() => {
    if (!scenes.length) return
    const rows = [
      ['Scene', 'Heading', 'Elements', 'Characters', 'Description'],
      ...scenes.map((s) => {
        const els = breakdownElements.filter((e) => e.sceneId === s.id)
        return [
          String(s.number),
          s.heading,
          els.map((e) => `${e.type}: ${e.text}`).join('; '),
          s.characters.join(', '),
          s.description,
        ]
      }),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.title || 'script'}-breakdown.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [scenes, breakdownElements, project])

  const allTypes = ['all', 'scene', 'cast', 'props', 'location', 'wardrobe', 'equipment', 'vfx']

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Scissors className="w-8 h-8 text-[#D4A853]" />
              Script Breakdown
            </h1>
            <p className="font-inter text-sm text-[#888888]">
              {project ? `Project: ${project.title} · ${scenes.length} scenes · ${breakdownElements.length} elements` : 'No active project'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary" onClick={exportCSV} disabled={!scenes.length}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="btn-primary" onClick={runBreakdown} disabled={loading || !project}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyzing…' : 'Re-Sync from Script'}
            </button>
          </div>
        </div>

        {/* Project Info */}
        {project && (
          <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 mb-6 flex flex-wrap items-center gap-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#D4A853]" />
              <span className="text-sm text-[#A3A3A3]">{project.pageCount} pages</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2D9CDB]" />
              <span className="text-sm text-[#A3A3A3]">{project.wordCount.toLocaleString()} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#27AE60]" />
              <span className="text-sm text-[#A3A3A3]">{scenes.length} scenes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9B59B6]" />
              <span className="text-sm text-[#A3A3A3]">{project.characters.length} characters</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#E67E22]" />
              <span className="text-sm text-[#A3A3A3]">~{project.estimatedMinutes} min</span>
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                activeFilter === t ? 'bg-[#D4A853] text-[#060606]' : 'bg-[#131313] text-[#A3A3A3] hover:text-[#F0F0F0]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stripboard */}
        <div className="space-y-3 mb-8">
          {scenes.length === 0 && (
            <div className="text-center py-12 text-[#6B6B6B]">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No scenes found. Write a script in Screenwriting and click "Re-Sync from Script".</p>
            </div>
          )}
          {scenes.map((scene) => {
            const sceneElements = breakdownElements.filter((e) => e.sceneId === scene.id)
            const filteredElements = activeFilter === 'all' ? sceneElements : sceneElements.filter((e) => e.type === activeFilter)
            return (
              <div key={scene.id} className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#131313] transition-colors" onClick={() => toggleExpand(scene.id)}>
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center text-sm font-bold">{scene.number}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{scene.heading}</p>
                      <p className="text-xs text-[#6B6B6B]">{scene.characters.join(', ') || 'No characters'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A3A3A3]">{filteredElements.length} elements</span>
                    {expanded.has(scene.id) ? <ChevronUp className="w-4 h-4 text-[#A3A3A3]" /> : <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />}
                  </div>
                </div>
                {expanded.has(scene.id) && (
                  <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredElements.map((el) => (
                      <div key={el.id} className={`px-3 py-2 rounded-md text-xs font-medium border-l-2 ${tagColors[el.type]} ${tagBg[el.type]}`}>
                        <span className="uppercase text-[10px] opacity-70">{el.type}</span>
                        <p className="mt-0.5">{el.text}</p>
                      </div>
                    ))}
                    {filteredElements.length === 0 && <p className="text-xs text-[#6B6B6B] col-span-4">No elements match this filter.</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Camera Diagram References */}
        <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-space-grotesk text-lg font-medium flex items-center gap-2 text-white">
              <Eye className="w-5 h-5 text-[#D4A853]" />
              Camera Diagram References
            </h2>
            <p className="text-xs text-[#A3A3A3]">Click any diagram for a larger preview</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cameraDiagrams.map((d) => (
              <button key={d.name} onClick={() => setSelectedDiagram(d)} className="group bg-[#0D0D0D] border border-[#242424] rounded-lg p-4 text-center hover:border-[#D4A853] transition-all cursor-pointer">
                <div className="w-full aspect-[3/2] mb-3 text-[#A3A3A3] group-hover:text-[#D4A853] transition-colors">
                  {d.svg}
                </div>
                <p className="text-xs font-medium text-[#F0F0F0] mb-0.5">{d.name}</p>
                <p className="text-[10px] text-[#6B6B6B]">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagram Modal */}
      {selectedDiagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedDiagram(null)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedDiagram(null)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424] transition-colors">
              <X className="w-5 h-5 text-[#A3A3A3]" />
            </button>
            <h3 className="font-space-grotesk text-xl font-semibold mb-1 pr-8 text-white">{selectedDiagram.name}</h3>
            <p className="text-sm text-[#A3A3A3] mb-4">{selectedDiagram.desc}</p>
            <div className="bg-[#060606] border border-[#242424] rounded-lg p-6 text-[#F0F0F0]">
              <div className="w-full max-w-[280px] mx-auto aspect-[3/2]">
                {selectedDiagram.svg}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary" onClick={() => setSelectedDiagram(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
