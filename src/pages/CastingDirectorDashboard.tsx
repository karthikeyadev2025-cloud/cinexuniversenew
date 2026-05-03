import { useState } from 'react'
import {
  Users, CheckCircle, X, Clock, Search, Plus,
  UserPlus, Send, Phone, Instagram, Facebook, Twitter, Youtube,
  Briefcase, Mic, Video
} from 'lucide-react'
import { useCastingStore } from '../stores/castingStore'
import { useRoleStore } from '../stores/roleStore'

/* ─── Casting Director Dashboard ───
   Directors are ONLY a bridge between actors and Cinex.
   They submit actor profiles TO Cinex for approval.
   Cinex (Super Admin) reviews and approves/rejects.
   No talent roster, no casting calls, no submissions review.
*/
export default function CastingDirectorDashboard() {
  const store = useCastingStore()
  const user = useRoleStore((s) => s.user)

  /* Find my director profile */
  const myDirector = store.directors.find(
    (d) => d.email.toLowerCase() === (user?.email || '').toLowerCase()
  )

  const [showSetup, setShowSetup] = useState(!myDirector)
  const [setupAgency, setSetupAgency] = useState(user?.name ? user.name + ' Productions' : '')
  const [setupLocation, setSetupLocation] = useState('')
  const [tab, setTab] = useState<'submit' | 'my-submissions'>('submit')
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  /* Setup screen for new directors */
  if (!myDirector || showSetup) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-8 text-center max-w-md mx-auto mt-8">
          <Briefcase className="w-12 h-12 text-[#D4A853] mx-auto mb-4" />
          <h2 className="font-cinzel text-lg font-bold text-[#F0F0F0] mb-2">Set Up Your Agency</h2>
          <p className="font-inter text-xs text-[#6B6B6B] mb-6">
            Welcome, {user?.name || 'Director'}. Complete your agency profile to start submitting actor profiles to Cinex.
          </p>
          <div className="space-y-3 text-left">
            <div><label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Agency / Production House Name</label>
              <input value={setupAgency} onChange={(e) => setSetupAgency(e.target.value)} placeholder="Your agency name" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
            </div>
            <div><label className="text-[11px] font-inter text-[#6B6B6B] mb-1 block">Location</label>
              <input value={setupLocation} onChange={(e) => setSetupLocation(e.target.value)} placeholder="City, State" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
            </div>
          </div>
          <button onClick={() => {
            if (!setupAgency) return
            store.addDirector({ name: user?.name || 'Director', email: user?.email || '', agencyName: setupAgency, location: setupLocation, status: 'pending', createdBy: 'self', verified: false })
            setShowSetup(false)
            showToast('Agency profile created! Awaiting Cinex approval.')
          }} className="mt-5 w-full py-2.5 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-colors">Create Agency Profile</button>
        </div>
      </div>
    )
  }

  /* Actors this director has submitted to Cinex */
  const mySubmissions = store.talent.filter((t) => t.addedBy === myDirector.id)
  const pendingCount = mySubmissions.filter((t) => !t.verified).length
  const approvedCount = mySubmissions.filter((t) => t.verified).length

  const filteredSubmissions = mySubmissions.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location.toLowerCase().includes(search.toLowerCase()) ||
    t.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-[#F0F0F0]">{myDirector.agencyName}</h2>
          <p className="font-inter text-xs text-[#6B6B6B] mt-0.5">
            Director: {myDirector.name} · {myDirector.status === 'pending' ? 'Awaiting Cinex approval' : 'Cinex approved'} · {mySubmissions.length} actors submitted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('submit')} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${tab==='submit'?'bg-[#D4A853] text-[#060606]':'bg-[#111] text-[#888] hover:bg-[#1a1a1a]'}`}>
            Submit Actor
          </button>
          <button onClick={() => setTab('my-submissions')} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${tab==='my-submissions'?'bg-[#D4A853] text-[#060606]':'bg-[#111] text-[#888] hover:bg-[#1a1a1a]'}`}>
            My Submissions
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Submitted', value: mySubmissions.length, color: '#D4A853', icon: Users },
          { label: 'Pending Approval', value: pendingCount, color: '#E67E22', icon: Clock },
          { label: 'Cinex Approved', value: approvedCount, color: '#27AE60', icon: CheckCircle },
        ].map((s) => (
          <div key={s.label} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-4 text-center">
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <p className="font-cinzel text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="font-inter text-[10px] text-[#6B6B6B] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══════ SUBMIT ACTOR TAB ══════ */}
      {tab === 'submit' && (
        <>
          <div className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-6 text-center">
            <UserPlus className="w-10 h-10 text-[#D4A853] mx-auto mb-3" />
            <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0] mb-2">Submit Actor Profile to Cinex</h3>
            <p className="font-inter text-xs text-[#6B6B6B] max-w-md mx-auto mb-5">
              As a casting director, you act as a bridge between talented actors and Cinex. Submit actor profiles with complete details, and Cinex will review and verify them.
            </p>
            <button onClick={() => setShowSubmitForm(true)} className="px-6 py-2.5 rounded-lg bg-[#D4A853] text-[#060606] text-sm font-semibold hover:bg-[#E8BF6A] transition-colors flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Submit New Actor
            </button>
          </div>

          {mySubmissions.length > 0 && (
            <div>
              <h3 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] mb-3">Recently Submitted</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mySubmissions.slice(0, 6).map((t) => (
                  <div key={t.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={t.headshotUrl || t.photos[0]?.url} alt={t.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
                      <span className={`absolute top-2 right-2 text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded ${t.verified?'bg-[rgba(39,174,96,0.15)] text-[#27AE60]':'bg-[rgba(230,126,34,0.15)] text-[#E67E22]'}`}>
                        {t.verified ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0]">{t.name}</h4>
                      <p className="font-inter text-[11px] text-[#6B6B6B]">{t.role} · {t.age} yrs · {t.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════ MY SUBMISSIONS TAB ══════ */}
      {tab === 'my-submissions' && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your submitted actors..."
                className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm font-inter text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-16">
                <Send className="w-10 h-10 text-[#333] mx-auto mb-3" />
                <p className="font-space-grotesk text-sm text-[#6B6B6B]">No actors submitted yet.</p>
                <button onClick={() => setTab('submit')} className="mt-3 text-xs text-[#D4A853] font-inter hover:underline">Submit your first actor</button>
              </div>
            ) : (
              filteredSubmissions.map((t) => (
                <div key={t.id} className="bg-[#0D0D0D] border border-[#242424] rounded-xl p-5 flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#242424] flex-shrink-0">
                    <img src={t.headshotUrl || t.photos[0]?.url} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0]">{t.name}</h4>
                      <span className={`text-[9px] font-jetbrains-mono px-1.5 py-0.5 rounded ${t.verified?'bg-[rgba(39,174,96,0.15)] text-[#27AE60]':'bg-[rgba(230,126,34,0.15)] text-[#E67E22]'}`}>
                        {t.verified ? 'CINEX APPROVED' : 'PENDING CINEX REVIEW'}
                      </span>
                    </div>
                    <p className="font-inter text-[11px] text-[#6B6B6B]">{t.role} · {t.age} yrs · {t.height} · {t.location}</p>
                    <p className="font-inter text-[11px] text-[#6B6B6B] mt-0.5">{t.experience} experience · {t.languages?.join(', ')}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.skills?.slice(0, 4).map((s) => <span key={s} className="text-[9px] font-inter px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#888]">{s}</span>)}
                    </div>
                    {t.phone && <p className="text-[10px] text-[#555] mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{t.phone}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ══════ SUBMIT ACTOR MODAL ══════ */}
      {showSubmitForm && (
        <SubmitActorModal
          directorId={myDirector.id}
          directorName={myDirector.name}
          onClose={() => setShowSubmitForm(false)}
          onSave={() => {
            showToast('Actor profile submitted to Cinex for approval!')
            setShowSubmitForm(false)
            setTab('my-submissions')
          }}
        />
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
   SUBMIT ACTOR TO CINEX MODAL
   ═══════════════════════════════════════════ */
function SubmitActorModal({ directorId, directorName, onClose, onSave }: {
  directorId: string; directorName: string; onClose: () => void; onSave: () => void
}) {
  const store = useCastingStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [role, setRole] = useState('Actor')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [languages, setLanguages] = useState('Telugu, Hindi')
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [_linkedin, _setLinkedin] = useState('')

  const handleSave = () => {
    if (!name || !email) return
    const socialLinks: Record<string, string> = {}
    if (instagram) socialLinks.instagram = instagram
    if (facebook) socialLinks.facebook = facebook
    if (twitter) socialLinks.twitter = twitter
    if (youtube) socialLinks.youtube = youtube
    if (_linkedin) socialLinks.linkedin = _linkedin

    store.addTalent({
      name,
      email,
      phone,
      whatsapp,
      role,
      location,
      age: parseInt(age) || undefined,
      height,
      weight,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experience,
      bio,
      socialLinks,
      addedBy: directorId,
      addedByName: directorName,
      agencyId: directorId,
      verified: false,
      status: 'available',
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0D0D0D] border border-[#242424] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space-grotesk text-base font-semibold text-[#F0F0F0]">Submit Actor to Cinex</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-lg border border-[#242424] flex items-center justify-center hover:border-[#D4A853]"><X className="w-3.5 h-3.5 text-[#6B6B6B]" /></button>
          </div>
          <p className="text-[11px] text-[#6B6B6B] mb-4">Complete all details. Cinex will review and verify this actor before adding them to the directory.</p>

          <div className="space-y-4">
            {/* Basic */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#D4A853] uppercase">Basic Information</p>
              <div className="grid grid-cols-2 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email *" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp Number" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] focus:outline-none focus:border-[#D4A853]/40" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0]">
                  <option>Actor</option><option>Model</option><option>Dancer</option><option>Voice Artist</option><option>Child Artist</option>
                </select>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
                <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
                <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#D4A853] uppercase">Bio & Skills</p>
              <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Actor bio..." className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555] resize-none" />
              <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Languages (comma separated)" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
              <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Experience" className="w-full bg-[#111] border border-[#242424] rounded-lg px-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" />
            </div>

            {/* Social */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#D4A853] uppercase">Social Media</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative"><Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <div className="relative"><Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <div className="relative"><Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
                <div className="relative"><Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" /><input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="YouTube" className="w-full bg-[#111] border border-[#242424] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0F0F0] placeholder:text-[#555]" /></div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#D4A853] uppercase">Media Uploads</p>
              <div className="border border-dashed border-[#242424] rounded-xl p-4 text-center hover:border-[#D4A853]/30 transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-[#555] mx-auto mb-1" /><p className="text-[11px] text-[#6B6B6B]">Upload headshot / portfolio photos</p>
              </div>
              <div className="border border-dashed border-[#242424] rounded-xl p-4 text-center hover:border-[#E74C3C]/30 transition-colors cursor-pointer">
                <Video className="w-5 h-5 text-[#555] mx-auto mb-1" /><p className="text-[11px] text-[#6B6B6B]">Upload showreel / audition video</p>
              </div>
              <div className="border border-dashed border-[#242424] rounded-xl p-4 text-center hover:border-[#9B59B6]/30 transition-colors cursor-pointer">
                <Mic className="w-5 h-5 text-[#555] mx-auto mb-1" /><p className="text-[11px] text-[#6B6B6B]">Upload voice recording / script reading</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#242424]">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#242424] text-xs font-inter text-[#888] hover:bg-[#111]">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[#D4A853] text-[#060606] text-xs font-inter font-semibold hover:bg-[#E8BF6A]">Submit to Cinex</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Need Upload icon in this file scope */
function Upload(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> }
