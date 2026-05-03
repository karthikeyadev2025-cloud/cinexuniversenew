import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Film, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'

export default function Register() {
  const navigate = useNavigate()
  const register = useRoleStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.includes('@')) { setError('Valid email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const result = await register(name.trim(), email, password, 'user')
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#060606] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Film className="w-8 h-8 text-[#D4A853] mr-3" />
          <h1 className="font-cinzel text-2xl font-bold text-[#F0F0F0]">Cinex Universe</h1>
        </div>

        <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8">
          <h2 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] text-center mb-2">Create Account</h2>
          <p className="font-inter text-sm text-[#A3A3A3] text-center mb-6">Start your filmmaking journey</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#131313] border border-[#242424] rounded-xl text-[#F0F0F0] placeholder-[#6B6B6B] focus:border-[#D4A853] focus:outline-none transition-colors font-inter text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#131313] border border-[#242424] rounded-xl text-[#F0F0F0] placeholder-[#6B6B6B] focus:border-[#D4A853] focus:outline-none transition-colors font-inter text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#131313] border border-[#242424] rounded-xl text-[#F0F0F0] placeholder-[#6B6B6B] focus:border-[#D4A853] focus:outline-none transition-colors font-inter text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#A3A3A3]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4A853] hover:bg-[#C49A4A] text-[#060606] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-[#6B6B6B] font-inter mt-6">
            Already have an account? <Link to="/login" className="text-[#D4A853] hover:underline">Sign In</Link>
          </p>
          <Link to="/" className="flex items-center justify-center gap-1 text-xs text-[#6B6B6B] hover:text-[#A3A3A3] font-inter mt-4 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
