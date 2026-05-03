import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Camera, Lightbulb, Volume2, Clapperboard, Heart,
  Globe, ArrowRight, Mail, MapPin, Calendar,
  Film, Award, Users, Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

/* ─── Animated Counter ─── */
function FilmCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (!numRef.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2.5,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        if (numRef.current) {
          numRef.current.textContent = Math.floor(obj.val).toLocaleString() + suffix
        }
      },
    })
  }, [])

  return (
    <div ref={ref} className="text-center" style={{ opacity: 1 }}>
      <p className="font-cinzel text-4xl sm:text-5xl font-bold text-[#D4A853] mb-2">
        <span ref={numRef} className="tabular-nums">0{suffix}</span>
      </p>
      <p className="font-inter text-xs sm:text-sm uppercase tracking-[0.15em] text-[#6B6B6B]">{label}</p>
    </div>
  )
}

/* ─── Film Grain Overlay Component ─── */
function FilmGrain() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[2] opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

/* ─── Data ─── */
const manifestoLines = [
  'We believe every story deserves to be told.',
  'Not just the blockbusters.',
  'Not just the ones with studio backing.',
  'Every story. From every corner of the world.',
]

const crew = [
  {
    name: 'Rajesh Kumar',
    role: 'Director / CEO',
    dept: 'PRODUCTION',
    location: 'Hyderabad, IN',
    callTime: '05:00 AM',
    note: 'Former AD on 12 Telugu features. Founded Cinex after losing a shooting day to a misplaced call sheet.',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Product',
    dept: 'CREATIVE',
    location: 'Mumbai, IN',
    callTime: '06:30 AM',
    note: 'Product lead at a streaming giant before building tools she wished she had on set.',
  },
  {
    name: 'Venkatesh Reddy',
    role: 'Chief Architect',
    dept: 'TECH',
    location: 'Vizag, IN',
    callTime: '04:00 AM',
    note: 'Built the first version in a Ramoji Film City editing bay during a night shoot.',
  },
  {
    name: 'Ananya Bose',
    role: 'Design Lead',
    dept: 'ART',
    location: 'Kolkata, IN',
    callTime: '07:00 AM',
    note: 'Award-winning production designer who translates film aesthetics into digital interfaces.',
  },
  {
    name: 'Arjun Mehta',
    role: 'AI Research Lead',
    dept: 'VFX / AI',
    location: 'Bangalore, IN',
    callTime: '08:00 AM',
    note: 'PhD in Computer Vision. Passionate about making AI understand the language of cinema.',
  },
  {
    name: 'Divya Nair',
    role: 'Community Director',
    dept: 'OUTREACH',
    location: 'Kochi, IN',
    callTime: '09:00 AM',
    note: 'Film festival programmer connecting regional cinema to the world for over a decade.',
  },
]

const values = [
  {
    icon: Camera,
    title: 'Craft Above All',
    subtitle: 'CAMERA DEPT',
    desc: 'We obsess over the details that make a tool feel like an extension of your creative mind. Every pixel, every interaction, every workflow is designed with cinematic precision.',
  },
  {
    icon: Lightbulb,
    title: 'Light the New',
    subtitle: 'ELECTRIC DEPT',
    desc: 'Technology should illuminate, not overshadow. Our AI assists the tedious — scheduling, breakdowns, shot lists — so you can focus on what matters: the art.',
  },
  {
    icon: Volume2,
    title: 'Every Voice Matters',
    subtitle: 'SOUND DEPT',
    desc: 'From Telugu indies to Marathi documentaries, we build for the diversity of Indian cinema. Regional language support is not a feature — it is our foundation.',
  },
  {
    icon: Clapperboard,
    title: 'Action Over Words',
    subtitle: 'DIRECTORS',
    desc: 'We ship fast, listen faster, and iterate with the urgency of a production day. No quarterly roadmap jargon — just tools that work when the red light is on.',
  },
]

const timeline = [
  {
    scene: 'SCENE 01',
    year: '2023',
    title: 'The Spark',
    desc: 'A lost call sheet. A ruined shooting day. A director in Hyderabad decides there must be a better way. Cinex Universe is sketched on a production notebook during lunch break at Ramoji Film City.',
  },
  {
    scene: 'SCENE 02',
    year: '2024',
    title: 'First Cut',
    desc: 'Beta launches to 500 filmmakers across India. The Telugu script engine — built from scratch because no existing tool supported Indic scripts properly — becomes our most loved feature overnight.',
  },
  {
    scene: 'SCENE 03',
    year: '2024',
    title: 'The Casting Call',
    desc: 'Casting agencies join the platform. Photo approvals, audition pipelines, and talent directories transform Cinex from a pre-production tool into a full ecosystem for film creation.',
  },
  {
    scene: 'SCENE 04',
    year: '2025',
    title: 'World Premiere',
    desc: '2,000+ filmmakers across 50 countries. Twelve languages. Six Indian regional industries. From student shorts to studio features — one platform for every story.',
  },
]

/* ─── Main Component ─── */
export default function About() {
  const heroRef = useRef<HTMLDivElement>(null)
  const manifestoRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const crewRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [activeCrew, setActiveCrew] = useState<number | null>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.about-hero-eyebrow',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'expo.out' }
      )
      gsap.fromTo('.about-hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, delay: 0.4, ease: 'expo.out' }
      )
      gsap.fromTo('.about-hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.7, ease: 'expo.out' }
      )
      gsap.fromTo('.about-hero-scroll',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, delay: 1.2, ease: 'none' }
      )

      // Manifesto lines
      if (manifestoRef.current) {
        gsap.fromTo('.manifesto-line',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'expo.out',
            scrollTrigger: { trigger: manifestoRef.current, start: 'top 75%', once: true }
          }
        )
      }

      // Scene block
      if (sceneRef.current) {
        gsap.fromTo('.scene-content',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out',
            scrollTrigger: { trigger: sceneRef.current, start: 'top 75%', once: true }
          }
        )
      }

      // Values
      if (valuesRef.current) {
        gsap.fromTo('.value-card',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'expo.out',
            scrollTrigger: { trigger: valuesRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Crew cards
      if (crewRef.current) {
        gsap.fromTo('.crew-card',
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out',
            scrollTrigger: { trigger: crewRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Timeline
      if (timelineRef.current) {
        gsap.fromTo('.timeline-item',
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'expo.out',
            scrollTrigger: { trigger: timelineRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // CTA
      if (ctaRef.current) {
        gsap.fromTo('.cta-inner',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', once: true }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO — The Story Behind the Story
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 50%, rgba(212,168,83,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139,90,43,0.06) 0%, transparent 40%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060606] via-transparent to-[#060606]" />
        </div>
        <FilmGrain />

        {/* Decorative film strip border */}
        <div className="absolute top-0 left-0 right-0 h-8 z-10 flex items-center justify-center gap-2 opacity-20">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="w-2 h-5 border border-[#D4A853] rounded-sm" />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-[850px] mx-auto" style={{ opacity: 1 }}>
          <p className="about-hero-eyebrow font-jetbrains-mono text-[11px] font-medium uppercase tracking-[0.25em] text-[#D4A853] mb-6">
            About Cinex Universe
          </p>

          <h1 className="about-hero-title font-cinzel text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F0F0F0] leading-[1.05] mb-6">
            The Story
            <br />
            <span className="text-[#D4A853]">Behind the Story</span>
          </h1>

          <p className="about-hero-sub font-inter text-base sm:text-lg text-[#A3A3A3] max-w-[600px] mx-auto leading-relaxed mb-8">
            We did not build Cinex in a boardroom. We built it on film sets, in editing bays, and between takes — because we were tired of watching great stories get buried under spreadsheets.
          </p>

          <div className="about-hero-scroll flex flex-col items-center gap-2 mt-12">
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B]">Scroll to enter</span>
            <div className="w-px h-10 bg-gradient-to-b from-[#D4A853] to-transparent" />
          </div>
        </div>

        {/* Bottom film strip */}
        <div className="absolute bottom-0 left-0 right-0 h-8 z-10 flex items-center justify-center gap-2 opacity-20">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="w-2 h-5 border border-[#D4A853] rounded-sm" />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MANIFESTO — Large Typography
      ═══════════════════════════════════════ */}
      <section ref={manifestoRef} className="py-32 lg:py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(212,168,83,0.03)] blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="space-y-2">
            {manifestoLines.map((line, i) => (
              <p
                key={i}
                className={`manifesto-line font-cinzel ${i === 0 ? 'text-3xl sm:text-4xl lg:text-5xl text-[#F0F0F0]' : i === 3 ? 'text-3xl sm:text-4xl lg:text-5xl text-[#D4A853]' : 'text-2xl sm:text-3xl lg:text-4xl text-[#888888]'} font-bold leading-tight`}
                style={{ opacity: 1 }}
              >
                {line}
              </p>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="w-12 h-px bg-[#D4A853]" />
            <p className="font-jetbrains-mono text-xs text-[#6B6B6B] uppercase tracking-[0.15em]">
              — The Cinex Manifesto, 2023
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCENE 1 — Origin Story (Screenplay Style)
      ═══════════════════════════════════════ */}
      <section ref={sceneRef} className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          {/* Screenplay header */}
          <div className="scene-content mb-10" style={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <Clapperboard className="w-5 h-5 text-[#D4A853]" />
              <span className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853]">Origin Story</span>
            </div>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-lg p-6 sm:p-8 font-mono text-sm">
              <p className="text-[#6B6B6B] mb-2">FADE IN:</p>
              <p className="text-[#888888] mb-4">INT. EDITING BAY — RAMOJI FILM CITY — NIGHT</p>
              <p className="text-[#AAAAAA] leading-relaxed mb-4">
                The room hums with server fans. RAJESH (30s), an assistant director, stares at a laptop screen showing 47 Excel tabs, 3 WhatsApp groups, and a storyboard drawn on a napkin.
              </p>
              <p className="text-[#AAAAAA] leading-relaxed mb-4">
                He flips to another tab. The call sheet is wrong. The location scout sent photos to a different thread. The shot list was last updated three days ago.
              </p>
              <p className="text-[#D4A853] leading-relaxed mb-4">
                RAJESH<br />
                (to himself)<br />
                There has to be a better way.
              </p>
              <p className="text-[#6B6B6B]">CUT TO:</p>
            </div>
          </div>

          <div className="scene-content" style={{ opacity: 1 }}>
            <p className="font-inter text-base sm:text-lg text-[#AAAAAA] leading-relaxed mb-6">
              That night, in an editing bay at Ramoji Film City, the first lines of Cinex Universe were written. Not as a business plan. As a <span className="text-[#F0F0F0]">desperate need</span>.
            </p>
            <p className="font-inter text-base sm:text-lg text-[#AAAAAA] leading-relaxed mb-6">
              We had lost a full shooting day because a call sheet had the wrong location. We had missed a prop because the breakdown was in a PDF nobody opened. We had cast the wrong actor for a scene because the photo references were scattered across three apps.
            </p>
            <p className="font-inter text-base sm:text-lg text-[#AAAAAA] leading-relaxed">
              So we built what we wished we had: <span className="text-[#D4A853]">one unified workspace</span> where scripts become shot lists, shot lists become schedules, and schedules become call sheets — all powered by AI that understands the language of cinema.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALUES — The Four Departments
      ═══════════════════════════════════════ */}
      <section ref={valuesRef} className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">What We Stand For</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-4">The Four Departments</h2>
            <p className="font-inter text-sm text-[#888888]">
              Like a film set, every part of Cinex is organized by purpose. These are the departments that define who we are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="value-card group relative bg-[#0D0D0D] border border-[#242424] rounded-xl p-6 sm:p-8 overflow-hidden"
                style={{ opacity: 1 }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,168,83,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center">
                      <v.icon className="w-5 h-5 text-[#D4A853]" />
                    </div>
                    <span className="font-jetbrains-mono text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em]">{v.subtitle}</span>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] mb-3">{v.title}</h3>
                  <p className="font-inter text-sm text-[#888888] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE ECOSYSTEM — Platform Modules
      ═══════════════════════════════════════ */}
      <section className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#242424] to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#242424] to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">The Ecosystem</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-4">One Workflow. Zero Friction.</h2>
            <p className="font-inter text-sm text-[#888888] max-w-lg mx-auto">
              Every module connects to every other. Change a scene in the script, and the shot list, schedule, and budget update automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Film, label: 'Screenwriting', desc: 'Fountain & Final Draft' },
              { icon: Sparkles, label: 'AI Breakdown', desc: 'Auto-tag everything' },
              { icon: Camera, label: 'Shot Lists', desc: 'Camera-ready specs' },
              { icon: Users, label: 'Casting', desc: 'Talent & agencies' },
              { icon: Award, label: 'Storyboard', desc: 'Frame by frame' },
              { icon: Clapperboard, label: 'Pre-Vis', desc: 'Animatic videos' },
              { icon: Calendar, label: 'Scheduling', desc: 'Drag & drop days' },
              { icon: Heart, label: 'Budget', desc: 'Track every rupee' },
            ].map((mod) => (
              <div
                key={mod.label}
                className="bg-[#0D0D0D] border border-[#242424] rounded-lg p-5 text-center hover:border-[#333333] hover:-translate-y-1 transition-all duration-300"
                style={{ opacity: 1 }}
              >
                <mod.icon className="w-6 h-6 text-[#D4A853] mx-auto mb-3" />
                <p className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] mb-1">{mod.label}</p>
                <p className="font-inter text-[11px] text-[#6B6B6B]">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          THE CREW — Call Sheet Style
      ═══════════════════════════════════════ */}
      <section ref={crewRef} className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">The People</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-4">The Crew</h2>
            <p className="font-inter text-sm text-[#888888]">
              We do not have employees. We have crew members. Each with a role, a call time, and a reason for being on set.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crew.map((member, idx) => (
              <div
                key={member.name}
                className={`crew-card relative bg-[#0D0D0D] border rounded-xl overflow-hidden cursor-default transition-all duration-300 ${activeCrew === idx ? 'border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.1)]' : 'border-[#242424] hover:border-[#333333]'}`}
                style={{ opacity: 1 }}
                onMouseEnter={() => setActiveCrew(idx)}
                onMouseLeave={() => setActiveCrew(null)}
              >
                {/* Call sheet header */}
                <div className="bg-[#111111] border-b border-[#242424] px-5 py-3 flex items-center justify-between">
                  <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.15em] text-[#D4A853]">{member.dept}</span>
                  <span className="font-jetbrains-mono text-[10px] text-[#6B6B6B]">CALL: {member.callTime}</span>
                </div>

                <div className="p-5">
                  <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0] mb-0.5">{member.name}</h3>
                  <p className="font-inter text-xs text-[#D4A853] mb-3">{member.role}</p>

                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-3 h-3 text-[#6B6B6B]" />
                    <span className="font-inter text-[11px] text-[#6B6B6B]">{member.location}</span>
                  </div>

                  <p className={`font-inter text-xs text-[#888888] leading-relaxed transition-all duration-300 ${activeCrew === idx ? 'opacity-100' : 'opacity-70'}`}>
                    {member.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CINEMA BY NUMBERS — Animated Stats
      ═══════════════════════════════════════ */}
      <section ref={statsRef} className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(212,168,83,0.02)] blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">Impact</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0]">Cinema by Numbers</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <FilmCounter target={2000} suffix="+" label="Filmmakers" />
            <FilmCounter target={50} suffix="+" label="Countries" />
            <FilmCounter target={12} suffix="" label="Languages" />
            <FilmCounter target={6} suffix="" label="Regional Industries" />
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: '15,000+', label: 'Projects Created', sub: 'From 30-second shorts to 3-hour epics' },
              { value: '500K+', label: 'Scenes Written', sub: 'In Fountain, Final Draft, and Telugu' },
              { value: '98%', label: 'Satisfaction', sub: 'Filmmakers who renewed their plan' },
            ].map((s) => (
              <div key={s.label} className="text-center border border-[#242424] rounded-xl p-6 bg-[#0D0D0D]" style={{ opacity: 1 }}>
                <p className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-1">{s.value}</p>
                <p className="font-space-grotesk text-sm text-[#D4A853] mb-1">{s.label}</p>
                <p className="font-inter text-[11px] text-[#6B6B6B]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TIMELINE — Film Strip Style
      ═══════════════════════════════════════ */}
      <section ref={timelineRef} className="py-24 lg:py-32 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">Our Journey</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0]">From Script to Screen</h2>
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="hidden lg:block absolute left-[140px] top-0 bottom-0 w-px bg-gradient-to-b from-[#D4A853] via-[#242424] to-transparent" />

            <div className="space-y-10">
              {timeline.map((item) => (
                <div
                  key={item.scene}
                  className="timeline-item relative lg:grid lg:grid-cols-[140px_1fr] lg:gap-8"
                  style={{ opacity: 1 }}
                >
                  {/* Left: Scene & Year */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-1 mb-3 lg:mb-0">
                    <span className="font-jetbrains-mono text-[10px] text-[#6B6B6B] uppercase tracking-[0.15em]">{item.scene}</span>
                    <span className="font-cinzel text-lg font-bold text-[#D4A853]">{item.year}</span>
                  </div>

                  {/* Dot on timeline */}
                  <div className="hidden lg:block absolute left-[140px] top-2 w-3 h-3 rounded-full bg-[#0D0D0D] border-2 border-[#D4A853] -translate-x-1/2 z-10" />

                  {/* Right: Content */}
                  <div className="lg:pl-8 lg:border-l lg:border-[#242424]">
                    <h3 className="font-space-grotesk text-lg font-semibold text-[#F0F0F0] mb-2">{item.title}</h3>
                    <p className="font-inter text-sm text-[#888888] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — Join the Set
      ═══════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="relative py-24 lg:py-32 border-t border-[#1a1a1a] overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,83,0.06) 0%, transparent 60%)',
            }}
          />
        </div>
        <FilmGrain />

        <div className="max-w-2xl mx-auto text-center relative z-10 px-6">
          <div className="cta-inner" style={{ opacity: 1 }}>
            <p className="font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-[#D4A853] mb-4">The Next Scene</p>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-4">
              Your Story Starts Here
            </h2>
            <p className="font-inter text-base text-[#888888] mb-8 max-w-lg mx-auto">
              Every great film began with a single decision. Ours was to build Cinex. Yours could be to use it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
                style={{ boxShadow: '0 0 40px rgba(212,168,83,0.25)', opacity: 1 }}
              >
                Start Creating Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:hello@cinexuniverse.com"
                className="font-inter text-sm text-[#D4A853] hover:underline inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> hello@cinexuniverse.com
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-[#6B6B6B]">
              <span className="font-inter text-xs inline-flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> 50+ Countries
              </span>
              <span className="w-1 h-1 rounded-full bg-[#333333]" />
              <span className="font-inter text-xs inline-flex items-center gap-1.5">
                <Heart className="w-3 h-3" /> Made in India
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
