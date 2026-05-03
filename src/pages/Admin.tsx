import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Users, DollarSign, Star, Cpu, SlidersHorizontal, FileText,
  Activity, RefreshCw, Download, ExternalLink, Search, ChevronDown,
  ChevronLeft, ChevronRight, Eye, Edit3, Lock, Unlock, Trash2,
  BarChart3, FolderOpen, TrendingUp, TrendingDown, ArrowUpDown,
  CheckCircle, XCircle, X, Ban, Plus, Briefcase, Camera, MapPin,
  Calendar, Send, Clock, AlertTriangle, History,
  Zap, Target, Award, Mic, Video, Music
} from 'lucide-react'
import {
  LineChart, Line, ResponsiveContainer
} from 'recharts'
import { useApiConfigStore } from '../stores/apiConfigStore'
import { useFeatureToggleStore } from '../stores/featureToggleStore'
import { useCastingStore } from '../stores/castingStore'
import { usePlanStore } from '../stores/planStore'
import type { CastingDirector, TalentProfile } from '../stores/castingStore'

/* ─── Types ─── */
interface User {
  id: string; name: string; email: string; role: 'super_admin' | 'admin' | 'casting_director' | 'editor' | 'user'
  status: 'active' | 'banned' | 'pending'; avatar: string; plan: 'free' | 'pro' | 'enterprise'
  projects: number; spend: number; joined: string; lastActive: string
}
interface Transaction { id: string; user: string; amount: number; status: 'completed' | 'pending' | 'refunded' | 'failed'; date: string; method: string }
interface Project { id: string; title: string; owner: string; status: 'active' | 'archived' | 'draft'; updated: string; scenes: number; budget: number }
interface Log { time: string; level: 'info' | 'warn' | 'error'; source: string; message: string }

/* ─── Mock Data ─── */
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Karthikeya Dev', email: 'karthikeya@cinex.com', role: 'super_admin', status: 'active', avatar: 'KD', plan: 'enterprise', projects: 12, spend: 2499, joined: '2024-01-15', lastActive: '2 min ago' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@email.com', role: 'casting_director', status: 'active', avatar: 'PS', plan: 'pro', projects: 8, spend: 899, joined: '2024-02-20', lastActive: '5 min ago' },
  { id: 'u3', name: 'Ravi Teja', email: 'ravi@email.com', role: 'casting_director', status: 'pending', avatar: 'RT', plan: 'pro', projects: 3, spend: 299, joined: '2024-03-10', lastActive: '1 hour ago' },
  { id: 'u4', name: 'Neha Gupta', email: 'neha@email.com', role: 'user', status: 'active', avatar: 'NG', plan: 'free', projects: 2, spend: 0, joined: '2024-04-05', lastActive: '3 hours ago' },
  { id: 'u5', name: 'Ajay Reddy', email: 'ajay@email.com', role: 'user', status: 'active', avatar: 'AR', plan: 'pro', projects: 6, spend: 599, joined: '2024-03-22', lastActive: '1 day ago' },
  { id: 'u6', name: 'Vikram Rao', email: 'vikram@email.com', role: 'editor', status: 'active', avatar: 'VR', plan: 'enterprise', projects: 15, spend: 3499, joined: '2024-01-20', lastActive: 'Just now' },
]
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', user: 'Karthikeya Dev', amount: 299, status: 'completed', date: '2024-05-01', method: 'Card' },
  { id: 't2', user: 'Priya Sharma', amount: 899, status: 'completed', date: '2024-04-28', method: 'UPI' },
  { id: 't3', user: 'Vikram Rao', amount: 1299, status: 'pending', date: '2024-04-25', method: 'Card' },
]
const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: 'Project Alpha', owner: 'Karthikeya Dev', status: 'active', updated: '2 hours ago', scenes: 24, budget: 50000 },
  { id: 'p2', title: 'Telugu Feature', owner: 'Priya Sharma', status: 'active', updated: '1 day ago', scenes: 45, budget: 120000 },
  { id: 'p3', title: 'Commercial Spot', owner: 'Vikram Rao', status: 'draft', updated: '3 days ago', scenes: 8, budget: 15000 },
]
const MOCK_LOGS: Log[] = [
  { time: '2024-05-01 14:23', level: 'info', source: 'Auth', message: 'Admin login successful' },
  { time: '2024-05-01 14:20', level: 'warn', source: 'API', message: 'Rate limit approaching for Gemini' },
  { time: '2024-05-01 14:15', level: 'error', source: 'Payment', message: 'Failed transaction #t3' },
  { time: '2024-05-01 14:10', level: 'info', source: 'User', message: 'New user registered: Ajay Reddy' },
  { time: '2024-05-01 14:05', level: 'info', source: 'Casting', message: 'Director Ravi Teja approved' },
]

/* ─── Role/Status Config ─── */
const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  admin: { label: 'Admin', color: '#D4A853', bg: 'rgba(212,168,83,0.1)' },
  casting_director: { label: 'Casting', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  editor: { label: 'Editor', color: '#2D9CDB', bg: 'rgba(45,156,219,0.1)' },
  user: { label: 'User', color: '#A3A3A3', bg: 'rgba(163,163,163,0.1)' },
}
const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: '#27AE60' },
  banned: { label: 'Banned', color: '#E74C3C' },
  pending: { label: 'Pending', color: '#E67E22' },
}
const planConfig: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#A3A3A3' },
  pro: { label: 'Pro', color: '#D4A853' },
  enterprise: { label: 'Enterprise', color: '#EF4444' },
}

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} /></LineChart>
      </ResponsiveContainer>
    </div>
  )
}
function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => { let start = 0; const duration = 800; const step = (timestamp: number) => { if (!start) start = timestamp; const progress = Math.min((timestamp - start) / duration, 1); setDisplay(Math.floor(progress * value)); if (progress < 1) requestAnimationFrame(step) }; requestAnimationFrame(step) }, [value])
  return <>{prefix}{display.toLocaleString()}{suffix}</>
}

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-[#131313] border border-[#242424] text-sm text-white shadow-2xl">
      <CheckCircle className="w-4 h-4 text-[#27AE60] shrink-0" />{message}
    </div>
  )
}

/* ─── Sort Hook ─── */
function useSort<T>(items: T[], getVal: (item: T, key: string) => string | number) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const toggleSort = useCallback((key: string) => {
    setSortKey((prev) => { if (prev === key) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); return prev } setSortDir('asc'); return key })
  }, [])
  const sorted = useMemo(() => {
    if (!sortKey) return items
    const dir = sortDir === 'asc' ? 1 : -1
    return [...items].sort((a, b) => { const av = getVal(a, sortKey); const bv = getVal(b, sortKey); if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir; return String(av).localeCompare(String(bv)) * dir })
  }, [items, sortKey, sortDir, getVal])
  return { sorted, sortKey, sortDir, toggleSort }
}

/* ════════════════════════════════════════════
   MAIN ADMIN COMPONENT
   ════════════════════════════════════════════ */
const tabs = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'casting', label: 'Casting', icon: Camera },
  { key: 'projects', label: 'Projects', icon: FolderOpen },
  { key: 'payments', label: 'Payments', icon: DollarSign },
  { key: 'plans', label: 'Plans', icon: Star },
  { key: 'apis', label: 'APIs & AI', icon: Cpu },
  { key: 'features', label: 'Features', icon: SlidersHorizontal },
  { key: 'cms', label: 'CMS Editor', icon: FileText },
  { key: 'system', label: 'System', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Activity },
] as const
type TabKey = (typeof tabs)[number]['key']

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)

  /* Filters */
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectSearch, setProjectSearch] = useState('')
  const [txSearch, setTxSearch] = useState('')
  const [txStatusFilter, setTxStatusFilter] = useState('all')
  const [logsFilter, _setLogsFilter] = useState('all')

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  /* Modals */
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)
  const [apiTestResult, setApiTestResult] = useState<{ id: string; status: 'testing' | 'success' | 'error'; message: string } | null>(null)

  /* Casting State */
  const [castingSubTab, setCastingSubTab] = useState<'overview'|'directors'|'talent'|'media'|'calls'|'submissions'|'activity'>('overview')
  const [viewTalent, setViewTalent] = useState<TalentProfile | null>(null)
  const [viewDirector, setViewDirector] = useState<CastingDirector | null>(null)
  const [castingSearch, setCastingSearch] = useState('')
  const [newCallModal, setNewCallModal] = useState(false)

  /* CMS & Settings */
  const [cmsContent, setCmsContent] = useState({ siteName: 'Cinex Universe', tagline: 'AI-Powered Film Pre-Production Platform', heroTitle: 'Where Stories Come to Life', heroSubtitle: 'The complete AI-powered pre-production suite for filmmakers, casting directors, and production teams.', aboutText: 'Cinex Universe is a next-generation film pre-production platform...', contactEmail: 'support@cinex.com', socialTwitter: '@cinexuniverse', socialInstagram: '@cinexuniverse', seoTitle: 'Cinex Universe - AI Film Pre-Production Platform', seoDescription: 'Complete AI-powered pre-production suite for filmmakers...' })
  const [settings, setSettings] = useState({ publicRegistration: true, emailVerification: true, twoFactorRequired: false, maintenanceMode: false, allowFreeProjects: true, maxProjectsPerUser: 10, maxStoragePerUser: 5, defaultLanguage: 'en', timezone: 'UTC', analyticsEnabled: true, errorReporting: true })

  /* Store Integration */
  const apiStore = useApiConfigStore()
  const featureToggleStore = useFeatureToggleStore()
  const castingStore = useCastingStore()
  const planStore = usePlanStore()
  const providers = apiStore.providers

  /* Toast */
  const showToast = useCallback((msg: string) => { setToastMsg(msg) }, [])
  const clearToast = useCallback(() => setToastMsg(null), [])

  /* User Actions */
  const toggleBan = useCallback((id: string) => {
    setUsers((prev) => { const target = prev.find((u) => u.id === id); const next = prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'banned' as const : 'active' as const } : u)); showToast(`${target?.name || 'User'} ${target?.status === 'active' ? 'banned' : 'unbanned'}`); return next })
  }, [showToast])
  const deleteUser = useCallback((id: string) => {
    const target = users.find((u) => u.id === id)
    setConfirmAction({ title: 'Delete User', message: `Permanently delete ${target?.name || 'this user'}? Cannot be undone.`, onConfirm: () => { setUsers((prev) => prev.filter((u) => u.id !== id)); showToast('User deleted'); setConfirmAction(null) } })
  }, [users, showToast])
  const saveUserEdit = useCallback(() => { if (!editUser) return; setUsers((prev) => prev.map((u) => (u.id === editUser.id ? editUser : u))); showToast(`${editUser.name} updated`); setEditUser(null) }, [editUser, showToast])
  const impersonateUser = useCallback((user: User) => { showToast(`Impersonating ${user.name}...`); setTimeout(() => navigate('/dashboard'), 800) }, [navigate, showToast])

  /* API Actions */
  const testApiConnection = useCallback((providerId: string) => {
    setApiTestResult({ id: providerId, status: 'testing', message: 'Testing...' })
    setTimeout(() => { const success = Math.random() > 0.3; setApiTestResult({ id: providerId, status: success ? 'success' : 'error', message: success ? 'Connected (42ms)' : 'Failed: Invalid key' }); showToast(success ? 'API test passed' : 'API test failed'); setTimeout(() => setApiTestResult(null), 4000) }, 1500)
  }, [showToast])
  const saveApiKey = useCallback((providerId: string, key: string) => { apiStore.setApiKey(providerId, key); showToast('API key saved') }, [apiStore, showToast])

  /* Stats */
  const totalRevenue = transactions.filter((t) => t.status === 'completed').reduce((a, t) => a + t.amount, 0)
  const stats = [
    { label: 'Total Users', value: users.length, change: '+12%', up: true, icon: Users, color: '#2D9CDB', spark: [{ v: 8 }, { v: 12 }, { v: 10 }, { v: 15 }, { v: 18 }, { v: 22 }, { v: 20 }] },
    { label: 'Active Projects', value: MOCK_PROJECTS.filter((p) => p.status === 'active').length, change: '+5%', up: true, icon: FolderOpen, color: '#27AE60', spark: [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 10 }, { v: 9 }, { v: 12 }] },
    { label: 'Revenue', value: totalRevenue, prefix: '$', change: '+18%', up: true, icon: DollarSign, color: '#D4A853', spark: [{ v: 20 }, { v: 22 }, { v: 25 }, { v: 24 }, { v: 28 }, { v: 30 }, { v: 32 }] },
    { label: 'API Calls', value: 842, suffix: 'K', change: '+32%', up: true, icon: Cpu, color: '#9B59B6', spark: [{ v: 40 }, { v: 38 }, { v: 42 }, { v: 45 }, { v: 48 }, { v: 50 }, { v: 55 }] },
  ]

  /* Filtering */
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    if (roleFilter !== 'all') result = result.filter((u) => u.role === roleFilter)
    if (statusFilter !== 'all') result = result.filter((u) => u.status === statusFilter)
    return result
  }, [users, userSearch, roleFilter, statusFilter])
  const userGetVal = useCallback((u: User, key: string) => { switch (key) { case 'name': return u.name; case 'role': return u.role; case 'status': return u.status; case 'projects': return u.projects; case 'joined': return u.joined; case 'spend': return u.spend; default: return u.name } }, [])
  const { sorted: sortedUsers, sortKey, sortDir, toggleSort } = useSort(filteredUsers, userGetVal)
  const paginatedUsers = useMemo(() => { const start = (currentPage - 1) * pageSize; return sortedUsers.slice(start, start + pageSize) }, [sortedUsers, currentPage])
  const totalPages = Math.ceil(sortedUsers.length / pageSize)

  const filteredProjects = useMemo(() => MOCK_PROJECTS.filter((p) => p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.owner.toLowerCase().includes(projectSearch.toLowerCase())), [projectSearch])
  const filteredTransactions = useMemo(() => { let result = transactions.filter((t) => t.user.toLowerCase().includes(txSearch.toLowerCase())); if (txStatusFilter !== 'all') result = result.filter((t) => t.status === txStatusFilter); return result }, [transactions, txSearch, txStatusFilter])
  const filteredLogs = useMemo(() => logsFilter === 'all' ? MOCK_LOGS : MOCK_LOGS.filter((l) => l.level === logsFilter), [logsFilter])

  /* Casting Stats */
  const cStats = castingStore.getStats()
  const allPendingPhotos = castingStore.getPhotosPendingApproval()
  const allPendingVideos = castingStore.talent.flatMap((t) => t.videos.filter((v) => v.status === 'pending').map((v) => ({ talent: t, video: v })))
  const allPendingVoice = castingStore.talent.flatMap((t) => t.voiceRecordings.filter((v) => v.status === 'pending').map((v) => ({ talent: t, voice: v })))
  const totalPendingMedia = allPendingPhotos.length + allPendingVideos.length + allPendingVoice.length

  /* New Call Form */
  const [newCallForm, setNewCallForm] = useState({ title: '', projectName: '', directorId: '', location: '', shootDates: '', deadline: '', compensation: '', description: '', roles: [{ name: '', type: 'lead' as 'lead'|'supporting'|'extra'|'voice', ageRange: '', gender: 'any' as 'male'|'female'|'any', description: '' }] })
  const saveNewCall = useCallback(() => {
    const director = castingStore.directors.find((d) => d.id === newCallForm.directorId)
    if (!director) { showToast('Select a director'); return }
    castingStore.addCastingCall({ title: newCallForm.title, projectName: newCallForm.projectName, directorId: director.id, directorName: director.name, directorAgency: director.agencyName, location: newCallForm.location, shootDates: newCallForm.shootDates, deadline: newCallForm.deadline, compensation: newCallForm.compensation, description: newCallForm.description, status: 'open', roles: newCallForm.roles.filter((r) => r.name).map((r, i) => ({ ...r, id: `nr${i}`, requiredSkills: [], filled: false })) })
    showToast('Casting call created!'); setNewCallModal(false)
    setNewCallForm({ title: '', projectName: '', directorId: '', location: '', shootDates: '', deadline: '', compensation: '', description: '', roles: [{ name: '', type: 'lead', ageRange: '', gender: 'any', description: '' }] })
  }, [castingStore, newCallForm, showToast])

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,83,0.1)] border border-[#D4A853]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#D4A853]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-cinzel text-2xl lg:text-3xl font-bold text-white tracking-wide">Super Admin</h1>
                <span className="px-2 py-0.5 rounded-md bg-[#27AE60]/10 text-[#27AE60] text-[10px] font-bold uppercase tracking-wider border border-[#27AE60]/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-pulse" />Online
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B]">Users · Casting · APIs · Payments · Features · CMS · System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button onClick={() => { showToast('Dashboard refreshed'); setCurrentPage(1) }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] hover:border-[#333333] hover:bg-[#131313] transition-all text-xs text-[#A3A3A3]">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={() => showToast('Report exported')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] hover:border-[#333333] hover:bg-[#131313] transition-all text-xs text-[#A3A3A3]">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold hover:bg-[#E8BF6A] transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> View Site
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="relative overflow-hidden rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 hover:border-[#333333] transition-all group" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${s.color}06, transparent 70%)` }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}><s.icon className="w-4.5 h-4.5" style={{ color: s.color }} /></div>
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${s.up ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>{s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{s.change}</span>
              </div>
              <p className="font-cinzel text-2xl font-bold text-white"><AnimatedValue value={s.value} prefix={s.prefix} suffix={s.suffix} /></p>
              <div className="flex items-center justify-between mt-1"><span className="text-[11px] text-[#6B6B6B]">{s.label}</span><Sparkline data={s.spark} color={s.color} /></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1a1a1a] pb-2 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setCurrentPage(1) }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${activeTab === t.key ? 'bg-[#D4A853] text-[#060606] shadow-[0_0_14px_rgba(212,168,83,0.25)]' : 'text-[#666666] hover:text-[#F0F0F0] hover:bg-[#131313]'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════
           OVERVIEW TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-3">Platform Overview</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Filmmakers', value: users.filter((u) => u.role === 'user').length, icon: Users, color: '#2D9CDB' },
                      { label: 'Casting Directors', value: users.filter((u) => u.role === 'casting_director').length, icon: Briefcase, color: '#34D399' },
                      { label: 'Admins', value: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length, icon: Shield, color: '#EF4444' },
                      { label: 'Editors', value: users.filter((u) => u.role === 'editor').length, icon: Edit3, color: '#9B59B6' },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-lg bg-[#111] border border-[#242424]">
                        <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
                        <p className="font-cinzel text-xl font-bold text-white">{s.value}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-3">Revenue Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Subscription Revenue', value: 3420, pct: 68, color: '#D4A853' },
                      { label: 'API Usage', value: 980, pct: 20, color: '#2D9CDB' },
                      { label: 'One-time Purchases', value: 490, pct: 10, color: '#27AE60' },
                      { label: 'Other', value: 98, pct: 2, color: '#6B6B6B' },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex items-center justify-between mb-1"><span className="text-xs text-[#888]">{r.label}</span><span className="text-xs font-medium text-white">${r.value}</span></div>
                        <div className="w-full h-1 bg-[#181818] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-3">System Status</h3>
                  <div className="space-y-2.5">
                    {[{ name: 'API Gateway', status: 'Operational', color: '#27AE60' }, { name: 'Database', status: 'Operational', color: '#27AE60' }, { name: 'Auth Service', status: 'Operational', color: '#27AE60' }, { name: 'File Storage', status: 'Warning', color: '#E67E22' }, { name: 'Email Service', status: 'Operational', color: '#27AE60' }].map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-[#111]">
                        <span className="text-xs text-[#888]">{s.name}</span>
                        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: s.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-3">Activity Log</h3>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {filteredLogs.slice(0, 6).map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${l.level === 'error' ? 'bg-[#E74C3C]' : l.level === 'warn' ? 'bg-[#E67E22]' : 'bg-[#27AE60]'}`} />
                        <div><p className="text-[11px] text-white">{l.message}</p><p className="text-[10px] text-[#555]">{l.source} · {l.time}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           USERS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold text-white">All Users</h3><p className="text-[11px] text-[#555]">{filteredUsers.length} total · {filteredUsers.filter((u) => u.status === 'active').length} active</p></div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none"><Search className="w-3.5 h-3.5 text-[#555] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search..." value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(1) }} className="bg-[#0D0D0D] border border-[#242424] rounded-lg pl-8 pr-3 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853] w-full sm:w-48" />
                </div>
                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }} className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-2 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853]">
                  <option value="all">All Roles</option><option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="casting_director">Casting</option><option value="editor">Editor</option><option value="user">User</option>
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-2 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853]">
                  <option value="all">All Status</option><option value="active">Active</option><option value="banned">Banned</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead><tr className="border-b border-[#242424] text-left text-[11px] text-[#888] uppercase bg-[#131313]">
                    {[{ k: 'name', l: 'User' }, { k: 'role', l: 'Role' }, { k: 'plan', l: 'Plan' }, { k: 'status', l: 'Status' }, { k: 'projects', l: 'Proj' }, { k: 'spend', l: 'Spend' }, { k: 'joined', l: 'Joined' }].map((c) => (
                      <th key={c.k} className="pb-2.5 pr-3 pl-5 cursor-pointer hover:text-[#eee]" onClick={() => toggleSort(c.k)}><span className="flex items-center gap-0.5">{c.l}{sortKey === c.k ? (sortDir === 'asc' ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />) : <ArrowUpDown className="w-3 h-3 opacity-20" />}</span></th>
                    ))}
                    <th className="pb-2.5 pr-5 text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedUsers.map((u) => {
                      const rc = roleConfig[u.role] || roleConfig.user
                      const sc = statusConfig[u.status] || statusConfig.active
                      const pc = planConfig[u.plan] || planConfig.free
                      return (
                        <tr key={u.id} className="border-b border-[#181818] hover:bg-[#131313] transition-colors">
                          <td className="py-3 pr-3 pl-5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full border border-[#242424] flex items-center justify-center text-[10px] font-bold" style={{ background: rc.bg, color: rc.color }}>{u.avatar}</div><div><p className="font-medium text-[13px] text-white">{u.name}</p><p className="text-[11px] text-[#555]">{u.email}</p></div></div></td>
                          <td className="py-3 pr-3"><span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border" style={{ background: rc.bg, color: rc.color, borderColor: `${rc.color}20` }}>{rc.label}</span></td>
                          <td className="py-3 pr-3"><span className="text-[11px] font-medium" style={{ color: pc.color }}>{pc.label}</span></td>
                          <td className="py-3 pr-3"><span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: sc.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />{sc.label}</span></td>
                          <td className="py-3 pr-3 text-white">{u.projects}</td>
                          <td className="py-3 pr-3 text-white">${u.spend}</td>
                          <td className="py-3 pr-3 text-[11px] text-[#555]">{u.joined}</td>
                          <td className="py-3 pr-5 text-right"><div className="flex items-center justify-end gap-0.5 opacity-70 hover:opacity-100">
                            <button className="p-1.5 rounded hover:bg-[#242424] text-[#888] hover:text-white" onClick={() => setViewUser(u)} title="View"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#242424] text-[#D4A853]" onClick={() => setEditUser(u)} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#242424] text-[#2D9CDB]" onClick={() => impersonateUser(u)} title="Login as"><ExternalLink className="w-3.5 h-3.5" /></button>
                            <button className={`p-1.5 rounded hover:bg-[#242424] ${u.status === 'active' ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`} onClick={() => toggleBan(u.id)} title={u.status === 'active' ? 'Ban' : 'Unban'}>{u.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}</button>
                            <button className="p-1.5 rounded hover:bg-[#242424] text-[#555] hover:text-[#E74C3C]" onClick={() => deleteUser(u.id)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {paginatedUsers.length === 0 && <div className="text-center py-10 text-[#555]"><Users className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No users match.</p></div>}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[#181818]">
                  <span className="text-[11px] text-[#555]">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedUsers.length)} of {sortedUsers.length}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-[#242424] text-[#888] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded text-[11px] font-medium ${p === currentPage ? 'bg-[#D4A853] text-[#060606]' : 'text-[#888] hover:bg-[#242424] hover:text-white'}`}>{p}</button>)}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-[#242424] text-[#888] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           CASTING TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'casting' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {[
                { label: 'Directors', value: cStats.totalDirectors, color: '#D4A853', icon: Briefcase, onClick: () => setCastingSubTab('directors') },
                { label: 'Verified', value: cStats.verifiedDirectors, color: '#27AE60', icon: CheckCircle, onClick: () => setCastingSubTab('directors') },
                { label: 'Talent', value: cStats.totalTalent, color: '#2D9CDB', icon: Users, onClick: () => setCastingSubTab('talent') },
                { label: 'Pending Media', value: totalPendingMedia, color: '#E67E22', icon: Camera, onClick: () => setCastingSubTab('media') },
                { label: 'Open Calls', value: cStats.openCalls, color: '#9B59B6', icon: Target, onClick: () => setCastingSubTab('calls') },
                { label: 'Submissions', value: cStats.totalSubmissions, color: '#E74C3C', icon: Send, onClick: () => setCastingSubTab('submissions') },
                { label: 'Shortlisted', value: castingStore.submissions.filter((s) => s.status === 'shortlisted').length, color: '#D4A853', icon: Star, onClick: () => setCastingSubTab('submissions') },
              ].map((s) => (
                <button key={s.label} onClick={s.onClick} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-3 hover:border-[#333333] text-left transition-all group">
                  <s.icon className="w-4 h-4 mb-1.5" style={{ color: s.color }} />
                  <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-[#555] uppercase">{s.label}</p>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input value={castingSearch} onChange={(e) => setCastingSearch(e.target.value)} placeholder="Search directors, talent, calls..."
                className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-1 border-b border-[#1a1a1a] pb-2 overflow-x-auto scrollbar-none">
              {[
                { k: 'overview', l: 'Overview', icon: BarChart3 },
                { k: 'directors', l: 'Directors', icon: Briefcase },
                { k: 'talent', l: 'Talent', icon: Users },
                { k: 'media', l: 'Media', icon: Camera },
                { k: 'calls', l: 'Calls', icon: Target },
                { k: 'submissions', l: 'Submissions', icon: Send },
                { k: 'activity', l: 'Activity', icon: History },
              ].map((s) => (
                <button key={s.k} onClick={() => setCastingSubTab(s.k as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${castingSubTab === s.k ? 'bg-[#D4A853] text-[#060606]' : 'text-[#666] hover:text-[#eee] hover:bg-[#131313]'}`}>
                  <s.icon className="w-3 h-3" />{s.l}
                </button>
              ))}
            </div>

            {/* ─── OVERVIEW ─── */}
            {castingSubTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#E67E22]" /> Pending Approvals</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[#111] border border-[#242424] text-center">
                        <p className="font-cinzel text-xl font-bold text-[#E67E22]">{castingStore.directors.filter((d) => d.status === 'pending').length}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5">Pending Directors</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#111] border border-[#242424] text-center">
                        <p className="font-cinzel text-xl font-bold text-[#E67E22]">{castingStore.talent.filter((t) => !t.verified).length}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5">Pending Talent</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#111] border border-[#242424] text-center">
                        <p className="font-cinzel text-xl font-bold text-[#E67E22]">{totalPendingMedia}</p>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5">Pending Media</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Source Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Cinex Direct (Self-registered)', value: castingStore.talent.filter((t) => t.addedBy === 'cinex').length, total: cStats.totalTalent, color: '#D4A853' },
                        { label: 'Agency Submitted', value: castingStore.talent.filter((t) => t.addedBy !== 'cinex').length, total: cStats.totalTalent, color: '#2D9CDB' },
                      ].map((r) => (
                        <div key={r.label}>
                          <div className="flex items-center justify-between mb-1"><span className="text-xs text-[#888]">{r.label}</span><span className="text-xs font-medium text-white">{r.value} ({r.total > 0 ? Math.round((r.value / r.total) * 100) : 0}%)</span></div>
                          <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${r.total > 0 ? (r.value / r.total) * 100 : 0}%`, background: r.color }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Top Directors</h3>
                    <div className="space-y-2.5">
                      {castingStore.directors.filter((d) => d.status === 'active').slice(0, 5).map((d) => (
                        <div key={d.id} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#242424] flex items-center justify-center text-[10px] font-bold text-[#D4A853]">{d.name.split(' ').map((n) => n[0]).join('')}</div>
                          <div className="flex-1 min-w-0"><p className="text-[12px] text-white truncate">{d.name}</p><p className="text-[10px] text-[#555] truncate">{d.agencyName}</p></div>
                          <span className="text-[11px] text-[#888]">{d.callCount} calls</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Recent Submissions</h3>
                    <div className="space-y-2.5">
                      {castingStore.submissions.slice(0, 5).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between">
                          <div><p className="text-[12px] text-white">{sub.talentName}</p><p className="text-[10px] text-[#555]">{sub.submittedAt}</p></div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${sub.status === 'selected' ? 'bg-[#27AE60]/10 text-[#27AE60]' : sub.status === 'shortlisted' ? 'bg-[#D4A853]/10 text-[#D4A853]' : 'bg-[#555]/10 text-[#888]'}`}>{sub.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── DIRECTORS ─── */}
            {castingSubTab === 'directors' && (
              <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead><tr className="border-b border-[#242424] text-left text-[11px] text-[#888] uppercase bg-[#131313]">
                      <th className="pb-2.5 pr-3 pl-5">Director</th><th className="pb-2.5 pr-3">Agency</th><th className="pb-2.5 pr-3">Location</th><th className="pb-2.5 pr-3">Status</th><th className="pb-2.5 pr-3">Talent</th><th className="pb-2.5 pr-3">Calls</th><th className="pb-2.5 pr-5 text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                      {castingStore.directors.filter((d) => d.name.toLowerCase().includes(castingSearch.toLowerCase()) || d.agencyName.toLowerCase().includes(castingSearch.toLowerCase())).map((d) => (
                        <tr key={d.id} className="border-b border-[#181818] hover:bg-[#131313] transition-colors">
                          <td className="py-3 pr-3 pl-5"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full border border-[#242424] flex items-center justify-center text-[10px] font-bold" style={{ background: d.verified ? 'rgba(39,174,96,0.1)' : 'rgba(230,126,34,0.1)', color: d.verified ? '#27AE60' : '#E67E22' }}>{d.name.split(' ').map((n) => n[0]).join('')}</div><div><p className="font-medium text-[13px] text-white">{d.name}</p><p className="text-[11px] text-[#555]">{d.email}</p></div></div></td>
                          <td className="py-3 pr-3 text-[12px] text-[#888]">{d.agencyName}</td>
                          <td className="py-3 pr-3 text-[11px] text-[#555]">{d.location}</td>
                          <td className="py-3 pr-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${d.status === 'active' ? 'bg-[#27AE60]/10 text-[#27AE60]' : d.status === 'pending' ? 'bg-[#E67E22]/10 text-[#E67E22]' : d.status === 'suspended' ? 'bg-[#9B59B6]/10 text-[#9B59B6]' : 'bg-[#E74C3C]/10 text-[#E74C3C]'}`}>{d.status}</span></td>
                          <td className="py-3 pr-3 text-white">{castingStore.getTalentByDirector(d.id).length}</td>
                          <td className="py-3 pr-3 text-white">{d.callCount}</td>
                          <td className="py-3 pr-5 text-right"><div className="flex items-center justify-end gap-0.5">
                            <button onClick={() => setViewDirector(d)} className="p-1.5 rounded hover:bg-[#242424] text-[#888] hover:text-white"><Eye className="w-3.5 h-3.5" /></button>
                            {d.status === 'pending' && <><button onClick={() => { castingStore.approveDirector(d.id); showToast(`${d.name} approved`) }} className="p-1.5 rounded hover:bg-[#242424] text-[#27AE60]"><CheckCircle className="w-3.5 h-3.5" /></button><button onClick={() => { castingStore.rejectDirector(d.id); showToast(`${d.name} rejected`) }} className="p-1.5 rounded hover:bg-[#242424] text-[#E74C3C]"><XCircle className="w-3.5 h-3.5" /></button></>}
                            {d.status === 'active' && <button onClick={() => { castingStore.suspendDirector(d.id); showToast(`${d.name} suspended`) }} className="p-1.5 rounded hover:bg-[#242424] text-[#9B59B6]"><Ban className="w-3.5 h-3.5" /></button>}
                            {(d.status === 'rejected' || d.status === 'suspended') && <button onClick={() => { castingStore.approveDirector(d.id); showToast(`${d.name} re-approved`) }} className="p-1.5 rounded hover:bg-[#242424] text-[#27AE60]"><CheckCircle className="w-3.5 h-3.5" /></button>}
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TALENT ─── */}
            {castingSubTab === 'talent' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
                    <span className="px-2 py-0.5 rounded bg-[rgba(39,174,96,0.1)] text-[#27AE60]">{castingStore.talent.filter((t) => t.verified).length} Verified</span>
                    <span className="px-2 py-0.5 rounded bg-[rgba(230,126,34,0.1)] text-[#E67E22]">{castingStore.talent.filter((t) => !t.verified).length} Pending</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {castingStore.talent.filter((t) => t.name.toLowerCase().includes(castingSearch.toLowerCase()) || t.location.toLowerCase().includes(castingSearch.toLowerCase())).map((t) => (
                    <div key={t.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden hover:border-[#333333] transition-all group">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={t.headshotUrl || t.photos[0]?.url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
                        <span className={`absolute top-2 right-2 text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded ${t.verified ? 'bg-[rgba(39,174,96,0.15)] text-[#27AE60]' : 'bg-[rgba(230,126,34,0.15)] text-[#E67E22]'}`}>{t.verified ? 'VERIFIED' : 'PENDING'}</span>
                        <span className={`absolute top-2 left-2 text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded ${t.addedBy === 'cinex' ? 'bg-[rgba(212,168,83,0.15)] text-[#D4A853]' : 'bg-[rgba(45,156,219,0.15)] text-[#2D9CDB]'}`}>{t.addedBy === 'cinex' ? 'CINEX DIRECT' : 'AGENCY'}</span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0]">{t.name}</h4>
                        <p className="font-inter text-[11px] text-[#6B6B6B]">{t.role} · {t.age} yrs · {t.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => setViewTalent(t)} className="flex-1 py-1.5 rounded-lg bg-[#111] border border-[#242424] text-[11px] text-[#888] hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all">View</button>
                          {!t.verified ? (
                            <button onClick={() => { castingStore.updateTalent(t.id, { verified: true }); showToast(`${t.name} verified`) }} className="px-3 py-1.5 rounded-lg bg-[#27AE60] text-white text-[11px] font-semibold hover:bg-[#219a52]">Verify</button>
                          ) : (
                            <button onClick={() => { castingStore.updateTalent(t.id, { verified: false }); showToast(`${t.name} unverified`) }} className="px-3 py-1.5 rounded-lg bg-[#E74C3C] text-white text-[11px] font-semibold hover:bg-[#c0392b]">Revoke</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── MEDIA APPROVALS ─── */}
            {castingSubTab === 'media' && (
              <div className="space-y-6">
                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white flex items-center gap-2"><Camera className="w-4 h-4 text-[#D4A853]" /> Pending Photos ({allPendingPhotos.length})</h3></div>
                  {allPendingPhotos.length === 0 ? <p className="text-[11px] text-[#555] py-4">All photos reviewed.</p> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {allPendingPhotos.map(({ talent, photo }, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-[#242424]">
                          <img src={photo.url} alt={photo.caption} className="w-full h-36 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[11px] text-white truncate">{talent.name}</p>
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => { castingStore.approvePhoto(talent.id, photo.id, 'Cinex Admin'); showToast('Photo approved') }} className="flex-1 py-1 rounded bg-[#27AE60] text-white text-[9px] font-semibold">Approve</button>
                              <button onClick={() => { castingStore.rejectPhoto(talent.id, photo.id, 'Cinex Admin'); showToast('Photo rejected') }} className="flex-1 py-1 rounded bg-[#E74C3C] text-white text-[9px] font-semibold">Reject</button>
                            </div>
                          </div>
                          <span className="absolute top-2 right-2 text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded bg-[#E67E22]/80 text-white">PENDING</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Videos */}
                <div>
                  <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white flex items-center gap-2"><Video className="w-4 h-4 text-[#E74C3C]" /> Pending Videos ({allPendingVideos.length})</h3></div>
                  {allPendingVideos.length === 0 ? <p className="text-[11px] text-[#555] py-4">All videos reviewed.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allPendingVideos.map(({ talent, video }, i) => (
                        <div key={i} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#242424]"><Video className="w-5 h-5 text-[#E74C3C]" /></div>
                          <div className="flex-1 min-w-0"><p className="text-xs text-[#F0F0F0] truncate">{video.caption}</p><p className="text-[10px] text-[#6B6B6B]">{talent.name} · {video.type}</p></div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => { castingStore.approveVideo(talent.id, video.id, 'Cinex Admin'); showToast('Video approved') }} className="px-2 py-1 rounded bg-[#27AE60] text-white text-[9px] font-semibold">Approve</button>
                            <button onClick={() => { castingStore.rejectVideo(talent.id, video.id, 'Cinex Admin'); showToast('Video rejected') }} className="px-2 py-1 rounded bg-[#E74C3C] text-white text-[9px] font-semibold">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Voice */}
                <div>
                  <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white flex items-center gap-2"><Mic className="w-4 h-4 text-[#9B59B6]" /> Pending Voice ({allPendingVoice.length})</h3></div>
                  {allPendingVoice.length === 0 ? <p className="text-[11px] text-[#555] py-4">All voice recordings reviewed.</p> : (
                    <div className="space-y-2">
                      {allPendingVoice.map(({ talent, voice }, i) => (
                        <div key={i} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#242424]"><Music className="w-4 h-4 text-[#9B59B6]" /></div>
                          <div className="flex-1 min-w-0"><p className="text-xs text-[#F0F0F0] truncate">{voice.caption}</p><p className="text-[10px] text-[#6B6B6B]">{talent.name} · {voice.language}</p></div>
                          <div className="flex gap-1">
                            <button onClick={() => { castingStore.approveVoice(talent.id, voice.id, 'Cinex Admin'); showToast('Voice approved') }} className="px-2 py-1 rounded bg-[#27AE60] text-white text-[9px] font-semibold">Approve</button>
                            <button onClick={() => { castingStore.rejectVoice(talent.id, voice.id, 'Cinex Admin'); showToast('Voice rejected') }} className="px-2 py-1 rounded bg-[#E74C3C] text-white text-[9px] font-semibold">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── CALLS ─── */}
            {castingSubTab === 'calls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">All Casting Calls</h3>
                  <button onClick={() => setNewCallModal(true)} className="px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold flex items-center gap-1"><Plus className="w-3 h-3" /> New Call</button>
                </div>
                <div className="space-y-3">
                  {castingStore.castingCalls.filter((c) => c.title.toLowerCase().includes(castingSearch.toLowerCase())).map((call) => (
                    <div key={call.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 hover:border-[#333] transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div><h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0]">{call.title}</h4><p className="font-inter text-[11px] text-[#6B6B6B]">{call.projectName} · {call.directorName}</p></div>
                        <span className={`text-[10px] font-jetbrains-mono px-2 py-0.5 rounded ${call.status === 'open' ? 'bg-[rgba(39,174,96,0.1)] text-[#27AE60] border border-[rgba(39,174,96,0.2)]' : 'bg-[rgba(231,76,60,0.1)] text-[#E74C3C] border border-[rgba(231,76,60,0.2)]'}`}>{call.status.toUpperCase()}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {call.roles.map((r) => <span key={r.id} className={`text-[10px] font-inter px-2 py-0.5 rounded border ${r.filled ? 'bg-[#1a1a1a] text-[#555] border-[#333]' : 'bg-[rgba(212,168,83,0.06)] text-[#D4A853] border-[rgba(212,168,83,0.15)]'}`}>{r.name} {r.filled ? '✓' : r.ageRange}</span>)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6B6B6B]">
                        <span className="flex items-center gap-3"><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{call.location}</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{call.shootDates}</span></span>
                        <span>{call.submissions} submissions · Deadline {call.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SUBMISSIONS ─── */}
            {castingSubTab === 'submissions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {['pending', 'shortlisted', 'selected', 'rejected'].map((st) => (
                    <div key={st} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3 text-center">
                      <p className="font-cinzel text-xl font-bold text-[#F0F0F0]">{castingStore.submissions.filter((s) => s.status === st).length}</p>
                      <p className="font-inter text-[10px] text-[#6B6B6B] capitalize">{st}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {castingStore.submissions.filter((s) => s.talentName.toLowerCase().includes(castingSearch.toLowerCase())).map((sub) => {
                    const call = castingStore.castingCalls.find((c) => c.id === sub.castingCallId)
                    const colors: Record<string, string> = { pending: '#2D9CDB', shortlisted: '#27AE60', rejected: '#E74C3C', selected: '#D4A853' }
                    const StatusIcon = sub.status === 'shortlisted' ? Star : sub.status === 'selected' ? Award : sub.status === 'rejected' ? X : Clock
                    return (
                      <div key={sub.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center"><Send className="w-4 h-4 text-[#D4A853]" /></div><div><p className="font-inter text-sm font-medium text-[#F0F0F0]">{sub.talentName}</p><p className="font-inter text-[11px] text-[#6B6B6B]">{call?.title} · Submitted {sub.submittedAt}</p></div></div>
                          <span className="flex items-center gap-1 text-[10px] font-jetbrains-mono px-2 py-0.5 rounded border" style={{ color: colors[sub.status], borderColor: colors[sub.status]+'30', background: colors[sub.status]+'08' }}><StatusIcon className="w-3 h-3" /> {sub.status.toUpperCase()}</span>
                        </div>
                        <p className="font-inter text-xs text-[#888888] leading-relaxed">{sub.message}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ─── ACTIVITY ─── */}
            {castingSubTab === 'activity' && (
              <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><History className="w-4 h-4 text-[#D4A853]" /> Admin Activity Log</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[
                    { time: 'Just now', action: 'Verified actor profile', target: 'Neha Gupta', admin: 'Cinex Admin', type: 'verify' },
                    { time: '5 min ago', action: 'Approved director', target: 'Ravi Teja', admin: 'Cinex Admin', type: 'approve' },
                    { time: '15 min ago', action: 'Rejected photo upload', target: 'Ajay Reddy', admin: 'Cinex Admin', type: 'reject' },
                    { time: '1 hour ago', action: 'Created casting call', target: 'Epic Feature 2025', admin: 'Cinex Admin', type: 'create' },
                    { time: '2 hours ago', action: 'Suspended director', target: 'Old Agency', admin: 'Cinex Admin', type: 'suspend' },
                    { time: '3 hours ago', action: 'Updated platform settings', target: 'Feature Toggles', admin: 'Cinex Admin', type: 'update' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#111] border border-[#242424]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === 'verify' || log.type === 'approve' ? 'bg-[rgba(39,174,96,0.1)]' : log.type === 'reject' || log.type === 'suspend' ? 'bg-[rgba(231,76,60,0.1)]' : 'bg-[rgba(212,168,83,0.1)]'}`}>
                        {log.type === 'verify' || log.type === 'approve' ? <CheckCircle className="w-4 h-4 text-[#27AE60]" /> : log.type === 'reject' ? <X className="w-4 h-4 text-[#E74C3C]" /> : log.type === 'suspend' ? <Ban className="w-4 h-4 text-[#E74C3C]" /> : <Zap className="w-4 h-4 text-[#D4A853]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#F0F0F0]"><span className="font-semibold">{log.admin}</span> {log.action} <span className="text-[#D4A853]">{log.target}</span></p>
                        <p className="text-[10px] text-[#555] mt-0.5">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════
           PROJECTS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'projects' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold text-white">All Projects</h3><p className="text-[11px] text-[#555]">{filteredProjects.length} total</p></div>
              <div className="relative flex-1 sm:flex-none"><Search className="w-3.5 h-3.5 text-[#555] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search projects..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} className="bg-[#0D0D0D] border border-[#242424] rounded-lg pl-8 pr-3 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853] w-full sm:w-48" />
              </div>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]"><thead><tr className="border-b border-[#242424] text-left text-[11px] text-[#888] uppercase bg-[#131313]"><th className="pb-2.5 pr-3 pl-5">Project</th><th className="pb-2.5 pr-3">Owner</th><th className="pb-2.5 pr-3">Status</th><th className="pb-2.5 pr-3">Scenes</th><th className="pb-2.5 pr-3">Budget</th><th className="pb-2.5 pr-3">Updated</th><th className="pb-2.5 pr-5 text-right">Actions</th></tr></thead>
                  <tbody>{filteredProjects.map((p) => (<tr key={p.id} className="border-b border-[#181818] hover:bg-[#131313] transition-colors"><td className="py-3 pr-3 pl-5"><p className="font-medium text-[13px] text-white">{p.title}</p></td><td className="py-3 pr-3 text-[11px] text-[#888]">{p.owner}</td><td className="py-3 pr-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${p.status === 'active' ? 'bg-[#27AE60]/10 text-[#27AE60]' : p.status === 'draft' ? 'bg-[#E67E22]/10 text-[#E67E22]' : 'bg-[#555]/10 text-[#888]'}`}>{p.status}</span></td><td className="py-3 pr-3 text-white">{p.scenes}</td><td className="py-3 pr-3 text-white">${p.budget.toLocaleString()}</td><td className="py-3 pr-3 text-[11px] text-[#555]">{p.updated}</td><td className="py-3 pr-5 text-right"><div className="flex items-center justify-end gap-0.5 opacity-70 hover:opacity-100"><button className="p-1.5 rounded hover:bg-[#242424] text-[#888] hover:text-white"><Eye className="w-3.5 h-3.5" /></button><button className="p-1.5 rounded hover:bg-[#242424] text-[#D4A853]"><Edit3 className="w-3.5 h-3.5" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           PAYMENTS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div><h3 className="text-sm font-semibold text-white">Transactions</h3><p className="text-[11px] text-[#555]">{filteredTransactions.length} total · ${totalRevenue} revenue</p></div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none"><Search className="w-3.5 h-3.5 text-[#555] absolute left-2.5 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search..." value={txSearch} onChange={(e) => setTxSearch(e.target.value)} className="bg-[#0D0D0D] border border-[#242424] rounded-lg pl-8 pr-3 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853] w-full sm:w-48" /></div>
                <select value={txStatusFilter} onChange={(e) => setTxStatusFilter(e.target.value)} className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-2 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853]"><option value="all">All</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="refunded">Refunded</option><option value="failed">Failed</option></select>
              </div>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]"><thead><tr className="border-b border-[#242424] text-left text-[11px] text-[#888] uppercase bg-[#131313]"><th className="pb-2.5 pr-3 pl-5">ID</th><th className="pb-2.5 pr-3">User</th><th className="pb-2.5 pr-3">Amount</th><th className="pb-2.5 pr-3">Status</th><th className="pb-2.5 pr-3">Method</th><th className="pb-2.5 pr-3">Date</th><th className="pb-2.5 pr-5 text-right">Actions</th></tr></thead>
                  <tbody>{filteredTransactions.map((t) => (<tr key={t.id} className="border-b border-[#181818] hover:bg-[#131313] transition-colors"><td className="py-3 pr-3 pl-5 text-[11px] text-[#888] font-mono">{t.id}</td><td className="py-3 pr-3 text-[13px] text-white">{t.user}</td><td className="py-3 pr-3 text-[13px] text-white">${t.amount}</td><td className="py-3 pr-3"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${t.status === 'completed' ? 'bg-[#27AE60]/10 text-[#27AE60]' : t.status === 'pending' ? 'bg-[#E67E22]/10 text-[#E67E22]' : t.status === 'refunded' ? 'bg-[#555]/10 text-[#888]' : 'bg-[#E74C3C]/10 text-[#E74C3C]'}`}>{t.status}</span></td><td className="py-3 pr-3 text-[11px] text-[#888]">{t.method}</td><td className="py-3 pr-3 text-[11px] text-[#555]">{t.date}</td><td className="py-3 pr-5 text-right">{t.status === 'completed' && <button onClick={() => { setTransactions((prev) => prev.map((tr) => (tr.id === t.id ? { ...tr, status: 'refunded' } : tr))); showToast('Transaction refunded') }} className="text-[11px] text-[#E74C3C] hover:underline">Refund</button>}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           PLANS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'plans' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Pricing Plans</h3><button onClick={() => { planStore.updatePlan('short_film', { name: 'New Plan', description: 'Description here', monthlyPrice: 99, features: [] }); showToast('Plan added') }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold hover:bg-[#E8BF6A]"><Plus className="w-3.5 h-3.5" /> Add Plan</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(planStore.plans).map((plan) => (
                <div key={plan.id} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 hover:border-[#333333] transition-all">
                  <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold text-white">{plan.name}</h4><span className="text-lg font-bold text-[#D4A853]">${plan.monthlyPrice}</span></div>
                  <p className="text-xs text-[#6B6B6B] mb-3">{plan.description}</p>
                  <div className="space-y-1.5 mb-4">{plan.features.map((f, i) => (<div key={i} className="flex items-center gap-2 text-xs"><span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] bg-[#27AE60]/20 text-[#27AE60]">✓</span><span className="text-white">{f}</span></div>))}</div>
                  <div className="flex gap-2"><button className="flex-1 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313]">Edit</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           APIs TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'apis' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">AI API Configuration</h3></div>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#131313] border border-[#242424] flex items-center justify-center text-lg"><Cpu className="w-5 h-5 text-[#D4A853]" /></div><div><h4 className="text-sm font-semibold text-white">{provider.name}</h4><p className="text-[11px] text-[#555]">{provider.category}</p></div></div>
                    <div className="flex items-center gap-2"><button onClick={() => apiStore.toggleProvider(provider.id)} className={`relative w-11 h-6 rounded-full transition-colors ${provider.isEnabled ? 'bg-[#D4A853]' : 'bg-[#242424]'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${provider.isEnabled ? 'translate-x-5' : ''}`} /></button></div>
                  </div>
                  <div className="flex items-center gap-2"><input type={provider.apiKey ? 'password' : 'text'} defaultValue={provider.apiKey || ''} placeholder={`Enter ${provider.name} API key...`} onBlur={(e) => saveApiKey(provider.id, e.target.value)} className="flex-1 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-[#eee] focus:outline-none focus:border-[#D4A853]" /><button onClick={() => testApiConnection(provider.id)} className="px-3 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313] transition-all whitespace-nowrap">{apiTestResult?.id === provider.id ? (apiTestResult.status === 'testing' ? 'Testing...' : apiTestResult.message) : 'Test'}</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           FEATURES TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'features' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Feature Toggles</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {featureToggleStore.features.map((feature) => (
                <div key={feature.id} className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 flex items-start justify-between hover:border-[#333333] transition-all">
                  <div><h4 className="text-xs font-semibold text-white">{feature.name}</h4><p className="text-[10px] text-[#555] mt-0.5">{feature.description}</p><span className="text-[9px] text-[#555] mt-1 inline-block px-1.5 py-0.5 rounded bg-[#181818]">{feature.category}</span></div>
                  <button onClick={() => { featureToggleStore.toggle(feature.id); showToast(`${feature.name} ${featureToggleStore.getFeature(feature.id)?.enabled ? 'enabled' : 'disabled'}`) }} className={`relative w-11 h-6 rounded-full transition-colors ${feature.enabled ? 'bg-[#D4A853]' : 'bg-[#242424]'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${feature.enabled ? 'translate-x-5' : ''}`} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           CMS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'cms' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">CMS Editor</h3><button onClick={() => showToast('CMS content saved')} className="px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold">Save Changes</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5"><h4 className="text-xs font-semibold text-white mb-3">Site Identity</h4><div className="space-y-3"><label className="block text-[11px] text-[#888]">Site Name<input value={cmsContent.siteName} onChange={(e) => setCmsContent({ ...cmsContent, siteName: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label><label className="block text-[11px] text-[#888]">Tagline<input value={cmsContent.tagline} onChange={(e) => setCmsContent({ ...cmsContent, tagline: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label></div></div>
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5"><h4 className="text-xs font-semibold text-white mb-3">Hero Section</h4><div className="space-y-3"><label className="block text-[11px] text-[#888]">Title<input value={cmsContent.heroTitle} onChange={(e) => setCmsContent({ ...cmsContent, heroTitle: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label><label className="block text-[11px] text-[#888]">Subtitle<textarea value={cmsContent.heroSubtitle} onChange={(e) => setCmsContent({ ...cmsContent, heroSubtitle: e.target.value })} rows={3} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853] resize-none" /></label></div></div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5"><h4 className="text-xs font-semibold text-white mb-3">Contact & Social</h4><div className="space-y-3"><label className="block text-[11px] text-[#888]">Contact Email<input value={cmsContent.contactEmail} onChange={(e) => setCmsContent({ ...cmsContent, contactEmail: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label><label className="block text-[11px] text-[#888]">Twitter<input value={cmsContent.socialTwitter} onChange={(e) => setCmsContent({ ...cmsContent, socialTwitter: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label></div></div>
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5"><h4 className="text-xs font-semibold text-white mb-3">SEO</h4><div className="space-y-3"><label className="block text-[11px] text-[#888]">Meta Title<input value={cmsContent.seoTitle} onChange={(e) => setCmsContent({ ...cmsContent, seoTitle: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853]" /></label><label className="block text-[11px] text-[#888]">Meta Description<textarea value={cmsContent.seoDescription} onChange={(e) => setCmsContent({ ...cmsContent, seoDescription: e.target.value })} rows={3} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A853] resize-none" /></label></div></div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           SYSTEM TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <h3 className="text-sm font-semibold text-white mb-4">System Settings</h3>
                <div className="space-y-4">
                  {[
                    { key: 'publicRegistration', label: 'Public Registration', desc: 'Allow new users to sign up' },
                    { key: 'emailVerification', label: 'Email Verification', desc: 'Require email verification' },
                    { key: 'twoFactorRequired', label: 'Two-Factor Auth', desc: 'Require 2FA for admin access' },
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to visitors' },
                    { key: 'allowFreeProjects', label: 'Free Projects', desc: 'Allow free tier users to create projects' },
                    { key: 'analyticsEnabled', label: 'Analytics', desc: 'Collect usage analytics' },
                    { key: 'errorReporting', label: 'Error Reporting', desc: 'Send errors to monitoring' },
                  ].map((s) => (
                    <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-[#111] border border-[#242424]">
                      <div><p className="text-xs text-white">{s.label}</p><p className="text-[10px] text-[#555]">{s.desc}</p></div>
                      <button onClick={() => setSettings((prev) => ({ ...prev, [s.key]: !prev[s.key as keyof typeof prev] }))} className={`relative w-11 h-6 rounded-full transition-colors ${settings[s.key as keyof typeof settings] ? 'bg-[#D4A853]' : 'bg-[#242424]'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings[s.key as keyof typeof settings] ? 'translate-x-5' : ''}`} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-4">Resource Limits</h3>
                  <div className="space-y-4">
                    <div><label className="text-[11px] text-[#888] block mb-1">Max Projects Per User</label><input type="number" value={settings.maxProjectsPerUser} onChange={(e) => setSettings({ ...settings, maxProjectsPerUser: Number(e.target.value) })} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white" /></div>
                    <div><label className="text-[11px] text-[#888] block mb-1">Max Storage (GB)</label><input type="number" value={settings.maxStoragePerUser} onChange={(e) => setSettings({ ...settings, maxStoragePerUser: Number(e.target.value) })} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white" /></div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <h3 className="text-sm font-semibold text-white mb-4">Danger Zone</h3>
                  <div className="space-y-3">
                    <button onClick={() => setConfirmAction({ title: 'Clear Cache', message: 'Clear all application caches?', onConfirm: () => { showToast('Cache cleared'); setConfirmAction(null) } })} className="w-full py-2.5 rounded-lg border border-[#E67E22]/30 text-[#E67E22] text-xs font-medium hover:bg-[#E67E22]/10 transition-colors">Clear Application Cache</button>
                    <button onClick={() => setConfirmAction({ title: 'Reset Demo Data', message: 'Reset all demo data to defaults?', onConfirm: () => { showToast('Demo data reset'); setConfirmAction(null) } })} className="w-full py-2.5 rounded-lg border border-[#E74C3C]/30 text-[#E74C3C] text-xs font-medium hover:bg-[#E74C3C]/10 transition-colors">Reset Demo Data</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           SETTINGS TAB
           ════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Platform Settings</h3>
              <div className="space-y-4 max-w-lg">
                <div><label className="text-[11px] text-[#888] block mb-1">Default Language</label><select value={settings.defaultLanguage} onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white"><option value="en">English</option><option value="te">Telugu</option><option value="hi">Hindi</option></select></div>
                <div><label className="text-[11px] text-[#888] block mb-1">Timezone</label><select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white"><option value="UTC">UTC</option><option value="Asia/Kolkata">Asia/Kolkata (IST)</option></select></div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
           MODALS
           ════════════════════════════════════════════ */}

        {/* View User */}
        {viewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewUser(null)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-white">User Details</h3><button onClick={() => setViewUser(null)} className="p-1 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button></div>
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full border border-[#242424] flex items-center justify-center text-sm font-bold" style={{ background: (roleConfig[viewUser.role] || roleConfig.user).bg, color: (roleConfig[viewUser.role] || roleConfig.user).color }}>{viewUser.avatar}</div><div><p className="text-base font-medium text-white">{viewUser.name}</p><p className="text-xs text-[#555]">{viewUser.email}</p></div></div>
              <div className="space-y-1.5 mb-4 text-[13px]">
                <div className="flex justify-between"><span className="text-[#555]">Role</span><span className="text-white">{(roleConfig[viewUser.role] || roleConfig.user).label}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Status</span><span className="text-white">{(statusConfig[viewUser.status] || statusConfig.active).label}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Plan</span><span className="text-white">{(planConfig[viewUser.plan] || planConfig.free).label}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Projects</span><span className="text-white">{viewUser.projects}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Spend</span><span className="text-white">${viewUser.spend}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Joined</span><span className="text-white">{viewUser.joined}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Last Active</span><span className="text-white">{viewUser.lastActive}</span></div>
              </div>
              <div className="flex gap-2"><button onClick={() => setViewUser(null)} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313]">Close</button><button onClick={() => { impersonateUser(viewUser); setViewUser(null) }} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold">Impersonate</button></div>
            </div>
          </div>
        )}

        {/* Edit User */}
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setEditUser(null)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-white">Edit User</h3><button onClick={() => setEditUser(null)} className="p-1 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button></div>
              <div className="space-y-3"><label className="block text-[11px] text-[#888]">Name<input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white" /></label><label className="block text-[11px] text-[#888]">Email<input value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white" /></label>
                <div className="grid grid-cols-2 gap-2"><label className="block text-[11px] text-[#888]">Role<select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value as User['role'] })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white"><option value="user">User</option><option value="casting_director">Casting Director</option><option value="editor">Editor</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></label><label className="block text-[11px] text-[#888]">Plan<select value={editUser.plan} onChange={(e) => setEditUser({ ...editUser, plan: e.target.value as User['plan'] })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white"><option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label></div>
                <label className="block text-[11px] text-[#888]">Status<select value={editUser.status} onChange={(e) => setEditUser({ ...editUser, status: e.target.value as User['status'] })} className="mt-1 w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-xs text-white"><option value="active">Active</option><option value="banned">Banned</option><option value="pending">Pending</option></select></label>
              </div>
              <div className="flex gap-2 mt-4"><button onClick={() => setEditUser(null)} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313]">Cancel</button><button onClick={saveUserEdit} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-semibold">Save</button></div>
            </div>
          </div>
        )}

        {/* View Director */}
        {viewDirector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewDirector(null)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-white">Casting Director</h3><button onClick={() => setViewDirector(null)} className="p-1 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button></div>
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full border border-[#242424] flex items-center justify-center text-sm font-bold" style={{ background: viewDirector.verified ? 'rgba(39,174,96,0.1)' : 'rgba(230,126,34,0.1)', color: viewDirector.verified ? '#27AE60' : '#E67E22' }}>{viewDirector.name.split(' ').map((n) => n[0]).join('')}</div><div><p className="text-base font-medium text-white">{viewDirector.name}</p><p className="text-xs text-[#555]">{viewDirector.email}</p></div></div>
              <div className="space-y-1.5 mb-4 text-[13px]">
                <div className="flex justify-between"><span className="text-[#555]">Agency</span><span className="text-white">{viewDirector.agencyName}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Location</span><span className="text-white">{viewDirector.location}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Phone</span><span className="text-white">{viewDirector.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Status</span><span className={`font-medium ${viewDirector.status === 'active' ? 'text-[#27AE60]' : viewDirector.status === 'pending' ? 'text-[#E67E22]' : 'text-[#E74C3C]'}`}>{viewDirector.status}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Verified</span><span className="text-white">{viewDirector.verified ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Talent Submitted</span><span className="text-white">{castingStore.getTalentByDirector(viewDirector.id).length}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Calls Created</span><span className="text-white">{viewDirector.callCount}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Joined</span><span className="text-white">{viewDirector.joinedAt}</span></div>
              </div>
              <div className="flex gap-2">
                {viewDirector.status === 'pending' && (<><button onClick={() => { castingStore.approveDirector(viewDirector.id); showToast('Approved'); setViewDirector(null) }} className="flex-1 py-2 rounded-lg bg-[#27AE60] text-white text-[11px] font-semibold">Approve</button><button onClick={() => { castingStore.rejectDirector(viewDirector.id); showToast('Rejected'); setViewDirector(null) }} className="flex-1 py-2 rounded-lg bg-[#E74C3C] text-white text-[11px] font-semibold">Reject</button></>)}
                {viewDirector.status === 'active' && (<button onClick={() => { castingStore.suspendDirector(viewDirector.id); showToast('Suspended'); setViewDirector(null) }} className="w-full py-2 rounded-lg bg-[#E74C3C] text-white text-[11px] font-semibold">Revoke</button>)}
                {(viewDirector.status === 'rejected' || viewDirector.status === 'suspended') && (<button onClick={() => { castingStore.approveDirector(viewDirector.id); showToast('Re-approved'); setViewDirector(null) }} className="w-full py-2 rounded-lg bg-[#27AE60] text-white text-[11px] font-semibold">Re-approve</button>)}
              </div>
            </div>
          </div>
        )}

        {/* View Talent */}
        {viewTalent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewTalent(null)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="text-base font-semibold text-white">Talent Profile</h3><button onClick={() => setViewTalent(null)} className="p-1 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button></div>
              <div className="flex items-center gap-3 mb-4"><img src={viewTalent.headshotUrl || viewTalent.photos[0]?.url} alt={viewTalent.name} className="w-14 h-14 rounded-xl object-cover border border-[#242424]" /><div><p className="text-base font-medium text-white">{viewTalent.name}</p><p className="text-xs text-[#555]">{viewTalent.role} · {viewTalent.location}</p></div></div>
              <div className="space-y-1.5 mb-4 text-[13px]">
                <div className="flex justify-between"><span className="text-[#555]">Age</span><span className="text-white">{viewTalent.age || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Height</span><span className="text-white">{viewTalent.height || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Weight</span><span className="text-white">{viewTalent.weight || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Experience</span><span className="text-white">{viewTalent.experience || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Languages</span><span className="text-white">{viewTalent.languages?.join(', ') || '—'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Status</span><span className={`font-medium ${viewTalent.status === 'available' ? 'text-[#27AE60]' : viewTalent.status === 'booked' ? 'text-[#E67E22]' : 'text-[#E74C3C]'}`}>{viewTalent.status}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Verified</span><span className="text-white">{viewTalent.verified ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">Source</span><span className="text-[#D4A853]">{viewTalent.addedBy === 'cinex' ? 'Cinex Direct' : viewTalent.addedByName}</span></div>
              </div>
              <div className="flex gap-2">
                {!viewTalent.verified ? (
                  <button onClick={() => { castingStore.updateTalent(viewTalent.id, { verified: true }); showToast(`${viewTalent.name} verified`); setViewTalent(null) }} className="flex-1 py-2 rounded-lg bg-[#27AE60] text-white text-xs font-semibold">Verify</button>
                ) : (
                  <button onClick={() => { castingStore.updateTalent(viewTalent.id, { verified: false }); showToast(`${viewTalent.name} unverified`); setViewTalent(null) }} className="flex-1 py-2 rounded-lg bg-[#E74C3C] text-white text-xs font-semibold">Revoke</button>
                )}
                <button onClick={() => setViewTalent(null)} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313]">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* New Call Modal */}
        {newCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setNewCallModal(false)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0]">Create Casting Call</h3><button onClick={() => setNewCallModal(false)} className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853]"><X className="w-3.5 h-3.5 text-[#6B6B6B]" /></button></div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2"><input value={newCallForm.title} onChange={(e) => setNewCallForm({ ...newCallForm, title: e.target.value })} placeholder="Call Title *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /><input value={newCallForm.projectName} onChange={(e) => setNewCallForm({ ...newCallForm, projectName: e.target.value })} placeholder="Project Name *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <select value={newCallForm.directorId} onChange={(e) => setNewCallForm({ ...newCallForm, directorId: e.target.value })} className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0]"><option value="">Select director...</option>{castingStore.directors.filter((d) => d.status === 'active').map((d) => <option key={d.id} value={d.id}>{d.name} ({d.agencyName})</option>)}</select>
                <div className="grid grid-cols-2 gap-2"><input value={newCallForm.location} onChange={(e) => setNewCallForm({ ...newCallForm, location: e.target.value })} placeholder="Location" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /><input value={newCallForm.compensation} onChange={(e) => setNewCallForm({ ...newCallForm, compensation: e.target.value })} placeholder="Compensation" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <div className="grid grid-cols-2 gap-2"><input value={newCallForm.shootDates} onChange={(e) => setNewCallForm({ ...newCallForm, shootDates: e.target.value })} placeholder="Shoot Dates" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /><input value={newCallForm.deadline} onChange={(e) => setNewCallForm({ ...newCallForm, deadline: e.target.value })} placeholder="Deadline" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <textarea rows={3} value={newCallForm.description} onChange={(e) => setNewCallForm({ ...newCallForm, description: e.target.value })} placeholder="Description..." className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] resize-none" />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <button onClick={() => setNewCallModal(false)} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs font-inter text-[#888] hover:bg-[#111]">Cancel</button>
                <button onClick={saveNewCall} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-inter font-semibold hover:bg-[#E8BF6A]">Create Call</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Action */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setConfirmAction(null)}>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-6 h-6 text-[#E74C3C]" /><h3 className="text-base font-semibold text-white">{confirmAction.title}</h3></div>
              <p className="text-sm text-[#888] mb-6">{confirmAction.message}</p>
              <div className="flex gap-2"><button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs text-[#888] hover:text-white hover:bg-[#131313]">Cancel</button><button onClick={confirmAction.onConfirm} className="flex-1 py-2 rounded-lg bg-[#E74C3C] text-white text-xs font-semibold hover:bg-[#c0392b]">Confirm</button></div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && <Toast message={toastMsg} onClose={clearToast} />}

      </div>
    </div>
  )
}
