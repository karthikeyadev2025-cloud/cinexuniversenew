/* ─────────────────────────────────────────────
   components/FeatureToggleGuard.tsx
   Wrapper that checks if a feature is enabled.
   If disabled → renders ComingSoon.
   If enabled → renders children.
   ───────────────────────────────────────────── */

import { useFeatureToggleStore } from '../stores/featureToggleStore'
import ComingSoon from './ComingSoon'

interface Props {
  featureId: string
  children: React.ReactNode
}

const FEATURE_META: Record<string, { name: string; desc: string; eta: string; icon: string }> = {
  pre_visualization: { name: 'Pre-Visualization', desc: 'AI video generation for pre-viz, animatics, and motion tests.', eta: 'Q2 2025', icon: 'Film' },
  script_doctor: { name: 'AI Script Doctor', desc: 'Analyze scripts for pacing, structure, and dialogue issues.', eta: 'Q2 2025', icon: 'Stethoscope' },
  beat_boards: { name: 'Beat Boards', desc: 'Digital index cards with drag-drop scene reordering.', eta: 'Q2 2025', icon: 'LayoutGrid' },
  location_scout: { name: 'Location Scout AI', desc: 'Search locations with permits, weather, and logistics.', eta: 'Q3 2025', icon: 'MapPin' },
  scene_treatment: { name: 'Scene Treatment', desc: 'Generate treatments in 6 genres.', eta: 'Q2 2025', icon: 'FileText' },
  ai_voice_over: { name: 'AI Voice Over', desc: 'Generate narration and temp dialogue tracks.', eta: 'Q3 2025', icon: 'Mic' },
  ai_music: { name: 'AI Music Score', desc: 'Generate temp scores and mood music.', eta: 'Q3 2025', icon: 'Music' },
  casting_ai: { name: 'AI Casting Assistant', desc: 'Match actors to roles using AI analysis.', eta: 'Q3 2025', icon: 'Users' },
  lookbook: { name: 'AI Lookbook', desc: 'Generate mood boards and costume references.', eta: 'Q2 2025', icon: 'Image' },
  subtitle_ai: { name: 'AI Subtitle Gen', desc: 'Auto-generate subtitles in 12 languages.', eta: 'Q3 2025', icon: 'Subtitles' },
  team_chat: { name: 'Team Chat', desc: 'Real-time team messaging.', eta: 'Q3 2025', icon: 'MessageCircle' },
  reviews: { name: 'Reviews & Approval', desc: 'Client review, comments, version compare.', eta: 'Q3 2025', icon: 'CheckCircle' },
  casting_directory: { name: 'Casting Directory', desc: 'Actor profiles, casting calls, auditions.', eta: 'Q2 2025', icon: 'Users' },
  casting_agencies: { name: 'Casting Agencies', desc: 'Director registration and agency approval.', eta: 'Q2 2025', icon: 'Building2' },
  dailies: { name: 'Dailies Viewer', desc: 'Review footage with notes and markers.', eta: 'Q4 2025', icon: 'Play' },
  color_ai: { name: 'AI Color Grading', desc: 'Auto color grade with LUT suggestions.', eta: 'Q4 2025', icon: 'Palette' },
  vfx_ai: { name: 'AI VFX Helper', desc: 'Green screen, rotoscoping, cleanup.', eta: 'Q4 2025', icon: 'Wand2' },
}

export default function FeatureToggleGuard({ featureId, children }: Props) {
  const isEnabled = useFeatureToggleStore((s) => s.isEnabled(featureId))

  if (isEnabled) {
    return <>{children}</>
  }

  const meta = FEATURE_META[featureId] || {
    name: 'Feature',
    desc: 'This feature is coming soon.',
    eta: '2025',
    icon: 'Rocket',
  }

  return (
    <ComingSoon
      featureName={meta.name}
      description={meta.desc}
      eta={meta.eta}
    />
  )
}
