/* ─────────────────────────────────────────────
   planStore.ts — Subscription Plan Management
   Defines all tiers and their feature access.
   Admin can edit plan prices, names, limits.
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlanTier = 'short_film' | 'indie' | 'studio' | 'big_maker' | 'legacy'

export interface PlanDef {
  id: PlanTier
  name: string
  shortName: string
  subtitle: string
  monthlyPrice: number
  annualPrice: number
  monthlyPriceINR: number
  annualPriceINR: number
  description: string
  cta: string
  featured: boolean
  badge?: string
  icon: string
  /* ─── Hard Limits ─── */
  maxProjects: number          // -1 = unlimited
  maxTeamSeats: number
  maxStorageGB: number
  aiGenerationsPerMonth: number  // -1 = unlimited
  maxScenesPerScript: number
  maxCastingCalls: number
  /* ─── Access Flags ─── */
  features: string[]           // which feature IDs are unlocked
  exportFormats: string[]     // pdf, excel, fdx, api
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated' | '24_7'
  hasWhiteLabel: boolean
  hasApiAccess: boolean
  hasSso: boolean
  hasSlas: boolean
  hasCustomModels: boolean
  hasOnPremise: boolean
}

export const DEFAULT_PLANS: PlanDef[] = [
  /* ─── TIER 1: SHORT FILM (Free) ─── */
  {
    id: 'short_film',
    name: 'Short Film',
    shortName: 'Free',
    subtitle: 'For students & hobbyists',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceINR: 0,
    annualPriceINR: 0,
    description: 'Everything you need to plan your first short film. No credit card required.',
    cta: 'Start Free',
    featured: false,
    icon: 'Film',
    maxProjects: 1,
    maxTeamSeats: 1,
    maxStorageGB: 2,
    aiGenerationsPerMonth: 10,
    maxScenesPerScript: 15,
    maxCastingCalls: 0,
    features: [
      'screenwriting', 'script_breakdown', 'shot_list',
    ],
    exportFormats: ['pdf', 'fountain'],
    supportLevel: 'community',
    hasWhiteLabel: false,
    hasApiAccess: false,
    hasSso: false,
    hasSlas: false,
    hasCustomModels: false,
    hasOnPremise: false,
  },

  /* ─── TIER 2: INDIE ($19/mo) ─── */
  {
    id: 'indie',
    name: 'Indie Filmmaker',
    shortName: 'Indie',
    subtitle: 'For working creators',
    monthlyPrice: 19,
    annualPrice: 182,
    monthlyPriceINR: 1599,
    annualPriceINR: 15350,  // 20% off
    description: 'Full pre-production power for indie films, web series, and commercials.',
    cta: 'Start 14-Day Trial',
    featured: true,
    badge: 'MOST POPULAR',
    icon: 'Star',
    maxProjects: 5,
    maxTeamSeats: 1,
    maxStorageGB: 20,
    aiGenerationsPerMonth: 150,
    maxScenesPerScript: 60,
    maxCastingCalls: 3,
    features: [
      'screenwriting', 'script_breakdown', 'shot_list',
      'storyboarding', 'scheduling', 'call_sheets', 'budgeting',
      'pre_visualization', 'casting_directory', 'beat_boards',
    ],
    exportFormats: ['pdf', 'excel', 'fdx', 'fountain'],
    supportLevel: 'email',
    hasWhiteLabel: false,
    hasApiAccess: false,
    hasSso: false,
    hasSlas: false,
    hasCustomModels: false,
    hasOnPremise: false,
  },

  /* ─── TIER 3: STUDIO ($49/mo) ─── */
  {
    id: 'studio',
    name: 'Studio',
    shortName: 'Studio',
    subtitle: 'For production houses',
    monthlyPrice: 49,
    annualPrice: 470,
    monthlyPriceINR: 3999,
    annualPriceINR: 38390,  // 20% off
    description: 'Team collaboration, AI tools, and casting management for growing studios.',
    cta: 'Start 14-Day Trial',
    featured: false,
    icon: 'Users',
    maxProjects: 25,
    maxTeamSeats: 8,
    maxStorageGB: 100,
    aiGenerationsPerMonth: 500,
    maxScenesPerScript: 200,
    maxCastingCalls: 20,
    features: [
      'screenwriting', 'script_breakdown', 'shot_list',
      'storyboarding', 'scheduling', 'call_sheets', 'budgeting',
      'pre_visualization', 'script_doctor', 'beat_boards',
      'location_scout', 'scene_treatment', 'casting_ai', 'lookbook',
      'team_chat', 'reviews', 'casting_directory', 'casting_agencies',
      'subtitle_ai',
    ],
    exportFormats: ['pdf', 'excel', 'fdx', 'fountain', 'api'],
    supportLevel: 'priority',
    hasWhiteLabel: false,
    hasApiAccess: true,
    hasSso: false,
    hasSlas: false,
    hasCustomModels: false,
    hasOnPremise: false,
  },

  /* ─── TIER 4: BIG MAKER ($99/mo) ─── */
  {
    id: 'big_maker',
    name: 'Big Maker',
    shortName: 'Big Maker',
    subtitle: 'For major studios',
    monthlyPrice: 99,
    annualPrice: 950,
    monthlyPriceINR: 7999,
    annualPriceINR: 76790,  // 20% off
    description: 'Everything for big-budget features, series, and full post-production pipeline.',
    cta: 'Start 14-Day Trial',
    featured: false,
    icon: 'Crown',
    maxProjects: -1,
    maxTeamSeats: -1,
    maxStorageGB: 500,
    aiGenerationsPerMonth: -1,
    maxScenesPerScript: -1,
    maxCastingCalls: -1,
    features: [
      'screenwriting', 'script_breakdown', 'shot_list',
      'storyboarding', 'scheduling', 'call_sheets', 'budgeting',
      'pre_visualization', 'script_doctor', 'beat_boards',
      'location_scout', 'scene_treatment', 'ai_voice_over',
      'ai_music', 'casting_ai', 'lookbook', 'subtitle_ai',
      'team_chat', 'reviews', 'casting_directory', 'casting_agencies',
      'dailies', 'color_ai', 'vfx_ai',
    ],
    exportFormats: ['pdf', 'excel', 'fdx', 'fountain', 'api', 'xml'],
    supportLevel: 'dedicated',
    hasWhiteLabel: true,
    hasApiAccess: true,
    hasSso: true,
    hasSlas: true,
    hasCustomModels: false,
    hasOnPremise: false,
  },

  /* ─── TIER 5: LEGACY (Custom $199/mo+) ─── */
  {
    id: 'legacy',
    name: 'Legacy',
    shortName: 'Legacy',
    subtitle: 'For major studios & franchises',
    monthlyPrice: 199,
    annualPrice: 1910,
    monthlyPriceINR: 15999,
    annualPriceINR: 153590,  // 20% off
    description: 'Custom deployment, model training, and white-glove support for studios at scale.',
    cta: 'Contact Sales',
    featured: false,
    icon: 'Building2',
    maxProjects: -1,
    maxTeamSeats: -1,
    maxStorageGB: -1,
    aiGenerationsPerMonth: -1,
    maxScenesPerScript: -1,
    maxCastingCalls: -1,
    features: [
      'screenwriting', 'script_breakdown', 'shot_list',
      'storyboarding', 'scheduling', 'call_sheets', 'budgeting',
      'pre_visualization', 'script_doctor', 'beat_boards',
      'location_scout', 'scene_treatment', 'ai_voice_over',
      'ai_music', 'casting_ai', 'lookbook', 'subtitle_ai',
      'team_chat', 'reviews', 'casting_directory', 'casting_agencies',
      'dailies', 'color_ai', 'vfx_ai',
    ],
    exportFormats: ['pdf', 'excel', 'fdx', 'fountain', 'api', 'xml', 'custom'],
    supportLevel: '24_7',
    hasWhiteLabel: true,
    hasApiAccess: true,
    hasSso: true,
    hasSlas: true,
    hasCustomModels: true,
    hasOnPremise: true,
  },
]

/* ─── Full feature list with categories for display ─── */
export interface FeatureInfo {
  id: string
  name: string
  category: string
  categoryLabel: string
}

export const ALL_FEATURES: FeatureInfo[] = [
  { id: 'screenwriting', name: 'Screenwriting', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'script_breakdown', name: 'Script Breakdown', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'shot_list', name: 'Shot List', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'storyboarding', name: 'Storyboarding', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'scheduling', name: 'Scheduling', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'call_sheets', name: 'Call Sheets', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'budgeting', name: 'Budgeting', category: 'pre', categoryLabel: 'Pre-Production' },
  { id: 'pre_visualization', name: 'Pre-Visualization', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'script_doctor', name: 'AI Script Doctor', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'beat_boards', name: 'Beat Boards', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'location_scout', name: 'Location Scout AI', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'scene_treatment', name: 'Scene Treatment', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'ai_voice_over', name: 'AI Voice Over', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'ai_music', name: 'AI Music Score', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'casting_ai', name: 'AI Casting Assistant', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'lookbook', name: 'AI Lookbook', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'subtitle_ai', name: 'AI Subtitle Gen', category: 'ai', categoryLabel: 'AI Tools' },
  { id: 'team_chat', name: 'Team Chat', category: 'collab', categoryLabel: 'Collaboration' },
  { id: 'reviews', name: 'Reviews & Approval', category: 'collab', categoryLabel: 'Collaboration' },
  { id: 'casting_directory', name: 'Casting Directory', category: 'collab', categoryLabel: 'Collaboration' },
  { id: 'casting_agencies', name: 'Casting Agencies', category: 'collab', categoryLabel: 'Collaboration' },
  { id: 'dailies', name: 'Dailies Viewer', category: 'post', categoryLabel: 'Post Production' },
  { id: 'color_ai', name: 'AI Color Grading', category: 'post', categoryLabel: 'Post Production' },
  { id: 'vfx_ai', name: 'AI VFX Helper', category: 'post', categoryLabel: 'Post Production' },
]

/* ─── Store Interface ─── */
interface PlanStore {
  plans: PlanDef[]
  editingPlan: PlanDef | null
  currentUserPlan: PlanTier
  /* ─── Queries ─── */
  getPlan: (id: PlanTier) => PlanDef | undefined
  getUserPlan: () => PlanDef
  planHasFeature: (planId: PlanTier, featureId: string) => boolean
  /* ─── Admin Actions ─── */
  updatePlan: (id: PlanTier, updates: Partial<PlanDef>) => void
  updateFeatureList: (id: PlanTier, featureId: string, add: boolean) => void
  setEditingPlan: (plan: PlanDef | null) => void
  setCurrentUserPlan: (id: PlanTier) => void
  /* ─── Reset ─── */
  resetPlans: () => void
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      editingPlan: null,
      currentUserPlan: 'short_film',

      getPlan: (id) => get().plans.find((p) => p.id === id),
      getUserPlan: () => get().plans.find((p) => p.id === get().currentUserPlan) || DEFAULT_PLANS[0],
      planHasFeature: (planId, featureId) => {
        const plan = get().plans.find((p) => p.id === planId)
        return plan?.features.includes(featureId) ?? false
      },

      updatePlan: (id, updates) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      updateFeatureList: (id, featureId, add) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === id
              ? {
                  ...p,
                  features: add
                    ? [...new Set([...p.features, featureId])]
                    : p.features.filter((f) => f !== featureId),
                }
              : p
          ),
        })),

      setEditingPlan: (plan) => set({ editingPlan: plan }),
      setCurrentUserPlan: (id) => set({ currentUserPlan: id }),
      resetPlans: () => set({ plans: DEFAULT_PLANS }),
    }),
    { name: 'cinex-plans-v1' }
  )
)

/* ─── Helpers ─── */
export function formatPrice(monthly: number, annual: number, isAnnual: boolean): string {
  if (monthly === 0) return 'Free'
  const price = isAnnual ? Math.round(annual / 12) : monthly
  return `$${price}`
}

export function formatPriceINR(monthlyINR: number, annualINR: number, isAnnual: boolean): string {
  if (monthlyINR === 0) return 'Free'
  const price = isAnnual ? Math.round(annualINR / 12) : monthlyINR
  return `₹${price.toLocaleString('en-IN')}`
}

export function formatPeriod(monthly: number, isAnnual: boolean): string {
  if (monthly === 0) return 'forever'
  return isAnnual ? '/month billed annually' : '/month'
}

export function formatLimit(value: number): string {
  if (value === -1) return 'Unlimited'
  if (value === 0) return '—'
  return value.toLocaleString()
}
