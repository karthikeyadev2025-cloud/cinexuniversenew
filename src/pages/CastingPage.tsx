import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera, Star, Users, ChevronRight, MapPin, Calendar,
  DollarSign, Briefcase, Award, Home,
  Mail, Lock, ArrowRight, CheckCircle, X, Globe, Phone
} from 'lucide-react'
import { useRoleStore } from '../stores/roleStore'
import { useCastingStore } from '../stores/castingStore'

/* ─── Mock Casting Calls ─── */
const CASTING_CALLS = [
  {
    id: 1, title: 'Lead Actress - Romantic Drama', project: 'Monsoon Dreams',
    director: 'Ravi Teja Films', location: 'Hyderabad, India',
    deadline: 'May 30, 2025', pay: '₹8-15 Lakhs', type: 'Lead',
    age: '22-28', gender: 'Female', applicants: 48,
    desc: 'Looking for an expressive lead actress with classical dance background for a romantic drama set in rural Telangana.',
  },
  {
    id: 2, title: 'Action Hero - Thriller', project: 'Neon Shadows',
    director: 'Studio X', location: 'Mumbai, India',
    deadline: 'Jun 10, 2025', pay: '₹12-20 Lakhs', type: 'Lead',
    age: '28-35', gender: 'Male', applicants: 32,
    desc: 'Physically fit actor with martial arts experience needed for high-octane action sequences.',
  },
  {
    id: 3, title: 'Supporting Roles (3)', project: 'Campus Diaries',
    director: 'Youth Pictures', location: 'Bangalore, India',
    deadline: 'May 20, 2025', pay: '₹50K-2L/episode', type: 'Supporting',
    age: '18-25', gender: 'Any', applicants: 86,
    desc: 'Web series ensemble cast. Fresh faces preferred. College student characters.',
  },
  {
    id: 4, title: 'Mother Character', project: 'Family Ties',
    director: 'Bollywood Casting', location: 'Delhi, India',
    deadline: 'Jun 5, 2025', pay: '₹3-5 Lakhs', type: 'Character',
    age: '45-55', gender: 'Female', applicants: 15,
    desc: 'Emotionally mature actor for pivotal mother role. Experience in family dramas preferred.',
  },
  {
    id: 5, title: 'Villain - Period Drama', project: 'The Emperor',
    director: 'Epic Studios', location: 'Jaipur, India',
    deadline: 'Jun 15, 2025', pay: '₹5-10 Lakhs', type: 'Antagonist',
    age: '35-50', gender: 'Male', applicants: 22,
    desc: 'Commanding screen presence required. Horse riding and sword fighting skills a plus.',
  },
  {
    id: 6, title: 'Child Artist (2 roles)', project: 'Little Stars',
    director: 'Kids Cinema', location: 'Chennai, India',
    deadline: 'May 25, 2025', pay: '₹1-2 Lakhs', type: 'Child',
    age: '8-12', gender: 'Any', applicants: 64,
    desc: 'Two child roles for a heartwarming family film. Acting experience not required.',
  },
]

/* ─── Talent Categories ─── */
const CATEGORIES = [
  { icon: Camera, label: 'Actors', count: '2,400+' },
  { icon: Users, label: 'Models', count: '850+' },
  { icon: Star, label: 'Dancers', count: '1,200+' },
  { icon: Briefcase, label: 'Voice Artists', count: '640+' },
  { icon: Award, label: 'Child Artists', count: '380+' },
  { icon: Globe, label: 'International', count: '420+' },
]

/* ─── How It Works ─── */
const STEPS = [
  { step: '01', title: 'Create Profile', desc: 'Build your talent profile with photos, skills, and experience.' },
  { step: '02', title: 'Apply to Calls', desc: 'Browse casting calls and submit applications in one click.' },
  { step: '03', title: 'Get Shortlisted', desc: 'Casting directors review and shortlist matching candidates.' },
  { step: '04', title: 'Audition & Book', desc: 'Attend auditions and get booked for your dream role.' },
]

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: 'Neha Gupta', role: 'Lead Actress', text: 'Got my first lead role through Cinex Casting within 3 weeks of joining. The platform connects you directly with top casting directors.', location: 'Mumbai' },
  { name: 'Arjun Reddy', role: 'Action Hero', text: 'The audition process is so smooth. No more running around with portfolios. Everything happens digitally here.', location: 'Hyderabad' },
  { name: 'Priya Nair', role: 'Classical Dancer', text: 'Found my breakthrough role in a period drama. The casting calls are genuine and the directors are professional.', location: 'Delhi' },
]

export default function CastingPage() {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState<'signin' | 'register'>('signin')
  const [selectedCall, setSelectedCall] = useState<typeof CASTING_CALLS[0] | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'talent' | 'director'>('talent')
  const [magicSent, setMagicSent] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [agencyName, setAgencyName] = useState('')

  const roleStore = useRoleStore()
  const castingStore = useCastingStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullName = role === 'talent'
      ? `${firstName} ${lastName}`.trim() || email.split('@')[0]
      : agencyName || firstName || email.split('@')[0]

    await roleStore.register(fullName, email, 'password', (role === 'director' ? 'casting' : 'talent') as import('../stores/roleStore').UserRole)

    // Auto-create casting profile if it doesn't exist
    if (role === 'director') {
      const existingDirector = castingStore.directors.find((d) => d.email.toLowerCase() === email.toLowerCase())
      if (!existingDirector) {
        castingStore.addDirector({
          name: fullName,
          email,
          agencyName: agencyName || fullName + ' Productions',
          status: 'pending',
          createdBy: 'self',
          verified: false,
        })
      }
    } else {
      const existingTalent = castingStore.talent.find((t) => t.email.toLowerCase() === email.toLowerCase())
      if (!existingTalent) {
        castingStore.addTalent({
          name: fullName,
          email,
          role: 'Actor',
          status: 'available',
          addedBy: 'cinex',
          addedByName: 'Cinex Casting',
          verified: false,
        })
      }
    }

    setShowLogin(false)
    navigate(role === 'director' ? '/casting-dashboard' : '/auditions')
  }

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault()
    setMagicSent(true)
    setTimeout(() => setMagicSent(false), 3000)
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#060606]/90 backdrop-blur-md border-b border-[#141414]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#888] hover:text-[#D4A853] transition-all">
            <Home className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden sm:inline">Cinex Home</span>
          </button>
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <Camera className="w-4 h-4 text-[#D4A853]" />
            <span className="font-cinzel text-sm font-bold text-white">Casting</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setLoginMode('signin'); setShowLogin(true) }} className="text-[11px] text-[#888] hover:text-white transition-all px-3 py-1.5 rounded-lg border border-[#242424] hover:border-[#444]">
              Sign In
            </button>
            <button onClick={() => { setLoginMode('register'); setShowLogin(true) }} className="text-[11px] font-medium text-[#060606] bg-[#D4A853] hover:bg-[#E8BF6A] transition-all px-3 py-1.5 rounded-lg">
              Join
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(155,89,186,0.06) 0%, transparent 60%)' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/20 text-[#D4A853] text-[11px] font-medium mb-4">
              <Camera className="w-3 h-3" /> India's #1 Casting Platform
            </div>
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Where Talent Meets<br /><span className="text-[#D4A853]">Opportunity</span>
            </h1>
            <p className="font-inter text-base sm:text-lg text-[#A3A3A3] max-w-2xl mx-auto mb-8">
              Connect with top casting directors, apply to verified auditions, and launch your acting career. From fresh faces to seasoned performers — your next role is here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => { setLoginMode('register'); setShowLogin(true) }} className="px-8 py-3.5 rounded-xl bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center gap-2 shadow-[0_0_24px_rgba(212,168,83,0.2)]">
                <Star className="w-4 h-4" /> Join as Talent
              </button>
              <button onClick={() => { setLoginMode('signin'); setRole('director'); setShowLogin(true) }} className="px-8 py-3.5 rounded-xl border border-[#242424] text-[#F0F0F0] text-sm font-medium hover:border-[#D4A853] hover:bg-[#D4A853]/5 transition-all flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> I'm a Casting Director
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-[#888]">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#27AE60]" /> 2,400+ Actors</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#27AE60]" /> 150+ Casting Directors</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#27AE60]" /> 500+ Roles Filled</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-12 px-4 border-y border-[#141414]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.label} className="text-center p-4 rounded-xl border border-[#242424] bg-[#0D0D0D] hover:border-[#D4A853]/30 transition-all cursor-pointer group">
                <c.icon className="w-6 h-6 text-[#D4A853] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-white">{c.label}</p>
                <p className="text-[11px] text-[#888]">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-sm text-[#888]">Your journey from profile to performance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="relative p-5 rounded-xl border border-[#242424] bg-[#0D0D0D] hover:border-[#D4A853]/20 transition-all">
                <span className="text-3xl font-bold text-[#242424] font-cinzel">{s.step}</span>
                <h3 className="text-sm font-semibold text-white mt-2 mb-1">{s.title}</h3>
                <p className="text-[11px] text-[#888] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE CASTING CALLS ─── */}
      <section className="py-16 px-4 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-1">Live Casting Calls</h2>
              <p className="text-sm text-[#888]">Apply now — verified opportunities updated daily</p>
            </div>
            <button onClick={() => setShowLogin(true)} className="text-[11px] text-[#D4A853] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CASTING_CALLS.map((call) => (
              <div key={call.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-4 hover:border-[#D4A853]/20 transition-all group">
                <div className="flex items-start justify-between mb-2.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${call.type === 'Lead' ? 'bg-[#D4A853]/10 text-[#D4A853]' : call.type === 'Character' ? 'bg-[#9B59B6]/10 text-[#9B59B6]' : 'bg-[#2D9CDB]/10 text-[#2D9CDB]'}`}>{call.type}</span>
                  <span className="text-[10px] text-[#555]">{call.applicants} applied</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5 group-hover:text-[#D4A853] transition-colors">{call.title}</h3>
                <p className="text-[11px] text-[#555] mb-2">{call.project} · {call.director}</p>
                <p className="text-[11px] text-[#888] mb-3 line-clamp-2">{call.desc}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#666] mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{call.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{call.deadline}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{call.pay}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{call.age} · {call.gender}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedCall(call)} className="flex-1 py-1.5 rounded-lg border border-[#242424] text-[11px] text-[#888] hover:text-white hover:border-[#444444] transition-all">Details</button>
                  <button onClick={() => { setLoginMode('signin'); setShowLogin(true) }} className="flex-1 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] text-[11px] font-semibold hover:bg-[#E8BF6A]">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-2">Success Stories</h2>
            <p className="text-sm text-[#888]">Talent who found their breakthrough here</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 hover:border-[#333333] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#242424] border border-[#333333] flex items-center justify-center text-sm font-bold text-[#D4A853]">{t.name[0]}</div>
                  <div><p className="text-sm font-medium text-white">{t.name}</p><p className="text-[10px] text-[#888]">{t.role} · {t.location}</p></div>
                </div>
                <p className="text-[12px] text-[#A3A3A3] leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-0.5 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3 h-3 text-[#D4A853] fill-[#D4A853]" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 px-4 bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-cinzel text-3xl font-bold text-white mb-3">Ready to Get Discovered?</h2>
          <p className="text-sm text-[#888] mb-6">Join thousands of actors, models, and performers finding their next big role on Cinex Casting.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => { setLoginMode('register'); setShowLogin(true) }} className="px-8 py-3 rounded-xl bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] flex items-center gap-2">
              <Camera className="w-4 h-4" /> Create Free Profile
            </button>
            <button onClick={() => { setLoginMode('signin'); setRole('director'); setShowLogin(true) }} className="px-8 py-3 rounded-xl border border-[#242424] text-[#F0F0F0] text-sm hover:border-[#D4A853] transition-all flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Post a Casting Call
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#141414] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D4A853]" />
            <span className="font-cinzel text-sm font-bold text-white">Cinex Casting</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-[#555]">
            <span className="cursor-pointer hover:text-[#A3A3A3]">About</span>
            <span className="cursor-pointer hover:text-[#A3A3A3]">How It Works</span>
            <span className="cursor-pointer hover:text-[#A3A3A3]">Privacy</span>
            <span className="cursor-pointer hover:text-[#A3A3A3]">Terms</span>
            <span className="cursor-pointer hover:text-[#A3A3A3]">Support</span>
          </div>
          <p className="text-[10px] text-[#444]">© 2025 Cinex Casting. All rights reserved.</p>
        </div>
      </footer>

      {/* ─── LOGIN / REGISTER MODAL ─── */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#181818]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#D4A853]" />
                <span className="font-cinzel text-sm font-bold text-white">Cinex Casting</span>
              </div>
              <button onClick={() => setShowLogin(false)} className="p-1.5 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button onClick={() => setRole('talent')} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-[12px] font-medium ${role === 'talent' ? 'border-[#D4A853]/40 bg-[#D4A853]/5 text-[#D4A853]' : 'border-[#242424] text-[#888] hover:border-[#333333]'}`}>
                  <Star className="w-4 h-4" /> I'm Talent
                </button>
                <button onClick={() => setRole('director')} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-[12px] font-medium ${role === 'director' ? 'border-[#D4A853]/40 bg-[#D4A853]/5 text-[#D4A853]' : 'border-[#242424] text-[#888] hover:border-[#333333]'}`}>
                  <Briefcase className="w-4 h-4" /> Casting Director
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-[#131313] rounded-lg p-0.5 mb-5">
                <button onClick={() => setLoginMode('signin')} className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all ${loginMode === 'signin' ? 'bg-[#242424] text-white' : 'text-[#888]'}`}>Sign In</button>
                <button onClick={() => setLoginMode('register')} className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all ${loginMode === 'register' ? 'bg-[#242424] text-white' : 'text-[#888]'}`}>New Account</button>
              </div>

              {loginMode === 'signin' ? (
                <>
                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313] transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.86 0 3.51.64 4.82 1.89l3.59-3.59C17.95 1.18 15.24 0 12 0 7.34 0 3.26 2.69 1.48 6.59l4.17 3.23C6.56 7.05 9.05 5.04 12 5.04z"/><path fill="#34A853" d="M23.5 12.18c0-.82-.07-1.61-.2-2.36H12v4.48h6.45c-.28 1.49-1.1 2.75-2.34 3.59l3.79 2.94c2.21-2.04 3.5-5.05 3.5-8.65z"/><path fill="#4A90D2" d="M5.65 14.18l-4.17 3.23C3.26 21.31 7.34 24 12 24c3.24 0 5.95-1.07 7.9-2.9l-3.79-2.94c-1.07.72-2.44 1.14-4.11 1.14-3.17 0-5.86-2.13-6.82-5.01z"/><path fill="#FBBC05" d="M5.65 14.18c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.48 6.59C.54 8.49 0 10.68 0 12.9s.54 4.41 1.48 6.31l4.17-3.23z"/></svg>
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313] transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[#242424]" />
                    <span className="text-[10px] text-[#555] uppercase">or with email</span>
                    <div className="flex-1 h-px bg-[#242424]" />
                  </div>

                  {/* Email Login */}
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="relative"><Mail className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" required />
                    </div>
                    <div className="relative"><Lock className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" required />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center justify-center gap-2">
                      <ArrowRight className="w-4 h-4" /> Sign In as {role === 'talent' ? 'Talent' : 'Director'}
                    </button>
                  </form>

                  {/* Magic Link */}
                  <div className="mt-4 pt-4 border-t border-[#181818]">
                    <p className="text-[10px] text-[#555] uppercase mb-2">Magic Link (passwordless)</p>
                    <form onSubmit={handleMagicLink} className="flex gap-2">
                      <input type="email" placeholder="Your email" className="flex-1 bg-[#131313] border border-[#242424] rounded-lg px-3 py-2 text-[11px] text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" />
                      <button type="submit" className="px-3 py-2 rounded-lg border border-[#242424] text-[#888] text-[11px] hover:text-[#D4A853] hover:border-[#D4A853] transition-all whitespace-nowrap">
                        {magicSent ? 'Sent!' : 'Send Link'}
                      </button>
                    </form>
                  </div>

                  <p className="text-center text-[11px] text-[#555] mt-4">No account? <button onClick={() => setLoginMode('register')} className="text-[#D4A853] hover:underline">Register here</button></p>
                </>
              ) : (
                <>
                  {/* Registration */}
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" />
                      <input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" />
                    </div>
                    <div className="relative"><Mail className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" required />
                    </div>
                    {role === 'talent' && (
                      <div className="grid grid-cols-2 gap-2">
                        <select className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-[#888] focus:outline-none focus:border-[#D4A853]">
                          <option>Category</option><option>Actor</option><option>Model</option><option>Dancer</option><option>Voice Artist</option>
                        </select>
                        <select className="w-full bg-[#131313] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-[#888] focus:outline-none focus:border-[#D4A853]">
                          <option>Experience</option><option>0-1 years</option><option>1-3 years</option><option>3-5 years</option><option>5+ years</option>
                        </select>
                      </div>
                    )}
                    {role === 'director' && (
                      <div className="relative"><Briefcase className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input placeholder="Agency / Production House" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" />
                      </div>
                    )}
                    <div className="relative"><Lock className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" required />
                    </div>
                    <div className="relative"><Phone className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input placeholder="Phone (for OTP)" className="w-full bg-[#131313] border border-[#242424] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#D4A853]" />
                    </div>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[#242424] bg-[#131313]" />
                      <p className="text-[10px] text-[#888]">I agree to the Terms of Service and Privacy Policy. I confirm I am 18+ years old.</p>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-all flex items-center justify-center gap-2">
                      <ArrowRight className="w-4 h-4" /> Create {role === 'talent' ? 'Talent' : 'Director'} Account
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[#242424]" />
                    <span className="text-[10px] text-[#555] uppercase">or</span>
                    <div className="flex-1 h-px bg-[#242424]" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.86 0 3.51.64 4.82 1.89l3.59-3.59C17.95 1.18 15.24 0 12 0 7.34 0 3.26 2.69 1.48 6.59l4.17 3.23C6.56 7.05 9.05 5.04 12 5.04z"/><path fill="#34A853" d="M23.5 12.18c0-.82-.07-1.61-.2-2.36H12v4.48h6.45c-.28 1.49-1.1 2.75-2.34 3.59l3.79 2.94c2.21-2.04 3.5-5.05 3.5-8.65z"/><path fill="#4A90D2" d="M5.65 14.18l-4.17 3.23C3.26 21.31 7.34 24 12 24c3.24 0 5.95-1.07 7.9-2.9l-3.79-2.94c-1.07.72-2.44 1.14-4.11 1.14-3.17 0-5.86-2.13-6.82-5.01z"/><path fill="#FBBC05" d="M5.65 14.18c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.48 6.59C.54 8.49 0 10.68 0 12.9s.54 4.41 1.48 6.31l4.17-3.23z"/></svg>
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-[#242424] text-[#F0F0F0] text-[11px] hover:bg-[#131313]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      GitHub
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-[#555] mt-4">Already have an account? <button onClick={() => setLoginMode('signin')} className="text-[#D4A853] hover:underline">Sign in</button></p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CASTING CALL DETAIL MODAL ─── */}
      {selectedCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelectedCall(null)}>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#181818]">
              <div><h3 className="text-base font-semibold text-white">{selectedCall.title}</h3><p className="text-[11px] text-[#555]">{selectedCall.project} · {selectedCall.director}</p></div>
              <button onClick={() => setSelectedCall(null)} className="p-1.5 rounded hover:bg-[#242424] text-[#555]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[13px] text-[#A3A3A3]">{selectedCall.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ label: 'Location', value: selectedCall.location, icon: MapPin }, { label: 'Deadline', value: selectedCall.deadline, icon: Calendar }, { label: 'Compensation', value: selectedCall.pay, icon: DollarSign }, { label: 'Requirements', value: `${selectedCall.age} · ${selectedCall.gender}`, icon: Users }].map((item) => (
                  <div key={item.label} className="bg-[#131313] rounded-lg p-2.5">
                    <div className="flex items-center gap-1 mb-0.5"><item.icon className="w-3 h-3 text-[#555]" /><span className="text-[10px] text-[#555]">{item.label}</span></div>
                    <p className="text-xs text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setSelectedCall(null); setLoginMode('signin'); setShowLogin(true) }} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A]">Apply Now</button>
                <button onClick={() => setSelectedCall(null)} className="flex-1 py-2 rounded-lg border border-[#242424] text-[#888] text-sm hover:text-white">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
