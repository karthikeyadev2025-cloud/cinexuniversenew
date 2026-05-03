import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import MagicLink from './pages/MagicLink'
import Dashboard from './pages/Dashboard'
import Screenwriting from './pages/Screenwriting'
import ScriptBreakdown from './pages/ScriptBreakdown'
import ShotList from './pages/ShotList'
import Storyboarding from './pages/Storyboarding'
import Scheduling from './pages/Scheduling'
import CallSheets from './pages/CallSheets'
import Budgeting from './pages/Budgeting'
import Admin from './pages/Admin'
import PlansPage from './pages/PlansPage'
import SettingsPage from './pages/SettingsPage'
import Pricing from './pages/Pricing'
import SysAdminLogin from './pages/SysAdminLogin'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogArticle from './pages/BlogArticle'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import Docs from './pages/Docs'
import ApiReference from './pages/ApiReference'
import Tutorials from './pages/Tutorials'
import Community from './pages/Community'
import PreVisualization from './pages/PreVisualization'
import CastingPage from './pages/CastingPage'
import FeatureToggleGuard from './components/FeatureToggleGuard'
import ComingSoon from './components/ComingSoon'
import TalentDashboard from './pages/TalentDashboard'
import CastingDirectorDashboard from './pages/CastingDirectorDashboard'

/* Super Admin */
import ApiManager from './pages/SuperAdmin/ApiManager'
import FeatureToggles from './pages/SuperAdmin/FeatureToggles'
import FeatureModels from './pages/SuperAdmin/FeatureModels'

import AdminGuard from './components/AdminGuard'

/* AI Feature Pages (guarded) */
function GuardedFeature({ featureId, children }: { featureId: string; children: React.ReactNode }) {
  return (
    <FeatureToggleGuard featureId={featureId}>
      <Layout>{children}</Layout>
    </FeatureToggleGuard>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sys/login" element={<SysAdminLogin />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/magic-link" element={<MagicLink />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Casting Landing Page */}
      <Route path="/casting" element={<CastingPage />} />

      {/* Public Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogArticle />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/api-reference" element={<ApiReference />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/community" element={<Community />} />

      {/* User Routes (Filmmaker) */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/screenwriting" element={<Layout><Screenwriting /></Layout>} />
      <Route path="/script-breakdown" element={<Layout><ScriptBreakdown /></Layout>} />
      <Route path="/shot-list" element={<Layout><ShotList /></Layout>} />
      <Route path="/storyboarding" element={<Layout><Storyboarding /></Layout>} />
      <Route path="/scheduling" element={<Layout><Scheduling /></Layout>} />
      <Route path="/call-sheets" element={<Layout><CallSheets /></Layout>} />
      <Route path="/budgeting" element={<Layout><Budgeting /></Layout>} />
      <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      <Route path="/plans" element={<Layout><PlansPage /></Layout>} />

      {/* Casting Routes */}
      <Route path="/casting-dashboard" element={<Layout><CastingDirectorDashboard /></Layout>} />
      <Route path="/auditions" element={<Layout><TalentDashboard /></Layout>} />
      <Route path="/shortlists" element={<Layout><ComingSoon featureName="Shortlists" description="Curate actor shortlists for productions." eta="Q2 2025" /></Layout>} />
      <Route path="/voice-samples" element={<Layout><ComingSoon featureName="Voice Samples" description="Review actor voice samples and demos." eta="Q2 2025" /></Layout>} />

      {/* Super Admin Routes (protected by AdminGuard) */}
      <Route path="/admin" element={<AdminGuard><Layout><Admin /></Layout></AdminGuard>} />
      <Route path="/admin/api-manager" element={<AdminGuard><Layout><ApiManager /></Layout></AdminGuard>} />
      <Route path="/admin/feature-toggles" element={<AdminGuard><Layout><FeatureToggles /></Layout></AdminGuard>} />
      <Route path="/admin/feature-models" element={<AdminGuard><Layout><FeatureModels /></Layout></AdminGuard>} />
      <Route path="/admin/plans" element={<AdminGuard><Layout><Admin /></Layout></AdminGuard>} />
      <Route path="/admin/users" element={<AdminGuard><Layout><Admin /></Layout></AdminGuard>} />
      <Route path="/admin/analytics" element={<AdminGuard><Layout><Admin /></Layout></AdminGuard>} />

      {/* AI Features (guarded by feature toggle) */}
      <Route path="/pre-visualization" element={<GuardedFeature featureId="pre_visualization"><PreVisualization /></GuardedFeature>} />
      <Route path="/script-doctor" element={<GuardedFeature featureId="script_doctor"><ComingSoon featureName="AI Script Doctor" eta="Q2 2025" /></GuardedFeature>} />
      <Route path="/beat-boards" element={<GuardedFeature featureId="beat_boards"><ComingSoon featureName="Beat Boards" eta="Q2 2025" /></GuardedFeature>} />
      <Route path="/location-scout" element={<GuardedFeature featureId="location_scout"><ComingSoon featureName="Location Scout AI" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/scene-treatment" element={<GuardedFeature featureId="scene_treatment"><ComingSoon featureName="Scene Treatment" eta="Q2 2025" /></GuardedFeature>} />
      <Route path="/voice-over" element={<GuardedFeature featureId="ai_voice_over"><ComingSoon featureName="AI Voice Over" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/music-score" element={<GuardedFeature featureId="ai_music"><ComingSoon featureName="AI Music Score" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/casting-ai" element={<GuardedFeature featureId="casting_ai"><ComingSoon featureName="AI Casting Assistant" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/lookbook" element={<GuardedFeature featureId="lookbook"><ComingSoon featureName="AI Lookbook" eta="Q2 2025" /></GuardedFeature>} />
      <Route path="/subtitles" element={<GuardedFeature featureId="subtitle_ai"><ComingSoon featureName="AI Subtitle Gen" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/team-chat" element={<GuardedFeature featureId="team_chat"><ComingSoon featureName="Team Chat" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/reviews" element={<GuardedFeature featureId="reviews"><ComingSoon featureName="Reviews & Approval" eta="Q3 2025" /></GuardedFeature>} />
      <Route path="/casting-directory" element={<GuardedFeature featureId="casting_directory"><TalentDashboard /></GuardedFeature>} />
      <Route path="/casting-agencies" element={<GuardedFeature featureId="casting_agencies"><ComingSoon featureName="Casting Agencies" eta="Q2 2025" /></GuardedFeature>} />
      <Route path="/dailies" element={<GuardedFeature featureId="dailies"><ComingSoon featureName="Dailies Viewer" eta="Q4 2025" /></GuardedFeature>} />
      <Route path="/color-grade" element={<GuardedFeature featureId="color_ai"><ComingSoon featureName="AI Color Grading" eta="Q4 2025" /></GuardedFeature>} />
      <Route path="/vfx-helper" element={<GuardedFeature featureId="vfx_ai"><ComingSoon featureName="AI VFX Helper" eta="Q4 2025" /></GuardedFeature>} />
    </Routes>
  )
}
