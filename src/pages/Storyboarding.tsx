import { useState, useCallback, useMemo, useRef } from 'react'
import {
  LayoutGrid, Trash2, Download, Wand2, Image as ImageIcon,
  Type, Circle, Square, ArrowRight, Undo, Maximize2, X,
  ChevronLeft, ChevronRight, Upload, Save, CheckCircle2,
  Clock, Film, RefreshCw
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { jsPDF } from 'jspdf'

interface Annotation {
  id: string
  type: string
  x: number
  y: number
  text?: string
  color: string
}

const annotationColors = ['#D4A853', '#2D9CDB', '#E74C3C', '#27AE60', '#F0F0F0', '#9B59B6']

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' },
  approved: { label: 'Approved', color: '#27AE60', bg: 'rgba(39,174,96,0.1)' },
  revised: { label: 'Revised', color: '#E67E22', bg: 'rgba(230,126,34,0.1)' },
  cut: { label: 'Cut', color: '#E74C3C', bg: 'rgba(231,76,60,0.1)' },
}

const aiPromptTemplates = [
  'Cinematic wide shot, rainy night, neon-lit alley, film noir style, 35mm, shallow depth of field',
  'Medium shot, character walking toward camera, dramatic backlighting, moody atmosphere',
  'Close-up, emotional face, soft diffused lighting, shallow DOF, 85mm lens',
  'Over-shoulder shot, two characters in conversation, warm interior lighting, film grain',
  'Aerial drone shot, ancient temple at golden hour, epic scale, dramatic clouds',
  'POV shot, hand reaching for an object, macro detail, cinematic lighting',
]

export default function Storyboarding() {
  const project = useProjectStore((s) => s.getActiveProject())
  const storeFrames = project?.frames || []
  const updateFrames = useProjectStore((s) => s.updateFrames)
  const syncFromScript = useProjectStore((s) => s.syncFromScript)

  const [localFrames, setLocalFrames] = useState(storeFrames)
  const [selectedFrameId, setSelectedFrameId] = useState<string>(storeFrames[0]?.id || '')
  const [activeTool, setActiveTool] = useState<'select' | 'arrow' | 'circle' | 'rect' | 'text'>('select')
  const [activeColor, setActiveColor] = useState('#D4A853')
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiTargetFrame, setAiTargetFrame] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [exporting, setExporting] = useState(false)
  const [frameViewMode, setFrameViewMode] = useState<'grid' | 'list'>('grid')
  const fileRef = useRef<HTMLInputElement>(null)
  const castPhotoRef = useRef<HTMLInputElement>(null)

  // Sync local frames
  useMemo(() => {
    setLocalFrames(storeFrames)
    if (storeFrames.length > 0 && !selectedFrameId) setSelectedFrameId(storeFrames[0].id)
  }, [storeFrames.length])

  const selectedFrame = localFrames.find((f) => f.id === selectedFrameId) || localFrames[0]

  const updateFrame = useCallback((id: string, field: string, value: any) => {
    const next = localFrames.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    setLocalFrames(next)
    updateFrames(next)
  }, [localFrames, updateFrames])

  const duplicateFrame = useCallback((frame: any) => {
    const newFrame = {
      ...frame,
      id: `frame-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    }
    const next = [...localFrames, newFrame]
    setLocalFrames(next)
    updateFrames(next)
    setSelectedFrameId(newFrame.id)
  }, [localFrames, updateFrames])

  const removeFrame = useCallback((id: string) => {
    const next = localFrames.filter((f) => f.id !== id)
    setLocalFrames(next)
    updateFrames(next)
    if (selectedFrameId === id && next.length > 0) setSelectedFrameId(next[0].id)
  }, [localFrames, updateFrames, selectedFrameId])

  const addAnnotation = useCallback((type: Annotation['type']) => {
    if (type === 'text') {
      const text = prompt('Enter annotation text:')
      if (!text) return
      const ann: Annotation = { id: Math.random().toString(36).slice(2, 9), type: 'text', x: 50, y: 50, text, color: activeColor }
      updateFrame(selectedFrameId, 'annotations', [...(selectedFrame?.annotations || []), ann])
      return
    }
    const ann: Annotation = { id: Math.random().toString(36).slice(2, 9), type, x: 50 + Math.random() * 20, y: 40 + Math.random() * 20, color: activeColor }
    updateFrame(selectedFrameId, 'annotations', [...(selectedFrame?.annotations || []), ann])
  }, [selectedFrameId, activeColor, selectedFrame, updateFrame])

  const undoAnnotation = useCallback(() => {
    const anns = selectedFrame?.annotations || []
    updateFrame(selectedFrameId, 'annotations', anns.slice(0, -1))
  }, [selectedFrameId, selectedFrame, updateFrame])

  const clearAnnotations = useCallback(() => {
    updateFrame(selectedFrameId, 'annotations', [])
  }, [selectedFrameId, updateFrame])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, frameId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateFrame(frameId, 'image', String(reader.result))
    reader.readAsDataURL(file)
  }, [updateFrame])

  const openAiModal = useCallback((frame: any) => {
    setAiTargetFrame(frame)
    setAiModalOpen(true)
    setGeneratedImage(frame.image)
    setGenerating(false)
    setAiPrompt('')
  }, [])

  const generateImage = useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      const urls = [
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=640&h=360&fit=crop',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=640&h=360&fit=crop',
        'https://images.unsplash.com/photo-1518676596012-424a84089f67?w=640&h=360&fit=crop',
        'https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=640&h=360&fit=crop',
      ]
      setGeneratedImage(urls[Math.floor(Math.random() * urls.length)])
      setGenerating(false)
    }, 1500)
  }, [])

  const applyGeneratedImage = useCallback(() => {
    if (!aiTargetFrame || !generatedImage) return
    updateFrame(aiTargetFrame.id, 'image', generatedImage)
    setAiModalOpen(false)
  }, [aiTargetFrame, generatedImage, updateFrame])

  const handleCastPhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setGeneratedImage(String(reader.result)) }
    reader.readAsDataURL(file)
  }, [])

  const exportPDF = useCallback(async () => {
    setExporting(true)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 40
    const cols = 2
    const rows = 2
    const cellW = (pageW - margin * 2 - (cols - 1) * 20) / cols
    const cellH = (pageH - margin * 2 - (rows - 1) * 20) / rows

    let col = 0
    let row = 0

    for (let i = 0; i < localFrames.length; i++) {
      const f = localFrames[i]
      const x = margin + col * (cellW + 20)
      const y = margin + row * (cellH + 20)

      if (i > 0 && i % (cols * rows) === 0) {
        doc.addPage()
        col = 0
        row = 0
      }

      doc.setDrawColor(36, 36, 36)
      doc.rect(x, y, cellW, cellH)

      doc.setFontSize(14)
      doc.setTextColor(212, 168, 83)
      doc.text(`Frame ${f.number} — ${f.status.toUpperCase()}`, x + 8, y + 18)

      if (f.image) {
        try { doc.addImage(f.image, 'JPEG', x + 8, y + 28, cellW - 16, cellH - 80) }
        catch {
          doc.setFillColor(13, 13, 13)
          doc.rect(x + 8, y + 28, cellW - 16, cellH - 80, 'F')
        }
      } else {
        doc.setFillColor(13, 13, 13)
        doc.rect(x + 8, y + 28, cellW - 16, cellH - 80, 'F')
        doc.setFontSize(10)
        doc.setTextColor(107, 107, 107)
        doc.text('No image', x + cellW / 2 - 20, y + cellH / 2)
      }

      doc.setFontSize(9)
      doc.setTextColor(240, 240, 240)
      const desc = doc.splitTextToSize(f.description, cellW - 16)
      doc.text(desc, x + 8, y + cellH - 40)

      doc.setFontSize(8)
      doc.setTextColor(163, 163, 163)
      const notes = doc.splitTextToSize(`Notes: ${f.notes || '-'}`, cellW - 16)
      doc.text(notes, x + 8, y + cellH - 18)

      col++
      if (col >= cols) { col = 0; row++ }
    }

    doc.save(`${project?.title || 'storyboard'}.pdf`)
    setExporting(false)
  }, [localFrames, project])

  const approvedCount = localFrames.filter((f) => f.status === 'approved').length
  const draftCount = localFrames.filter((f) => f.status === 'draft').length

  const scenes = project?.scenes || []

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-[#D4A853]" />
              Storyboarding
            </h1>
            <p className="font-inter text-sm text-[#888888]">
              {project ? `Project: ${project.title} · ` : ''}{localFrames.length} frames · {approvedCount} approved · {draftCount} draft
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-[#131313] border border-[#242424] rounded-lg p-1">
              <button onClick={() => setFrameViewMode('grid')} className={`p-1.5 rounded ${frameViewMode === 'grid' ? 'bg-[#242424] text-white' : 'text-[#6B6B6B] hover:text-white'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setFrameViewMode('list')} className={`p-1.5 rounded ${frameViewMode === 'list' ? 'bg-[#242424] text-white' : 'text-[#6B6B6B] hover:text-white'}`}>
                <Film className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => syncFromScript()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D4A853]/30 text-[#D4A853] text-sm font-inter hover:bg-[#D4A853]/10 transition-all">
              <RefreshCw className="w-4 h-4" /> Sync from Script
            </button>
            <button onClick={exportPDF} disabled={exporting} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#242424] text-[#A3A3A3] text-sm font-inter hover:text-white hover:border-[#333333] transition-all">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Frames', value: localFrames.length, icon: LayoutGrid, color: '#D4A853' },
            { label: 'Approved', value: approvedCount, icon: CheckCircle2, color: '#27AE60' },
            { label: 'Draft', value: draftCount, icon: Clock, color: '#2D9CDB' },
            { label: 'With Images', value: localFrames.filter((f) => f.image).length, icon: ImageIcon, color: '#9B59B6' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-4" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-2 mb-1"><s.icon className="w-4 h-4" style={{ color: s.color }} /><span className="text-xs text-[#6B6B6B]">{s.label}</span></div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Frame Grid */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-space-grotesk text-base font-medium">Frames</h2>
              <span className="text-xs text-[#6B6B6B]">{localFrames.length} total</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {localFrames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrameId(frame.id)}
                  className={`relative bg-[#0D0D0D] border rounded-lg overflow-hidden text-left transition-all ${
                    selectedFrameId === frame.id ? 'border-[#D4A853] ring-1 ring-[#D4A853]/30' : 'border-[#242424] hover:border-[#333333]'
                  }`}
                >
                  <div className="aspect-video bg-[#131313] flex items-center justify-center relative">
                    {frame.image ? <img src={frame.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-[#333333]" />}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase" style={{ background: statusConfig[frame.status].bg, color: statusConfig[frame.status].color, border: `1px solid ${statusConfig[frame.status].color}30` }}>{statusConfig[frame.status].label}</span>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0D0D0D] border border-[#242424] flex items-center justify-center text-[9px] font-bold text-white">{frame.number}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] text-[#A3A3A3] truncate">{frame.description?.slice(0, 40) || 'No description'}...</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Canvas / Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Toolbar */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 flex flex-wrap items-center gap-3" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-1 bg-[#131313] rounded-md p-1">
                {([
                  { key: 'select', icon: Maximize2 },
                  { key: 'arrow', icon: ArrowRight },
                  { key: 'circle', icon: Circle },
                  { key: 'rect', icon: Square },
                  { key: 'text', icon: Type },
                ] as const).map((tool) => (
                  <button key={tool.key} onClick={() => { setActiveTool(tool.key); if (tool.key !== 'select') addAnnotation(tool.key) }} className={`p-2 rounded transition-colors ${activeTool === tool.key ? 'bg-[#D4A853] text-[#060606]' : 'text-[#A3A3A3] hover:text-[#F0F0F0] hover:bg-[#242424]'}`} title={tool.key}>
                    <tool.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-[#242424]" />
              <div className="flex items-center gap-1">
                {annotationColors.map((c) => (
                  <button key={c} onClick={() => setActiveColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${activeColor === c ? 'border-[#F0F0F0] scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="h-6 w-px bg-[#242424]" />
              <button className="p-2 rounded text-[#A3A3A3] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors" onClick={undoAnnotation}><Undo className="w-4 h-4" /></button>
              <button className="p-2 rounded text-[#A3A3A3] hover:text-[#E74C3C] hover:bg-[#242424] transition-colors" onClick={clearAnnotations}><Trash2 className="w-4 h-4" /></button>
              <div className="flex-1" />
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] text-xs font-inter hover:text-white" onClick={() => duplicateFrame(selectedFrame)}>
                <Save className="w-3.5 h-3.5" /> Duplicate
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-inter font-medium hover:bg-[#E8BF6A] transition-all" onClick={() => openAiModal(selectedFrame)}>
                <Wand2 className="w-3.5 h-3.5" /> Generate Image
              </button>
            </div>

            {/* Canvas Area */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 relative" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded hover:bg-[#242424]" onClick={() => { const idx = localFrames.findIndex(f => f.id === selectedFrameId); if (idx > 0) setSelectedFrameId(localFrames[idx - 1].id) }}>
                    <ChevronLeft className="w-4 h-4 text-[#A3A3A3]" />
                  </button>
                  <span className="text-sm font-medium text-white">Frame {selectedFrame?.number}</span>
                  <button className="p-1 rounded hover:bg-[#242424]" onClick={() => { const idx = localFrames.findIndex(f => f.id === selectedFrameId); if (idx < localFrames.length - 1) setSelectedFrameId(localFrames[idx + 1].id) }}>
                    <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                  </button>
                  <div className="h-4 w-px bg-[#242424] mx-1" />
                  <select
                    value={selectedFrame?.status || 'draft'}
                    onChange={(e) => updateFrame(selectedFrame.id, 'status', e.target.value)}
                    className="text-[10px] px-2 py-1 rounded border font-medium uppercase bg-transparent outline-none cursor-pointer"
                    style={{ color: statusConfig[selectedFrame?.status || 'draft'].color, borderColor: `${statusConfig[selectedFrame?.status || 'draft'].color}30` }}
                  >
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <option key={key} value={key} style={{ background: '#131313', color: cfg.color }}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded hover:bg-[#242424] text-[#A3A3A3]" onClick={() => fileRef.current?.click()} title="Upload image"><Upload className="w-4 h-4" /></button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, selectedFrame.id)} />
                  <button className="p-1.5 rounded hover:bg-[#242424] text-[#E74C3C]" onClick={() => removeFrame(selectedFrame.id)} title="Delete frame"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="aspect-video bg-[#0D0D0D] border border-[#242424] rounded-lg relative overflow-hidden flex items-center justify-center group">
                {selectedFrame?.image ? (
                  <img src={selectedFrame.image} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-[#333333] mx-auto mb-3" />
                    <p className="text-sm text-[#6B6B6B] mb-3">No image for this frame</p>
                    <div className="flex items-center justify-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-inter font-medium" onClick={() => openAiModal(selectedFrame)}><Wand2 className="w-3.5 h-3.5" /> Generate</button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] text-xs font-inter" onClick={() => fileRef.current?.click()}><Upload className="w-3.5 h-3.5" /> Upload</button>
                    </div>
                  </div>
                )}
                {selectedFrame?.annotations?.map((ann: Annotation) => (
                  <div key={ann.id} className="absolute pointer-events-none" style={{ left: `${ann.x}%`, top: `${ann.y}%`, color: ann.color }}>
                    {ann.type === 'arrow' && <ArrowRight className="w-6 h-6" />}
                    {ann.type === 'circle' && <Circle className="w-6 h-6" />}
                    {ann.type === 'rect' && <Square className="w-6 h-6" />}
                    {ann.type === 'text' && <span className="text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">{ann.text}</span>}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#6B6B6B] uppercase block mb-1">Description</label>
                  <textarea className="w-full h-20 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#D4A853] resize-none" value={selectedFrame?.description || ''} onChange={(e) => updateFrame(selectedFrame.id, 'description', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#6B6B6B] uppercase block mb-1">Director's Notes</label>
                  <textarea className="w-full h-20 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] focus:outline-none focus:border-[#D4A853] resize-none" value={selectedFrame?.notes || ''} onChange={(e) => updateFrame(selectedFrame.id, 'notes', e.target.value)} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-[#6B6B6B]">
                <span>Created: {selectedFrame?.createdAt || '-'}</span>
                {selectedFrame?.sceneId && <span className="text-[#D4A853]">Linked to {scenes.find(s => s.id === selectedFrame.sceneId)?.heading || selectedFrame.sceneId}</span>}
                <span className="ml-auto">{(selectedFrame?.annotations || []).length} annotations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generate Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setAiModalOpen(false)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setAiModalOpen(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424] transition-colors"><X className="w-5 h-5 text-[#A3A3A3]" /></button>
            <h3 className="font-space-grotesk text-xl font-semibold mb-1 pr-8 text-white">AI Image Generation</h3>
            <p className="text-sm text-[#A3A3A3] mb-4">Frame {aiTargetFrame?.number}: {aiTargetFrame?.description?.slice(0, 60)}...</p>
            <div className="mb-3">
              <p className="text-xs text-[#6B6B6B] uppercase mb-2">Quick Prompts</p>
              <div className="flex flex-wrap gap-2">
                {aiPromptTemplates.map((prompt, i) => (
                  <button key={i} onClick={() => setAiPrompt(prompt)} className="text-[10px] px-2 py-1 rounded border border-[#242424] text-[#A3A3A3] hover:border-[#D4A853] hover:text-[#D4A853] transition-all">Prompt {i + 1}</button>
                ))}
              </div>
            </div>
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe the frame you want to generate..." className="w-full h-20 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-sm text-white placeholder-[#444444] outline-none focus:border-[#D4A853] resize-none mb-4" />
            <div className="bg-[#060606] border border-[#242424] rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
              {generating ? (
                <div className="text-center text-[#A3A3A3]">
                  <div className="w-8 h-8 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Generating image...</p>
                </div>
              ) : generatedImage ? (
                <img src={generatedImage} alt="Generated preview" className="max-w-full max-h-[280px] rounded object-contain" />
              ) : (
                <div className="text-center text-[#6B6B6B]"><ImageIcon className="w-8 h-8 mx-auto mb-2" /><p className="text-xs">No image generated yet</p></div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={generateImage} disabled={generating}>{generating ? 'Generating...' : 'Generate Image'}</button>
              <button className="btn-secondary" onClick={() => castPhotoRef.current?.click()}><Upload className="w-4 h-4" /> Upload Cast Photo</button>
              <input ref={castPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleCastPhotoUpload} />
              {generatedImage && <button className="btn-primary" onClick={applyGeneratedImage}><CheckCircle2 className="w-4 h-4" /> Apply to Frame</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
