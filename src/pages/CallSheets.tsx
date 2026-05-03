import { useState } from 'react'
import { PhoneCall, Plus, Trash2, Download, Clock, MapPin, Users, FileText } from 'lucide-react'

interface CallSheet {
  id: number
  date: string
  project: string
  location: string
  callTime: string
  crew: { role: string; name: string; callTime: string }[]
  scenes: number[]
  notes: string
}

const INITIAL_CALLS: CallSheet[] = [
  {
    id: 1,
    date: '2025-06-15',
    project: 'Neon Shadows',
    location: 'Ramoji Film City, Hyderabad',
    callTime: '06:00 AM',
    crew: [
      { role: 'Director', name: 'Rajesh Kumar', callTime: '05:30 AM' },
      { role: 'Cinematographer', name: 'Priya Sharma', callTime: '05:30 AM' },
      { role: 'Sound', name: 'Venkatesh R.', callTime: '06:00 AM' },
      { role: 'Production Asst', name: 'Ananya B.', callTime: '06:00 AM' },
    ],
    scenes: [12, 13, 14],
    notes: 'Rain sequence. Bring waterproof gear. Backup indoor location ready.',
  },
]

export default function CallSheets() {
  const [calls, setCalls] = useState<CallSheet[]>(INITIAL_CALLS)
  const [showForm, setShowForm] = useState(false)
  const [newCall, setNewCall] = useState<Partial<CallSheet>>({
    date: '', project: '', location: '', callTime: '06:00 AM', scenes: [], notes: '',
  })
  const [crewInputs, setCrewInputs] = useState<{ role: string; name: string; callTime: string }[]>([
    { role: '', name: '', callTime: '' },
  ])

  const addCrewRow = () => setCrewInputs([...crewInputs, { role: '', name: '', callTime: '' }])
  const updateCrew = (i: number, field: string, value: string) => {
    const next = [...crewInputs]
    next[i] = { ...next[i], [field]: value }
    setCrewInputs(next)
  }
  const removeCrew = (i: number) => setCrewInputs(crewInputs.filter((_, idx) => idx !== i))

  const saveCall = () => {
    const validCrew = crewInputs.filter((c) => c.role && c.name)
    if (!newCall.date || !newCall.project || !newCall.location) return
    const call: CallSheet = {
      id: Date.now(),
      date: newCall.date,
      project: newCall.project,
      location: newCall.location,
      callTime: newCall.callTime || '06:00 AM',
      crew: validCrew,
      scenes: newCall.scenes || [],
      notes: newCall.notes || '',
    }
    setCalls([call, ...calls])
    setShowForm(false)
    setNewCall({ date: '', project: '', location: '', callTime: '06:00 AM', scenes: [], notes: '' })
    setCrewInputs([{ role: '', name: '', callTime: '' }])
  }

  const deleteCall = (id: number) => setCalls(calls.filter((c) => c.id !== id))

  const exportCall = (call: CallSheet) => {
    const text = `CALL SHEET\n${'='.repeat(40)}\n\nProject: ${call.project}\nDate: ${call.date}\nLocation: ${call.location}\nCall Time: ${call.callTime}\n\nSCENES: ${call.scenes.join(', ')}\n\nCREW:\n${call.crew.map((c) => `  ${c.role}: ${c.name} (Call: ${c.callTime})`).join('\n')}\n\nNOTES:\n${call.notes}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `call_sheet_${call.project.replace(/\s+/g, '_')}_${call.date}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Call Sheets</h1>
            <p className="font-inter text-sm text-[#888888]">Generate and manage daily call sheets</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-4 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors"
          >
            <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Call Sheet'}
          </button>
        </div>

        {/* New Call Sheet Form */}
        {showForm && (
          <div className="bg-[#111111] border border-[#242424] rounded-xl p-6 mb-8">
            <h3 className="font-space-grotesk text-lg font-semibold text-white mb-4">Create Call Sheet</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <input
                type="date"
                value={newCall.date}
                onChange={(e) => setNewCall({ ...newCall, date: e.target.value })}
                className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4A853]"
              />
              <input
                type="text"
                placeholder="Project name"
                value={newCall.project}
                onChange={(e) => setNewCall({ ...newCall, project: e.target.value })}
                className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
              />
              <input
                type="text"
                placeholder="Location"
                value={newCall.location}
                onChange={(e) => setNewCall({ ...newCall, location: e.target.value })}
                className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
              />
            </div>
            <div className="mb-4">
              <p className="font-inter text-xs text-[#6B6B6B] uppercase mb-2">Crew</p>
              <div className="space-y-2">
                {crewInputs.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Role"
                      value={c.role}
                      onChange={(e) => updateCrew(i, 'role', e.target.value)}
                      className="flex-1 bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) => updateCrew(i, 'name', e.target.value)}
                      className="flex-1 bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                    />
                    <input
                      type="text"
                      placeholder="Call time"
                      value={c.callTime}
                      onChange={(e) => updateCrew(i, 'callTime', e.target.value)}
                      className="w-28 bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                    />
                    <button onClick={() => removeCrew(i)} className="p-2 rounded hover:bg-[#242424] text-[#6B6B6B] hover:text-[#E74C3C]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addCrewRow} className="mt-2 text-sm text-[#D4A853] hover:underline font-inter">+ Add crew member</button>
            </div>
            <textarea
              placeholder="Notes (weather, special instructions, etc.)"
              value={newCall.notes}
              onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
              className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853] mb-4 resize-none h-20"
            />
            <button onClick={saveCall} className="bg-[#D4A853] text-[#060606] px-6 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors">
              Save Call Sheet
            </button>
          </div>
        )}

        {/* Call Sheets List */}
        <div className="space-y-4">
          {calls.map((call) => (
            <div key={call.id} className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1a1a1a]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-space-grotesk text-lg font-semibold text-white">{call.project}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20">{call.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#888888]">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {call.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Call: {call.callTime}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Scenes: {call.scenes.join(', ') || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => exportCall(call)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#242424] text-[#A3A3A3] hover:text-white hover:border-[#333333] text-sm font-inter transition-all">
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => deleteCall(call.id)} className="p-2 rounded-lg border border-[#242424] text-[#6B6B6B] hover:text-[#E74C3C] hover:border-red-500/30 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="font-inter text-xs text-[#6B6B6B] uppercase mb-3">Crew Call Times</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {call.crew.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#6B6B6B]" />
                        <span className="font-inter text-sm text-[#CCCCCC]">{c.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#181818] text-[#888888]">{c.role}</span>
                      </div>
                      <span className="font-inter text-xs text-[#D4A853]">{c.callTime}</span>
                    </div>
                  ))}
                </div>
                {call.notes && (
                  <div className="mt-4 p-3 bg-[#181818] rounded-lg">
                    <p className="font-inter text-xs text-[#6B6B6B] uppercase mb-1">Notes</p>
                    <p className="font-inter text-sm text-[#AAAAAA]">{call.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {calls.length === 0 && (
          <div className="text-center py-16">
            <PhoneCall className="w-12 h-12 text-[#333333] mx-auto mb-3" />
            <p className="font-inter text-sm text-[#6B6B6B]">No call sheets yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
