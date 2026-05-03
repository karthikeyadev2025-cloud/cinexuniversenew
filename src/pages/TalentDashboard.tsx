import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, MapPin, Calendar, DollarSign, Star, Upload, User,
  Briefcase, Clock, X, CheckCircle, Eye, Send, Filter, Phone,
  Instagram, Facebook, Twitter, Youtube, Linkedin, Globe, Mic,
  Video, Music, Zap, Award, FileText, Camera
} from 'lucide-react'
import { useCastingStore } from '../stores/castingStore'
import type { CastingCall, TalentProfile } from '../stores/castingStore'
import { useRoleStore } from '../stores/roleStore'

/* ─── Talent Dashboard ───
   Full portfolio with WhatsApp, social links, video, voice.
   Tabs driven by URL: ?tab=calls | ?tab=submissions | ?tab=portfolio
*/
export default function TalentDashboard() {
  const store = useCastingStore()
  const user = useRoleStore((s) => s.user)
  const [searchParams, setSearchParams] = useSearchParams()

  const myProfile = store.talent.find(
    (t) => t.email.toLowerCase() === (user?.email || '').toLowerCase()
  )
  const myTalentId = myProfile?.id

  /* Tab from URL, default to calls */
  const tab = (searchParams.get('tab') || 'calls') as 'calls' | 'submissions' | 'portfolio' | 'edit'
  const setTab = (t: string) => setSearchParams({ tab: t })

  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<CastingCall | null>(null)
  const [submitModal, setSubmitModal] = useState(false)
  const [toast, setToast] = useState('')

  const openCalls = store.castingCalls.filter((c) => c.status === 'open')
  const filteredCalls = openCalls.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.projectName.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )
  const mySubmissions = myTalentId
    ? store.submissions.filter((s) => s.talentId === myTalentId)
    : []

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  /* If no profile, show create profile */
  if (!myProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-8 text-center">
          <User className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h2 className="font-cinzel text-xl font-bold text-[#F0F0F0] mb-2">Complete Your Actor Profile</h2>
          <p className="font-inter text-xs text-[#6B6B6B] mb-6 max-w-md mx-auto">
            Create your portfolio to apply for casting calls. Casting directors need your full profile including photos, videos, voice samples, and contact details.
          </p>
        </div>
        <ProfileEditForm user={user} onSave={() => setSearchParams({ tab: 'calls' })} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-[#F0F0F0]">
            {tab === 'calls' ? 'Casting Calls' : tab === 'submissions' ? 'My Submissions' : tab === 'portfolio' ? 'My Portfolio' : 'Edit Profile'}
          </h2>
          <p className="font-inter text-xs text-[#6B6B6B] mt-0.5">
            {myProfile ? `Welcome, ${myProfile.name}` : 'Create your actor profile'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: 'calls', label: 'Casting Calls' },
            { key: 'submissions', label: 'My Submissions' },
            { key: 'portfolio', label: 'Portfolio' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                tab === t.key ? 'bg-[#D4A853] text-[#060606]' : 'bg-[#111] text-[#888] hover:bg-[#1a1a1a]'
              }`}>
              {t.label}
            </button>
          ))}
          {myProfile && (
            <button onClick={() => setTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                tab === 'edit' ? 'bg-[#2D9CDB] text-white' : 'bg-[#111] text-[#888] hover:bg-[#1a1a1a]'
              }`}>
              Edit
            </button>
          )}
        </div>
      </div>

      {/* ══════ CASTING CALLS TAB ══════ */}
      {tab === 'calls' && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by role, project, or city..."
                className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)} className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${filterOpen?'border-[#D4A853] text-[#D4A853]':'border-[#242424] text-[#555] hover:border-[#333]'}`}>
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          {!myProfile && (
            <div className="bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.15)] rounded-xl p-4 flex items-center gap-3">
              <User className="w-5 h-5 text-[#D4A853]" />
              <div className="flex-1"><p className="text-sm font-medium text-[#F0F0F0]">Complete your profile to apply</p><p className="text-[11px] text-[#888]">Casting directors prefer actors with full portfolios.</p></div>
              <button onClick={() => setTab('edit')} className="px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] text-[11px] font-semibold">Create Profile</button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCalls.map((call) => (
              <div key={call.id} className="group relative bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden hover:border-[#D4A853]/30 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] group-hover:text-[#D4A853] transition-colors">{call.title}</h3>
                      <p className="font-inter text-[11px] text-[#6B6B6B] mt-0.5">{call.projectName} · {call.directorName}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-jetbrains-mono px-2 py-0.5 rounded bg-[rgba(39,174,96,0.1)] text-[#27AE60] border border-[rgba(39,174,96,0.2)]">
                      <Zap className="w-2.5 h-2.5" /> OPEN
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] text-[#6B6B6B] font-inter">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D4A853]" />{call.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#2D9CDB]" />{call.shootDates}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-[#27AE60]" />{call.compensation}</span>
                  </div>
                  <p className="font-inter text-xs text-[#888888] leading-relaxed line-clamp-2 mb-3">{call.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {call.roles.map((r) => (
                      <span key={r.id} className={`text-[10px] font-inter px-2 py-0.5 rounded-full border ${r.filled?'bg-[#1a1a1a] text-[#555] border-[#333]':'bg-[rgba(212,168,83,0.06)] text-[#D4A853] border-[rgba(212,168,83,0.15)]'}`}>
                        {r.name} {r.filled ? '✓' : r.ageRange}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                    <span className="text-[10px] text-[#6B6B6B] font-inter flex items-center gap-1"><Eye className="w-3 h-3" /> {call.submissions} submissions · Deadline {call.deadline}</span>
                    <button onClick={() => { setSelectedCall(call); setSubmitModal(true) }}
                      className="text-xs font-inter font-semibold px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#060606] hover:bg-[#E8BF6A] transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" /> Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCalls.length === 0 && (
            <div className="text-center py-16"><Briefcase className="w-10 h-10 text-[#333] mx-auto mb-3" /><p className="font-space-grotesk text-sm text-[#6B6B6B]">No casting calls match your search.</p></div>
          )}
        </>
      )}

      {/* ══════ MY SUBMISSIONS TAB ══════ */}
      {tab === 'submissions' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total', value: mySubmissions.length, color: '#D4A853', icon: FileText },
              { label: 'Pending', value: mySubmissions.filter((s) => s.status === 'pending').length, color: '#2D9CDB', icon: Clock },
              { label: 'Shortlisted', value: mySubmissions.filter((s) => s.status === 'shortlisted').length, color: '#27AE60', icon: Star },
              { label: 'Selected', value: mySubmissions.filter((s) => s.status === 'selected').length, color: '#E74C3C', icon: Award },
            ].map((s) => (
              <div key={s.label} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-4 text-center hover:border-[#333] transition-colors">
                <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                <p className="font-cinzel text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="font-inter text-[11px] text-[#6B6B6B] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-16"><Send className="w-10 h-10 text-[#333] mx-auto mb-3" /><p className="font-space-grotesk text-sm text-[#6B6B6B]">No submissions yet.</p><button onClick={() => setTab('calls')} className="mt-3 text-xs text-[#D4A853] font-inter hover:underline">Browse casting calls</button></div>
            ) : (
              mySubmissions.map((sub) => {
                const call = store.castingCalls.find((c) => c.id === sub.castingCallId)
                const role = call?.roles.find((r) => r.id === sub.roleId)
                const colors: Record<string, string> = { pending: '#2D9CDB', shortlisted: '#27AE60', rejected: '#E74C3C', selected: '#D4A853' }
                const StatusIcon = sub.status === 'shortlisted' ? Star : sub.status === 'selected' ? Award : sub.status === 'rejected' ? X : Clock
                return (
                  <div key={sub.id} className="group bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 hover:border-[#333] transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.15)] flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-[#D4A853]" />
                        </div>
                        <div><h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0]">{call?.title || 'Unknown'}</h3><p className="font-inter text-[11px] text-[#6B6B6B]">Role: {role?.name || 'Unknown'} · Submitted {sub.submittedAt}</p></div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-jetbrains-mono px-2 py-0.5 rounded border" style={{ color: colors[sub.status], borderColor: colors[sub.status]+'30', background: colors[sub.status]+'08' }}>
                        <StatusIcon className="w-3 h-3" /> {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-inter text-xs text-[#888888] leading-relaxed">{sub.message}</p>
                    {sub.notes && <div className="mt-2 p-2 rounded-lg bg-[rgba(212,168,83,0.04)] border border-[rgba(212,168,83,0.1)]"><p className="font-inter text-[11px] text-[#D4A853]"><strong>Director's Note:</strong> {sub.notes}</p></div>}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* ══════ PORTFOLIO TAB ══════ */}
      {tab === 'portfolio' && myProfile && <PortfolioView profile={myProfile} />}

      {/* ══════ EDIT PROFILE TAB ══════ */}
      {tab === 'edit' && <ProfileEditForm user={user} onSave={() => { showToast('Profile saved!'); setTab('portfolio') }} existing={myProfile} />}

      {/* ══════ SUBMIT MODAL ══════ */}
      {submitModal && selectedCall && (
        <ApplyModal call={selectedCall} myProfile={myProfile} myTalentId={myTalentId} userName={user?.name ?? undefined} onClose={() => setSubmitModal(false)} onSubmit={() => { showToast('Application submitted!'); setSubmitModal(false) }} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#131313] border border-[#242424] shadow-xl">
          <CheckCircle className="w-4 h-4 text-[#27AE60]" />
          <span className="text-sm font-inter text-[#F0F0F0]">{toast}</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   PORTFOLIO VIEW (Upgraded Visuals)
   ═══════════════════════════════════════════ */
function PortfolioView({ profile }: { profile: TalentProfile }) {
  const socialIcons: Record<string, any> = { instagram: Instagram, facebook: Facebook, twitter: Twitter, youtube: Youtube, linkedin: Linkedin }

  return (
    <div className="space-y-5">
      {/* Hero Profile Card */}
      <div className="relative bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-[#111]" />
        <div className="relative p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-[rgba(212,168,83,0.08)] border-2 border-[rgba(212,168,83,0.2)] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
              {profile.headshotUrl ? <img src={profile.headshotUrl} alt={profile.name} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-[#D4A853]" />}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-space-grotesk text-xl font-bold text-[#F0F0F0]">{profile.name}</h3>
                {profile.verified ? (
                  <span className="flex items-center gap-1 text-[10px] font-jetbrains-mono px-2 py-0.5 rounded-full bg-[rgba(39,174,96,0.12)] text-[#27AE60] border border-[rgba(39,174,96,0.2)]">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-jetbrains-mono px-2 py-0.5 rounded-full bg-[rgba(230,126,34,0.12)] text-[#E67E22] border border-[rgba(230,126,34,0.2)]">
                    <Clock className="w-3 h-3" /> PENDING
                  </span>
                )}
              </div>
              <p className="font-inter text-sm text-[#D4A853] font-medium">{profile.role}</p>
              <p className="font-inter text-xs text-[#6B6B6B] mt-0.5">{profile.location || 'Location not set'} · {profile.experience || 'No experience'}</p>
              {profile.bio && <p className="font-inter text-xs text-[#888888] leading-relaxed mt-3 max-w-lg">{profile.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { label: 'Age', value: profile.age || '-', color: '#D4A853' },
              { label: 'Height', value: profile.height || '-', color: '#2D9CDB' },
              { label: 'Weight', value: profile.weight || '-', color: '#27AE60' },
              { label: 'Languages', value: profile.languages?.length || 0, color: '#E67E22' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-[#111] border border-[#242424] text-center hover:border-[#333] transition-colors">
                <p className="font-cinzel text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="font-inter text-[10px] text-[#6B6B6B] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contact Row */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#1a1a1a]">
            {profile.phone && (
              <span className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] bg-[#111] px-3 py-1.5 rounded-lg border border-[#242424]">
                <Phone className="w-3 h-3 text-[#D4A853]" /> {profile.phone}
              </span>
            )}
            {profile.whatsapp && (
              <span className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] bg-[#111] px-3 py-1.5 rounded-lg border border-[#242424]">
                <Phone className="w-3 h-3 text-[#27AE60]" /> WhatsApp: {profile.whatsapp}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] bg-[#111] px-3 py-1.5 rounded-lg border border-[#242424]">
              <Globe className="w-3 h-3 text-[#2D9CDB]" /> {profile.email}
            </span>
          </div>

          {/* Social */}
          {Object.keys(profile.socialLinks || {}).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(profile.socialLinks || {}).map(([platform, handle]) => {
                const Icon = socialIcons[platform.toLowerCase()] || Globe
                return (
                  <a key={platform} href={`https://${platform}.com/${handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] border border-[#242424] text-[11px] text-[#888] hover:text-[#D4A853] hover:border-[#D4A853]/30 transition-all">
                    <Icon className="w-3 h-3" /> {handle}
                  </a>
                )
              })}
            </div>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.skills.map((s) => (
                <span key={s} className="text-[10px] font-inter px-2.5 py-1 rounded-full bg-[#1a1a1a] text-[#A3A3A3] border border-[#242424]">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Camera className="w-4 h-4 text-[#D4A853]" /> Photos</h3>
          <span className="text-[11px] text-[#6B6B6B]">{profile.photos?.length || 0} uploaded</span>
        </div>
        {profile.photos?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {profile.photos.map((p) => (
              <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#242424] group hover:border-[#D4A853]/30 transition-all">
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent opacity-50" />
                <span className={`absolute top-2 right-2 text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded-full ${p.status==='approved'?'bg-[rgba(39,174,96,0.2)] text-[#27AE60]':'bg-[rgba(230,126,34,0.2)] text-[#E67E22]'}`}>{p.status.toUpperCase()}</span>
                <div className="absolute bottom-2 left-2 right-2"><p className="text-[10px] font-inter text-[#F0F0F0] truncate">{p.caption}</p><p className="text-[9px] text-[#888]">{p.category}</p></div>
              </div>
            ))}
          </div>
        ) : <p className="text-[11px] text-[#555] py-8 text-center border border-dashed border-[#242424] rounded-xl">No photos uploaded yet.</p>}
      </div>

      {/* Videos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Video className="w-4 h-4 text-[#E74C3C]" /> Videos</h3>
          <span className="text-[11px] text-[#6B6B6B]">{profile.videos?.length || 0} uploaded</span>
        </div>
        {profile.videos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.videos.map((v) => (
              <div key={v.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3 flex items-center gap-3 hover:border-[#333] transition-colors">
                <div className="w-14 h-14 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#242424]"><Video className="w-5 h-5 text-[#E74C3C]" /></div>
                <div className="flex-1 min-w-0"><p className="text-xs text-[#F0F0F0] truncate">{v.caption}</p><p className="text-[10px] text-[#6B6B6B]">{v.type} · {v.status}</p></div>
                <span className={`text-[9px] font-jetbrains-mono px-2 py-0.5 rounded-full ${v.status==='approved'?'bg-[rgba(39,174,96,0.15)] text-[#27AE60]':'bg-[rgba(230,126,34,0.15)] text-[#E67E22]'}`}>{v.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[11px] text-[#555] py-8 text-center border border-dashed border-[#242424] rounded-xl">No videos uploaded yet.</p>}
      </div>

      {/* Voice */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] flex items-center gap-2"><Mic className="w-4 h-4 text-[#9B59B6]" /> Voice Recordings</h3>
          <span className="text-[11px] text-[#6B6B6B]">{profile.voiceRecordings?.length || 0} uploaded</span>
        </div>
        {profile.voiceRecordings?.length > 0 ? (
          <div className="space-y-2">
            {profile.voiceRecordings.map((v) => (
              <div key={v.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-3 flex items-center gap-3 hover:border-[#333] transition-colors">
                <div className="w-12 h-12 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0 border border-[#242424]"><Music className="w-4 h-4 text-[#9B59B6]" /></div>
                <div className="flex-1 min-w-0"><p className="text-xs text-[#F0F0F0] truncate">{v.caption}</p><p className="text-[10px] text-[#6B6B6B]">{v.language} · {v.status}</p></div>
                <span className={`text-[9px] font-jetbrains-mono px-2 py-0.5 rounded-full ${v.status==='approved'?'bg-[rgba(39,174,96,0.15)] text-[#27AE60]':'bg-[rgba(230,126,34,0.15)] text-[#E67E22]'}`}>{v.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[11px] text-[#555] py-8 text-center border border-dashed border-[#242424] rounded-xl">No voice recordings yet.</p>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   PROFILE EDIT FORM
   ═══════════════════════════════════════════ */
function ProfileEditForm({ user, onSave, existing }: { user: any; onSave: () => void; existing?: TalentProfile }) {
  const store = useCastingStore()

  const [name, setName] = useState(existing?.name || user?.name || '')
  const [email, setEmail] = useState(existing?.email || user?.email || '')
  const [phone, setPhone] = useState(existing?.phone || '')
  const [whatsapp, setWhatsapp] = useState(existing?.whatsapp || '')
  const [role, setRole] = useState(existing?.role || 'Actor')
  const [location, setLocation] = useState(existing?.location || '')
  const [age, setAge] = useState(existing?.age?.toString() || '')
  const [height, setHeight] = useState(existing?.height || '')
  const [weight, setWeight] = useState(existing?.weight || '')
  const [languages, setLanguages] = useState(existing?.languages?.join(', ') || 'Telugu, Hindi')
  const [skills, setSkills] = useState(existing?.skills?.join(', ') || '')
  const [experience, setExperience] = useState(existing?.experience || '')
  const [bio, setBio] = useState(existing?.bio || '')
  const [instagram, setInstagram] = useState(existing?.socialLinks?.instagram || '')
  const [facebook, setFacebook] = useState(existing?.socialLinks?.facebook || '')
  const [twitter, setTwitter] = useState(existing?.socialLinks?.twitter || '')
  const [youtube, setYoutube] = useState(existing?.socialLinks?.youtube || '')
  const [linkedin, setLinkedin] = useState(existing?.socialLinks?.linkedin || '')

  const handleSave = () => {
    const socialLinks: Record<string, string> = {}
    if (instagram) socialLinks.instagram = instagram
    if (facebook) socialLinks.facebook = facebook
    if (twitter) socialLinks.twitter = twitter
    if (youtube) socialLinks.youtube = youtube
    if (linkedin) socialLinks.linkedin = linkedin

    const data = {
      name, email, phone, whatsapp, role, location,
      age: parseInt(age) || undefined,
      height, weight,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience, bio, socialLinks,
    }

    if (existing) {
      store.updateTalent(existing.id, data)
    } else {
      store.addTalent({ ...data, status: 'available', addedBy: 'cinex', addedByName: 'Cinex Casting', verified: false })
    }
    onSave()
  }

  return (
    <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-6 space-y-5">
      <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0]">{existing ? 'Edit Profile' : 'Create Actor Profile'}</h3>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[#D4A853] uppercase tracking-wider">Basic Information</p>
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555]" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp Number" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0]">
            <option>Actor</option><option>Model</option><option>Dancer</option><option>Voice Artist</option><option>Child Artist</option>
          </select>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
          <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
          <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[#D4A853] uppercase tracking-wider">Bio & Skills</p>
        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell casting directors about yourself..." className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] resize-none" />
        <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Languages (comma separated)" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
        <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Experience" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-[#D4A853] uppercase tracking-wider">Social Media</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
          <div className="relative"><Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
          <div className="relative"><Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
          <div className="relative"><Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="YouTube" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
          <div className="relative"><Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-colors">{existing ? 'Save Changes' : 'Create Profile'}</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   APPLY MODAL
   ═══════════════════════════════════════════ */
function ApplyModal({ call, myProfile, myTalentId, userName, onClose, onSubmit }: {
  call: CastingCall; myProfile: TalentProfile | undefined; myTalentId: string | undefined; userName: string | undefined; onClose: () => void; onSubmit: () => void
}) {
  const store = useCastingStore()
  const [message, setMessage] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState(call.roles.find((r) => !r.filled)?.id || call.roles[0]?.id)

  if (!myProfile || !myTalentId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <User className="w-10 h-10 text-[#333] mx-auto mb-3" />
          <p className="font-inter text-sm text-[#6B6B6B] text-center mb-4">Create a profile before applying.</p>
          <button onClick={onClose} className="w-full py-2 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold">Got it</button>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    const role = call.roles.find((r) => r.id === selectedRoleId)
    if (!role) return
    store.addSubmission({
      castingCallId: call.id, roleId: role.id, talentId: myTalentId,
      talentName: myProfile.name || userName || 'Unknown',
      message: message || `Applied for ${role.name} via dashboard.`,
      status: 'pending', photos: [], videoUrl: videoLink || undefined,
    })
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0]">Apply for {call.title}</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853]"><X className="w-3.5 h-3.5 text-[#6B6B6B]" /></button>
          </div>
          <div className="space-y-3 mb-4">
            <p className="font-inter text-xs text-[#888888]">{call.description}</p>
            <div className="flex flex-wrap gap-2">
              {call.roles.filter((r) => !r.filled).map((r) => (
                <button key={r.id} onClick={() => setSelectedRoleId(r.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${selectedRoleId===r.id?'border-[#D4A853] bg-[rgba(212,168,83,0.06)]':'border-[#242424] bg-[#111]'}`}>
                  <span className="text-xs font-inter text-[#F0F0F0]">{r.name}</span><span className="text-[10px] text-[#6B6B6B]">{r.ageRange} · {r.gender}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Cover Message</label>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why are you perfect for this role?" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-xs font-inter text-[#F0F0F0] placeholder:text-[#555] resize-none" />
            </div>
            <div><label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Audition Video Link</label>
              <input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="YouTube, Vimeo, or Drive link..." className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-xs font-inter text-[#F0F0F0] placeholder:text-[#555]" />
            </div>
            <div className="border border-dashed border-[#242424] rounded-xl p-4 text-center hover:border-[#D4A853]/30 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-[#555] mx-auto mb-1" /><p className="text-[11px] font-inter text-[#6B6B6B]">Drag photos or click to upload</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs font-inter text-[#888] hover:bg-[#111]">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-inter font-semibold hover:bg-[#E8BF6A]">Submit Application</button>
          </div>
        </div>
      </div>
    </div>
  )
}
