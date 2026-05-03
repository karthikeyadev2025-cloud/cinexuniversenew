import { useState } from 'react'
import {
  Film, Sparkles, Play, Download, Clock, Ratio, ArrowRight,
  Trash2, RefreshCw, CheckCircle2, Zap, X, Star, Copy, Check,
  Volume2, Maximize2
} from 'lucide-react'
import { useProjectStore } from '../stores/projectStore'
import { useFeatureModelStore } from '../stores/featureModelStore'
import { useApiConfigStore } from '../stores/apiConfigStore'

interface GeneratedVideo {
  id: string
  prompt: string
  status: 'generating' | 'completed' | 'failed'
  url?: string
  createdAt: string
  duration: number
  ratio: string
  model: string
  provider: string
  starred: boolean
  views: number
}

const RATIOS = [
  { label: '16:9 (Widescreen)', value: '16:9', dim: '16/9' },
  { label: '9:16 (Vertical)', value: '9:16', dim: '9/16' },
  { label: '1:1 (Square)', value: '1:1', dim: '1/1' },
  { label: '4:3 (Classic)', value: '4:3', dim: '4/3' },
  { label: '21:9 (Cinema)', value: '21:9', dim: '21/9' },
]

const DURATIONS = [3, 5, 10]

export default function PreVisualization() {
  const project = useProjectStore((s) => s.getActiveProject())
  const scenes = project?.scenes || []
  const storePrevis = project?.previsVideos || []
  const syncFromScript = useProjectStore((s) => s.syncFromScript)

  const assignment = useFeatureModelStore((s) => s.getAssignment('pre_visualization'))
  const provider = useApiConfigStore((s) => s.getProvider(assignment?.providerId || ''))

  const [prompt, setPrompt] = useState('')
  const [ratio, setRatio] = useState('16:9')
  const [duration, setDuration] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videos, setVideos] = useState<GeneratedVideo[]>([
    ...storePrevis.map((v) => ({ ...v, starred: false, views: 0 })),
    {
      id: 'demo-1',
      prompt: 'A detective walks through a neon-lit alley in rainy Mumbai at night. Cinematic film noir style. Camera tracks slowly forward.',
      status: 'completed' as const,
      url: '/previs-demo-1.mp4',
      createdAt: '2 hours ago',
      duration: 5,
      ratio: '16:9',
      model: 'gen-4-turbo',
      provider: 'Runway',
      starred: true,
      views: 12,
    },
  ])
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'starred' | 'completed'>('all')
  const [copied, setCopied] = useState(false)

  const assignedModel = assignment?.model || 'Not configured'
  const assignedProvider = provider?.name || assignment?.providerId || 'Not configured'
  const qualityPreset = assignment?.qualityPreset || 'balanced'

  const filteredVideos = videos.filter((v) => {
    if (filter === 'starred') return v.starred
    if (filter === 'completed') return v.status === 'completed'
    return true
  })

  // Scene-based prompt templates
  const scenePrompts = scenes.map((scene) => ({
    label: `Scene ${scene.number}: ${scene.heading.slice(0, 30)}...`,
    prompt: `Cinematic ${scene.intExt === 'EXT.' ? 'exterior' : 'interior'} shot: ${scene.description}. ${scene.time === 'NIGHT' ? 'Night lighting, dramatic shadows.' : 'Day lighting, natural atmosphere.'} ${scene.characters.length > 0 ? `Featuring ${scene.characters.join(', ')}.` : ''}`,
  }))

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setProgress(0)

    const newVideo: GeneratedVideo = {
      id: 'gen-' + Date.now(),
      prompt: prompt.trim(),
      status: 'generating',
      createdAt: 'Just now',
      duration,
      ratio,
      model: assignedModel,
      provider: assignedProvider,
      starred: false,
      views: 0,
    }
    setVideos((v) => [newVideo, ...v])

    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.random() * 12))
    }, 800)

    await new Promise((r) => setTimeout(r, 6000))
    clearInterval(interval)
    setProgress(100)

    setVideos((v) => v.map((vid) => vid.id === newVideo.id ? { ...vid, status: 'completed' as const, url: '/previs-generated.mp4' } : vid))
    setGenerating(false)
    setProgress(0)
    setPrompt('')
  }

  const deleteVideo = (id: string) => setVideos((v) => v.filter((vid) => vid.id !== id))
  const toggleStar = (id: string) => setVideos((v) => v.map((vid) => vid.id === id ? { ...vid, starred: !vid.starred } : vid))

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const getAspectStyle = (r: string) => ({ aspectRatio: RATIOS.find((rr) => rr.value === r)?.dim || '16/9' })

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      {/* Header */}
      <div className="border-b border-[#242424] bg-[#0D0D0D] px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center">
              <Film className="w-5 h-5 text-[#D4A853]" />
            </div>
            <div>
              <h1 className="font-space-grotesk text-lg font-semibold text-white">Pre-Visualization</h1>
              <p className="font-inter text-xs text-[#6B6B6B]">{project ? `Project: ${project.title} · ${scenes.length} scenes · ` : ''}AI video generation for pre-viz, animatics & motion tests</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-inter flex-wrap">
            <button onClick={() => syncFromScript()} className="px-2.5 py-1 rounded-lg border border-[#D4A853]/30 text-[#D4A853] text-xs font-inter hover:bg-[#D4A853]/10 transition-all">
              <RefreshCw className="w-3 h-3 inline mr-1" /> Sync from Script
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#242424] text-[#A3A3A3] flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#D4A853]" />{assignedProvider}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#181818] border border-[#242424] text-[#D4A853]">{assignedModel}</span>
            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-medium uppercase ${
              qualityPreset === 'fast' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              qualityPreset === 'max' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              qualityPreset === 'quality' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>{qualityPreset}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Generator Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-3">
                <label className="font-inter text-xs text-[#6B6B6B] uppercase tracking-wider">Scene Description</label>
                <span className="text-xs text-[#6B6B6B]">{prompt.length} chars</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene in detail. Include camera movement, lighting, atmosphere, and shot type..."
                className="w-full bg-[#131313] border border-[#242424] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444444] outline-none focus:border-[#D4A853] resize-none h-32"
              />

              {/* Scene Prompts */}
              {scenePrompts.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] text-[#6B6B6B] uppercase mb-2">From Script ({scenePrompts.length} scenes)</p>
                  <div className="flex flex-wrap gap-2">
                    {scenePrompts.map((p, i) => (
                      <button key={i} onClick={() => setPrompt(p.prompt)} className="text-[10px] px-2 py-1 rounded border border-[#242424] text-[#A3A3A3] hover:border-[#D4A853] hover:text-[#D4A853] transition-all line-clamp-1 max-w-[200px]" title={p.label}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#242424]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="text-xs text-[#888888] font-inter">Duration:</span>
                  <div className="flex gap-1">
                    {DURATIONS.map((d) => (
                      <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${duration === d ? 'bg-[#D4A853] text-[#060606] font-medium' : 'bg-[#181818] text-[#888888] border border-[#242424] hover:border-[#333333]'}`}>{d}s</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ratio className="w-4 h-4 text-[#6B6B6B]" />
                  <span className="text-xs text-[#888888] font-inter">Ratio:</span>
                  <select value={ratio} onChange={(e) => setRatio(e.target.value)} className="bg-[#181818] border border-[#242424] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4A853] font-inter">
                    {RATIOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex-1" />
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-inter text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: generating ? '#1a1a1a' : '#D4A853', color: generating ? '#888888' : '#060606', border: generating ? '1px solid #333333' : 'none' }}
                >
                  {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating... {Math.round(progress)}%</> : <><Sparkles className="w-4 h-4" /> Generate Video</>}
                </button>
              </div>
              {generating && (
                <div className="mt-3 w-full h-1.5 bg-[#181818] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4A853] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>

            {/* Videos Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-space-grotesk text-base font-semibold text-white">Generated Videos ({filteredVideos.length})</h2>
                <div className="flex items-center gap-2">
                  {(['all', 'starred', 'completed'] as const).map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${filter === f ? 'bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853]' : 'border-[#242424] text-[#6B6B6B]'}`}>
                      {f === 'all' ? 'All' : f === 'starred' ? 'Starred' : 'Completed'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden hover:border-[#333333] transition-all group" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                    <div className="relative bg-gradient-to-br from-[#1a1500] to-[#0D0D0D] flex items-center justify-center border-b border-[#1a1a1a] overflow-hidden cursor-pointer" style={getAspectStyle(video.ratio)} onClick={() => setPlayingVideo(video.id)}>
                      {video.status === 'generating' ? (
                        <div className="text-center">
                          <RefreshCw className="w-10 h-10 text-[#D4A853] animate-spin mx-auto mb-2" />
                          <p className="font-inter text-xs text-[#888888]">Generating...</p>
                        </div>
                      ) : (
                        <div className="text-center group-hover:scale-105 transition-transform duration-300">
                          <div className="w-14 h-14 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.3)] flex items-center justify-center mx-auto mb-2 group-hover:bg-[rgba(212,168,83,0.2)] transition-all">
                            <Play className="w-6 h-6 text-[#D4A853] ml-0.5" />
                          </div>
                          <p className="font-inter text-xs text-[#888888]">Click to preview</p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-inter ${video.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : video.status === 'generating' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{video.status}</span>
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0D0D0D] text-[#888888] border border-[#242424] font-inter">{video.duration}s · {video.ratio}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(video.id) }} className="absolute top-2 left-2 p-1 rounded hover:bg-[#242424] transition-colors">
                        <Star className={`w-3.5 h-3.5 ${video.starred ? 'text-[#D4A853] fill-[#D4A853]' : 'text-[#6B6B6B]'}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="font-inter text-sm text-[#CCCCCC] line-clamp-2 mb-2">{video.prompt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B] font-inter">
                          <span className="text-[#D4A853]">{video.provider}</span><span>·</span><span>{video.model}</span><span>·</span><span>{video.createdAt}</span><span>·</span><span>{video.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyPrompt(video.prompt)} className="p-1.5 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-[#D4A853] transition-colors" title="Copy prompt">
                            {copied ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => deleteVideo(video.id)} className="p-1.5 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          {video.status === 'completed' && <button className="p-1.5 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-[#D4A853] transition-colors"><Download className="w-3.5 h-3.5" /></button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredVideos.length === 0 && (
                <div className="text-center py-12">
                  <Film className="w-12 h-12 text-[#333333] mx-auto mb-3" />
                  <p className="font-inter text-sm text-[#6B6B6B]">No videos match your filter. Generate your first pre-visualization.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-3">Active Model</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm"><span className="font-inter text-[#888888]">Provider</span><span className="font-inter text-white">{assignedProvider}</span></div>
                <div className="flex justify-between text-sm"><span className="font-inter text-[#888888]">Model</span><span className="font-inter text-[#D4A853]">{assignedModel}</span></div>
                <div className="flex justify-between text-sm"><span className="font-inter text-[#888888]">Quality</span><span className={`font-inter ${qualityPreset === 'fast' ? 'text-yellow-400' : qualityPreset === 'max' ? 'text-purple-400' : qualityPreset === 'quality' ? 'text-emerald-400' : 'text-blue-400'}`}>{qualityPreset}</span></div>
                <div className="flex justify-between text-sm"><span className="font-inter text-[#888888]">Max Duration</span><span className="font-inter text-white">10 seconds</span></div>
                <div className="flex justify-between text-sm"><span className="font-inter text-[#888888]">Queue</span><span className="font-inter text-[#27AE60]">Ready</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242424]">
                <a href="/admin/feature-models" className="flex items-center gap-1 text-xs text-[#D4A853] hover:underline font-inter">Change model <ArrowRight className="w-3 h-3" /></a>
              </div>
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-3">Prompt Engineering</h3>
              <ul className="space-y-2.5">
                {[
                  'Describe camera movement explicitly (dolly, crane, handheld)',
                  'Mention lighting style (golden hour, neon, noir, practical)',
                  'Include shot type and lens feel (wide, close-up, macro)',
                  'Specify mood and atmosphere in 3-5 adjectives',
                  'Add color palette or grading style references',
                  'Mention character action and emotional state',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-inter text-[#AAAAAA]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A853] flex-shrink-0 mt-0.5" />{tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-3">Usage</h3>
              <div className="mb-3">
                <div className="flex justify-between text-xs font-inter mb-1.5"><span className="text-[#888888]">This month</span><span className="text-white">{videos.filter(v => v.status === 'completed').length} / 50 videos</span></div>
                <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden"><div className="h-full bg-[#D4A853] rounded-full" style={{ width: `${(videos.filter(v => v.status === 'completed').length / 50) * 100}%` }} /></div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs font-inter mb-1.5"><span className="text-[#888888]">Storage</span><span className="text-white">1.2 GB / 10 GB</span></div>
                <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden"><div className="h-full bg-[#2D9CDB] rounded-full" style={{ width: '12%' }} /></div>
              </div>
              <p className="text-[10px] text-[#6B6B6B] font-inter">Resets on the 1st of each month</p>
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h3 className="font-space-grotesk text-sm font-semibold text-white mb-3">Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#131313] border border-[#242424]"><p className="text-xs text-[#6B6B6B] mb-1">Total</p><p className="text-xl font-bold text-white">{videos.length}</p></div>
                <div className="p-3 rounded-lg bg-[#131313] border border-[#242424]"><p className="text-xs text-[#6B6B6B] mb-1">Starred</p><p className="text-xl font-bold text-[#D4A853]">{videos.filter(v => v.starred).length}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPlayingVideo(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPlayingVideo(null)} className="absolute -top-10 right-0 p-2 rounded-lg hover:bg-[#242424] text-[#A3A3A3] transition-colors"><X className="w-5 h-5" /></button>
            <div className="rounded-xl overflow-hidden bg-[#0D0D0D] border border-[#242424]">
              <div className="aspect-video bg-[#060606] flex items-center justify-center">
                <div className="text-center">
                  <Film className="w-16 h-16 text-[#333333] mx-auto mb-3" />
                  <p className="text-sm text-[#6B6B6B] font-inter">Video preview would play here</p>
                  <p className="text-xs text-[#444444] font-inter mt-1">Connect an AI video API to enable real playback</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-full bg-[#D4A853] text-[#060606] hover:bg-[#E8BF6A] transition-colors"><Play className="w-4 h-4" /></button>
                  <button className="p-2 rounded hover:bg-[#242424] text-[#A3A3A3]"><Volume2 className="w-4 h-4" /></button>
                  <span className="text-xs text-[#6B6B6B] font-inter">0:00 / 0:05</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-[#242424] text-[#A3A3A3]"><Download className="w-4 h-4" /></button>
                  <button className="p-2 rounded hover:bg-[#242424] text-[#A3A3A3]"><Maximize2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
