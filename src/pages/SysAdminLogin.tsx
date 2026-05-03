import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertTriangle, Lock, KeyRound, History, Fingerprint } from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'

/* ─── Security State (in-memory, resets on refresh) ─── */
interface LoginAttempt {
  email: string
  time: number
  success: boolean
  ip: string
}

const SECURITY = {
  attempts: [] as LoginAttempt[],
  lockoutUntil: 0,
  maxAttempts: 5,
  lockoutDuration: 5 * 60 * 1000, // 5 minutes
}

function getClientIP() { return 'client-' + Math.random().toString(36).slice(2, 8) }

function isLockedOut() { return Date.now() < SECURITY.lockoutUntil }
function getRemainingLockout() { return Math.ceil((SECURITY.lockoutUntil - Date.now()) / 1000) }
function recordAttempt(email: string, success: boolean) {
  SECURITY.attempts.push({ email, time: Date.now(), success, ip: getClientIP() })
  const recentFails = SECURITY.attempts.filter((a) => !a.success && Date.now() - a.time < 15 * 60 * 1000).length
  if (recentFails >= SECURITY.maxAttempts) {
    SECURITY.lockoutUntil = Date.now() + SECURITY.lockoutDuration
  }
}
function getRecentAttempts() {
  return SECURITY.attempts.filter((a) => Date.now() - a.time < 15 * 60 * 1000)
}

export default function SysAdminLogin() {
  const navigate = useNavigate()
  const login = useRoleStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const SECRET_KEY = 'cinex-admin-2025'

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLockedOut()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setError(`Account locked. Try again in ${getRemainingLockout()} seconds.`)
      return
    }

    if (!email || !password || !secretKey) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setError('All fields are required.')
      return
    }

    if (secretKey !== SECRET_KEY) {
      recordAttempt(email, false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setError('Invalid secret key. Access denied.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))

    const result = await login(email, password)
    if (!result.success) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setLoading(false)
      return
    }
    recordAttempt(email, true)
    setLoading(false)
    navigate('/admin')
  }, [email, password, secretKey, login, navigate])

  const recentFailCount = getRecentAttempts().filter((a) => !a.success).length
  const lockoutActive = isLockedOut()

  return (
    <div className="min-h-[100dvh] bg-[#060606] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className={`w-full max-w-md relative z-10 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        {/* Card */}
        <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl p-8 shadow-2xl" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.08)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#D4A853]" />
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-[#F0F0F0]">Super Admin</h1>
            <p className="font-inter text-xs text-[#6B6B6B] mt-1">Restricted access. Authorized personnel only.</p>
          </div>

          {/* Security Status */}
          <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-[#111] border border-[#242424]">
            <Fingerprint className="w-4 h-4 text-[#D4A853]" />
            <div className="flex-1">
              <p className="text-[11px] font-inter text-[#888]">Security Level: <span className="text-[#D4A853] font-semibold">Maximum</span></p>
              <p className="text-[10px] font-inter text-[#555]">Multi-factor authentication required</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${lockoutActive ? 'bg-[#E74C3C] animate-pulse' : 'bg-[#27AE60]'}`} />
          </div>

          {/* Attempts Warning */}
          {recentFailCount > 0 && !lockoutActive && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[rgba(231,76,60,0.06)] border border-[rgba(231,76,60,0.12)]">
              <AlertTriangle className="w-4 h-4 text-[#E74C3C] flex-shrink-0" />
              <p className="text-[11px] font-inter text-[#E74C3C]">{recentFailCount} failed attempt{recentFailCount > 1 ? 's' : ''}. {SECURITY.maxAttempts - recentFailCount} attempts remaining before lockout.</p>
            </div>
          )}

          {/* Lockout Banner */}
          {lockoutActive && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.15)]">
              <Lock className="w-4 h-4 text-[#E74C3C] flex-shrink-0" />
              <div>
                <p className="text-[11px] font-inter text-[#E74C3C] font-semibold">Account Temporarily Locked</p>
                <p className="text-[10px] font-inter text-[#E74C3C]/70">Too many failed attempts. Wait {getRemainingLockout()} seconds.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Admin Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cinex.com" disabled={lockoutActive}
                  className="w-full bg-[#111] border border-[#242424] rounded-lg pl-10 pr-3 py-2.5 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40 disabled:opacity-40" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" disabled={lockoutActive}
                  className="w-full bg-[#111] border border-[#242424] rounded-lg pl-10 pr-10 py-2.5 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40 disabled:opacity-40" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Secret Key <span className="text-[#D4A853]">*</span></label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4A853]" />
                <input type={showSecret ? 'text' : 'password'} value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="cinex-admin-2025" disabled={lockoutActive}
                  className="w-full bg-[#111] border border-[#242424] rounded-lg pl-10 pr-10 py-2.5 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40 disabled:opacity-40" />
                <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888]">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] font-inter text-[#555] mt-1">Demo key: <span className="text-[#D4A853] font-mono">cinex-admin-2025</span></p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(231,76,60,0.06)] border border-[rgba(231,76,60,0.12)]">
                <AlertTriangle className="w-4 h-4 text-[#E74C3C] flex-shrink-0" />
                <p className="text-[11px] font-inter text-[#E74C3C]">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || lockoutActive}
              className="w-full py-3 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold font-inter hover:bg-[#E8BF6A] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Authenticating...</>
              ) : (
                <><Shield className="w-4 h-4" /> Access Admin Panel</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#242424] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <History className="w-3 h-3 text-[#555]" />
              <p className="text-[10px] font-inter text-[#555]">{recentFailCount > 0 ? `${recentFailCount} failed attempts` : 'No recent failed attempts'}</p>
            </div>
            <p className="text-[10px] font-inter text-[#555]">v2.0 Secure</p>
          </div>
        </div>
      </div>
    </div>
  )
}
