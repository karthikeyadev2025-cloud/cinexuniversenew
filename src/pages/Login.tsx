import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Film, Clapperboard, Eye, EyeOff, Mail, Lock, ArrowRight,
  Sparkles, Zap, Chrome, ArrowLeft, Fingerprint
} from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'

export default function Login() {
  const navigate = useNavigate()
  const roleStore = useRoleStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'register' | 'magic'>('signin')
  const [name, setName] = useState('')
  const [particles, setParticles] = useState<{x: number; y: number; size: number; delay: number}[]>([])

  /* Floating particles */
  useEffect(() => {
    const p = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
    }))
    setParticles(p)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await roleStore.login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Login failed. Please check your email and password.')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const result = await roleStore.register(name.trim(), email, password, 'user')
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Registration failed. Please try again.')
    }
  }
  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault()
    setMagicSent(true)
    setTimeout(() => setMagicSent(false), 4000)
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const resp = await fetch('/api/trpc/googleAuth.getAuthUrl')
      const data = await resp.json()
      if (data?.result?.data?.json?.url) {
        window.location.href = data.result.data.json.url
      } else {
        setError('Google Sign-In is not configured yet. Please use Email/Password.')
        setLoading(false)
      }
    } catch {
      setError('Google Sign-In is not configured yet. Please use Email/Password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0] flex overflow-hidden">
      {/* ─── LEFT: CINEMATIC VISUAL ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1200] to-[#0a0a0a]" />
        
        {/* Floating dust particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#D4A853] opacity-20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${6 + p.delay}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Film strip decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col items-center justify-center gap-3 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-8 h-6 border-2 border-[#D4A853] rounded-sm" />
          ))}
        </div>

        {/* Central content */}
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(212,168,83,0.08)] border border-[#D4A853]/20 flex items-center justify-center mx-auto mb-6">
            <Film className="w-10 h-10 text-[#D4A853]" />
          </div>
          <h2 className="font-cinzel text-3xl font-bold text-white mb-3 leading-tight">
            Your Story<br /><span className="text-[#D4A853]">Starts Here</span>
          </h2>
          <p className="font-inter text-sm text-[#888] leading-relaxed mb-8">
            Join 10,000+ filmmakers who plan, shoot, and deliver films faster with AI-powered pre-production.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-cinzel text-xl font-bold text-[#D4A853]">50K+</p>
              <p className="text-[10px] text-[#555] uppercase tracking-wider">Scripts</p>
            </div>
            <div>
              <p className="font-cinzel text-xl font-bold text-[#D4A853]">12K+</p>
              <p className="text-[10px] text-[#555] uppercase tracking-wider">Projects</p>
            </div>
            <div>
              <p className="font-cinzel text-xl font-bold text-[#D4A853]">2.4K+</p>
              <p className="text-[10px] text-[#555] uppercase tracking-wider">Actors</p>
            </div>
          </div>

          {/* Testimonial mini */}
          <div className="mt-8 p-4 rounded-xl bg-[#131313]/60 border border-[#242424]/60 backdrop-blur-sm">
            <p className="text-[12px] text-[#A3A3A3] italic leading-relaxed mb-2">
              "Cinex cut our pre-production time by 60%. The AI storyboard generator alone is worth the subscription."
            </p>
            <p className="text-[10px] text-[#555]">— Ravi Teja, Director</p>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060606] to-transparent" />
      </div>

      {/* ─── RIGHT: LOGIN FORM ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2 text-[#555] hover:text-[#D4A853] transition-all text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,83,0.1)] border border-[#D4A853]/20 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-[#D4A853]" />
            </div>
            <div>
              <h1 className="font-cinzel text-lg font-bold text-white">Cinex Universe</h1>
              <p className="text-[10px] text-[#555] uppercase tracking-wider">AI Film Pre-Production</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-[#131313] rounded-xl p-1 mb-6 border border-[#242424]">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${mode === 'signin' ? 'bg-[#242424] text-white shadow-sm' : 'text-[#555] hover:text-[#888]'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${mode === 'register' ? 'bg-[#242424] text-white shadow-sm' : 'text-[#555] hover:text-[#888]'}`}
            >
              New Account
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${mode === 'magic' ? 'bg-[#242424] text-white shadow-sm' : 'text-[#555] hover:text-[#888]'}`}
            >
              Magic Link
            </button>
          </div>

          {/* ─── SIGN IN ─── */}
          {mode === 'signin' && (
            <>
              <p className="text-sm text-[#888] mb-5">
                {mode === 'signin' ? 'Welcome back, filmmaker.' : 'Create your filmmaker account.'}
              </p>

              {/* Social Login — Google OAuth */}
              <div className="mb-4">
                <div className="text-center mb-2">
                  <span className="text-[11px] text-[#6B6B6B] font-inter">Quick Sign In</span>
                </div>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313] transition-all disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4" /> Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#242424]" />
                <span className="text-[10px] text-[#555] uppercase">or with email</span>
                <div className="flex-1 h-px bg-[#242424]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-inter mb-3">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder=" filmmaker@studio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853] transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] text-[#555] cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#242424] bg-[#131313]" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-[#D4A853] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-[#555] mt-4">
                New here?{' '}
                <button onClick={() => setMode('register')} className="text-[#D4A853] hover:underline font-medium">
                  Create account
                </button>
              </p>
            </>
          )}

          {/* ─── REGISTER ─── */}
          {mode === 'register' && (
            <>
              <p className="text-sm text-[#888] mb-5">Start your filmmaking journey.</p>

              <form onSubmit={handleRegister} className="space-y-3">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-inter mb-3">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853]" required />
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853]" required />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" placeholder="Create password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853]" required />
                </div>
                <div className="relative">
                  <Zap className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#888] focus:outline-none focus:border-[#D4A853]">
                    <option>I am a...</option>
                    <option>Independent Filmmaker</option>
                    <option>Director</option>
                    <option>Producer</option>
                    <option>Writer / Screenwriter</option>
                    <option>DOP / Cinematographer</option>
                    <option>Editor</option>
                    <option>Production House</option>
                    <option>Student</option>
                  </select>
                </div>
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[#242424] bg-[#131313]" />
                  <p className="text-[10px] text-[#555]">I agree to the Terms of Service and Privacy Policy. I am 18+ years old.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><Sparkles className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#242424]" />
                <span className="text-[10px] text-[#555] uppercase">or</span>
                <div className="flex-1 h-px bg-[#242424]" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313] disabled:opacity-50"
                >
                  <Chrome className="w-4 h-4" /> Continue with Google
                </button>
              </div>

              <p className="text-center text-[11px] text-[#555] mt-4">
                Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-[#D4A853] hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ─── MAGIC LINK ─── */}
          {mode === 'magic' && (
            <>
              <p className="text-sm text-[#888] mb-5">Passwordless login. We send a magic link to your email.</p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#131313] border border-[#242424] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#D4A853] transition-all"
                    required
                  />
                </div>

                {magicSent ? (
                  <div className="p-3 rounded-xl bg-[#27AE60]/10 border border-[#27AE60]/20 text-center">
                    <p className="text-sm text-[#27AE60] font-medium">Magic link sent!</p>
                    <p className="text-[11px] text-[#888] mt-0.5">Check your inbox for the login link.</p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Send Magic Link
                  </button>
                )}
              </form>

              <p className="text-center text-[11px] text-[#555] mt-4">
                Prefer password?{' '}
                <button onClick={() => setMode('signin')} className="text-[#D4A853] hover:underline font-medium">
                  Sign in with password
                </button>
              </p>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center">
            <p className="text-[10px] text-[#444]">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-[#555] hover:text-[#D4A853]">Terms</Link> and{' '}
              <Link to="/privacy" className="text-[#555] hover:text-[#D4A853]">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.4; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.15; }
          75% { transform: translateY(-20px) translateX(5px); opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
