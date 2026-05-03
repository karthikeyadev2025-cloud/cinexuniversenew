/* ─────────────────────────────────────────────
   components/ComingSoon.tsx
   Roadmap view for disabled or upcoming features.
   ───────────────────────────────────────────── */

import { useNavigate } from 'react-router-dom'
import {
  Rocket, Clock, ArrowLeft,
  Wand2, Box, Layers, Sparkles
} from 'lucide-react'

interface Props {
  featureName?: string
  description?: string
  eta?: string
  icon?: React.ReactNode
}

export default function ComingSoon({
  featureName = 'This Feature',
  description = 'We are building something amazing for you.',
  eta = 'Q3 2025',
  icon,
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 bg-[#0A0A0A]">
      <div className="w-20 h-20 rounded-2xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center mb-6">
        {icon || <Rocket className="w-10 h-10 text-[#D4A853]" />}
      </div>

      <h2 className="font-cinzel text-3xl font-bold text-[#F0F0F0] mb-3">
        {featureName}
      </h2>
      <p className="text-[#A3A3A3] font-inter max-w-md mb-8">
        {description}
      </p>

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131313] border border-[#242424] text-sm text-[#6B6B6B] font-inter mb-8">
        <Clock className="w-4 h-4 text-[#D4A853]" />
        <span>Estimated release:</span>
        <span className="text-[#F0F0F0]">{eta}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-lg w-full">
        {[
          { icon: <Wand2 className="w-4 h-4" />, label: 'AI Powered' },
          { icon: <Box className="w-4 h-4" />, label: 'Cloud Native' },
          { icon: <Layers className="w-4 h-4" />, label: 'Team Sync' },
          { icon: <Sparkles className="w-4 h-4" />, label: 'Smart Assist' },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-[#131313] border border-[#242424]"
          >
            <div className="text-[#D4A853]">{item.icon}</div>
            <span className="text-[10px] text-[#A3A3A3] font-inter">{item.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4A853] text-[#0A0A0A] font-inter text-sm font-semibold hover:bg-[#c49a48] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
    </div>
  )
}
