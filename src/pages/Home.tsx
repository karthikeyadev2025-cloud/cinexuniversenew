import { useRef, useEffect, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  PenTool, Camera, Users, LayoutGrid, Film, Calendar,
  Play, Check, Star, ArrowRight, FileText, Scissors, Clapperboard, Monitor,
  X
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

/* ─── Canvas Particles (isolated, memoized) ─── */
const CanvasParticles = memo(function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    interface Particle {
      x: number
      y: number
      size: number
      speedY: number
      speedX: number
      opacity: number
      maxOpacity: number
    }

    const particles: Particle[] = []
    const count = 120

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedY: -Math.random() * 0.4 - 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random(),
        maxOpacity: Math.random() * 0.6 + 0.2,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Volumetric light cone from bottom-center
      const gradient = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.8)
      gradient.addColorStop(0, 'rgba(212,168,83,0.04)')
      gradient.addColorStop(0.5, 'rgba(212,168,83,0.01)')
      gradient.addColorStop(1, 'rgba(212,168,83,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      // Particles
      particles.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.1
        p.opacity += (Math.random() - 0.5) * 0.02
        p.opacity = Math.max(0.1, Math.min(p.maxOpacity, p.opacity))

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,83,${p.opacity})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  )
})

/* ─── Features Data ─── */
const features = [
  {
    icon: PenTool,
    image: '/feature-screenwriting.jpg',
    title: 'AI Screenwriting',
    desc: 'Write in Fountain or Final Draft format with intelligent auto-formatting, scene suggestions, and Telugu script support.',
  },
  {
    icon: Camera,
    image: '/feature-shot-division.jpg',
    title: 'AI Shot Division',
    desc: 'Automatically generate detailed shot lists with camera angles, movement, lenses, and duration — all from your script.',
  },
  {
    icon: Users,
    image: '/feature-cast-mapping.jpg',
    title: 'Cast Photo Mapping',
    desc: 'Upload cast photos and map them to characters. AI maintains face consistency across storyboards.',
  },
  {
    icon: LayoutGrid,
    image: '/feature-storyboard.jpg',
    title: 'AI Storyboarding',
    desc: 'Generate cinematic storyboard frames per shot. Multiple layout options, frame annotations, and PDF export.',
  },
  {
    icon: Film,
    image: '/feature-previs.jpg',
    title: 'Pre-Visualization Video',
    desc: 'Create animatic pre-vis videos from your storyboards with automatic timing and camera movement.',
  },
  {
    icon: Calendar,
    image: '/feature-production.jpg',
    title: 'Production Management',
    desc: 'Scheduling, call sheets, budgeting — all in one place. Auto-sync changes across every module.',
  },
]

/* ─── Stats Data ─── */
const stats = [
  { value: 2000, suffix: '+', label: 'Filmmakers' },
  { value: 15000, suffix: '+', label: 'Projects Created' },
  { value: 500, suffix: 'K+', label: 'Scenes Written' },
  { value: 50, suffix: '+', label: 'Countries' },
]

/* ─── Testimonials Data ─── */
const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Director, Hyderabad',
    quote: 'Cinex Universe cut our pre-production time by 60%. The AI breakdown feature alone saved us weeks of manual tagging.',
    avatar: '/testimonial-1.jpg',
  },
  {
    name: 'Priya Sharma',
    role: 'Cinematographer, Mumbai',
    quote: 'The shot list generator with camera diagrams is brilliant. I can visualize every frame before we step on set.',
    avatar: '/testimonial-2.jpg',
  },
  {
    name: 'Venkatesh Reddy',
    role: 'Producer, Vizag',
    quote: 'Budget tracking and call sheets in one place means no more Excel chaos. My production coordinator actually smiled.',
    avatar: '/testimonial-3.jpg',
  },
  {
    name: 'Ananya Bose',
    role: 'Editor, Kolkata',
    quote: 'Telugu script support was a game-changer for our regional productions. Finally, a tool that understands Indian cinema.',
    avatar: '/testimonial-4.jpg',
  },
]

/* ─── How It Works Data ─── */
const howItWorks = [
  {
    step: '01',
    title: 'Write Your Script',
    desc: 'Import or write in Fountain or Final Draft format. AI suggests scenes, fixes formatting, and supports Telugu scripts.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'AI Breakdown',
    desc: 'Our AI automatically tags every element — cast, props, locations, wardrobe, VFX — color-coded and exportable.',
    icon: Scissors,
  },
  {
    step: '03',
    title: 'Storyboard & Shot List',
    desc: 'Generate storyboard frames and detailed shot lists with camera angles, lens specs, and movement notes.',
    icon: Clapperboard,
  },
  {
    step: '04',
    title: 'Schedule & Budget',
    desc: 'Drag scenes onto shooting days, auto-generate call sheets, and track every rupee across production.',
    icon: Monitor,
  },
]

/* ─── Pricing Data ─── */
const pricingPlans = [
  {
    id: 'short_film', name: 'Short Film', priceMonthly: '$0', priceYearly: '$0',
    priceMonthlyINR: 0, priceYearlyINR: 0,
    featured: false, badge: null,
    features: ['1 Project', 'Basic Screenwriting', 'Shot Lists', '2GB Storage'],
    cta: 'Start Free', ctaStyle: 'secondary' as const,
  },
  {
    id: 'indie', name: 'Indie Filmmaker', priceMonthly: '$19', priceYearly: '$15',
    priceMonthlyINR: 1599, priceYearlyINR: 1279,
    featured: true, badge: 'MOST POPULAR',
    features: ['5 Projects', 'AI Script Breakdown', 'Storyboards', 'Pre-Visualization', 'Scheduling', 'Casting Calls (3)', '20GB Storage', '150 AI Gen/mo', 'Email Support'],
    cta: 'Start 14-Day Trial', ctaStyle: 'primary' as const,
  },
  {
    id: 'studio', name: 'Studio', priceMonthly: '$49', priceYearly: '$39',
    priceMonthlyINR: 3999, priceYearlyINR: 3199,
    featured: false, badge: null,
    features: ['25 Projects', 'AI Script Doctor', 'Location Scout AI', 'Full AI Suite', 'Team Chat (8)', 'Casting Agencies', '100GB Storage', '500 AI Gen/mo', 'Priority Support'],
    cta: 'Start 14-Day Trial', ctaStyle: 'primary' as const,
  },
  {
    id: 'big_maker', name: 'Big Maker', priceMonthly: '$99', priceYearly: '$79',
    priceMonthlyINR: 7999, priceYearlyINR: 6399,
    featured: false, badge: 'UNLIMITED',
    features: ['Unlimited Projects', 'AI Voice & Music', 'VFX AI', 'Color AI', 'Dailies Viewer', 'White-label', 'API Access', '500GB Storage', 'Dedicated Manager'],
    cta: 'Start 14-Day Trial', ctaStyle: 'primary' as const,
  },
  {
    id: 'legacy', name: 'Legacy', priceMonthly: '$199', priceYearly: '$159',
    priceMonthlyINR: 15999, priceYearlyINR: 12799,
    featured: false, badge: 'ENTERPRISE',
    features: ['Everything in Big Maker', 'Custom AI Models', 'On-premise Deploy', 'SSO & SAML', 'SLA Guarantee', 'Unlimited Storage', 'Unlimited AI', '24/7 Phone Support'],
    cta: 'Contact Sales', ctaStyle: 'secondary' as const,
  },
]

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        if (ref.current) {
          if (target >= 1000) {
            ref.current.textContent = Math.floor(obj.val).toLocaleString() + suffix
          } else {
            ref.current.textContent = Math.floor(obj.val) + suffix
          }
        }
      },
    })
  }, [])

  return <span ref={ref} className="tabular-nums">0{suffix}</span>
}

/* ─── Main Home Component ─── */
export default function Home() {
  const [showVideo, setShowVideo] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [billing, _setBilling] = useState<'monthly' | 'yearly'>('monthly')

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Hero scroll fade-out
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          scale: 0.95,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // Hero entrance animations
      gsap.fromTo('.hero-eyebrow',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'expo.out' }
      )
      gsap.fromTo('.hero-headline',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'expo.out' }
      )
      gsap.fromTo('.hero-subheadline',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.8, ease: 'expo.out' }
      )
      gsap.fromTo('.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, delay: 1.0, stagger: 0.1, ease: 'expo.out' }
      )
      gsap.fromTo('.hero-trust',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, delay: 1.2, ease: 'expo.out' }
      )

      // Feature cards — CSS fade-in, no GSAP opacity trap
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll('.feature-card')
        cards.forEach((card) => {
          const el = card as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        })
        // Optional: gentle entrance if scroll trigger fires
        gsap.fromTo('.feature-card',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Stats labels
      if (statsRef.current) {
        gsap.fromTo('.stat-label',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.3, ease: 'expo.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // How it works steps
      if (howItWorksRef.current) {
        gsap.fromTo('.how-step',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'expo.out',
            scrollTrigger: { trigger: howItWorksRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Testimonials
      if (testimonialsRef.current) {
        gsap.fromTo('.testimonial-card',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'expo.out',
            scrollTrigger: { trigger: testimonialsRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Pricing cards
      if (pricingRef.current) {
        gsap.fromTo('.pricing-card',
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'expo.out',
            scrollTrigger: { trigger: pricingRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // CTA section
      if (ctaRef.current) {
        gsap.fromTo('.cta-content',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', once: true }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="bg-[#060606] min-h-[100dvh]">
      <Navbar />

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-film-reel.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[rgba(6,6,6,0.7)] to-[rgba(6,6,6,0.4)]" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </div>

        {/* Particles */}
        <CanvasParticles />

        {/* Content */}
        <div ref={heroContentRef} className="relative z-10 text-center px-6 max-w-[900px] mx-auto">
          <p className="hero-eyebrow font-jetbrains-mono text-xs font-medium uppercase tracking-[0.2em] text-[#D4A853] mb-6" style={{ opacity: 1 }}>
            AI-Powered Film Pre-Production
          </p>

          <h1 className="hero-headline font-cinzel text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F0F0F0] leading-none mb-6" style={{ opacity: 1 }}>
            Where Stories
            <br />
            Become Cinema
          </h1>

          <p className="hero-subheadline font-inter text-base sm:text-lg text-[#A3A3A3] max-w-[640px] mx-auto leading-relaxed mb-8" style={{ opacity: 1 }}>
            From first draft to final call sheet — Cinex Universe gives filmmakers an intelligent workspace for screenwriting, shot planning, scheduling, and budgeting.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-10" style={{ opacity: 1 }}>
            <Link to="/login" className="btn-primary text-base px-8 py-3" style={{ boxShadow: '0 0 40px rgba(212,168,83,0.25)', opacity: 1 }}>
              Start Creating — Free
            </Link>
            <button 
              onClick={() => setShowVideo(true)}
              className="btn-ghost text-base px-6 py-3 flex items-center gap-2" 
              style={{ opacity: 1 }}
            >
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>

          <div className="hero-trust" style={{ opacity: 1 }}>
            <p className="font-inter text-xs text-[#6B6B6B] mb-3">Trusted by 2,000+ filmmakers</p>
            <div className="flex items-center justify-center gap-6 opacity-40">
              {['Studio A', 'FilmCorp', 'CineMax', 'ReelFlow', 'PixelWorks'].map((name) => (
                <span key={name} className="font-cinzel text-sm text-[#F0F0F0] hover:opacity-80 transition-opacity cursor-default">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FILM STRIP TRANSITION ─── */}
      <div className="relative h-16 bg-[#060606] overflow-hidden flex items-center">
        <div className="absolute inset-0 flex items-center">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-8 h-10 border border-[#333333] mx-1 rounded-sm bg-[#0D0D0D]" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-transparent to-[#060606]" />
      </div>

      {/* ─── FEATURES SECTION ─── */}
      <section ref={featuresRef} className="py-24 lg:py-32">
        <div className="container-lg">
          {/* Header */}
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-xs font-medium uppercase tracking-[0.15em] text-[#D4A853] mb-4">
              Intelligent Tools
            </p>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl font-semibold text-[#F0F0F0] mb-4">
              Everything You Need to Plan Your Film
            </h2>
            <p className="font-inter text-base text-[#A3A3A3]">
              Six integrated modules powered by AI. One seamless workflow.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden group"
                style={{ transition: 'all 300ms cubic-bezier(0.25, 1, 0.5, 1)', opacity: 1 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#333333'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#242424'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  />
                </div>
                <div className="p-6">
                  <feature.icon className="w-6 h-6 text-[#D4A853] mb-3" />
                  <h3 className="font-space-grotesk text-lg font-medium text-[#F0F0F0] mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-inter text-sm text-[#A3A3A3] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section ref={statsRef} className="bg-[#0A0A0A] border-y border-[#242424] py-16 lg:py-20">
        <div className="container-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-cinzel text-4xl lg:text-5xl font-bold text-[#D4A853] mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="stat-label font-inter text-sm text-[#6B6B6B]" style={{ opacity: 1 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section ref={howItWorksRef} className="py-24 lg:py-32">
        <div className="container-lg">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-xs font-medium uppercase tracking-[0.15em] text-[#D4A853] mb-4">
              The Workflow
            </p>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl font-semibold text-[#F0F0F0] mb-4">
              From Script to Screen in Four Steps
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[#242424] -translate-x-1/2" />

            <div className="space-y-12 lg:space-y-0">
              {howItWorks.map((step, i) => (
                <div
                  key={step.step}
                  className={`how-step relative lg:grid lg:grid-cols-2 lg:gap-16 ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}
                  style={{ opacity: 1 }}
                >
                  {/* Connector dot */}
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0D0D0D] border-2 border-[#D4A853] z-10 items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                  </div>

                  <div className={`${i % 2 === 1 ? 'lg:col-start-2 lg:text-left' : 'lg:text-right'} text-left`}>
                    <div className={`inline-flex items-start gap-4 ${i % 2 === 1 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-row`}>
                      <div className="w-12 h-12 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-5 h-5 text-[#D4A853]" />
                      </div>
                      <div>
                        <span className="font-jetbrains-mono text-xs text-[#D4A853] mb-1 block">Step {step.step}</span>
                        <h3 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] mb-2">{step.title}</h3>
                        <p className="font-inter text-sm text-[#A3A3A3] leading-relaxed max-w-sm">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className={`hidden lg:block ${i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section ref={testimonialsRef} className="py-24 lg:py-32">
        <div className="container-lg">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-xs font-medium uppercase tracking-[0.15em] text-[#D4A853] mb-4">
              Filmmaker Stories
            </p>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl font-semibold text-[#F0F0F0]">
              Trusted by Creators Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card bg-[#0D0D0D] border border-[#242424] rounded-lg p-6 relative"
                style={{ opacity: 1 }}
              >
                {/* Decorative quote mark */}
                <span className="absolute top-4 left-4 font-cinzel text-5xl text-[#D4A853] opacity-30 leading-none">
                  &ldquo;
                </span>

                <p className="font-inter text-base text-[#F0F0F0] italic leading-relaxed mb-6 relative z-10 pl-4">
                  {t.quote}
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#242424]"
                  />
                  <div className="flex-1">
                    <p className="font-inter text-sm font-semibold text-[#F0F0F0]">{t.name}</p>
                    <p className="font-inter text-xs text-[#6B6B6B]">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#F2C94C] fill-[#F2C94C]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section ref={pricingRef} className="py-24 lg:py-32">
        <div className="container-lg">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <p className="font-jetbrains-mono text-xs font-medium uppercase tracking-[0.15em] text-[#D4A853] mb-4">
              Pricing
            </p>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl font-semibold text-[#F0F0F0] mb-4">
              From Short Film to Big Budget
            </h2>
            <p className="font-inter text-base text-[#A3A3A3] mb-6">
              Built for India. Priced for every filmmaker.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => _setBilling('monthly')} className={`text-sm font-inter px-4 py-2 rounded-lg transition-all ${billing === 'monthly' ? 'bg-[#D4A853] text-[#060606] font-medium' : 'text-[#888888] hover:text-white'}`}>Monthly</button>
              <button onClick={() => _setBilling('yearly')} className={`text-sm font-inter px-4 py-2 rounded-lg transition-all ${billing === 'yearly' ? 'bg-[#D4A853] text-[#060606] font-medium' : 'text-[#888888] hover:text-white'}`}>Yearly <span className="text-[#D4A853]">-20%</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-[1200px] mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`slide-up relative rounded-xl p-5 ${plan.featured ? 'bg-[#111111] border-2 border-[#D4A853] shadow-[0_0_24px_rgba(212,168,83,0.12)]' : 'bg-[#111111] border border-[#2a2a2a]'}`}
                style={{ opacity: 1 }}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D4A853] text-[#060606] font-inter text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="font-space-grotesk text-sm font-semibold text-white mb-0.5">{plan.name}</h3>
                <p className="font-inter text-[10px] text-[#888] mb-3">{billing === 'yearly' ? 'Billed annually (-20%)' : 'Billed monthly'}</p>
                <div className="mb-1">
                  <span className="font-cinzel text-2xl font-bold text-white">{billing === 'monthly' ? plan.priceMonthly : plan.priceYearly}</span>
                  <span className="font-inter text-[11px] text-[#888] ml-1">/mo</span>
                </div>
                <div className="text-[11px] text-[#D4A853] font-medium mb-3">
                  ₹{billing === 'monthly' ? plan.priceMonthlyINR.toLocaleString('en-IN') : plan.priceYearlyINR.toLocaleString('en-IN')}/mo
                </div>
                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[#27AE60] flex-shrink-0" />
                      <span className="font-inter text-[11px] text-[#CCCCCC]">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`w-full text-center block py-2 rounded-lg font-inter text-xs font-semibold transition-all ${plan.ctaStyle === 'primary' ? 'bg-[#D4A853] text-[#060606] hover:bg-[#E8BF6A]' : 'border border-[#333333] text-[#F0F0F0] hover:border-[#D4A853]'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section
        ref={ctaRef}
        className="relative py-24 lg:py-32 border-t border-[#242424] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1200 50%, #0D0D0D 100%)',
        }}
      >
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container-sm relative z-10 text-center">
          <div className="cta-content" style={{ opacity: 1 }}>
            <h2 className="font-space-grotesk text-3xl sm:text-4xl font-semibold text-[#F0F0F0] mb-4">
              Ready to Make Your Next Film?
            </h2>
            <p className="font-inter text-base text-[#A3A3A3] mb-8 max-w-[500px] mx-auto">
              Join 2,000+ filmmakers using Cinex Universe. Start free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn-primary text-base px-8 py-3.5"
                style={{ boxShadow: '0 0 40px rgba(212,168,83,0.25)' }}
              >
                Get Started Free
              </Link>
              <a
                href="#"
                className="font-inter text-sm text-[#D4A853] hover:underline inline-flex items-center gap-1"
              >
                Schedule a Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIDEO MODAL ─── */}
      {showVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-[#0D0D0D] rounded-xl overflow-hidden border border-[#242424]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <video 
              controls 
              autoPlay
              className="w-full h-full"
              poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1280&h=720&fit=crop"
            >
              <source src="https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}
