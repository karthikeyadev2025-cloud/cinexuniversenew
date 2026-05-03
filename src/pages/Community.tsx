import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Users, MessageCircle, Heart, Globe } from 'lucide-react'

const discussions = [
  {
    title: 'Best practices for script breakdown?',
    author: 'Rajesh K.',
    replies: 24,
    likes: 56,
    tag: 'Pre-Production',
    time: '2 hrs ago',
  },
  {
    title: 'Telugu fountain format tips',
    author: 'Priya S.',
    replies: 18,
    likes: 42,
    tag: 'Screenwriting',
    time: '5 hrs ago',
  },
  {
    title: 'Budget tracking for indie shorts',
    author: 'Venkatesh R.',
    replies: 31,
    likes: 73,
    tag: 'Production',
    time: '1 day ago',
  },
  {
    title: 'Casting director recommendations in Mumbai',
    author: 'Ananya B.',
    replies: 12,
    likes: 28,
    tag: 'Casting',
    time: '2 days ago',
  },
]

const stats = [
  { value: '2,000+', label: 'Members', icon: Users },
  { value: '500+', label: 'Discussions', icon: MessageCircle },
  { value: '50+', label: 'Countries', icon: Globe },
]

export default function Community() {
  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Community</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">Filmmakers United</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mx-auto">
            Connect with 2,000+ filmmakers worldwide. Share knowledge, ask questions, and grow together.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#111111] border border-[#242424] rounded-xl p-5 text-center">
              <s.icon className="w-5 h-5 text-[#D4A853] mx-auto mb-2" />
              <p className="font-cinzel text-xl font-bold text-white">{s.value}</p>
              <p className="font-inter text-xs text-[#888888]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Discussions */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-space-grotesk text-xl font-semibold text-white">Recent Discussions</h2>
            <button className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-4 py-2 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors">
              <MessageCircle className="w-4 h-4" /> New Topic
            </button>
          </div>
          <div className="space-y-3">
            {discussions.map((d) => (
              <Link
                key={d.title}
                to="#"
                className="block bg-[#111111] border border-[#242424] rounded-xl p-5 hover:border-[#333333] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#181818] text-[#A3A3A3] border border-[#242424] font-inter">{d.tag}</span>
                      <span className="text-xs text-[#6B6B6B] font-inter">{d.time}</span>
                    </div>
                    <h3 className="font-space-grotesk text-base font-semibold text-white mb-1">{d.title}</h3>
                    <p className="font-inter text-xs text-[#888888]">by {d.author}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B6B6B] font-inter flex-shrink-0">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {d.replies}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {d.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
