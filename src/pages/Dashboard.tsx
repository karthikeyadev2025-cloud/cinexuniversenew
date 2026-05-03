import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Folder, FileText, Image, Calendar, DollarSign, Users, ArrowRight, Plus,
  MoreHorizontal, TrendingUp, TrendingDown, Activity, Wand2, Clapperboard,
  Camera, Mic, Layers, Zap, HardDrive, Clock, ChevronRight, Bell, Crown,
  Check, X, Trash2, Edit3, RefreshCw, Download, Film, UserPlus, MessageSquare
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, Tooltip, XAxis
} from 'recharts'
// import { useProjectStore } from '../stores/projectStore'

/* ─── Types ─── */
interface Project {
  id: number
  title: string
  type: string
  scenes: number
  shots: number
  status: 'active' | 'draft' | 'completed'
  updated: string
  progress: number
  budgetUsed: number
  budgetTotal: number
  cover: string
}

interface ActivityItem {
  id: number
  action: string
  detail: string
  project: string
  time: string
  icon: React.ElementType
  color: string
  bg: string
  link?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'alert' | 'success'
}

/* ─── Mock Data ─── */
const projects: Project[] = [
  { id: 1, title: 'Neon Shadows', type: 'Feature Film', scenes: 24, shots: 86, status: 'active', updated: '2 hrs ago', progress: 65, budgetUsed: 42000, budgetTotal: 65000, cover: '#D4A853' },
  { id: 2, title: 'The Last Frame', type: 'Short Film', scenes: 8, shots: 32, status: 'active', updated: '5 hrs ago', progress: 40, budgetUsed: 8500, budgetTotal: 15000, cover: '#2D9CDB' },
  { id: 3, title: 'Midnight Drive', type: 'Web Series', scenes: 12, shots: 48, status: 'draft', updated: '1 day ago', progress: 20, budgetUsed: 3000, budgetTotal: 25000, cover: '#27AE60' },
  { id: 4, title: 'Echoes of Time', type: 'Documentary', scenes: 18, shots: 54, status: 'completed', updated: '3 days ago', progress: 100, budgetUsed: 18000, budgetTotal: 18000, cover: '#9B59B6' },
]

const aiUsageData = [
  { day: 'Mon', calls: 45 }, { day: 'Tue', calls: 62 }, { day: 'Wed', calls: 38 },
  { day: 'Thu', calls: 75 }, { day: 'Fri', calls: 55 }, { day: 'Sat', calls: 88 }, { day: 'Sun', calls: 72 },
]

const storageData = [
  { name: 'Scripts', value: 340, color: '#D4A853' },
  { name: 'Storyboards', value: 820, color: '#2D9CDB' },
  { name: 'Pre-Viz', value: 560, color: '#27AE60' },
  { name: 'Audio', value: 280, color: '#9B59B6' },
  { name: 'Exports', value: 400, color: '#E67E22' },
]

const sparklineData1 = [{ v: 12 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: 28 }, { v: 24 }, { v: 30 }]
const sparklineData2 = [{ v: 8 }, { v: 12 }, { v: 10 }, { v: 14 }, { v: 18 }, { v: 16 }, { v: 20 }]
const sparklineData3 = [{ v: 20 }, { v: 18 }, { v: 24 }, { v: 22 }, { v: 28 }, { v: 32 }, { v: 36 }]
const sparklineData4 = [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 10 }, { v: 12 }]

const activities: ActivityItem[] = [
  { id: 1, action: 'Script Updated', detail: 'Scene 12 revised with new dialogue', project: 'Neon Shadows', time: '10 min ago', icon: FileText, color: '#D4A853', bg: 'rgba(212,168,83,0.1)', link: '/screenwriting' },
  { id: 2, action: 'Shot List Generated', detail: '24 new shots added to sequence', project: 'The Last Frame', time: '1 hr ago', icon: Camera, color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)', link: '/shot-list' },
  { id: 3, action: 'Budget Alert', detail: '85% of location budget consumed', project: 'Midnight Drive', time: '3 hrs ago', icon: DollarSign, color: '#E74C3C', bg: 'rgba(231,76,60,0.1)', link: '/budgeting' },
  { id: 4, action: 'Team Member Joined', detail: 'Priya Sharma joined as cinematographer', project: 'Neon Shadows', time: '5 hrs ago', icon: Users, color: '#27AE60', bg: 'rgba(39,174,96,0.1)' },
  { id: 5, action: 'AI Breakdown Complete', detail: 'Script breakdown generated 47 elements', project: 'Echoes of Time', time: '8 hrs ago', icon: Wand2, color: '#9B59B6', bg: 'rgba(155,89,186,0.1)', link: '/script-breakdown' },
  { id: 6, action: 'Schedule Published', detail: '15-day shoot calendar finalized', project: 'The Last Frame', time: '1 day ago', icon: Calendar, color: '#E67E22', bg: 'rgba(230,126,34,0.1)', link: '/scheduling' },
]

const quickActions = [
  { icon: FileText, label: 'New Script', desc: 'Start writing', href: '/screenwriting', color: '#D4A853', bg: 'rgba(212,168,83,0.08)' },
  { icon: Image, label: 'Storyboard', desc: 'Visualize scenes', href: '/storyboarding', color: '#2D9CDB', bg: 'rgba(45,156,219,0.08)' },
  { icon: Camera, label: 'Shot List', desc: 'Plan coverage', href: '/shot-list', color: '#27AE60', bg: 'rgba(39,174,96,0.08)' },
  { icon: Wand2, label: 'Breakdown', desc: 'Script elements', href: '/script-breakdown', color: '#9B59B6', bg: 'rgba(155,89,186,0.08)' },
  { icon: Clapperboard, label: 'Pre-Vis', desc: 'AI video preview', href: '/pre-visualization', color: '#E67E22', bg: 'rgba(230,126,34,0.08)' },
  { icon: Film, label: 'Settings', desc: 'App preferences', href: '/settings', color: '#E74C3C', bg: 'rgba(231,76,60,0.08)' },
  { icon: Zap, label: 'AI Tools', desc: 'Generate content', href: '/script-doctor', color: '#F2C94C', bg: 'rgba(242,201,76,0.08)' },
  { icon: Mic, label: 'Casting', desc: 'Manage talent', href: '/casting-dashboard', color: '#00BCD4', bg: 'rgba(0,188,212,0.08)' },
]

const initialNotifications: Notification[] = [
  { id: 'n1', title: 'Script Updated', message: 'Neon Shadows Scene 12 was revised', time: '10 min ago', read: false, type: 'info' },
  { id: 'n2', title: 'Budget Alert', message: 'Midnight Drive is at 85% of location budget', time: '3 hrs ago', read: false, type: 'alert' },
  { id: 'n3', title: 'AI Generation Complete', message: 'Pre-visualization for Scene 5 is ready', time: '5 hrs ago', read: true, type: 'success' },
  { id: 'n4', title: 'Team Invitation', message: 'David Kim accepted your project invite', time: '1 day ago', read: true, type: 'info' },
]

/* ─── Animated Counter ─── */
function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = 0
    const end = value
    const duration = 1200
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#131313] border border-[#242424] text-sm text-white shadow-xl animate-in slide-in-from-bottom-2">
      <Check className="w-4 h-4 text-[#27AE60]" />
      {message}
    </div>
  )
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const navigate = useNavigate()
  const [activeProject, setActiveProject] = useState(1)
  const [greeting, setGreeting] = useState('Good day')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState<number | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectType, setNewProjectType] = useState('Feature Film')

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening')
  }, [])

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500) }

  const activeProjects = useMemo(() => projects.filter((p) => p.status === 'active'), [])
  const completedProjects = useMemo(() => projects.filter((p) => p.status === 'completed'), [])
  const totalScenes = useMemo(() => projects.reduce((a, p) => a + p.scenes, 0), [])
  const totalShots = useMemo(() => projects.reduce((a, p) => a + p.shots, 0), [])
  const totalBudget = useMemo(() => projects.reduce((a, p) => a + p.budgetUsed, 0), [])
  const totalBudgetCap = useMemo(() => projects.reduce((a, p) => a + p.budgetTotal, 0), [])

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, total: projects.length, icon: Folder, color: '#D4A853', spark: sparklineData1, trend: '+12%', up: true },
    { label: 'Total Scenes', value: totalScenes, icon: Layers, color: '#2D9CDB', spark: sparklineData2, trend: '+8%', up: true },
    { label: 'Total Shots', value: totalShots, icon: Camera, color: '#27AE60', spark: sparklineData3, trend: '+24%', up: true },
    { label: 'Budget Used', value: totalBudget, prefix: '$', icon: DollarSign, color: '#9B59B6', spark: sparklineData4, trend: `${Math.round((totalBudget / totalBudgetCap) * 100)}%`, up: false },
  ]

  const totalStorage = storageData.reduce((a, s) => a + s.value, 0)

  const markAllRead = () => { setNotifications((n) => n.map((x) => ({ ...x, read: true }))); showToast('All notifications marked as read') }
  const markRead = (id: string) => { setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x)) }
  const deleteNotif = (id: string) => { setNotifications((n) => n.filter((x) => x.id !== id)) }

  const createProject = () => {
    if (!newProjectName.trim()) return
    showToast(`Project "${newProjectName}" created`)
    setNewProjectName('')
    setShowNewProject(false)
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-cinzel text-3xl lg:text-4xl font-bold text-white mb-2">{greeting}, Director</h1>
            <p className="font-inter text-sm text-[#888888]">{activeProjects.length} active productions · {completedProjects.length} completed · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-lg border border-[#242424] hover:border-[#333333] hover:bg-[#131313] transition-all text-[#A3A3A3]"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E74C3C]" />
                )}
              </button>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D0D0D] border border-[#242424] rounded-xl shadow-2xl z-50 overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#242424]">
                      <h3 className="font-space-grotesk text-sm font-semibold text-white">Notifications ({unreadCount})</h3>
                      <button onClick={markAllRead} className="text-xs text-[#D4A853] hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 && (
                        <div className="px-4 py-6 text-center text-xs text-[#6B6B6B]">No notifications</div>
                      )}
                      {notifications.map((n) => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-[#181818] hover:bg-[#131313] transition-colors cursor-pointer ${n.read ? 'opacity-60' : ''}`} onClick={() => markRead(n.id)}>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.type === 'alert' ? 'bg-[#E74C3C]' : n.type === 'success' ? 'bg-[#27AE60]' : 'bg-[#2D9CDB]'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white">{n.title}</p>
                            <p className="text-[11px] text-[#6B6B6B] mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-[#444444] mt-1">{n.time}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id) }} className="p-1 rounded hover:bg-[#242424] text-[#6B6B6B]">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* New Project */}
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-5 py-2.5 rounded-lg font-inter text-sm font-semibold hover:bg-[#E8BF6A] transition-all shadow-[0_0_24px_rgba(212,168,83,0.15)]"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 hover:border-[#333333] transition-all group cursor-pointer" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }} onClick={() => navigate('/screenwriting')}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${s.color}08, transparent 70%)` }} />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <span className="font-inter text-xs text-[#6B6B6B] uppercase tracking-wider">{s.label}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${s.up ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
                  {s.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{s.trend}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="font-cinzel text-3xl font-bold text-white">
                  <AnimatedValue value={s.value} prefix={s.prefix || ''} />
                  {s.total !== undefined && <span className="text-sm font-inter font-normal text-[#6B6B6B] ml-1">/ {s.total}</span>}
                </p>
                <Sparkline data={s.spark} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-6">
            {/* Projects */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#181818]">
                <div>
                  <h2 className="font-space-grotesk text-lg font-semibold text-white">Production Pipeline</h2>
                  <p className="font-inter text-xs text-[#6B6B6B] mt-0.5">Track progress across all active projects</p>
                </div>
                <button onClick={() => { showToast('Projects view opened'); navigate('/screenwriting') }} className="flex items-center gap-1 text-[#D4A853] font-inter text-sm hover:text-[#E8BF6A] transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActiveProject(p.id)}
                    className={`flex items-center gap-4 p-4 mx-2 my-1 rounded-lg border transition-all cursor-pointer ${
                      activeProject === p.id ? 'border-[#D4A853]/30 bg-[rgba(212,168,83,0.04)]' : 'border-transparent hover:bg-[#131313] hover:border-[#242424]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.cover}15` }}>
                      <Folder className="w-6 h-6" style={{ color: p.cover }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-inter text-sm font-semibold text-white truncate">{p.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${
                          p.status === 'active' ? 'bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20' :
                          p.status === 'completed' ? 'bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/20' :
                          'bg-[#2D9CDB]/10 text-[#2D9CDB] border-[#2D9CDB]/20'
                        }`}>{p.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
                        <span>{p.type}</span><span className="w-1 h-1 rounded-full bg-[#333333]" /><span>{p.scenes} scenes</span><span className="w-1 h-1 rounded-full bg-[#333333]" /><span>{p.shots} shots</span><span className="w-1 h-1 rounded-full bg-[#333333]" /><span>{p.updated}</span>
                      </div>
                    </div>
                    <div className="hidden sm:block w-28">
                      <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] text-[#6B6B6B]">Progress</span><span className="text-[10px] font-medium text-white">{p.progress}%</span></div>
                      <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.cover }} /></div>
                    </div>
                    <div className="hidden md:block w-24">
                      <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] text-[#6B6B6B]">Budget</span><span className="text-[10px] font-medium text-white">${(p.budgetUsed / 1000).toFixed(0)}k</span></div>
                      <div className="w-full h-1.5 bg-[#181818] rounded-full overflow-hidden"><div className="h-full bg-[#E74C3C] rounded-full transition-all" style={{ width: `${Math.min((p.budgetUsed / p.budgetTotal) * 100, 100)}%` }} /></div>
                    </div>
                    {/* Project Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjectMenuOpen(projectMenuOpen === p.id ? null : p.id) }}
                        className="p-1.5 rounded hover:bg-[#242424] transition-colors text-[#6B6B6B]"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {projectMenuOpen === p.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setProjectMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-[#131313] border border-[#242424] rounded-lg shadow-xl z-40 overflow-hidden">
                            <button onClick={() => { setProjectMenuOpen(null); navigate('/screenwriting') }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left"><Edit3 className="w-3.5 h-3.5" /> Edit Script</button>
                            <button onClick={() => { setProjectMenuOpen(null); navigate('/shot-list') }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left"><Camera className="w-3.5 h-3.5" /> View Shots</button>
                            <button onClick={() => { setProjectMenuOpen(null); navigate('/storyboarding') }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left"><Image className="w-3.5 h-3.5" /> Storyboard</button>
                            <button onClick={() => { setProjectMenuOpen(null); showToast(`${p.title} exported`) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] text-left"><Download className="w-3.5 h-3.5" /> Export</button>
                            <div className="border-t border-[#242424]" />
                            <button onClick={() => { setProjectMenuOpen(null); showToast(`${p.title} archived`) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#E74C3C] hover:bg-[#E74C3C]/10 text-left"><Trash2 className="w-3.5 h-3.5" /> Archive</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Usage Chart */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,83,0.1)] flex items-center justify-center"><Zap className="w-5 h-5 text-[#D4A853]" /></div>
                  <div>
                    <h2 className="font-space-grotesk text-lg font-semibold text-white">AI Tool Usage</h2>
                    <p className="font-inter text-xs text-[#6B6B6B]">API calls across all features this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#242424] text-xs text-[#A3A3A3]">
                  <Activity className="w-3.5 h-3.5 text-[#27AE60]" />455 total calls
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiUsageData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs><linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4A853" stopOpacity={0.25} /><stop offset="95%" stopColor="#D4A853" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B6B6B', fontSize: 12 }} dy={8} />
                    <Tooltip contentStyle={{ background: '#131313', border: '1px solid #242424', borderRadius: '8px', color: '#F0F0F0', fontSize: '12px' }} itemStyle={{ color: '#D4A853' }} />
                    <Area type="monotone" dataKey="calls" stroke="#D4A853" strokeWidth={2} fill="url(#aiGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h2 className="font-space-grotesk text-lg font-semibold text-white mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className="group flex flex-col items-center gap-2.5 p-4 rounded-lg border border-[#1a1a1a] hover:border-[#333333] bg-[#0a0a0a] transition-all text-center"
                  >
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: action.bg }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="font-inter text-sm font-medium text-white">{action.label}</span>
                    <span className="font-inter text-xs text-[#6B6B6B]">{action.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-space-grotesk text-lg font-semibold text-white">Activity Feed</h2>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20 font-medium">Live</span>
              </div>
              <div className="relative">
                <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[#242424]" />
                <div className="space-y-1">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 relative py-2 pl-1 group cursor-pointer" onClick={() => a.link ? navigate(a.link) : null}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 z-10 border border-[#242424]" style={{ background: a.bg }}>
                        <a.icon className="w-4 h-4" style={{ color: a.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm text-[#CCCCCC] group-hover:text-white transition-colors">{a.action}</p>
                        <p className="font-inter text-xs text-[#6B6B6B] mt-0.5 truncate">{a.detail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#444444]">{a.project}</span><span className="w-0.5 h-0.5 rounded-full bg-[#444444]" /><span className="text-[10px] text-[#444444]">{a.time}</span>
                        </div>
                      </div>
                      {a.link && <ChevronRight className="w-3 h-3 text-[#444444] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-3" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-[rgba(155,89,186,0.1)] flex items-center justify-center"><HardDrive className="w-5 h-5 text-[#9B59B6]" /></div>
                <div>
                  <h2 className="font-space-grotesk text-lg font-semibold text-white">Storage</h2>
                  <p className="font-inter text-xs text-[#6B6B6B]">{totalStorage} MB of 5 GB used</p>
                </div>
              </div>
              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={storageData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                      {storageData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#131313', border: '1px solid #242424', borderRadius: '8px', color: '#F0F0F0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {storageData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-[#A3A3A3]">{s.name}</span>
                    <span className="text-xs text-[#6B6B6B] ml-auto">{s.value} MB</span>
                  </div>
                ))}
              </div>
              <button onClick={() => showToast('Storage usage refreshed')} className="w-full mt-3 py-2 rounded-lg border border-[#242424] text-xs text-[#A3A3A3] hover:text-white hover:border-[#333333] transition-all flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-space-grotesk text-lg font-semibold text-white">Your Team</h2>
                <span className="text-xs text-[#6B6B6B]">6 members</span>
              </div>
              <div className="flex -space-x-2 mb-4">
                {['AR', 'JC', 'SP', 'TB', 'ML', '+2'].map((initial, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-xs font-semibold cursor-pointer hover:scale-110 transition-transform"
                    style={{ background: i === 5 ? '#242424' : ['#D4A85320', '#2D9CDB20', '#27AE6020', '#9B59B620', '#E67E2220'][i], color: i === 5 ? '#A3A3A3' : ['#D4A853', '#2D9CDB', '#27AE60', '#9B59B6', '#E67E22'][i] }}>
                    {initial}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTeamModal(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#242424] hover:border-[#D4A853] hover:text-[#D4A853] transition-all text-xs text-[#A3A3A3]">
                <Users className="w-3.5 h-3.5" /> Manage Team
              </button>
            </div>

            {/* Upgrade CTA */}
            <div className="relative overflow-hidden rounded-xl border border-[#D4A853]/20 p-6" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(212,168,83,0.02))' }}>
              <div className="absolute top-0 right-0 w-40 h-40 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(212,168,83,0.2), transparent 70%)' }} />
              <div className="relative flex items-start gap-3 mb-3">
                <Crown className="w-6 h-6 text-[#D4A853] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-space-grotesk text-sm font-semibold text-[#D4A853] mb-1">Upgrade to Pro</h3>
                  <p className="font-inter text-xs text-[#888888] leading-relaxed">Unlock unlimited AI generations, 4K exports, team collaboration, and priority rendering.</p>
                </div>
              </div>
              <button onClick={() => navigate('/pricing')} className="relative flex items-center gap-1 text-[#D4A853] font-inter text-sm font-medium hover:text-[#E8BF6A] transition-colors">
                View Plans <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Next Deadline */}
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-[#E67E22]" />
                <h2 className="font-space-grotesk text-sm font-semibold text-white">Upcoming Deadline</h2>
              </div>
              <div className="p-3 rounded-lg border border-[#242424] bg-[#131313] cursor-pointer hover:border-[#333333] transition-all" onClick={() => navigate('/scheduling')}>
                <p className="font-inter text-sm font-medium text-white mb-1">Neon Shadows — Pre-Production Wrap</p>
                <p className="font-inter text-xs text-[#6B6B6B]">Due in 12 days · May 14, 2026</p>
                <div className="w-full h-1.5 bg-[#181818] rounded-full mt-3 overflow-hidden"><div className="h-full bg-[#E67E22] rounded-full" style={{ width: '65%' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── New Project Modal ─── */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowNewProject(false)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowNewProject(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424]"><X className="w-5 h-5 text-[#A3A3A3]" /></button>
            <h3 className="font-space-grotesk text-xl font-semibold text-white mb-4 pr-8">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#6B6B6B] uppercase block mb-1.5 font-medium">Project Name</label>
                <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="e.g. Neon Shadows" className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444444] outline-none focus:border-[#D4A853]" />
              </div>
              <div>
                <label className="text-xs text-[#6B6B6B] uppercase block mb-1.5 font-medium">Project Type</label>
                <select value={newProjectType} onChange={(e) => setNewProjectType(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4A853]">
                  <option>Feature Film</option><option>Short Film</option><option>Web Series</option><option>Documentary</option><option>Commercial</option><option>Music Video</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowNewProject(false)} className="px-4 py-2 rounded-lg border border-[#242424] text-xs text-[#A3A3A3] hover:text-white">Cancel</button>
              <button onClick={createProject} disabled={!newProjectName.trim()} className="px-4 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold hover:bg-[#E8BF6A] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Team Modal ─── */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowTeamModal(false)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTeamModal(false)} className="absolute top-3 right-3 p-1 rounded hover:bg-[#242424]"><X className="w-5 h-5 text-[#A3A3A3]" /></button>
            <h3 className="font-space-grotesk text-xl font-semibold text-white mb-4 pr-8 flex items-center gap-2"><Users className="w-5 h-5 text-[#D4A853]" /> Team Management</h3>
            <div className="space-y-2 mb-4">
              {[
                { name: 'Alex Rivera', role: 'Director', initials: 'AR', color: '#D4A853' },
                { name: 'Jordan Chen', role: 'Cinematographer', initials: 'JC', color: '#2D9CDB' },
                { name: 'Sam Patel', role: 'Editor', initials: 'SP', color: '#27AE60' },
                { name: 'Taylor Brooks', role: 'Sound', initials: 'TB', color: '#9B59B6' },
                { name: 'Morgan Lee', role: 'Producer', initials: 'ML', color: '#E67E22' },
                { name: 'Priya Sharma', role: 'VFX', initials: 'PS', color: '#00BCD4' },
              ].map((m) => (
                <div key={m.initials} className="flex items-center gap-3 p-3 rounded-lg bg-[#131313] border border-[#242424] hover:border-[#333333] transition-all">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: `${m.color}20`, color: m.color }}>{m.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-xs text-[#6B6B6B]">{m.role}</p>
                  </div>
                  <button onClick={() => showToast(`Message sent to ${m.name}`)} className="p-1.5 rounded hover:bg-[#242424] text-[#A3A3A3] hover:text-[#D4A853] transition-colors"><MessageSquare className="w-3.5 h-3.5" /></button>
                  <button onClick={() => showToast(`${m.name} removed`)} className="p-1.5 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-[#E74C3C] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('Invite link copied')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/10 transition-all text-sm">
              <UserPlus className="w-4 h-4" /> Invite Team Member
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  )
}
