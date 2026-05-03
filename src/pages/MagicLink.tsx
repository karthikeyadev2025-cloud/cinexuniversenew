import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wand2, ArrowLeft, Send, Check, AlertCircle } from 'lucide-react'

export default function MagicLink() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Valid email is required'); return }
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#060606] px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Wand2 className="w-8 h-8 text-[#D4A853] mr-3" />
          <h1 className="font-cinzel text-2xl font-bold text-[#F0F0F0]">Magic Link</h1>
        </div>

        <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8">
          {!sent ? (
            <>
              <h2 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] text-center mb-2">Sign In Without Password</h2>
              <p className="font-inter text-sm text-[#A3A3A3] text-center mb-6">We'll send a secure login link to your email</p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#131313] border border-[#242424] rounded-[6px] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#6B6B6B] focus:outline-none focus:border-[#D4A853]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : (
                    <>
                      <Send className="w-4 h-4" /> Send Magic Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#27AE60]/10 border border-[#27AE60]/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#27AE60]" />
              </div>
              <h2 className="font-space-grotesk text-xl font-semibold text-white mb-2">Link Sent!</h2>
              <p className="font-inter text-sm text-[#A3A3A3] mb-1">Check your email at</p>
              <p className="font-inter text-sm text-[#D4A853] mb-6">{email}</p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-[#888888] hover:text-white font-inter transition-colors"
              >
                Send to a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#6B6B6B] font-inter mt-6">
          <Link to="/login" className="text-[#D4A853] hover:underline">Back to Sign In</Link>
        </p>
        <Link to="/" className="flex items-center justify-center gap-1 text-xs text-[#6B6B6B] hover:text-[#A3A3A3] font-inter mt-4 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
