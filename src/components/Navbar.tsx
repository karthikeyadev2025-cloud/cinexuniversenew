import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Film, Menu, X, User, ChevronDown, LogOut } from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'
import type { UserRole } from '../stores/roleStore'

/* ─── Public Landing Nav ─── */
const PUBLIC_NAV = [
  { label: 'Features', path: '/#features' },
  { label: 'Casting', path: '/casting' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'Blog', path: '/blog' },
]

/* ─── In-App Nav by Role ─── */
const APP_NAV: Record<UserRole, { label: string; path: string }[]> = {
  user: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Editor', path: '/screenwriting' },
    { label: 'Breakdown', path: '/script-breakdown' },
    { label: 'Shots', path: '/shot-list' },
    { label: 'Storyboard', path: '/storyboarding' },
    { label: 'Schedule', path: '/scheduling' },
    { label: 'Budget', path: '/budgeting' },
  ],
  casting: [
    { label: 'Dashboard', path: '/casting-dashboard' },
    { label: 'Actors', path: '/casting-directory' },
    { label: 'Agencies', path: '/casting-agencies' },
    { label: 'Auditions', path: '/auditions' },
  ],
  talent: [
    { label: 'Casting Calls', path: '/auditions?tab=calls' },
    { label: 'My Submissions', path: '/auditions?tab=submissions' },
    { label: 'Portfolio', path: '/auditions?tab=portfolio' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'APIs', path: '/admin/api-manager' },
    { label: 'Features', path: '/admin/feature-toggles' },
    { label: 'Models', path: '/admin/feature-models' },
  ],
  guest: PUBLIC_NAV,
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const user = useRoleStore((s) => s.user)
  const isAuthenticated = useRoleStore((s) => s.isAuthenticated)
  const logout = useRoleStore((s) => s.logout)
  const role = (user?.role || 'guest') as UserRole

  const [searchParams] = useSearchParams()

  /* Show public nav on landing page, role-based inside app */
  const isLandingPage = location.pathname === '/' || location.pathname === '/pricing'
  const navLinks = isLandingPage && !user ? PUBLIC_NAV : (APP_NAV[role] || PUBLIC_NAV)

  const isActive = (path: string) => {
    if (path.startsWith('/#')) return location.hash === path.slice(1)
    const [pathname, search] = path.split('?')
    if (location.pathname !== pathname) return false
    if (!search) return true
    const expectedParams = new URLSearchParams(search)
    for (const [key, value] of expectedParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-[60px] z-50 flex items-center justify-between px-6" style={{ background: 'rgba(6,6,6,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(36,36,36,0.5)' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Film className="w-6 h-6 text-[#D4A853]" />
          <span className="font-cinzel text-lg font-bold text-[#F0F0F0] tracking-wide">Cinex Universe</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: isActive(link.path) ? '#D4A853' : '#A3A3A3',
              }}
              onMouseEnter={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = '#F0F0F0' }}
              onMouseLeave={(e) => { if (!isActive(link.path)) e.currentTarget.style.color = '#A3A3A3' }}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4A853]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="hidden lg:block relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 text-[#A3A3A3] hover:text-[#F0F0F0] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#242424] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-inter">{user.name || 'User'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {userOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#0D0D0D] border border-[#242424] rounded-lg shadow-lg overflow-hidden"
                  style={{ animation: 'fadeIn 0.2s ease' }}
                >
                  <div className="px-4 py-2 border-b border-[#242424]">
                    <p className="text-sm text-[#F0F0F0] font-inter">{user.name}</p>
                    <p className="text-xs text-[#6B6B6B] font-inter">{user.email}</p>
                  </div>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-[#A3A3A3] hover:text-[#F0F0F0] hover:bg-[#181818] transition-colors">Settings</Link>
                  <button onClick={() => { logout(); navigate('/'); setUserOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#E74C3C] hover:bg-[#181818] transition-colors flex items-center gap-2">
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden lg:inline-flex btn-primary text-sm px-4 py-2">
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden text-[#F0F0F0]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#060606] flex flex-col items-center justify-center gap-6 lg:hidden" style={{ animation: 'fadeIn 0.3s ease' }}>
          {navLinks.map((link) => (
            <div key={link.path}>
              <Link
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="font-space-grotesk text-2xl font-semibold"
                style={{ color: isActive(link.path) ? '#D4A853' : '#F0F0F0' }}
              >
                {link.label}
              </Link>
            </div>
          ))}
          {user && (
            <button
              onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
              className="text-red-400 font-space-grotesk text-xl"
            >
              Sign Out
            </button>
          )}
            {!user && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="font-space-grotesk text-2xl text-[#D4A853]">Sign In</Link>
              </div>
            )}
          </div>
        )}
    </>
  )
}
