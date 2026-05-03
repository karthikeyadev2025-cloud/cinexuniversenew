import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ═══════════════════════════════════════════
   CASTING STORE — Three-Entity Model
   Cinex (Super Admin) maintains:
     - Casting Directors (agencies)
     - Actors (directly registered)
   Casting Directors maintain:
     - Their own Crew/Actors
   ═══════════════════════════════════════════ */

export type UserRole = 'user' | 'casting_director' | 'admin'

export interface CastingDirector {
  id: string
  name: string
  email: string
  agencyName: string
  phone: string
  location: string
  bio: string
  agencyLogo?: string
  status: 'active' | 'pending' | 'suspended' | 'rejected'
  joinedAt: string
  subscriptionTier?: 'free' | 'silver' | 'gold' | 'platinum'
  talentCount: number
  callCount: number
  maxTalent: number
  maxCalls: number
  commissionRate: number
  verified: boolean
  createdBy: 'cinex' | 'self'
  rating: number
}

export interface TalentProfile {
  id: string
  name: string
  email: string
  phone?: string
  whatsapp?: string
  role: string
  status: 'available' | 'booked' | 'unavailable' | 'pending'
  headshotUrl: string
  photos: TalentPhoto[]
  location: string
  age?: number
  height?: string
  weight?: string
  languages: string[]
  skills: string[]
  experience: string
  bio: string
  socialLinks: Record<string, string>
  addedBy: string // castingDirector.id or 'cinex'
  addedByName: string
  agencyId?: string
  verified: boolean
  portfolioVideo?: string
  resumeUrl?: string
  videos: TalentVideo[]
  voiceRecordings: TalentVoice[]
}

export interface TalentVideo {
  id: string
  url: string
  caption: string
  type: 'showreel' | 'audition' | 'intro' | 'behind_scenes'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
}

export interface TalentVoice {
  id: string
  url: string
  caption: string
  language: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
}

export interface TalentPhoto {
  id: string
  url: string
  caption: string
  category: 'headshot' | 'portfolio' | 'audition' | 'behind_scenes'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface CastingRole {
  id: string
  name: string
  type: 'lead' | 'supporting' | 'extra' | 'voice' | 'dance' | 'child'
  ageRange: string
  gender: 'male' | 'female' | 'any'
  description: string
  requiredSkills: string[]
  filled: boolean
}

export interface CastingCall {
  id: string
  title: string
  projectName: string
  directorId: string
  directorName: string
  directorAgency?: string
  roles: CastingRole[]
  location: string
  shootDates: string
  deadline: string
  status: 'open' | 'closed' | 'filled'
  description: string
  compensation: string
  createdAt: string
  submissions: number
}

export interface AuditionSubmission {
  id: string
  castingCallId: string
  roleId: string
  talentId: string
  talentName: string
  talentAgency?: string
  message: string
  status: 'pending' | 'shortlisted' | 'rejected' | 'selected'
  submittedAt: string
  photos: string[]
  videoUrl?: string
  notes?: string
}

/* ─── Default Photos ─── */
const defaultPhotos = (base: string): TalentPhoto[] => [
  { id: `${base}-p1`, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop', caption: 'Headshot', category: 'headshot', status: 'approved', uploadedAt: '2024-01-15' },
  { id: `${base}-p2`, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', caption: 'Portfolio 1', category: 'portfolio', status: 'approved', uploadedAt: '2024-02-01' },
  { id: `${base}-p3`, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop', caption: 'Portfolio 2', category: 'portfolio', status: 'pending', uploadedAt: '2024-12-01' },
]

/* ─── Mock Casting Directors ─── */
const defaultDirectors: CastingDirector[] = [
  { id: 'd1', name: 'Ravi Teja', email: 'ravi@creativevision.com', agencyName: 'Creative Vision Casting', phone: '+91 98765 43210', location: 'Hyderabad', bio: 'Leading casting agency for Telugu blockbusters since 2015.', status: 'active', joinedAt: '2023-03-15', subscriptionTier: 'gold', talentCount: 8, callCount: 3, maxTalent: 50, maxCalls: 10, commissionRate: 15, verified: true, createdBy: 'cinex', rating: 4.8 },
  { id: 'd2', name: 'Priya Sharma', email: 'priya@starfinders.in', agencyName: 'Star Finders', phone: '+91 98765 12345', location: 'Mumbai', bio: 'Premium talent management for pan-India films and OTT.', status: 'active', joinedAt: '2024-01-10', subscriptionTier: 'platinum', talentCount: 7, callCount: 2, maxTalent: 100, maxCalls: 20, commissionRate: 12, verified: true, createdBy: 'self', rating: 4.9 },
]

/* ─── Mock Talent (mixed sources) ─── */
const defaultTalent: TalentProfile[] = [
  { id: 't1', name: 'Neha Gupta', email: 'neha@email.com', phone: '+91 98765 11111', whatsapp: '+91 98765 11111', role: 'Lead Actress', status: 'available', headshotUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop', photos: defaultPhotos('t1'), location: 'Mumbai', age: 26, height: '5\'6"', weight: '55kg', languages: ['Hindi', 'English'], skills: ['Method Acting', 'Dance', 'Classical Singing'], experience: '5 years', bio: 'Versatile actress with theater background. Specializes in emotional drama and period pieces.', socialLinks: { instagram: '@neha.gupta', youtube: 'NehaGuptaOfficial' }, addedBy: 'd1', addedByName: 'Ravi Teja', agencyId: 'd1', verified: true, videos: [], voiceRecordings: [] },
  { id: 't2', name: 'Ajay Reddy', email: 'ajay@email.com', phone: '+91 98765 22222', whatsapp: '+91 98765 22222', role: 'Action Hero', status: 'booked', headshotUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop', photos: defaultPhotos('t2'), location: 'Hyderabad', age: 32, height: '6\'0"', weight: '78kg', languages: ['Telugu', 'Hindi'], skills: ['Martial Arts', 'Stunts', 'Horse Riding'], experience: '8 years', bio: 'Former national-level martial artist turned action specialist. Works across Telugu and Hindi cinema.', socialLinks: { instagram: '@ajay.reddy.action' }, addedBy: 'd1', addedByName: 'Ravi Teja', agencyId: 'd1', verified: true, videos: [], voiceRecordings: [] },
  { id: 't3', name: 'Kiran Rao', email: 'kiran@email.com', phone: '+91 98765 33333', whatsapp: '+91 98765 33333', role: 'Comic Relief', status: 'available', headshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', photos: defaultPhotos('t3'), location: 'Bangalore', age: 28, height: '5\'7"', weight: '65kg', languages: ['Kannada', 'Tamil', 'Telugu'], skills: ['Improv', 'Mimicry', 'Physical Comedy'], experience: '4 years', bio: 'Stand-up comedian who transitioned to film. Known for perfect timing and natural expressions.', socialLinks: { instagram: '@kiran.comedy' }, addedBy: 'd2', addedByName: 'Priya Sharma', agencyId: 'd2', verified: true, videos: [], voiceRecordings: [] },
  { id: 't4', name: 'Divya Nair', email: 'divya@email.com', phone: '+91 98765 44444', whatsapp: '+91 98765 44444', role: 'Character Actress', status: 'available', headshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', photos: defaultPhotos('t4'), location: 'Kochi', age: 42, height: '5\'5"', weight: '60kg', languages: ['Malayalam', 'Tamil'], skills: ['Classical Dance', 'Emotional Depth', 'Voice Modulation'], experience: '18 years', bio: 'Veteran character actress with 80+ films. Specializes in mother and matriarch roles.', socialLinks: { instagram: '@divya.nair.official', facebook: 'DivyaNairOfficial' }, addedBy: 'd2', addedByName: 'Priya Sharma', agencyId: 'd2', verified: true, videos: [], voiceRecordings: [] },
  { id: 't5', name: 'Sahil Khan', email: 'sahil@email.com', phone: '+91 98765 55555', whatsapp: '+91 98765 55555', role: 'Romantic Lead', status: 'unavailable', headshotUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop', photos: defaultPhotos('t5'), location: 'Delhi', age: 25, height: '5\'11"', weight: '72kg', languages: ['Hindi', 'English', 'Punjabi'], skills: ['Guitar', 'Singing', 'Modeling'], experience: '2 years', bio: 'Fresh face from Delhi theater circuit. Perfect for urban romance and coming-of-age stories.', socialLinks: { instagram: '@sahil.khan.actor', youtube: 'SahilKhanVlogs' }, addedBy: 'cinex', addedByName: 'Cinex', verified: true, videos: [], voiceRecordings: [] },
  { id: 't6', name: 'Meera Joshi', email: 'meera@email.com', phone: '+91 98765 66666', whatsapp: '+91 98765 66666', role: 'Villain', status: 'available', headshotUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop', photos: defaultPhotos('t6'), location: 'Pune', age: 35, height: '5\'8"', weight: '58kg', languages: ['Marathi', 'Hindi'], skills: ['Intense Eyes', 'Action', 'Negative Shades'], experience: '10 years', bio: 'Specialist in antagonist roles. Has played memorable villains in 15+ regional films.', socialLinks: {}, addedBy: 'cinex', addedByName: 'Cinex', verified: false, videos: [], voiceRecordings: [] },
]

/* ─── Mock Casting Calls ─── */
const defaultCalls: CastingCall[] = [
  { id: 'c1', title: 'Lead Female - Period Drama', projectName: 'Rani of Jhansi', directorId: 'd1', directorName: 'Ravi Teja', directorAgency: 'Creative Vision Casting', roles: [{ id: 'r1', name: 'Lead', type: 'lead', ageRange: '22-28', gender: 'female', description: 'Warrior queen', requiredSkills: ['Horse Riding', 'Sword'], filled: false }, { id: 'r2', name: 'Handmaiden', type: 'supporting', ageRange: '18-25', gender: 'female', description: 'Loyal companion', requiredSkills: [], filled: false }], location: 'Ramoji Film City', shootDates: 'Mar 1-30, 2025', deadline: '2025-02-15', status: 'open', description: 'Epic period drama about Rani Lakshmibai.', compensation: '₹15-25 Lakhs', createdAt: '2025-01-10', submissions: 12 },
  { id: 'c2', title: 'Villain - Action Thriller', projectName: 'Shadow Hunter', directorId: 'd1', directorName: 'Ravi Teja', directorAgency: 'Creative Vision Casting', roles: [{ id: 'r3', name: 'Main Villain', type: 'lead', ageRange: '35-45', gender: 'male', description: 'Ruthless crime lord', requiredSkills: ['Fight'], filled: false }], location: 'Goa', shootDates: 'Apr 5-20, 2025', deadline: '2025-03-01', status: 'open', description: 'Pan-India action thriller.', compensation: '₹20-30 Lakhs', createdAt: '2025-01-12', submissions: 8 },
  { id: 'c3', title: 'Child Artist - Family Drama', projectName: 'Papa Ki Pari', directorId: 'd2', directorName: 'Priya Sharma', directorAgency: 'Star Finders', roles: [{ id: 'r4', name: 'Daughter', type: 'child', ageRange: '8-12', gender: 'female', description: 'Precocious child', requiredSkills: ['Dialogue'], filled: false }], location: 'Mumbai', shootDates: 'Feb 10-28, 2025', deadline: '2025-01-25', status: 'open', description: 'Heartwarming family drama.', compensation: '₹2-5 Lakhs', createdAt: '2025-01-08', submissions: 24 },
  { id: 'c4', title: 'Dancer - Mass Song', projectName: 'Dhamaka', directorId: 'd1', directorName: 'Ravi Teja', directorAgency: 'Creative Vision Casting', roles: [{ id: 'r5', name: 'Item Dancer', type: 'dance', ageRange: '20-30', gender: 'female', description: 'High energy', requiredSkills: ['Bharatanatyam', 'Bollywood'], filled: true }], location: 'Chennai', shootDates: 'Jan 20-22, 2025', deadline: '2025-01-10', status: 'closed', description: 'High-budget commercial song.', compensation: '₹5-8 Lakhs', createdAt: '2025-01-01', submissions: 45 },
  { id: 'c5', title: 'Voice Artist - Animated Film', projectName: 'Little Krishna', directorId: 'd2', directorName: 'Priya Sharma', directorAgency: 'Star Finders', roles: [{ id: 'r6', name: 'Krishna', type: 'voice', ageRange: 'any', gender: 'male', description: 'Youthful voice', requiredSkills: ['Voice Acting', 'Singing'], filled: false }], location: 'Remote', shootDates: 'Ongoing', deadline: '2025-03-15', status: 'open', description: 'Animated feature film dubbing.', compensation: '₹3-6 Lakhs', createdAt: '2025-01-14', submissions: 6 },
]

/* ─── Mock Submissions ─── */
const defaultSubmissions: AuditionSubmission[] = [
  { id: 's1', castingCallId: 'c1', roleId: 'r1', talentId: 't1', talentName: 'Neha Gupta', talentAgency: 'Creative Vision Casting', message: 'Perfect for warrior roles. Have trained in sword fighting.', status: 'shortlisted', submittedAt: '2025-01-12', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'], notes: 'Great screen presence' },
  { id: 's2', castingCallId: 'c2', roleId: 'r3', talentId: 't6', talentName: 'Meera Joshi', message: '15 years of villain experience. Ready for action.', status: 'pending', submittedAt: '2025-01-13', photos: [] },
  { id: 's3', castingCallId: 'c3', roleId: 'r4', talentId: 't3', talentName: 'Kiran Rao', message: 'Natural comic timing. Can play younger characters.', status: 'rejected', submittedAt: '2025-01-10', photos: [], notes: 'Too old for child role' },
  { id: 's4', castingCallId: 'c1', roleId: 'r2', talentId: 't4', talentName: 'Divya Nair', message: 'Experienced in period dramas. Perfect for handmaiden.', status: 'selected', submittedAt: '2025-01-11', photos: [], notes: 'Excellent classical dance background' },
]

interface CastingStore {
  directors: CastingDirector[]
  talent: TalentProfile[]
  castingCalls: CastingCall[]
  submissions: AuditionSubmission[]

  // Director management
  addDirector: (d: Partial<CastingDirector>) => void
  updateDirector: (id: string, data: Partial<CastingDirector>) => void
  removeDirector: (id: string) => void
  suspendDirector: (id: string) => void
  activateDirector: (id: string) => void
  approveDirector: (id: string) => void
  rejectDirector: (id: string) => void

  // Talent management (both director and self-registered)
  addTalent: (t: Partial<TalentProfile>) => void
  updateTalent: (id: string, data: Partial<TalentProfile>) => void
  removeTalent: (id: string) => void
  verifyTalent: (id: string) => void

  // Photos
  addPhoto: (talentId: string, photo: Partial<TalentPhoto>) => void
  approvePhoto: (talentId: string, photoId: string, reviewer: string) => void
  rejectPhoto: (talentId: string, photoId: string, reviewer: string) => void

  // Videos
  addVideo: (talentId: string, video: Partial<TalentVideo>) => void
  approveVideo: (talentId: string, videoId: string, reviewer: string) => void
  rejectVideo: (talentId: string, videoId: string, reviewer: string) => void

  // Voice
  addVoice: (talentId: string, voice: Partial<TalentVoice>) => void
  approveVoice: (talentId: string, voiceId: string, reviewer: string) => void
  rejectVoice: (talentId: string, voiceId: string, reviewer: string) => void

  // Casting calls
  addCastingCall: (c: Partial<CastingCall>) => void
  updateCastingCall: (id: string, data: Partial<CastingCall>) => void
  closeCastingCall: (id: string) => void
  deleteCastingCall: (id: string) => void

  // Submissions
  addSubmission: (s: Partial<AuditionSubmission>) => void
  updateSubmission: (id: string, status: AuditionSubmission['status'], notes?: string) => void

  // Queries
  getDirectorById: (id: string) => CastingDirector | undefined
  getTalentByDirector: (directorId: string) => TalentProfile[]
  getTalentByAgency: (agencyId: string) => TalentProfile[]
  getPhotosPendingApproval: () => { talent: TalentProfile; photo: TalentPhoto }[]
  getApprovedPhotos: () => { talent: TalentProfile; photo: TalentPhoto }[]
  getSubmissionsForCall: (callId: string) => AuditionSubmission[]
  getStats: () => { totalDirectors: number; totalTalent: number; openCalls: number; totalSubmissions: number; pendingPhotos: number; verifiedDirectors: number; cinexTalent: number; agencyTalent: number }
}

export const useCastingStore = create<CastingStore>()(
  persist(
    (set, get) => ({
      directors: defaultDirectors,
      talent: defaultTalent,
      castingCalls: defaultCalls,
      submissions: defaultSubmissions,

      addDirector: (d) => {
        const newDirector: CastingDirector = {
          id: `d-${Date.now()}`,
          name: d.name || 'New Director',
          email: d.email || '',
          agencyName: d.agencyName || 'New Agency',
          phone: d.phone || '',
          location: d.location || '',
          bio: d.bio || '',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0],
          subscriptionTier: 'free',
          talentCount: 0,
          callCount: 0,
          maxTalent: 25,
          maxCalls: 5,
          commissionRate: 20,
          verified: false,
          createdBy: 'cinex',
          rating: 0,
          ...d,
        } as CastingDirector
        set({ directors: [...get().directors, newDirector] })
      },

      updateDirector: (id, data) => {
        set({ directors: get().directors.map((d) => (d.id === id ? { ...d, ...data } : d)) })
      },

      removeDirector: (id) => {
        set({ directors: get().directors.filter((d) => d.id !== id) })
      },

      suspendDirector: (id) => {
        set({ directors: get().directors.map((d) => (d.id === id ? { ...d, status: 'suspended' as const } : d)) })
      },

      activateDirector: (id) => {
        set({ directors: get().directors.map((d) => (d.id === id ? { ...d, status: 'active' as const } : d)) })
      },

      approveDirector: (id) => {
        set({ directors: get().directors.map((d) => (d.id === id ? { ...d, status: 'active' as const, verified: true } : d)) })
      },

      rejectDirector: (id) => {
        set({ directors: get().directors.map((d) => (d.id === id ? { ...d, status: 'rejected' as const } : d)) })
      },

      addTalent: (t) => {
        const newTalent: TalentProfile = {
          id: `t-${Date.now()}`,
          name: t.name || 'New Talent',
          email: t.email || '',
          role: t.role || 'Actor',
          status: 'available',
          headshotUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
          photos: [],
          videos: [],
          voiceRecordings: [],
          location: t.location || '',
          languages: ['Telugu'],
          skills: [],
          experience: '0 years',
          bio: '',
          socialLinks: {},
          addedBy: t.addedBy || 'cinex',
          addedByName: t.addedByName || 'Cinex',
          agencyId: t.agencyId,
          verified: false,
          ...t,
        } as TalentProfile
        set({ talent: [...get().talent, newTalent] })
      },

      updateTalent: (id, data) => {
        set({ talent: get().talent.map((t) => (t.id === id ? { ...t, ...data } : t)) })
      },

      removeTalent: (id) => {
        set({ talent: get().talent.filter((t) => t.id !== id) })
      },

      verifyTalent: (id) => {
        set({ talent: get().talent.map((t) => (t.id === id ? { ...t, verified: true } : t)) })
      },

      addPhoto: (talentId, photo) => {
        const newPhoto: TalentPhoto = {
          id: `p-${Date.now()}`,
          url: photo.url || '',
          caption: photo.caption || '',
          category: photo.category || 'portfolio',
          status: 'pending',
          uploadedAt: new Date().toISOString().split('T')[0],
          ...photo,
        }
        set({
          talent: get().talent.map((t) =>
            t.id === talentId ? { ...t, photos: [...t.photos, newPhoto] } : t
          ),
        })
      },

      approvePhoto: (talentId, photoId, reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? {
                  ...t,
                  photos: t.photos.map((p) =>
                    p.id === photoId
                      ? { ...p, status: 'approved' as const, reviewedBy: reviewer, reviewedAt: new Date().toISOString().split('T')[0] }
                      : p
                  ),
                }
              : t
          ),
        })
      },

      rejectPhoto: (talentId, photoId, reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? {
                  ...t,
                  photos: t.photos.map((p) =>
                    p.id === photoId
                      ? { ...p, status: 'rejected' as const, reviewedBy: reviewer, reviewedAt: new Date().toISOString().split('T')[0] }
                      : p
                  ),
                }
              : t
          ),
        })
      },

      addVideo: (talentId, video) => {
        const newVideo: TalentVideo = {
          id: `v-${Date.now()}`,
          url: video.url || '',
          caption: video.caption || '',
          type: video.type || 'showreel',
          status: 'pending',
          uploadedAt: new Date().toISOString().split('T')[0],
        }
        set({
          talent: get().talent.map((t) =>
            t.id === talentId ? { ...t, videos: [...t.videos, newVideo] } : t
          ),
        })
      },

      approveVideo: (talentId, videoId, _reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? { ...t, videos: t.videos.map((v) => v.id === videoId ? { ...v, status: 'approved' as const } : v) }
              : t
          ),
        })
      },

      rejectVideo: (talentId, videoId, _reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? { ...t, videos: t.videos.map((v) => v.id === videoId ? { ...v, status: 'rejected' as const } : v) }
              : t
          ),
        })
      },

      addVoice: (talentId, voice) => {
        const newVoice: TalentVoice = {
          id: `vo-${Date.now()}`,
          url: voice.url || '',
          caption: voice.caption || '',
          language: voice.language || 'Telugu',
          status: 'pending',
          uploadedAt: new Date().toISOString().split('T')[0],
        }
        set({
          talent: get().talent.map((t) =>
            t.id === talentId ? { ...t, voiceRecordings: [...t.voiceRecordings, newVoice] } : t
          ),
        })
      },

      approveVoice: (talentId, voiceId, _reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? { ...t, voiceRecordings: t.voiceRecordings.map((v) => v.id === voiceId ? { ...v, status: 'approved' as const } : v) }
              : t
          ),
        })
      },

      rejectVoice: (talentId, voiceId, _reviewer) => {
        set({
          talent: get().talent.map((t) =>
            t.id === talentId
              ? { ...t, voiceRecordings: t.voiceRecordings.map((v) => v.id === voiceId ? { ...v, status: 'rejected' as const } : v) }
              : t
          ),
        })
      },

      addCastingCall: (c) => {
        const newCall: CastingCall = {
          id: `c-${Date.now()}`,
          title: c.title || 'New Casting Call',
          projectName: c.projectName || '',
          directorId: c.directorId || '',
          directorName: c.directorName || '',
          directorAgency: c.directorAgency || '',
          roles: c.roles || [],
          location: c.location || '',
          shootDates: c.shootDates || '',
          deadline: c.deadline || '',
          status: 'open',
          description: c.description || '',
          compensation: c.compensation || '',
          createdAt: new Date().toISOString().split('T')[0],
          submissions: 0,
          ...c,
        } as CastingCall
        set({ castingCalls: [...get().castingCalls, newCall] })
      },

      updateCastingCall: (id, data) => {
        set({ castingCalls: get().castingCalls.map((c) => (c.id === id ? { ...c, ...data } : c)) })
      },

      closeCastingCall: (id) => {
        set({ castingCalls: get().castingCalls.map((c) => (c.id === id ? { ...c, status: 'closed' as const } : c)) })
      },

      deleteCastingCall: (id) => {
        set({ castingCalls: get().castingCalls.filter((c) => c.id !== id) })
      },

      addSubmission: (s) => {
        const newSub: AuditionSubmission = {
          id: `s-${Date.now()}`,
          castingCallId: s.castingCallId || '',
          roleId: s.roleId || '',
          talentId: s.talentId || '',
          talentName: s.talentName || '',
          talentAgency: s.talentAgency,
          message: s.message || '',
          status: 'pending',
          submittedAt: new Date().toISOString().split('T')[0],
          photos: s.photos || [],
          ...s,
        } as AuditionSubmission
        set({ submissions: [...get().submissions, newSub] })
      },

      updateSubmission: (id, status, notes) => {
        set({
          submissions: get().submissions.map((s) =>
            s.id === id ? { ...s, status, notes: notes || s.notes } : s
          ),
        })
      },

      getDirectorById: (id) => get().directors.find((d) => d.id === id),
      getTalentByDirector: (directorId) => get().talent.filter((t) => t.addedBy === directorId),
      getTalentByAgency: (agencyId) => get().talent.filter((t) => t.agencyId === agencyId),
      getPhotosPendingApproval: () =>
        get().talent.flatMap((t) => t.photos.filter((p) => p.status === 'pending').map((p) => ({ talent: t, photo: p }))),
      getApprovedPhotos: () =>
        get().talent.flatMap((t) => t.photos.filter((p) => p.status === 'approved').map((p) => ({ talent: t, photo: p }))),
      getSubmissionsForCall: (callId) => get().submissions.filter((s) => s.castingCallId === callId),

      getStats: () => {
        const state = get()
        return {
          totalDirectors: state.directors.length,
          totalTalent: state.talent.length,
          openCalls: state.castingCalls.filter((c) => c.status === 'open').length,
          totalSubmissions: state.submissions.length,
          pendingPhotos: state.getPhotosPendingApproval().length,
          verifiedDirectors: state.directors.filter((d) => d.verified).length,
          cinexTalent: state.talent.filter((t) => t.addedBy === 'cinex').length,
          agencyTalent: state.talent.filter((t) => t.addedBy !== 'cinex').length,
        }
      },
    }),
    { name: 'cinex-casting-store', partialize: (state) => ({ directors: state.directors, talent: state.talent, castingCalls: state.castingCalls, submissions: state.submissions }) }
  )
)
