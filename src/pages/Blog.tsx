import { useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Clock, User, Tag, ArrowRight, Bookmark,
  TrendingUp, Film, PenTool, Music, Camera,
  Mail, Sparkles, Calendar, Flame,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { dailyMoments, type DailyMoment } from '../data/blogData'

gsap.registerPlugin(ScrollTrigger)

/* ─── Helper: Get today's moment ─── */
function getTodayMoment(offset = 0): DailyMoment {
  const base = new Date()
  base.setDate(base.getDate() + offset)
  const mm = String(base.getMonth() + 1).padStart(2, '0')
  const dd = String(base.getDate()).padStart(2, '0')
  const key = `${mm}-${dd}`
  const found = dailyMoments.find((m) => m.date === key)
  if (found) return found
  const start = new Date(base.getFullYear(), 0, 0)
  const diff = base.getTime() - start.getTime()
  const doy = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dailyMoments[doy % dailyMoments.length]
}

/* ─── Featured Articles (static, curated) ─── */
const featuredArticles = [
  {
    id: 'baahubali-to-kalki',
    title: 'From Baahubali to Kalki: How Tollywood Conquered the World',
    excerpt: 'Telugu cinema did not just make films — it built universes. From the waterfall kingdom of Mahishmati to the cyberpunk dystopia of Kashi, Tollywood proved Indian epics can rival Marvel in scale and Shakespeare in emotion.',
    date: 'Jan 18, 2025',
    author: 'Rajesh Kumar',
    readTime: '12 min read',
    tag: 'Tollywood',
    image: '/blog-tollywood-epic.jpg',
    featured: true,
  },
  {
    id: 'ramoji-film-city',
    title: 'Inside Ramoji Film City: Where 800 Films Come to Life',
    excerpt: 'At 1,666 acres, it is the largest film studio complex on Earth. Walk through the London street, the Japanese garden, the ancient temple, and the airport terminal — all within one Hyderabad compound.',
    date: 'Jan 12, 2025',
    author: 'Priya Sharma',
    readTime: '9 min read',
    tag: 'Production',
    image: '/blog-ramoji-city.jpg',
    featured: false,
    trending: true,
  },
  {
    id: 'telugu-screenplay',
    title: 'The Telugu Screenplay: Writing Dialogue That Echoes',
    excerpt: 'Telugu is not just a language on screen — it is a rhythm. From Trivikram Srinivas\' poetic wordplay to Puri Jagannadh\'s raw street dialect, discover how Telugu writers craft dialogue that audiences quote for decades.',
    date: 'Jan 8, 2025',
    author: 'Venkatesh Reddy',
    readTime: '8 min read',
    tag: 'Screenwriting',
    image: '/blog-telugu-script.jpg',
    featured: false,
    trending: false,
  },
  {
    id: 'mass-song',
    title: 'The Art of the Mass Song: Choreographing Tollywood\'s Biggest Numbers',
    excerpt: 'Five hundred dancers. Twenty trucks of flowers. One hero in a lungi. The mass song is not just a musical number — it is a cultural phenomenon. Go behind the scenes of Tollywood\'s most iconic dance sequences.',
    date: 'Jan 4, 2025',
    author: 'Ananya Bose',
    readTime: '7 min read',
    tag: 'Music',
    image: '/blog-dance-sequence.jpg',
    featured: false,
    trending: true,
  },
  {
    id: 'storyboard-epic',
    title: 'From Paper to Screen: Storyboarding the Telugu Epic',
    excerpt: 'How does a director visualize a kingdom before it exists? Meet the storyboard artists behind Tollywood\'s biggest spectacles, and learn how AI tools like Cinex are changing the pre-visualization game.',
    date: 'Dec 28, 2024',
    author: 'Arjun Mehta',
    readTime: '10 min read',
    tag: 'Pre-Production',
    image: '/blog-storyboard.jpg',
    featured: false,
    trending: false,
  },
  {
    id: 'digital-revolution',
    title: 'The Digital Revolution: How AI is Reshaping Telugu Cinema',
    excerpt: 'From AI script breakdown to automated shot lists, Telugu filmmakers are embracing technology without losing their soul. See how modern directors use Cinex to cut pre-production time by 60%.',
    date: 'Dec 22, 2024',
    author: 'Divya Nair',
    readTime: '6 min read',
    tag: 'AI',
    image: '/blog-tollywood-revolution.jpg',
    featured: false,
    trending: false,
  },
  {
    id: 'casting-telugu-hero',
    title: 'Casting the Telugu Hero: Tradition Meets Modernity',
    excerpt: 'The Telugu hero is not just a protagonist — he is a brother, a protector, a dancer, and a warrior. Explore how casting directors find faces that carry the weight of a culture\'s expectations.',
    date: 'Dec 15, 2024',
    author: 'Rajesh Kumar',
    readTime: '8 min read',
    tag: 'Casting',
    image: '/blog-tollywood-epic.jpg',
    featured: false,
    trending: false,
  },
  {
    id: 'pre-production-secrets',
    title: 'Pre-Production Secrets of a Tollywood Blockbuster',
    excerpt: 'What happens before the camera rolls? Location recce in Vizag, costume trials in Chennai, storyboard reviews in Hyderabad. A day-by-day breakdown of how a Telugu blockbuster prepares for its first shot.',
    date: 'Dec 10, 2024',
    author: 'Priya Sharma',
    readTime: '11 min read',
    tag: 'Production',
    image: '/blog-ramoji-city.jpg',
    featured: false,
    trending: false,
  },
  {
    id: 'telugu-music',
    title: 'The Music of Telugu Cinema: Where Beats Drive the Story',
    excerpt: 'Devi Sri Prasad. Thaman. Mickey J Meyer. Telugu music directors do not just compose songs — they compose emotions. Discover how the "item song," the "sad melody," and the "mass anthem" shape a film\'s soul.',
    date: 'Dec 5, 2024',
    author: 'Ananya Bose',
    readTime: '7 min read',
    tag: 'Music',
    image: '/blog-dance-sequence.jpg',
    featured: false,
    trending: false,
  },
]

const allTags = ['All', 'Tollywood', 'Production', 'Screenwriting', 'Music', 'Pre-Production', 'AI', 'Casting']

/* ─── Tag Config ─── */
const tagConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Tollywood: { icon: Film, color: '#D4A853' },
  Production: { icon: Camera, color: '#27AE60' },
  Screenwriting: { icon: PenTool, color: '#E67E22' },
  Music: { icon: Music, color: '#9B59B6' },
  'Pre-Production': { icon: Sparkles, color: '#3498DB' },
  AI: { icon: TrendingUp, color: '#E74C3C' },
  Casting: { icon: User, color: '#1ABC9C' },
}

/* ─── Film Grain ─── */
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

/* ─── Category Badge ─── */
function CatBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    Birthday: '#D4A853',
    Release: '#27AE60',
    Anniversary: '#3498DB',
    Record: '#E74C3C',
    Trivia: '#9B59B6',
    Awards: '#F39C12',
    Iconic: '#1ABC9C',
  }
  return (
    <span
      className="text-[10px] font-jetbrains-mono font-medium px-2 py-0.5 rounded border"
      style={{ color: colors[cat] || '#888', borderColor: (colors[cat] || '#888') + '40', background: (colors[cat] || '#888') + '10' }}
    >
      {cat.toUpperCase()}
    </span>
  )
}

/* ─── Main Component ─── */
export default function Blog() {
  const [activeTag, setActiveTag] = useState('All')
  const [saved, setSaved] = useState<string[]>([])
  const [dayOffset, setDayOffset] = useState(0)
  const featuredRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const newsletterRef = useRef<HTMLDivElement>(null)

  const todayMoment = useMemo(() => getTodayMoment(dayOffset), [dayOffset])

  const filtered = activeTag === 'All'
    ? featuredArticles.filter((p) => !p.featured)
    : featuredArticles.filter((p) => p.tag === activeTag && !p.featured)

  const featured = featuredArticles.find((p) => p.featured)
  const trending = featuredArticles.filter((p) => (p as { trending?: boolean }).trending && !p.featured).slice(0, 3)

  const toggleSave = (id: string) => {
    setSaved((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.blog-hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'expo.out' })
      gsap.fromTo('.blog-hero-title', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.4, ease: 'expo.out' })
      gsap.fromTo('.blog-hero-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.7, ease: 'expo.out' })

      if (featuredRef.current) {
        gsap.fromTo('.featured-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: featuredRef.current, start: 'top 85%', once: true } })
      }
      if (gridRef.current) {
        gsap.fromTo('.blog-card', { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: gridRef.current, start: 'top 85%', once: true } })
      }
      if (newsletterRef.current) {
        gsap.fromTo('.newsletter-content', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', scrollTrigger: { trigger: newsletterRef.current, start: 'top 85%', once: true } })
      }
    })
    return () => ctx.revert()
  }, [activeTag, dayOffset])

  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO — Spotlight on Tollywood
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.06) 0%, transparent 50%)' }} />
        </div>
        <FilmGrain />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="blog-hero-eyebrow font-jetbrains-mono text-[11px] font-medium uppercase tracking-[0.25em] text-[#D4A853] mb-4" style={{ opacity: 1 }}>
            The Cinex Journal
          </p>
          <h1 className="blog-hero-title font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F0F0F0] leading-tight mb-5" style={{ opacity: 1 }}>
            Stories About
            <br />
            <span className="text-[#D4A853]">Cinema</span>
          </h1>
          <p className="blog-hero-sub font-inter text-base sm:text-lg text-[#A3A3A3] max-w-xl mx-auto leading-relaxed" style={{ opacity: 1 }}>
            Deep dives into Tollywood, pre-production craft, and the future of Indian filmmaking. Written by filmmakers, for filmmakers.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          DAILY TOLLYWOOD MOMENT — Auto-Updating
      ═══════════════════════════════════════ */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4A853]" />
              <span className="font-jetbrains-mono text-[11px] uppercase tracking-[0.15em] text-[#D4A853]">Today in Tollywood</span>
              <Flame className="w-3 h-3 text-orange-500" />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDayOffset((d) => d - 1)}
                className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#6B6B6B]" />
              </button>
              <button
                onClick={() => setDayOffset(0)}
                className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853] transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-[#6B6B6B]" />
              </button>
              <button
                onClick={() => setDayOffset((d) => d + 1)}
                className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
              </button>
            </div>
          </div>

          <div className="relative bg-[#0D0D0D] border border-[#242424] rounded-2xl overflow-hidden group" style={{ opacity: 1 }}>
            <Link to={`/blog/${todayMoment.date}`} className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <CatBadge cat={todayMoment.category} />
                  {todayMoment.year && (
                    <span className="font-cinzel text-sm text-[#6B6B6B]">{todayMoment.year}</span>
                  )}
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F0F0F0] mb-3 group-hover:text-[#D4A853] transition-colors leading-snug">
                  {todayMoment.title}
                </h2>
                <p className="font-inter text-sm text-[#A3A3A3] leading-relaxed mb-4">
                  {todayMoment.desc}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B] font-inter">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {dayOffset === 0 ? 'Today' : dayOffset > 0 ? `+${dayOffset} day${dayOffset > 1 ? 's' : ''}` : `${dayOffset} day${Math.abs(dayOffset) > 1 ? 's' : ''}`}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#333333]" />
                  <span>Click to read full story</span>
                </div>
              </div>
              <div className="relative h-48 md:h-auto overflow-hidden">
                <img src={todayMoment.image} alt={todayMoment.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent md:bg-gradient-to-l" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRENDING — Hot Right Now
      ═══════════════════════════════════════ */}
      {trending.length > 0 && (
        <section className="px-6 pb-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-[#D4A853]" />
              <span className="font-jetbrains-mono text-[11px] uppercase tracking-[0.15em] text-[#D4A853]">Trending Now</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trending.map((post) => {
                const TagIcon = tagConfig[post.tag]?.icon || Tag
                return (
                  <Link to={`/blog/${post.id}`} key={post.id} className="group flex items-start gap-4 bg-[#0D0D0D] border border-[#242424] rounded-xl p-4 hover:border-[#333333] transition-all" style={{ opacity: 1 }}>
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#111111]">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <TagIcon className="w-3 h-3" style={{ color: tagConfig[post.tag]?.color || '#D4A853' }} />
                        <span className="text-[10px] font-inter font-medium px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#888888]">{post.tag}</span>
                      </div>
                      <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] leading-snug mb-1 group-hover:text-[#D4A853] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B] font-inter">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-[#333333]" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEATURED POST
      ═══════════════════════════════════════ */}
      {featured && (
        <section ref={featuredRef} className="px-6 pb-14">
          <div className="max-w-6xl mx-auto">
            <div className="featured-card relative bg-[#0D0D0D] border border-[#242424] rounded-2xl overflow-hidden group" style={{ opacity: 1 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto min-h-[320px] overflow-hidden">
                  <img src={featured.image} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0D0D0D]" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-jetbrains-mono font-medium uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-[#D4A853] text-[#060606]">Featured</span>
                  </div>
                </div>
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Film className="w-4 h-4 text-[#D4A853]" />
                    <span className="text-xs font-inter font-medium px-2 py-1 rounded bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20">{featured.tag}</span>
                  </div>
                  <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-4 group-hover:text-[#D4A853] transition-colors leading-snug">{featured.title}</h2>
                  <p className="font-inter text-sm sm:text-base text-[#A3A3A3] leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-inter"><User className="w-3 h-3" /><span>{featured.author}</span></div>
                    <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-inter"><Clock className="w-3 h-3" /><span>{featured.readTime}</span></div>
                    <span className="text-xs text-[#6B6B6B] font-inter">{featured.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to={`/blog/${featured.id}`} className="inline-flex items-center gap-2 bg-[#D4A853] text-[#060606] font-inter text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#E8BF6A] transition-colors">Read Article <ArrowRight className="w-4 h-4" /></Link>
                    <button onClick={() => toggleSave(featured.id)} className="w-10 h-10 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853] transition-colors">
                      <Bookmark className={`w-4 h-4 ${saved.includes(featured.id) ? 'text-[#D4A853] fill-[#D4A853]' : 'text-[#6B6B6B]'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FILTER BAR
      ═══════════════════════════════════════ */}
      <section className="px-6 pb-8 sticky top-[60px] z-30 bg-[#060606]/90 backdrop-blur-lg border-b border-[#1a1a1a] py-4 -mt-4 mb-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Tag className="w-4 h-4 text-[#6B6B6B] mr-1 flex-shrink-0" />
          {allTags.map((tag) => {
            const TagIcon = tagConfig[tag]?.icon || Tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter whitespace-nowrap transition-all ${activeTag === tag ? 'bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/30' : 'bg-[#0D0D0D] text-[#888888] border border-[#242424] hover:border-[#333333]'}`}
              >
                {tag !== 'All' && <TagIcon className="w-3 h-3" />}
                {tag}
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BLOG GRID
      ═══════════════════════════════════════ */}
      <section ref={gridRef} className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-space-grotesk text-lg font-semibold text-[#F0F0F0]">{activeTag === 'All' ? 'All Articles' : `${activeTag} Articles`}</h2>
            <span className="font-inter text-xs text-[#6B6B6B]">{filtered.length} posts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((post) => {
              const TagIcon = tagConfig[post.tag]?.icon || Tag
              const tagColor = tagConfig[post.tag]?.color || '#D4A853'
              return (
                <Link to={`/blog/${post.id}`} key={post.id} className="blog-card group bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden hover:border-[#333333] hover:-translate-y-1 transition-all duration-300" style={{ opacity: 1 }}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-inter font-medium px-2 py-1 rounded-md bg-[#0D0D0D]/80 backdrop-blur-sm border text-[#F0F0F0]" style={{ borderColor: tagColor + '40' }}>
                        <TagIcon className="w-3 h-3 inline mr-1" style={{ color: tagColor }} />{post.tag}
                      </span>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(post.id); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#0D0D0D]/60 backdrop-blur-sm flex items-center justify-center hover:bg-[#0D0D0D]/90 transition-colors">
                      <Bookmark className={`w-3.5 h-3.5 ${saved.includes(post.id) ? 'text-[#D4A853] fill-[#D4A853]' : 'text-[#F0F0F0]'}`} />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0] mb-2 group-hover:text-[#D4A853] transition-colors leading-snug line-clamp-2">{post.title}</h3>
                    <p className="font-inter text-xs text-[#888888] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center"><User className="w-3 h-3 text-[#D4A853]" /></div>
                        <span className="font-inter text-[11px] text-[#6B6B6B]">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B] font-inter"><Clock className="w-3 h-3" /><span>{post.readTime}</span></div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-space-grotesk text-lg text-[#6B6B6B] mb-2">No articles found in this category.</p>
              <button onClick={() => setActiveTag('All')} className="text-[#D4A853] font-inter text-sm hover:underline">View all articles</button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════ */}
      <section ref={newsletterRef} className="relative py-20 px-6 border-t border-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,168,83,0.04) 0%, transparent 60%)' }} />
        </div>
        <FilmGrain />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <div className="newsletter-content" style={{ opacity: 1 }}>
            <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center mx-auto mb-5">
              <Mail className="w-5 h-5 text-[#D4A853]" />
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-3">Stay in the Loop</h2>
            <p className="font-inter text-sm text-[#888888] mb-6 max-w-md mx-auto">
              Get weekly insights on Tollywood, pre-production tips, and new Cinex features delivered to your inbox. No spam, just cinema.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 bg-[#0D0D0D] border border-[#242424] rounded-lg px-4 py-2.5 text-sm font-inter text-[#F0F0F0] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#D4A853]/50 transition-colors" />
              <button className="bg-[#D4A853] text-[#060606] font-inter text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#E8BF6A] transition-colors whitespace-nowrap">Subscribe</button>
            </div>
            <p className="font-inter text-[10px] text-[#555555] mt-3">Join 2,400+ filmmakers reading The Cinex Journal</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
