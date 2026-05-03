/* ─────────────────────────────────────────────
   featureToggleStore.ts — Feature Toggle System
   Enable/disable any Cinex feature. Disabled
   features show "Coming Soon" automatically.
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FeatureCategory =
  | 'pre_production'
  | 'ai_tools'
  | 'collaboration'
  | 'post_production'
  | 'admin'
  | 'integration'

export interface FeatureDef {
  id: string
  name: string
  category: FeatureCategory
  description: string
  enabled: boolean
  path: string
  icon: string
  requiresBackend: boolean
  aiCategory?: 'llm' | 'image' | 'video' | 'voice' | 'music'
}

const defaultFeatures: FeatureDef[] = [
  /* Pre-Production */
  { id: 'screenwriting', name: 'Screenwriting', category: 'pre_production', description: 'AI-powered script writing & formatting', enabled: true, path: '/screenwriting', icon: 'PenTool', requiresBackend: false, aiCategory: 'llm' },
  { id: 'script_breakdown', name: 'Script Breakdown', category: 'pre_production', description: 'Auto-tag elements, props, cast, locations', enabled: true, path: '/script-breakdown', icon: 'Scissors', requiresBackend: false, aiCategory: 'llm' },
  { id: 'shot_list', name: 'Shot List', category: 'pre_production', description: 'Generate shot lists from scenes', enabled: true, path: '/shot-list', icon: 'Camera', requiresBackend: false },
  { id: 'storyboarding', name: 'Storyboarding', category: 'pre_production', description: 'AI storyboard generation from text', enabled: true, path: '/storyboarding', icon: 'LayoutGrid', requiresBackend: false, aiCategory: 'image' },
  { id: 'scheduling', name: 'Scheduling', category: 'pre_production', description: 'Shoot day scheduling & timeline', enabled: true, path: '/scheduling', icon: 'Calendar', requiresBackend: false },
  { id: 'call_sheets', name: 'Call Sheets', category: 'pre_production', description: 'Automated call sheet generation', enabled: true, path: '/call-sheets', icon: 'PhoneCall', requiresBackend: false },
  { id: 'budgeting', name: 'Budgeting', category: 'pre_production', description: 'Budget tracking & cost estimation', enabled: true, path: '/budgeting', icon: 'DollarSign', requiresBackend: false },

  /* AI Tools */
  { id: 'pre_visualization', name: 'Pre-Visualization', category: 'ai_tools', description: 'AI video generation for pre-viz, animatics, and motion tests', enabled: true, path: '/pre-visualization', icon: 'Film', requiresBackend: true, aiCategory: 'video' },
  { id: 'script_doctor', name: 'AI Script Doctor', category: 'ai_tools', description: 'Analyze scripts for pacing, structure, dialogue issues', enabled: false, path: '/script-doctor', icon: 'Stethoscope', requiresBackend: true, aiCategory: 'llm' },
  { id: 'beat_boards', name: 'Beat Boards', category: 'ai_tools', description: 'Digital index cards with drag-drop scene reordering', enabled: false, path: '/beat-boards', icon: 'LayoutGrid', requiresBackend: false },
  { id: 'location_scout', name: 'Location Scout AI', category: 'ai_tools', description: 'Search locations with permits, weather, logistics', enabled: false, path: '/location-scout', icon: 'MapPin', requiresBackend: true, aiCategory: 'llm' },
  { id: 'scene_treatment', name: 'Scene Treatment', category: 'ai_tools', description: 'Generate treatments in 6 genres: drama, action, romance, thriller, comedy, horror', enabled: false, path: '/scene-treatment', icon: 'FileText', requiresBackend: true, aiCategory: 'llm' },
  { id: 'ai_voice_over', name: 'AI Voice Over', category: 'ai_tools', description: 'Generate narration, temp dialogue, scratch tracks', enabled: false, path: '/voice-over', icon: 'Mic', requiresBackend: true, aiCategory: 'voice' },
  { id: 'ai_music', name: 'AI Music Score', category: 'ai_tools', description: 'Generate temp scores & mood music', enabled: false, path: '/music-score', icon: 'Music', requiresBackend: true, aiCategory: 'music' },
  { id: 'casting_ai', name: 'AI Casting Assistant', category: 'ai_tools', description: 'Match actors to roles using AI analysis', enabled: false, path: '/casting-ai', icon: 'Users', requiresBackend: true, aiCategory: 'llm' },
  { id: 'lookbook', name: 'AI Lookbook', category: 'ai_tools', description: 'Generate mood boards, costume & set references', enabled: false, path: '/lookbook', icon: 'Image', requiresBackend: true, aiCategory: 'image' },
  { id: 'subtitle_ai', name: 'AI Subtitle Gen', category: 'ai_tools', description: 'Auto-generate subtitles in 12 languages', enabled: false, path: '/subtitles', icon: 'Subtitles', requiresBackend: true, aiCategory: 'llm' },

  /* Collaboration */
  { id: 'team_chat', name: 'Team Chat', category: 'collaboration', description: 'Real-time team messaging', enabled: false, path: '/team-chat', icon: 'MessageCircle', requiresBackend: true },
  { id: 'reviews', name: 'Reviews & Approval', category: 'collaboration', description: 'Client review, comments, version compare', enabled: false, path: '/reviews', icon: 'CheckCircle', requiresBackend: true },
  { id: 'casting_directory', name: 'Casting Directory', category: 'collaboration', description: 'Actor profiles, casting calls, auditions', enabled: true, path: '/casting-directory', icon: 'Users', requiresBackend: false },
  { id: 'casting_agencies', name: 'Casting Agencies', category: 'collaboration', description: 'Director registration, agency approval workflow', enabled: true, path: '/casting-agencies', icon: 'Building2', requiresBackend: false },

  /* Post Production */
  { id: 'dailies', name: 'Dailies Viewer', category: 'post_production', description: 'Review footage with notes & markers', enabled: false, path: '/dailies', icon: 'Play', requiresBackend: true },
  { id: 'color_ai', name: 'AI Color Grading', category: 'post_production', description: 'Auto color grade with LUT suggestions', enabled: false, path: '/color-grade', icon: 'Palette', requiresBackend: true, aiCategory: 'image' },
  { id: 'vfx_ai', name: 'AI VFX Helper', category: 'post_production', description: 'Green screen, rotoscoping, cleanup suggestions', enabled: false, path: '/vfx-helper', icon: 'Wand2', requiresBackend: true, aiCategory: 'image' },

  /* Admin / Integration */
  { id: 'api_manager', name: 'API Manager', category: 'admin', description: 'Configure AI provider keys & usage caps', enabled: true, path: '/admin/api-manager', icon: 'Cpu', requiresBackend: false },
  { id: 'feature_toggles', name: 'Feature Toggles', category: 'admin', description: 'Enable/disable platform features', enabled: true, path: '/admin/feature-toggles', icon: 'ToggleLeft', requiresBackend: false },
  { id: 'feature_models', name: 'Feature Models', category: 'admin', description: 'Assign AI models per feature', enabled: true, path: '/admin/feature-models', icon: 'Sliders', requiresBackend: false },
  { id: 'plans', name: 'Plans & Pricing', category: 'admin', description: 'Manage subscription tiers', enabled: true, path: '/admin/plans', icon: 'CreditCard', requiresBackend: false },
  { id: 'users', name: 'User Management', category: 'admin', description: 'Manage users, roles, bans', enabled: true, path: '/admin/users', icon: 'Users', requiresBackend: true },
  { id: 'analytics', name: 'Analytics', category: 'admin', description: 'Usage analytics & reports', enabled: true, path: '/admin/analytics', icon: 'BarChart3', requiresBackend: true },
]

interface FeatureToggleState {
  features: FeatureDef[]
  isEnabled: (id: string) => boolean
  getFeature: (id: string) => FeatureDef | undefined
  getFeaturesByCategory: (cat: FeatureCategory) => FeatureDef[]
  toggle: (id: string) => void
  enable: (id: string) => void
  disable: (id: string) => void
  enableAll: (category?: FeatureCategory) => void
  disableAll: (category?: FeatureCategory) => void
  reset: () => void
}

export const useFeatureToggleStore = create<FeatureToggleState>()(
  persist(
    (set, get) => ({
      features: defaultFeatures,

      isEnabled: (id) => get().features.find((f) => f.id === id)?.enabled ?? false,
      getFeature: (id) => get().features.find((f) => f.id === id),
      getFeaturesByCategory: (cat) => get().features.filter((f) => f.category === cat),

      toggle: (id) =>
        set((s) => ({
          features: s.features.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        })),

      enable: (id) =>
        set((s) => ({
          features: s.features.map((f) => (f.id === id ? { ...f, enabled: true } : f)),
        })),

      disable: (id) =>
        set((s) => ({
          features: s.features.map((f) => (f.id === id ? { ...f, enabled: false } : f)),
        })),

      enableAll: (category) =>
        set((s) => ({
          features: s.features.map((f) =>
            (!category || f.category === category) && !f.id.startsWith('api_') && !f.id.startsWith('feature_') && !f.id.startsWith('plans') && !f.id.startsWith('users') && !f.id.startsWith('analytics')
              ? { ...f, enabled: true }
              : f
          ),
        })),

      disableAll: (category) =>
        set((s) => ({
          features: s.features.map((f) =>
            (!category || f.category === category) && !f.id.startsWith('api_') && !f.id.startsWith('feature_') && !f.id.startsWith('plans') && !f.id.startsWith('users') && !f.id.startsWith('analytics')
              ? { ...f, enabled: false }
              : f
          ),
        })),

      reset: () => set({ features: defaultFeatures }),
    }),
    { name: 'cinex-feature-toggles', version: 2 }
  )
)
