import { useState, useCallback, useRef, useMemo } from 'react'
import {
  Camera, Trash2, Eye, ChevronDown, ChevronUp,
  Wand2, Image as ImageIcon, Grid3x3, Clapperboard,
  Clock, FileSpreadsheet, Film, Filter,
  CheckCircle2, X, RefreshCw
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'

/* ─── Camera Diagrams ─── */
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
  {
    name: 'Dutch Angle',
    desc: 'Tilted camera for tension',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <rect x="25" y="20" width="70" height="45" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" transform="rotate(12 60 42)" />
        <circle cx="60" cy="42" r="12" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(12 60 42)" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">Dutch</text>
      </svg>
    ),
  },
  {
    name: 'Low Angle',
    desc: 'Camera looking up',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="5" y="5" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <rect x="35" y="15" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <path d="M20 75 L60 20 L100 75" fill="none" stroke="currentColor" strokeWidth="1" />
        <text x="60" y="72" textAnchor="middle" fontSize="5" fill="currentColor">Low</text>
      </svg>
    ),
  },
]

/* ─── Status Config ─── */
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  planned: { label: 'Planned', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' },
  filmed: { label: 'Filmed', color: '#27AE60', bg: 'rgba(39,174,96,0.1)' },
  edited: { label: 'Edited', color: '#D4A853', bg: 'rgba(212,168,83,0.1)' },
  cut: { label: 'Cut', color: '#E74C3C', bg: 'rgba(231,76,60,0.1)' },
}

const complexityConfig: Record<string, { label: string; color: string }> = {
  simple: { label: 'Simple', color: '#27AE60' },
  medium: { label: 'Medium', color: '#E67E22' },
  complex: { label: 'Complex', color: '#E74C3C' },
}

/* ─── SVG component ─── */
function CameraDiagramSVG({ angle }: { angle: string }) {
  const diagram = cameraDiagrams.find((d) => d.name.toLowerCase().includes(angle.toLowerCase()))
  if (!diagram) return <span className="text-[#6B6B6B] text-xs">—</span>
  return (
    <div className="w-14 h-9 text-[#A3A3A3] hover:text-[#D4A853] transition-colors" title={`${diagram.name} — ${diagram.desc}`}>
      {diagram.svg}
    </div>
  )
}

/* ─── Component ─── */
export default function ShotList() {
  const project = useProjectStore((s) => s.getActiveProject())
  const scenes = project?.scenes || []
  const storeShots = project?.shots || []
  const updateShots = useProjectStore((s) => s.updateShots)
  const syncFromScript = useProjectStore((s) => s.syncFromScript)

  const [shots, setLocalShots] = useState(storeShots)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [sceneFilter, setSceneFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showTemplates, setShowTemplates] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiTargetShot, setAiTargetShot] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [selectedDiagram, setSelectedDiagram] = useState<CameraDiagram | null>(null)
  const [showAllDiagrams, setShowAllDiagrams] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Keep local shots in sync with store
  useMemo(() => { setLocalShots(storeShots) }, [storeShots.length])

  /* ─── Computed ─── */
  const filteredShots = useMemo(() => {
    let result = [...shots]
    if (sceneFilter !== 'all') result = result.filter((s) => s.sceneId === sceneFilter)
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter)
    return result
  }, [shots, sceneFilter, statusFilter])

  const totalDuration = useMemo(() => shots.reduce((a, s) => a + (s.duration || 0), 0), [shots])
  const filmedCount = useMemo(() => shots.filter((s) => s.status === 'filmed').length, [shots])

  /* ─── Actions ─── */
  const updateShot = useCallback((id: string, field: string, value: any) => {
    const next = shots.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    setLocalShots(next)
    updateShots(next)
  }, [shots, updateShots])

  const removeShot = useCallback((id: string) => {
    const next = shots.filter((s) => s.id !== id)
    setLocalShots(next)
    updateShots(next)
  }, [shots, updateShots])

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }, [])

  const exportExcel = useCallback(() => {
    if (!shots.length) return
    const rows = [
      ['#', 'Scene', 'Description', 'Angle', 'Movement', 'Lens', 'Duration', 'Status', 'Complexity', 'Lighting', 'Sound', 'Equipment', 'Notes'],
      ...shots.map((s) => [
        String(s.number), String(s.sceneId), s.description, s.angle, s.movement, s.lens,
        String(s.duration), s.status, s.complexity, s.lighting, s.sound, s.equipment.join(', '), s.notes,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.title || 'shot-list'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [shots, project])

  const openAiModal = useCallback((shot: any) => { setAiTargetShot(shot); setAiModalOpen(true); setGeneratedImage(null) }, [])
  const generateImage = useCallback(() => { setGenerating(true); setTimeout(() => { setGeneratedImage('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop'); setGenerating(false) }, 1500) }, [])
  const handleCastPhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setGeneratedImage(String(reader.result)) }
    reader.readAsDataURL(file)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Camera className="w-8 h-8 text-[#D4A853]" />
              Shot List
            </h1>
            <p className="font-inter text-sm text-[#888888]">
              {project ? `Project: ${project.title} · ` : ''}{shots.length} shots · {scenes.length} scenes · {totalDuration}s total
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => syncFromScript()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D4A853]/30 text-[#D4A853] text-sm font-inter hover:bg-[#D4A853]/10 transition-all">
              <RefreshCw className="w-4 h-4" /> Sync from Script
            </button>
            <button onClick={() => setShowTemplates(!showTemplates)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-inter transition-all ${showTemplates ? 'bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853]' : 'border-[#242424] text-[#A3A3A3]'}`}>
              <Clapperboard className="w-4 h-4" /> Templates
            </button>
            <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#242424] text-[#A3A3A3] text-sm font-inter hover:text-white hover:border-[#333333] transition-all">
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Shots', value: shots.length, icon: Camera, color: '#D4A853' },
            { label: 'Total Duration', value: `${totalDuration}s`, icon: Clock, color: '#2D9CDB' },
            { label: 'Filmed', value: filmedCount, icon: CheckCircle2, color: '#27AE60' },
            { label: 'Planned', value: shots.filter((s) => s.status === 'planned').length, icon: Film, color: '#E67E22' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4" style={{ color: s.color }} /><span className="text-xs text-[#6B6B6B]">{s.label}</span></div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#242424] bg-[#0D0D0D]">
            <Filter className="w-3.5 h-3.5 text-[#6B6B6B]" />
            <span className="text-xs text-[#6B6B6B]">Scene:</span>
            <select value={sceneFilter} onChange={(e) => setSceneFilter(e.target.value)} className="bg-transparent text-xs text-white outline-none cursor-pointer">
              <option value="all">All Scenes</option>
              {scenes.map((s) => <option key={s.id} value={s.id}>Scene {s.number}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#242424] bg-[#0D0D0D]">
            <Filter className="w-3.5 h-3.5 text-[#6B6B6B]" />
            <span className="text-xs text-[#6B6B6B]">Status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-xs text-white outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="filmed">Filmed</option>
              <option value="edited">Edited</option>
              <option value="cut">Cut</option>
            </select>
          </div>
          <span className="text-xs text-[#6B6B6B] ml-auto">{filteredShots.length} shots shown</span>
        </div>

        {/* Shot Table */}
        <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#242424] text-left text-xs text-[#A3A3A3] uppercase bg-[#131313]">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 pr-4">#</th>
                  <th className="py-3 pr-4">Scene</th>
                  <th className="py-3 pr-4 min-w-[160px]">Description</th>
                  <th className="py-3 pr-4">Angle</th>
                  <th className="py-3 pr-4">Movement</th>
                  <th className="py-3 pr-4">Lens</th>
                  <th className="py-3 pr-4">Dur</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {scenes.map((scene) => {
                  const visibleShots = filteredShots.filter((s) => s.sceneId === scene.id)
                  if (visibleShots.length === 0) return null
                  return (
                    <>
                      <tr key={`scene-${scene.id}`} className="bg-[#181818]">
                        <td colSpan={10} className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <Film className="w-3.5 h-3.5 text-[#D4A853]" />
                            <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider">Scene {scene.number}: {scene.heading}</span>
                            <span className="text-[10px] text-[#6B6B6B]">({visibleShots.length} shots · {visibleShots.reduce((a, s) => a + (s.duration || 0), 0)}s)</span>
                          </div>
                        </td>
                      </tr>
                      {visibleShots.map((shot) => {
                        const sc = statusConfig[shot.status] || statusConfig.planned
                        const cc = complexityConfig[shot.complexity] || complexityConfig.simple
                        const isExpanded = expanded.has(shot.id)
                        return (
                          <>
                            <tr key={shot.id} className="border-b border-[#181818] hover:bg-[#131313] transition-colors">
                              <td className="py-3 px-2">
                                <button onClick={() => toggleExpand(shot.id)} className="p-1 rounded hover:bg-[#242424] text-[#6B6B6B]">
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <span className="w-7 h-7 rounded bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center text-xs font-bold">{shot.number}</span>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <span className="text-xs text-[#A3A3A3]">Scene {scene.number}</span>
                              </td>
                              <td className="py-3 pr-4 align-top min-w-[180px]">
                                <input className="w-full bg-transparent border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.description} onChange={(e) => updateShot(shot.id, 'description', e.target.value)} />
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <div className="flex items-center gap-2">
                                  <CameraDiagramSVG angle={shot.angle} />
                                  <select className="bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.angle} onChange={(e) => updateShot(shot.id, 'angle', e.target.value)}>
                                    {cameraDiagrams.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                                  </select>
                                </div>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <select className="bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.movement} onChange={(e) => updateShot(shot.id, 'movement', e.target.value)}>
                                  {['Static', 'Tracking', 'Push-in', 'Pull-out', 'Pan', 'Tilt', 'Dolly', 'Handheld', 'Crane', 'Steadicam', 'Flyover', 'Drone'].map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <select className="bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.lens} onChange={(e) => updateShot(shot.id, 'lens', e.target.value)}>
                                  {['16mm', '24mm', '35mm', '50mm', '85mm', '135mm', '200mm'].map((l) => <option key={l} value={l}>{l}</option>)}
                                </select>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <input type="number" min={1} max={60} className="w-10 bg-transparent border border-[#242424] rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-[#D4A853]" value={shot.duration} onChange={(e) => updateShot(shot.id, 'duration', Number(e.target.value))} />
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <select className="text-[10px] px-2 py-1 rounded border font-medium uppercase" style={{ background: sc.bg, color: sc.color, borderColor: `${sc.color}30` }} value={shot.status} onChange={(e) => updateShot(shot.id, 'status', e.target.value)}>
                                  {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                                </select>
                              </td>
                              <td className="py-3 pr-4 align-top">
                                <div className="flex items-center gap-1">
                                  <button className="p-1 rounded hover:bg-[#242424] text-[#A3A3A3]" onClick={() => openAiModal(shot)} title="Generate image"><Wand2 className="w-3.5 h-3.5" /></button>
                                  <button className="p-1 rounded hover:bg-[#242424] text-[#E74C3C]" onClick={() => removeShot(shot.id)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={10} className="pb-3 px-4">
                                  <div className="bg-[#131313] border border-[#242424] rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Notes</label>
                                      <textarea className="w-full h-16 bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853] resize-none" value={shot.notes} onChange={(e) => updateShot(shot.id, 'notes', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Lighting</label>
                                        <input className="w-full bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.lighting} onChange={(e) => updateShot(shot.id, 'lighting', e.target.value)} />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Sound</label>
                                        <input className="w-full bg-[#0D0D0D] border border-[#242424] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#D4A853]" value={shot.sound} onChange={(e) => updateShot(shot.id, 'sound', e.target.value)} />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Complexity</label>
                                        <span className="text-xs font-medium" style={{ color: cc.color }}>{cc.label}</span>
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Equipment</label>
                                        <div className="flex flex-wrap gap-1">{shot.equipment.map((eq: string) => <span key={eq} className="text-[10px] px-1.5 py-0.5 rounded bg-[#242424] text-[#A3A3A3]">{eq}</span>)}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Preview</label>
                                      <div className="w-full h-20 bg-[#0D0D0D] border border-[#242424] rounded flex items-center justify-center text-[#6B6B6B] text-xs">
                                        <ImageIcon className="w-5 h-5 mr-2" />No preview
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredShots.length === 0 && (
            <div className="text-center py-12 text-[#6B6B6B]">
              <Camera className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No shots. Write a script and click "Sync from Script".</p>
            </div>
          )}
        </div>

        {/* Camera Diagram Reference */}
        <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6 mt-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-space-grotesk text-lg font-medium flex items-center gap-2 text-white">
              <Grid3x3 className="w-5 h-5 text-[#D4A853]" />
              Camera Angle Reference ({cameraDiagrams.length} diagrams)
            </h2>
            <button className="btn-secondary text-xs" onClick={() => setShowAllDiagrams(!showAllDiagrams)}>
              <Eye className="w-3.5 h-3.5" />
              {showAllDiagrams ? 'Hide' : 'View All'}
            </button>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 ${showAllDiagrams ? '' : 'opacity-60'}`}>
            {cameraDiagrams.map((d) => (
              <button key={d.name} onClick={() => setSelectedDiagram(d)} className="group bg-[#131313] border border-[#242424] rounded-lg p-3 text-center hover:border-[#D4A853] transition-all cursor-pointer">
                <div className="w-full aspect-[3/2] mb-2 text-[#A3A3A3] group-hover:text-[#D4A853] transition-colors">{d.svg}</div>
                <p className="text-[11px] font-medium text-[#F0F0F0] mb-0.5">{d.name}</p>
                <p className="text-[9px] text-[#6B6B6B]">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagram Preview Modal */}
      {selectedDiagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedDiagram(null)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedDiagram(null)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424] transition-colors">
              <X className="w-5 h-5 text-[#A3A3A3]" />
            </button>
            <h3 className="font-space-grotesk text-xl font-semibold mb-1 pr-8 text-white">{selectedDiagram.name}</h3>
            <p className="text-sm text-[#A3A3A3] mb-4">{selectedDiagram.desc}</p>
            <div className="bg-[#060606] border border-[#242424] rounded-lg p-6 text-[#F0F0F0]">
              <div className="w-full max-w-[280px] mx-auto aspect-[3/2]">{selectedDiagram.svg}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary" onClick={() => setSelectedDiagram(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setAiModalOpen(false)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAiModalOpen(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424] transition-colors">
              <X className="w-5 h-5 text-[#A3A3A3]" />
            </button>
            <h3 className="font-space-grotesk text-xl font-semibold mb-1 pr-8 text-white">AI Image Generation</h3>
            <p className="text-sm text-[#A3A3A3] mb-4">Shot {aiTargetShot?.number}: {aiTargetShot?.description}</p>
            <div className="bg-[#060606] border border-[#242424] rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {generating ? (
                <div className="text-center text-[#A3A3A3]">
                  <div className="w-8 h-8 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Generating image...</p>
                </div>
              ) : generatedImage ? (
                <img src={generatedImage} alt="Generated preview" className="max-w-full max-h-[280px] rounded object-contain" />
              ) : (
                <div className="text-center text-[#6B6B6B]">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No image generated yet</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={generateImage} disabled={generating}>{generating ? 'Generating...' : 'Generate Image'}</button>
              <button className="btn-secondary" onClick={() => fileRef.current?.click()}>Upload Cast Photo</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCastPhotoUpload} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
