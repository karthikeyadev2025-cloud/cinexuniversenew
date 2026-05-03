import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Clock, User, Tag, ArrowLeft, Bookmark, Share2,
  Calendar, TrendingUp, Film, PenTool, Music, Camera,
  Sparkles, Heart, Star
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getArticleById, getRelatedArticles } from '../data/blogArticles'

gsap.registerPlugin(ScrollTrigger)

/* ─── Tag Config ─── */
const tagConfig: Record<string, { icon: React.ElementType; color: string }> = {
  Tollywood: { icon: Film, color: '#D4A853' },
  Production: { icon: Camera, color: '#27AE60' },
  Screenwriting: { icon: PenTool, color: '#E67E22' },
  Music: { icon: Music, color: '#9B59B6' },
  'Pre-Production': { icon: Sparkles, color: '#3498DB' },
  AI: { icon: TrendingUp, color: '#E74C3C' },
  Casting: { icon: User, color: '#1ABC9C' },
  Birthday: { icon: Calendar, color: '#D4A853' },
  Release: { icon: Film, color: '#27AE60' },
  Anniversary: { icon: Calendar, color: '#3498DB' },
  Record: { icon: TrendingUp, color: '#E74C3C' },
  Trivia: { icon: Heart, color: '#9B59B6' },
  Awards: { icon: Star, color: '#F39C12' },
  Iconic: { icon: Sparkles, color: '#1ABC9C' },
}

/* ─── Category Badge ─── */
function CatBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    Tollywood: '#D4A853',
    Production: '#27AE60',
    Screenwriting: '#E67E22',
    Music: '#9B59B6',
    'Pre-Production': '#3498DB',
    AI: '#E74C3C',
    Casting: '#1ABC9C',
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
      className="text-[10px] font-jetbrains-mono font-medium px-2.5 py-1 rounded border"
      style={{ color: colors[cat] || '#888', borderColor: (colors[cat] || '#888') + '40', background: (colors[cat] || '#888') + '10' }}
    >
      {cat.toUpperCase()}
    </span>
  )
}

/* ─── Render article content with sections ─── */
function ArticleContent({ content }: { content: string }) {
  // Split by markdown-style headers
  const parts = content.split(/(?=\n#{1,3}\s)/)

  return (
    <div className="space-y-6">
      {parts.map((part, idx) => {
        if (!part.trim()) return null

        // Check if this part starts with a header
        const headerMatch = part.match(/^#{1,3}\s+(.+)\n/)
        if (headerMatch) {
          const level = part.match(/^(#+)/)?.[0].length || 2
          const title = headerMatch[1]
          const body = part.replace(/^#{1,3}\s+.+\n/, '').trim()

          return (
            <div key={idx}>
              {level === 1 && <h2 className="font-space-grotesk text-xl sm:text-2xl font-semibold text-[#F0F0F0] mb-3 mt-8">{title}</h2>}
              {level === 2 && <h3 className="font-space-grotesk text-lg sm:text-xl font-semibold text-[#F0F0F0] mb-3 mt-8">{title}</h3>}
              {level >= 3 && <h4 className="font-space-grotesk text-lg font-semibold text-[#F0F0F0] mb-3 mt-8">{title}</h4>}
              <div className="article-body font-inter text-sm sm:text-base text-[#A3A3A3] leading-[1.8] space-y-4">
                {body.split('\n\n').map((para, pidx) => (
                  <p key={pidx} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#F0F0F0]">$1</strong>') }} />
                ))}
              </div>
            </div>
          )
        }

        // Regular paragraphs
        return (
          <div key={idx} className="article-body font-inter text-sm sm:text-base text-[#A3A3A3] leading-[1.8] space-y-4">
            {part.split('\n\n').map((para, pidx) => (
              <p key={pidx} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#F0F0F0]">$1</strong>') }} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main Component ─── */
export default function BlogArticle() {
  const { id } = useParams<{ id: string }>()
  const article = id ? getArticleById(id) : undefined
  const related = article?.relatedIds ? getRelatedArticles(article.relatedIds) : []
  const contentRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.article-hero-content', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' })
      gsap.fromTo('.article-image', { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out' })
      if (contentRef.current) {
        gsap.fromTo('.article-body-block', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: contentRef.current, start: 'top 85%', once: true } })
      }
      if (relatedRef.current && related.length > 0) {
        gsap.fromTo('.related-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: relatedRef.current, start: 'top 90%', once: true } })
      }
    })
    return () => ctx.revert()
  }, [id])

  if (!article) {
    return (
      <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="font-cinzel text-3xl font-bold text-[#F0F0F0] mb-4">Article Not Found</h1>
          <p className="font-inter text-sm text-[#888888] mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-[#D4A853] font-inter text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const TagIcon = tagConfig[article.tag]?.icon || Tag

  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      {/* ═══════════════════════════════════════
          ARTICLE HERO
      ═══════════════════════════════════════ */}
      <section className="relative pt-28 pb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(212,168,83,0.06) 0%, transparent 50%)' }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="article-hero-content" style={{ opacity: 1 }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <Link to="/blog" className="font-inter text-xs text-[#6B6B6B] hover:text-[#D4A853] transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Blog
              </Link>
              <span className="text-[#333333]">/</span>
              <span className="font-inter text-xs text-[#888888]">{article.tag}</span>
            </div>

            {/* Tag */}
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-4 h-4" style={{ color: tagConfig[article.tag]?.color || '#D4A853' }} />
              <CatBadge cat={article.tag} />
            </div>

            {/* Title */}
            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F0F0F0] leading-tight mb-5">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="font-inter text-base sm:text-lg text-[#A3A3A3] leading-relaxed mb-6 max-w-2xl">
              {article.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-inter">
                <User className="w-3.5 h-3.5" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-inter">
                <Calendar className="w-3.5 h-3.5" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-inter">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED IMAGE
      ═══════════════════════════════════════ */}
      <section className="px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="article-image relative aspect-[16/9] rounded-2xl overflow-hidden" style={{ opacity: 1 }}>
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent opacity-40" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ARTICLE CONTENT
      ═══════════════════════════════════════ */}
      <section ref={contentRef} className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="article-body-block" style={{ opacity: 1 }}>
            <ArticleContent content={article.fullContent} />
          </div>

          {/* Share / Actions */}
          <div className="flex items-center gap-3 pt-8 mt-8 border-t border-[#242424]">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D0D0D] border border-[#242424] text-[#888888] font-inter text-xs hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D0D0D] border border-[#242424] text-[#888888] font-inter text-xs hover:border-[#D4A853] hover:text-[#D4A853] transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          RELATED ARTICLES
      ═══════════════════════════════════════ */}
      {related.length > 0 && (
        <section ref={relatedRef} className="px-6 pb-20 border-t border-[#1a1a1a]">
          <div className="max-w-6xl mx-auto pt-12">
            <h2 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => {
                const RTagIcon = tagConfig[r.tag]?.icon || Tag
                return (
                  <Link
                    to={`/blog/${r.id}`}
                    key={r.id}
                    className="related-card group bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden hover:border-[#333333] hover:-translate-y-1 transition-all duration-300"
                    style={{ opacity: 1 }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-inter font-medium px-2 py-1 rounded-md bg-[#0D0D0D]/80 backdrop-blur-sm border text-[#F0F0F0]" style={{ borderColor: (tagConfig[r.tag]?.color || '#D4A853') + '40' }}>
                          <RTagIcon className="w-3 h-3 inline mr-1" style={{ color: tagConfig[r.tag]?.color || '#D4A853' }} />{r.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] mb-2 group-hover:text-[#D4A853] transition-colors leading-snug line-clamp-2">{r.title}</h3>
                      <p className="font-inter text-xs text-[#888888] leading-relaxed line-clamp-2">{r.excerpt}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CTA — Back to Blog
      ═══════════════════════════════════════ */}
      <section className="px-6 pb-16 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center pt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-[#D4A853] text-[#060606] font-inter text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#E8BF6A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Explore All Articles
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
