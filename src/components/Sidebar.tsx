import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, PenTool, Scissors, Camera, LayoutGrid,
  Calendar, PhoneCall, DollarSign, Settings,
  Users, Cpu, ToggleLeft, SlidersHorizontal,
  CreditCard, BarChart3, Search, Building2, Mic,
  Star, LogOut, Shield, HelpCircle,
  Film, Wand2, MapPin, Palette, Music
} from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'
import { useFeatureToggleStore } from '../stores/featureToggleStore'
import type { UserRole } from '../stores/roleStore'

/* ─── Navigation by Role ─── */
const MAIN_NAV: Record<UserRole, { icon: any; label: string; path: string; search?: string }[]> = {
  user: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PenTool, label: 'Screenwriting', path: '/screenwriting' },
    { icon: Scissors, label: 'Script Breakdown', path: '/script-breakdown' },
    { icon: Camera, label: 'Shot List', path: '/shot-list' },
    { icon: LayoutGrid, label: 'Storyboarding', path: '/storyboarding' },
    { icon: Calendar, label: 'Scheduling', path: '/scheduling' },
    { icon: PhoneCall, label: 'Call Sheets', path: '/call-sheets' },
    { icon: DollarSign, label: 'Budgeting', path: '/budgeting' },
  ],
  casting: [
    { icon: LayoutDashboard, label: 'Casting Dashboard', path: '/casting-dashboard' },
    { icon: Users, label: 'Actor Directory', path: '/casting-directory' },
    { icon: Building2, label: 'Agencies', path: '/casting-agencies' },
    { icon: Search, label: 'Auditions', path: '/auditions' },
    { icon: Star, label: 'Shortlists', path: '/shortlists' },
    { icon: Mic, label: 'Voice Samples', path: '/voice-samples' },
  ],
  talent: [
    { icon: Search, label: 'Casting Calls', path: '/auditions', search: '?tab=calls' },
    { icon: Star, label: 'My Submissions', path: '/auditions', search: '?tab=submissions' },
    { icon: Camera, label: 'Portfolio', path: '/auditions', search: '?tab=portfolio' },
  ],
  admin: [
    { icon: Shield, label: 'Admin Dashboard', path: '/admin' },
    { icon: Cpu, label: 'API Manager', path: '/admin/api-manager' },
    { icon: ToggleLeft, label: 'Feature Toggles', path: '/admin/feature-toggles' },
    { icon: SlidersHorizontal, label: 'Feature Models', path: '/admin/feature-models' },
    { icon: CreditCard, label: 'Plans & Pricing', path: '/admin/plans' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  ],
  guest: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ],
}

const AI_NAV = [
  { icon: Film, label: 'Pre-Visualization', path: '/pre-visualization', featureId: 'pre_visualization' },
  { icon: Wand2, label: 'Script Doctor', path: '/script-doctor', featureId: 'script_doctor' },
  { icon: MapPin, label: 'Location Scout', path: '/location-scout', featureId: 'location_scout' },
  { icon: Palette, label: 'AI Lookbook', path: '/lookbook', featureId: 'lookbook' },
  { icon: Mic, label: 'Voice Over', path: '/voice-over', featureId: 'ai_voice_over' },
  { icon: Music, label: 'AI Music', path: '/music-score', featureId: 'ai_music' },
]

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  user: { label: 'Filmmaker', color: '#D4A853' },
  casting: { label: 'Casting Director', color: '#34D399' },
  talent: { label: 'Actor / Talent', color: '#2D9CDB' },
  admin: { label: 'Super Admin', color: '#EF4444' },
  guest: { label: 'Visitor', color: '#6B6B6B' },
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useRoleStore((s) => s.user)
  const isAuthenticated = useRoleStore((s) => s.isAuthenticated)
  const logout = useRoleStore((s) => s.logout)
  const role = (user?.role || 'guest') as UserRole
  const isEnabled = useFeatureToggleStore((s) => s.isEnabled)

  const navItems = isAuthenticated ? (MAIN_NAV[role] || MAIN_NAV.guest) : []
  const aiItems = isAuthenticated ? AI_NAV.filter((item) => isEnabled(item.featureId)) : []
  const roleMeta = ROLE_LABELS[role]

  const isActive = (path: string, search?: string) => {
    if (location.pathname !== path) return false
    if (!search) return true
    const expectedTab = new URLSearchParams(search).get('tab')
    const currentTab = searchParams.get('tab')
    return currentTab === expectedTab || (!currentTab && !expectedTab)
  }

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-[60px] bg-[#0D0D0D] border-r border-[#242424] z-40 overflow-y-auto">
      {/* Role Badge / Sign In Prompt */}
      <div className="p-4 border-b border-[#242424]">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.12)]">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: roleMeta.color }} />
              <span className="font-inter text-sm font-medium text-[#F0F0F0] truncate">{user?.name || roleMeta.label}</span>
            </div>
            <p className="text-[10px] text-[#6B6B6B] font-inter mt-1.5 px-1">
              {role === 'admin' ? 'Manage entire platform' : role === 'casting' ? 'Manage casting & auditions' : role === 'talent' ? 'Find roles & submit auditions' : 'Project Alpha'}
            </p>
          </>
        ) : (
          <div className="px-3 py-2">
            <p className="font-inter text-sm text-[#A3A3A3]">Please sign in to access features</p>
            <button onClick={() => navigate('/login')} className="mt-2 text-xs text-[#D4A853] hover:underline font-inter">
              Go to Sign In →
            </button>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <div className="p-2 flex-1">
        {isAuthenticated && (
          <p className="px-4 py-2 font-inter text-[11px] font-semibold text-[#555] uppercase tracking-widest">
            {role === 'admin' ? 'Admin Panel' : role === 'casting' ? 'Casting' : role === 'talent' ? 'Actor Workspace' : 'Production'}
          </p>
        )}
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path, item.search)
            const to = item.search ? `${item.path}${item.search}` : item.path
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 h-10 rounded-lg transition-all font-inter text-sm ${
                  active
                    ? 'bg-[rgba(212,168,83,0.08)] text-[#D4A853] border-l-[3px] border-[#D4A853]'
                    : 'text-[#A3A3A3] border-l-[3px] border-transparent hover:bg-[#181818] hover:text-[#F0F0F0]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* AI Tools Section */}
        {role === 'user' && aiItems.length > 0 && (
          <>
            <p className="px-4 py-2 mt-4 font-inter text-[11px] font-semibold text-[#555] uppercase tracking-widest">AI Tools</p>
            <div className="space-y-1">
              {aiItems.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 h-10 rounded-lg transition-all font-inter text-sm ${
                      active
                        ? 'bg-[rgba(212,168,83,0.08)] text-[#D4A853] border-l-[3px] border-[#D4A853]'
                        : 'text-[#A3A3A3] border-l-[3px] border-transparent hover:bg-[#181818] hover:text-[#F0F0F0]'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="p-2 border-t border-[#242424]">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 h-10 rounded-lg transition-all font-inter text-sm ${
            isActive('/settings')
              ? 'bg-[rgba(212,168,83,0.08)] text-[#D4A853] border-l-[3px] border-[#D4A853]'
              : 'text-[#A3A3A3] border-l-[3px] border-transparent hover:bg-[#181818] hover:text-[#F0F0F0]'
          }`}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Settings</span>
        </Link>

        {user && (
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-3 px-4 h-10 rounded-lg w-full transition-all font-inter text-sm text-[#A3A3A3] hover:text-red-400 hover:bg-[#181818]"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        )}

        <button className="flex items-center gap-3 px-4 h-10 rounded-lg w-full transition-all font-inter text-sm text-[#A3A3A3] hover:text-[#F0F0F0] hover:bg-[#181818]">
          <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  )
}
