import { Link } from 'react-router-dom'
import { Play, Clock, BookOpen, ChevronRight, Star, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const tutorials = [
  {
    title: 'Getting Started with Cinex',
    desc: 'Learn the basics of project creation, script import, and navigation.',
    duration: '10 min',
    level: 'Beginner',
    icon: BookOpen,
  },
  {
    title: 'AI Script Breakdown',
    desc: 'Master the AI-powered breakdown tool for tagging cast, props, and locations.',
    duration: '15 min',
    level: 'Intermediate',
    icon: Star,
  },
  {
    title: 'Shot List Generation',
    desc: 'Generate professional shot lists with camera angles and lens specs.',
    duration: '12 min',
    level: 'Intermediate',
    icon: Play,
  },
  {
    title: 'Budget Tracking',
    desc: 'Track production costs in real-time with category breakdowns.',
    duration: '8 min',
    level: 'Beginner',
    icon: Clock,
  },
  {
    title: 'Team Collaboration',
    desc: 'Invite crew members, assign roles, and manage permissions.',
    duration: '10 min',
    level: 'Intermediate',
    icon: Users,
  },
  {
    title: 'Export & Delivery',
    desc: 'Export your work to PDF, Excel, Final Draft, and other formats.',
    duration: '7 min',
    level: 'Beginner',
    icon: BookOpen,
  },
]

export default function Tutorials() {
  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Learn</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">Tutorials</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mx-auto">
            Step-by-step guides to master every feature of Cinex Universe.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {tutorials.map((t) => (
            <Link
              key={t.title}
              to="#"
              className="bg-[#111111] border border-[#242424] rounded-xl p-6 hover:border-[#333333] transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center flex-shrink-0">
                  <t.icon className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-space-grotesk text-base font-semibold text-white group-hover:text-[#D4A853] transition-colors mb-1">{t.title}</h3>
                  <p className="font-inter text-sm text-[#888888] mb-3">{t.desc}</p>
                  <div className="flex items-center gap-3 text-xs font-inter text-[#6B6B6B]">
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {t.duration}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#181818] border border-[#242424]">{t.level}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#D4A853] transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
