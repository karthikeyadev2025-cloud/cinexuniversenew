import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check, Zap, Star, Users, Film, Crown, Building2,
  ArrowRight, HardDrive, Bot, Shield,
} from 'lucide-react'
import { type PlanTier } from '../stores/planStore'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { usePlanStore, formatPrice, formatPriceINR, formatPeriod, formatLimit, ALL_FEATURES } from '../stores/planStore'

const ICON_MAP: Record<string, React.ElementType> = {
  Film, Star, Users, Crown, Building2,
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const { plans, currentUserPlan } = usePlanStore()

  const allPlanIds: PlanTier[] = ['short_film', 'indie', 'studio', 'big_maker', 'legacy']

  const supportLabel = (level: string) => {
    const labels: Record<string, string> = {
      community: 'Community Forum',
      email: 'Priority Email',
      priority: 'Priority Support',
      dedicated: 'Dedicated Manager',
      '24_7': '24/7 Phone + Email',
    }
    return labels[level] || level
  }

  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-3">Flexible Plans for Every Filmmaker</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">From Short Film to Big Budget</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mx-auto mb-8">
            Whether you're a student shooting a 5-minute short or a studio working on a feature film — Cinex scales with you. No hidden fees. Cancel anytime.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#111111] border border-[#242424] rounded-xl p-1">
            <button onClick={() => setAnnual(false)} className={`px-5 py-2.5 rounded-lg text-sm font-inter transition-all ${!annual ? 'bg-[#D4A853] text-[#060606] font-semibold' : 'text-[#888888] hover:text-white'}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-5 py-2.5 rounded-lg text-sm font-inter transition-all ${annual ? 'bg-[#D4A853] text-[#060606] font-semibold' : 'text-[#888888] hover:text-white'}`}>Annual <span className="text-[#D4A853] font-semibold">-20% off</span></button>
          </div>
          {annual && (
            <p className="text-[11px] text-[#555] mt-2">
              You save up to <span className="text-[#D4A853]">$478/year</span> (<span className="text-[#D4A853]">₹39,598/year</span>) with annual billing
            </p>
          )}
        </div>
      </section>

      {/* ─── PLANS GRID ─── */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {allPlanIds.map((id) => {
            const plan = plans.find((p) => p.id === id)!
            const Icon = ICON_MAP[plan.icon] || Zap
            const isCurrent = currentUserPlan === id
            const price = formatPrice(plan.monthlyPrice, plan.annualPrice, annual)
            const priceINR = formatPriceINR(plan.monthlyPriceINR, plan.annualPriceINR, annual)
            const period = formatPeriod(plan.monthlyPrice, annual)

            return (
              <div
                key={id}
                className={`relative rounded-xl p-5 flex flex-col transition-all hover:scale-[1.02] ${
                  plan.featured
                    ? 'bg-[#111111] border-2 border-[#D4A853] shadow-[0_0_24px_rgba(212,168,83,0.12)]'
                    : 'bg-[#0D0D0D] border border-[#242424] hover:border-[#333333]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D4A853] text-[#060606] font-inter text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 right-3 bg-[#27AE60] text-white font-inter text-[9px] font-bold px-2 py-0.5 rounded-full">
                    CURRENT
                  </div>
                )}

                <div className="w-9 h-9 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#D4A853]" />
                </div>

                <h3 className="font-space-grotesk text-sm font-bold text-white">{plan.name}</h3>
                <p className="text-[10px] text-[#888] mb-1">{plan.subtitle}</p>
                <p className="text-[11px] text-[#555] mb-3 leading-relaxed">{plan.description}</p>

                <div className="mb-4">
                  <span className="font-cinzel text-3xl font-bold text-white">{price}</span>
                  <span className="font-inter text-[11px] text-[#888] ml-1">{period}</span>
                  <div className="text-[11px] text-[#D4A853] mt-0.5">{priceINR}</div>
                </div>

                {/* Core Limits */}
                <div className="space-y-1.5 mb-4 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#555] flex items-center gap-1"><Film className="w-3 h-3" /> Projects</span>
                    <span className="text-white font-medium">{formatLimit(plan.maxProjects)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#555] flex items-center gap-1"><Users className="w-3 h-3" /> Team</span>
                    <span className="text-white font-medium">{formatLimit(plan.maxTeamSeats)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#555] flex items-center gap-1"><HardDrive className="w-3 h-3" /> Storage</span>
                    <span className="text-white font-medium">{formatLimit(plan.maxStorageGB)} GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#555] flex items-center gap-1"><Bot className="w-3 h-3" /> AI Uses</span>
                    <span className="text-white font-medium">{formatLimit(plan.aiGenerationsPerMonth)}/mo</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#242424] mb-3" />

                {/* Features */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {ALL_FEATURES.map((feat) => {
                    const hasAccess = plan.features.includes(feat.id)
                    return (
                      <li key={feat.id} className={`flex items-start gap-1.5 ${hasAccess ? '' : 'opacity-25'}`}>
                        <Check className={`w-3 h-3 flex-shrink-0 mt-0.5 ${hasAccess ? 'text-[#27AE60]' : 'text-[#333]'}`} />
                        <span className={`text-[10px] ${hasAccess ? 'text-[#CCCCCC]' : 'text-[#555]'}`}>{feat.name}</span>
                      </li>
                    )
                  })}
                </ul>

                {/* Extras */}
                <div className="space-y-1 mb-4 text-[10px]">
                  <div className="flex items-center gap-1 text-[#888]">
                    <Shield className="w-3 h-3" />
                    <span>{supportLabel(plan.supportLevel)}</span>
                  </div>
                  {plan.hasWhiteLabel && <div className="text-[#D4A853]">✦ White-label exports</div>}
                  {plan.hasApiAccess && <div className="text-[#D4A853]">✦ API access included</div>}
                  {plan.hasSso && <div className="text-[#D4A853]">✦ SSO & SAML</div>}
                  {plan.hasSlas && <div className="text-[#D4A853]">✦ SLA guarantee</div>}
                  {plan.hasOnPremise && <div className="text-[#D4A853]">✦ On-premise option</div>}
                </div>

                <Link
                  to="/register"
                  className={`block text-center py-2.5 rounded-lg font-inter text-xs font-semibold transition-all ${
                    plan.featured
                      ? 'bg-[#D4A853] text-[#060606] hover:bg-[#c49a48]'
                      : 'bg-[#1a1a1a] border border-[#333333] text-white hover:border-[#D4A853]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-12 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-space-grotesk text-2xl font-semibold text-white text-center mb-8">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#242424]">
                  <th className="text-left py-2.5 pr-4 font-inter text-[#888] sticky left-0 bg-[#060606]">Feature</th>
                  {allPlanIds.map((id) => {
                    const p = plans.find((pl) => pl.id === id)!
                    return (
                      <th key={id} className={`text-center py-2.5 px-3 font-inter ${p.featured ? 'text-[#D4A853]' : 'text-[#888]'}`}>
                        <div className="text-[11px] font-semibold">{p.shortName}</div>
                        <div className="text-[10px] text-[#555]">{formatPrice(p.monthlyPrice, p.annualPrice, false)}/mo</div>
                        <div className="text-[10px] text-[#D4A853]">₹{p.monthlyPriceINR.toLocaleString('en-IN')}/mo</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Category: Pre-Production */}
                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <td colSpan={6} className="py-1.5 px-3 text-[10px] uppercase text-[#D4A853] font-semibold tracking-wider">Pre-Production</td>
                </tr>
                {ALL_FEATURES.filter((f) => f.category === 'pre').map((feat) => (
                  <tr key={feat.id} className="border-b border-[#1a1a1a]">
                    <td className="py-2 pr-4 font-inter text-[#CCCCCC] sticky left-0 bg-[#060606]">{feat.name}</td>
                    {allPlanIds.map((id) => {
                      const p = plans.find((pl) => pl.id === id)!
                      const has = p.features.includes(feat.id)
                      return (
                        <td key={id} className="text-center py-2 px-3">
                          {has ? <Check className="w-3.5 h-3.5 text-[#27AE60] mx-auto" /> : <span className="text-[#333]">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Category: AI Tools */}
                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <td colSpan={6} className="py-1.5 px-3 text-[10px] uppercase text-[#D4A853] font-semibold tracking-wider">AI Tools</td>
                </tr>
                {ALL_FEATURES.filter((f) => f.category === 'ai').map((feat) => (
                  <tr key={feat.id} className="border-b border-[#1a1a1a]">
                    <td className="py-2 pr-4 font-inter text-[#CCCCCC] sticky left-0 bg-[#060606]">{feat.name}</td>
                    {allPlanIds.map((id) => {
                      const p = plans.find((pl) => pl.id === id)!
                      const has = p.features.includes(feat.id)
                      return (
                        <td key={id} className="text-center py-2 px-3">
                          {has ? <Check className="w-3.5 h-3.5 text-[#27AE60] mx-auto" /> : <span className="text-[#333]">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Category: Collaboration */}
                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <td colSpan={6} className="py-1.5 px-3 text-[10px] uppercase text-[#D4A853] font-semibold tracking-wider">Collaboration</td>
                </tr>
                {ALL_FEATURES.filter((f) => f.category === 'collab').map((feat) => (
                  <tr key={feat.id} className="border-b border-[#1a1a1a]">
                    <td className="py-2 pr-4 font-inter text-[#CCCCCC] sticky left-0 bg-[#060606]">{feat.name}</td>
                    {allPlanIds.map((id) => {
                      const p = plans.find((pl) => pl.id === id)!
                      const has = p.features.includes(feat.id)
                      return (
                        <td key={id} className="text-center py-2 px-3">
                          {has ? <Check className="w-3.5 h-3.5 text-[#27AE60] mx-auto" /> : <span className="text-[#333]">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Category: Post Production */}
                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <td colSpan={6} className="py-1.5 px-3 text-[10px] uppercase text-[#D4A853] font-semibold tracking-wider">Post Production</td>
                </tr>
                {ALL_FEATURES.filter((f) => f.category === 'post').map((feat) => (
                  <tr key={feat.id} className="border-b border-[#1a1a1a]">
                    <td className="py-2 pr-4 font-inter text-[#CCCCCC] sticky left-0 bg-[#060606]">{feat.name}</td>
                    {allPlanIds.map((id) => {
                      const p = plans.find((pl) => pl.id === id)!
                      const has = p.features.includes(feat.id)
                      return (
                        <td key={id} className="text-center py-2 px-3">
                          {has ? <Check className="w-3.5 h-3.5 text-[#27AE60] mx-auto" /> : <span className="text-[#333]">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Limits Row */}
                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                  <td colSpan={6} className="py-1.5 px-3 text-[10px] uppercase text-[#D4A853] font-semibold tracking-wider">Limits</td>
                </tr>
                {[
                  { label: 'Projects', key: 'maxProjects' },
                  { label: 'Team Seats', key: 'maxTeamSeats' },
                  { label: 'Storage (GB)', key: 'maxStorageGB' },
                  { label: 'AI Generations/mo', key: 'aiGenerationsPerMonth' },
                  { label: 'Casting Calls', key: 'maxCastingCalls' },
                ].map((row) => (
                  <tr key={row.key} className="border-b border-[#1a1a1a]">
                    <td className="py-2 pr-4 font-inter text-[#CCCCCC] sticky left-0 bg-[#060606]">{row.label}</td>
                    {allPlanIds.map((id) => {
                      const p = plans.find((pl) => pl.id === id)!
                      const val = (p as any)[row.key] as number
                      return (
                        <td key={id} className="text-center py-2 px-3 font-medium text-white">
                          {formatLimit(val)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section className="py-12 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-space-grotesk text-2xl font-semibold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade instantly. Annual plan changes are prorated. You never lose your projects.' },
              { q: 'Is there a free trial for paid plans?', a: 'Every paid plan includes a 14-day free trial with full access. No credit card needed to start.' },
              { q: 'What happens to my projects if I cancel?', a: 'Projects stay accessible in read-only mode. You can always export everything before leaving.' },
              { q: 'Do students get discounts?', a: 'Yes — verified students and educators get 50% off Indie and Studio plans with a .edu email.' },
              { q: 'What is "AI generation" exactly?', a: 'Each AI generation is one action: a storyboard frame, a pre-viz video segment, a script analysis, or a casting match. Unused generations do not roll over.' },
              { q: 'Can I pay annually and save?', a: 'Yes — annual billing saves 20% on all paid plans. You are billed once per year.' },
              { q: 'Is my data secure?', a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We run on AWS with SOC 2 compliance.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-4 hover:border-[#333333] transition-all">
                <h3 className="font-space-grotesk text-sm font-medium text-white mb-1.5">{faq.q}</h3>
                <p className="font-inter text-xs text-[#888] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-12 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-space-grotesk text-xl font-semibold text-white mb-3">Still deciding?</h2>
          <p className="font-inter text-xs text-[#888] mb-5">Start with the Short Film plan — it's free forever. Upgrade when you need more.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-[#D4A853] text-[#060606] px-6 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
