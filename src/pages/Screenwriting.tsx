import { useState, useRef, useCallback, useMemo } from 'react'
import {
  PenTool, Download, Save, Type, AlignLeft, FileText, Printer, Copy, Check,
  Bold, Film, Users, Hash,
  BookOpen, Trash2, Sparkles, X, Zap, FileJson, FileCode,
  RefreshCw, Plus
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { jsPDF } from 'jspdf'

/* ─── Fountain Parser Helpers ─── */
const detectLineType = (line: string): 'heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'note' | 'pagebreak' | 'unknown' => {
  const trimmed = line.trim()
  if (!trimmed) return 'unknown'
  if (trimmed.startsWith('===') || trimmed.startsWith('***')) return 'pagebreak'
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return 'note'
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return 'parenthetical'
  if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.') || trimmed.startsWith('I/E.') || trimmed.startsWith('EST.')) return 'heading'
  if (/^\d+\.?\s+/.test(trimmed) && (trimmed.includes('INT') || trimmed.includes('EXT'))) return 'heading'
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 1 && trimmed.length < 60 && !trimmed.includes('.')) return 'character'
  if (trimmed.startsWith('FADE ') || trimmed.startsWith('CUT ') || trimmed.startsWith('DISSOLVE') || trimmed.startsWith('SMASH CUT') || trimmed.startsWith('JUMP CUT') || trimmed.endsWith('TO:')) return 'transition'
  if (trimmed.startsWith('TITLE:') || trimmed.startsWith('CREDIT:') || trimmed.startsWith('AUTHOR:') || trimmed.startsWith('DRAFT DATE:')) return 'note'
  return 'action'
}

const estimatePageCount = (content: string) => {
  const lines = content.split('\n').filter((l) => l.trim())
  let pageCount = 0
  let linesOnPage = 0
  const LINES_PER_PAGE = 55
  lines.forEach((line) => {
    const type = detectLineType(line)
    const lineHeight = type === 'heading' || type === 'transition' ? 2 : type === 'character' ? 1 : type === 'dialogue' ? 1 : type === 'parenthetical' ? 1 : 1.5
    linesOnPage += lineHeight
    if (linesOnPage >= LINES_PER_PAGE) { pageCount++; linesOnPage = 0 }
  })
  if (linesOnPage > 0) pageCount++
  return Math.max(pageCount, 1)
}

export default function Screenwriting() {
  const project = useProjectStore((s) => s.getActiveProject())
  const updateScript = useProjectStore((s) => s.updateScript)
  const syncFromScript = useProjectStore((s) => s.syncFromScript)
  const projects = useProjectStore((s) => s.projects)
  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const setActiveProject = useProjectStore((s) => s.setActiveProject)
  const createProject = useProjectStore((s) => s.createProject)

  const [content, setContent] = useState(project?.scriptContent || '')
  const [title, setTitle] = useState(project?.title || 'Untitled')
  const [saved, setSaved] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [showSidebar, setShowSidebar] = useState<'scenes' | 'characters' | null>('scenes')
  const [showAiAssist, setShowAiAssist] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync local state when project changes
  const currentProjectId = project?.id
  useMemo(() => {
    if (project) {
      setContent(project.scriptContent)
      setTitle(project.title)
    }
  }, [currentProjectId])

  const lines = useMemo(() => content.split('\n'), [content])
  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content])
  const lineCount = useMemo(() => lines.length, [lines])
  const pages = useMemo(() => estimatePageCount(content), [content])

  // Parse scenes and characters from current content
  const scenes = useMemo(() => project?.scenes || [], [project])
  const characters = useMemo(() => project?.characters || [], [project])

  const handleSave = () => {
    updateScript(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSync = () => {
    updateScript(content)
    syncFromScript()
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.fountain`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = useCallback(() => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 72
    const textW = pageW - margin * 2
    let y = margin
    const lineHeight = 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)

    content.split('\n').forEach((rawLine) => {
      const line = rawLine.trim()
      if (!line) { y += lineHeight; return }
      const type = detectLineType(line)
      if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin }
      if (type === 'heading') {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(0, 0, 0)
        doc.text(line.toUpperCase(), margin, y); y += lineHeight * 2
      } else if (type === 'character') {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(0, 0, 0)
        doc.text(line.toUpperCase(), margin + textW * 0.35, y); y += lineHeight
      } else if (type === 'parenthetical') {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(0, 0, 0)
        doc.text(line, margin + textW * 0.28, y); y += lineHeight
      } else {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(0, 0, 0)
        const split = doc.splitTextToSize(line, textW)
        doc.text(split, margin, y); y += lineHeight * split.length
      }
    })
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`)
  }, [content, title])

  const insertTemplate = (template: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent = content.slice(0, start) + template + content.slice(end)
    setContent(newContent)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + template.length, start + template.length) }, 0)
  }

  const jumpToLine = (lineIndex: number) => {
    const ta = textareaRef.current
    if (!ta) return
    let charPos = 0
    for (let i = 0; i < lineIndex && i < lines.length; i++) charPos += lines[i].length + 1
    ta.focus(); ta.setSelectionRange(charPos, charPos)
  }

  const generateAiSuggestions = useCallback(() => {
    setAiLoading(true)
    setTimeout(() => {
      const suggestions = [
        `Consider adding visual rain motifs to mirror ${characters[0]?.name || 'the protagonist'}'s emotional state.`,
        'The confrontation could benefit from a ticking clock element.',
        `Add a silent beat after the reveal to let tension breathe.`,
        'The film reel reveal works well — consider foreshadowing it earlier.',
        `Scene 2's apartment setting feels cramped. Open a window for visual depth?`,
      ]
      setAiSuggestions(suggestions)
      setAiLoading(false)
    }, 1500)
  }, [characters])

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      {/* Top Toolbar */}
      <div className="border-b border-[#242424] bg-[#0D0D0D] px-4 py-3">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PenTool className="w-5 h-5 text-[#D4A853]" />
            {/* Project Selector */}
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProject(e.target.value)}
              className="bg-[#131313] border border-[#242424] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#D4A853]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <button
              onClick={() => { const name = prompt('New project name:'); if (name) createProject(name) }}
              className="p-1.5 rounded hover:bg-[#242424] text-[#A3A3A3]"
              title="New Project"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-[#242424]" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-space-grotesk text-lg font-semibold text-white outline-none border-b border-transparent focus:border-[#D4A853] transition-colors w-48 sm:w-72"
            />
            {saved && (
              <span className="text-xs text-[#27AE60] font-inter flex items-center gap-1 bg-[#27AE60]/10 px-2 py-1 rounded border border-[#27AE60]/20">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 mr-2 px-3 py-1.5 rounded-lg border border-[#242424] bg-[#131313]">
              <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-white font-medium">{pages}</span> pages
              </div>
              <div className="w-px h-3 bg-[#242424]" />
              <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                <Type className="w-3.5 h-3.5" />
                <span className="text-white font-medium">{wordCount.toLocaleString()}</span> words
              </div>
              <div className="w-px h-3 bg-[#242424]" />
              <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                <Film className="w-3.5 h-3.5" />
                <span className="text-white font-medium">{scenes.length}</span> scenes
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-[#111111] border border-[#242424] rounded-lg px-2 py-1">
              <button onClick={() => setFontSize(Math.max(12, fontSize - 1))} className="p-1 text-[#888888] hover:text-white"><span className="text-xs font-bold">A-</span></button>
              <span className="text-xs text-[#888888] font-inter w-6 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(20, fontSize + 1))} className="p-1 text-[#888888] hover:text-white"><span className="text-sm font-bold">A+</span></button>
            </div>

            <button onClick={() => setShowAiAssist(!showAiAssist)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-inter transition-all ${showAiAssist ? 'bg-[#9B59B6]/10 border-[#9B59B6]/30 text-[#9B59B6]' : 'border-[#242424] text-[#A3A3A3] hover:text-white hover:border-[#333333]'}`}>
              <Sparkles className="w-4 h-4" /> AI Assist
            </button>

            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] hover:text-white hover:border-[#333333] text-sm font-inter transition-all">
              <Save className="w-4 h-4" /> Save
            </button>

            <button onClick={handleSync} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10 text-sm font-inter transition-all" title="Sync script to Shot List, Storyboard, Breakdown">
              <RefreshCw className="w-4 h-4" /> Sync
            </button>

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-inter font-medium hover:bg-[#E8BF6A] transition-all">
                <Download className="w-4 h-4" /> Export
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#131313] border border-[#242424] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden">
                <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left">
                  <FileCode className="w-4 h-4" /> Fountain
                </button>
                <button onClick={exportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left">
                  <FileJson className="w-4 h-4" /> PDF Script
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar: Scene/Character Navigator */}
        <div className="w-full lg:w-72 border-r border-[#242424] bg-[#0D0D0D] flex flex-col max-h-[calc(100vh-60px)] overflow-y-auto">
          <div className="flex items-center border-b border-[#242424]">
            <button onClick={() => setShowSidebar('scenes')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${showSidebar === 'scenes' ? 'text-[#D4A853] border-b-2 border-[#D4A853]' : 'text-[#6B6B6B] hover:text-[#A3A3A3]'}`}>
              <Film className="w-3.5 h-3.5" /> Scenes
            </button>
            <button onClick={() => setShowSidebar('characters')} className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${showSidebar === 'characters' ? 'text-[#2D9CDB] border-b-2 border-[#2D9CDB]' : 'text-[#6B6B6B] hover:text-[#A3A3A3]'}`}>
              <Users className="w-3.5 h-3.5" /> Cast ({characters.length})
            </button>
          </div>

          <div className="p-3 space-y-1">
            {showSidebar === 'scenes' && (
              <>
                {scenes.length === 0 && <p className="text-xs text-[#6B6B6B] p-4 text-center">No scenes detected. Add scene headings like "EXT. LOCATION - TIME"</p>}
                {scenes.map((scene) => (
                  <button key={scene.id} onClick={() => jumpToLine(scene.lineIndex)} className="w-full text-left p-2.5 rounded-lg hover:bg-[#181818] transition-all group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded bg-[#D4A853]/10 text-[#D4A853] flex items-center justify-center text-[10px] font-bold">{scene.number}</span>
                      <span className="text-xs text-[#D4A853] font-medium truncate">{scene.heading}</span>
                    </div>
                    {scene.characters.length > 0 && (
                      <div className="flex items-center gap-1 ml-7 flex-wrap">
                        {scene.characters.map((c) => (
                          <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2D9CDB]/10 text-[#2D9CDB]">{c}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </>
            )}
            {showSidebar === 'characters' && (
              <>
                {characters.length === 0 && <p className="text-xs text-[#6B6B6B] p-4 text-center">No characters detected.</p>}
                {characters.map((char) => (
                  <div key={char.name} className="p-2.5 rounded-lg hover:bg-[#181818] transition-all">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#2D9CDB]" />
                      <span className="text-sm font-medium text-white">{char.name}</span>
                    </div>
                    <p className="text-[10px] text-[#6B6B6B] mt-1 ml-5.5">{char.scenes.length} scene{char.scenes.length !== 1 ? 's' : ''} · {char.dialogueCount} lines</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Format Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#242424] bg-[#0a0a0a] overflow-x-auto">
            {[
              { label: 'Scene Heading', template: '\n\nEXT. LOCATION - TIME\n\n', icon: Film, color: '#D4A853' },
              { label: 'Action', template: '\nDescribe the scene visually.\n\n', icon: AlignLeft, color: '#A3A3A3' },
              { label: 'Character', template: '\n\nCHARACTER NAME\n', icon: Users, color: '#2D9CDB' },
              { label: 'Dialogue', template: 'Dialogue goes here.\n\n', icon: Type, color: '#F0F0F0' },
              { label: 'Parenthetical', template: '(whispering)\n', icon: Hash, color: '#888888' },
              { label: 'Transition', template: '\n\nCUT TO:\n\n', icon: Zap, color: '#9B59B6' },
            ].map((item) => (
              <button key={item.label} onClick={() => insertTemplate(item.template)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-inter transition-all hover:bg-[#181818] border border-transparent hover:border-[#333333] whitespace-nowrap" style={{ color: item.color }}>
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            ))}
          </div>

          {/* AI Assist Panel */}
          {showAiAssist && (
            <div className="border-b border-[#242424] bg-[#131313] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-space-grotesk text-sm font-semibold text-[#9B59B6] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Script Assistant
                </h3>
                <button onClick={() => setShowAiAssist(false)} className="p-1 rounded hover:bg-[#242424] text-[#A3A3A3]"><X className="w-4 h-4" /></button>
              </div>
              {aiSuggestions.length === 0 && !aiLoading && (
                <button onClick={generateAiSuggestions} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9B59B6]/10 border border-[#9B59B6]/20 text-[#9B59B6] text-sm hover:bg-[#9B59B6]/20 transition-all">
                  <Zap className="w-4 h-4" /> Analyze Script & Get Suggestions
                </button>
              )}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                  <div className="w-4 h-4 border-2 border-[#9B59B6] border-t-transparent rounded-full animate-spin" />
                  Analyzing your screenplay...
                </div>
              )}
              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#0D0D0D] border border-[#242424]">
                      <Sparkles className="w-3.5 h-3.5 text-[#9B59B6] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#CCCCCC]">{s}</p>
                    </div>
                  ))}
                  <button onClick={generateAiSuggestions} className="text-xs text-[#9B59B6] hover:underline mt-1">Regenerate suggestions</button>
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">
              <div className="flex">
                <div className="w-12 bg-[#0D0D0D] border-r border-[#242424] py-4 flex-shrink-0">
                  {lines.map((_, i) => (
                    <div key={i} className="h-7 flex items-center justify-center text-[10px] text-[#444444] font-mono select-none">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 min-h-[70vh] bg-transparent p-4 font-mono text-sm outline-none resize-none leading-7"
                  style={{ fontSize: `${fontSize}px`, color: '#CCCCCC', tabSize: 2 }}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="border-t border-[#242424] bg-[#0D0D0D] px-4 py-2 flex items-center gap-4 text-xs text-[#6B6B6B]">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {pages} pages</span>
            <span className="flex items-center gap-1"><Type className="w-3 h-3" /> {wordCount.toLocaleString()} words</span>
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {lineCount} lines</span>
            <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {scenes.length} scenes</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {characters.length} characters</span>
            <span className="ml-auto">Project: {project?.title || 'Untitled'}</span>
          </div>
        </div>

        {/* Right Sidebar: Tools */}
        <div className="hidden xl:block w-64 border-l border-[#242424] bg-[#0D0D0D] p-4 space-y-6">
          <div>
            <p className="font-inter text-xs text-[#6B6B6B] uppercase tracking-wider mb-3">Insert</p>
            <div className="space-y-1">
              {[
                { label: 'Scene Heading', template: '\n\nEXT. LOCATION - TIME\n\n', icon: Film },
                { label: 'Action Line', template: '\nDescribe the scene visually.\n\n', icon: AlignLeft },
                { label: 'Character Name', template: '\n\nCHARACTER NAME\n', icon: Users },
                { label: 'Dialogue', template: 'Dialogue goes here.\n\n', icon: Type },
                { label: 'Parenthetical', template: '(emotion)\n', icon: Hash },
                { label: 'Transition', template: '\n\nFADE TO BLACK.\n\n', icon: Zap },
                { label: 'Note', template: '[[Add production note here]]\n', icon: FileText },
              ].map((item) => (
                <button key={item.label} onClick={() => insertTemplate(item.template)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-all text-left">
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-[#242424] pt-4">
            <p className="font-inter text-xs text-[#6B6B6B] uppercase tracking-wider mb-3">Tools</p>
            <div className="space-y-1">
              <button onClick={() => setContent(content.toUpperCase())} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-all text-left">
                <Bold className="w-3.5 h-3.5" /> Uppercase All
              </button>
              <button onClick={() => { navigator.clipboard.writeText(content); alert('Copied to clipboard') }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-all text-left">
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
              <button onClick={() => window.print()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-all text-left">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button onClick={() => setContent('')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter text-[#A3A3A3] hover:text-[#E74C3C] hover:bg-[#E74C3C]/10 transition-all text-left">
                <Trash2 className="w-3.5 h-3.5" /> Clear Script
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
