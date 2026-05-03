import { useState, useCallback } from 'react'
import {
  Calendar,
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Wand2,
  Grid3x3,
  List,
  Save,
} from 'lucide-react'

/* ─── Types ─── */
interface Scene {
  id: string
  number: number
  heading: string
  estTime: string
  cast: string[]
  location: string
  dayOrNight: 'DAY' | 'NIGHT' | 'DUSK' | 'DAWN'
}

interface DaySchedule {
  id: string
  date: string
  label: string
  scenes: Scene[]
}

/* ─── Mock Data ─── */
const initialScenes: Scene[] = [
  { id: 'sc1', number: 1, heading: 'EXT. WAREHOUSE DISTRICT - NIGHT', estTime: '0:45', cast: ['Jack'], location: 'Warehouse Ext', dayOrNight: 'NIGHT' },
  { id: 'sc2', number: 2, heading: 'INT. WAREHOUSE - CONTINUOUS', estTime: '1:30', cast: ['Jack', 'Sarah'], location: 'Warehouse Int', dayOrNight: 'NIGHT' },
  { id: 'sc3', number: 3, heading: 'INT. WAREHOUSE OFFICE - NIGHT', estTime: '1:15', cast: ['Sarah'], location: 'Warehouse Office', dayOrNight: 'NIGHT' },
  { id: 'sc4', number: 4, heading: 'EXT. ALLEY BEHIND WAREHOUSE - NIGHT', estTime: '0:30', cast: ['Jack'], location: 'Alley', dayOrNight: 'NIGHT' },
  { id: 'sc5', number: 5, heading: 'INT. SAFEHOUSE - DAY', estTime: '2:00', cast: ['Sarah', 'Morgan'], location: 'Safehouse', dayOrNight: 'DAY' },
  { id: 'sc6', number: 6, heading: 'EXT. SAFEHOUSE ROOF - DUSK', estTime: '0:45', cast: ['Jack', 'Sarah'], location: 'Safehouse Roof', dayOrNight: 'DUSK' },
]

const initialSchedule: DaySchedule[] = [
  { id: 'd1', date: '2025-06-02', label: 'Day 1 — Mon', scenes: [initialScenes[0], initialScenes[1]] },
  { id: 'd2', date: '2025-06-03', label: 'Day 2 — Tue', scenes: [initialScenes[2]] },
  { id: 'd3', date: '2025-06-04', label: 'Day 3 — Wed', scenes: [] },
  { id: 'd4', date: '2025-06-05', label: 'Day 4 — Thu', scenes: [initialScenes[3]] },
  { id: 'd5', date: '2025-06-06', label: 'Day 5 — Fri', scenes: [] },
]

/* ─── Helpers ─── */
const timeToMin = (t: string) => {
  const [m, s] = t.split(':').map(Number)
  return m + s / 60
}
const formatTime = (m: number) => `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`

const dayOrNightColor = (d: Scene['dayOrNight']) => {
  switch (d) {
    case 'DAY': return 'text-[#F2C94C]'
    case 'NIGHT': return 'text-[#2D9CDB]'
    case 'DUSK': return 'text-[#E67E22]'
    case 'DAWN': return 'text-[#9B59B6]'
  }
}

const dayOrNightBg = (d: Scene['dayOrNight']) => {
  switch (d) {
    case 'DAY': return 'bg-[#F2C94C]/10 border-l-[#F2C94C]'
    case 'NIGHT': return 'bg-[#2D9CDB]/10 border-l-[#2D9CDB]'
    case 'DUSK': return 'bg-[#E67E22]/10 border-l-[#E67E22]'
    case 'DAWN': return 'bg-[#9B59B6]/10 border-l-[#9B59B6]'
  }
}

/* ─── Component ─── */
export default function Scheduling() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule)
  const [unassigned, setUnassigned] = useState<Scene[]>([initialScenes[4], initialScenes[5]])
  const [view, setView] = useState<'stripboard' | 'calendar'>('stripboard')
  const [draggingScene, setDraggingScene] = useState<Scene | null>(null)
  const [dragSource, setDragSource] = useState<string | null>(null)
  const [nextSceneNum, setNextSceneNum] = useState(7)
  const [saving, setSaving] = useState(false)

  /* ─── Drag & Drop ─── */
  const onDragStart = useCallback((scene: Scene, source: string) => {
    setDraggingScene(scene)
    setDragSource(source)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent, targetDayId: string | 'unassigned') => {
      e.preventDefault()
      if (!draggingScene || !dragSource) return

      // Remove from source
      if (dragSource === 'unassigned') {
        setUnassigned((prev) => prev.filter((s) => s.id !== draggingScene.id))
      } else {
        setSchedule((prev) =>
          prev.map((d) =>
            d.id === dragSource ? { ...d, scenes: d.scenes.filter((s) => s.id !== draggingScene.id) } : d
          )
        )
      }

      // Add to target
      if (targetDayId === 'unassigned') {
        setUnassigned((prev) => [...prev, draggingScene])
      } else {
        setSchedule((prev) =>
          prev.map((d) =>
            d.id === targetDayId ? { ...d, scenes: [...d.scenes, draggingScene] } : d
          )
        )
      }

      setDraggingScene(null)
      setDragSource(null)
    },
    [draggingScene, dragSource]
  )

  /* ─── Actions ─── */
  const addScene = useCallback(() => {
    const newScene: Scene = {
      id: `sc${Date.now()}`,
      number: nextSceneNum,
      heading: 'NEW SCENE — TBD',
      estTime: '1:00',
      cast: [],
      location: 'TBD',
      dayOrNight: 'DAY',
    }
    setUnassigned((prev) => [...prev, newScene])
    setNextSceneNum((n) => n + 1)
  }, [nextSceneNum])

  const removeScene = useCallback((sceneId: string, source: string) => {
    if (source === 'unassigned') {
      setUnassigned((prev) => prev.filter((s) => s.id !== sceneId))
    } else {
      setSchedule((prev) =>
        prev.map((d) =>
          d.id === source ? { ...d, scenes: d.scenes.filter((s) => s.id !== sceneId) } : d
        )
      )
    }
  }, [])

  const autoSchedule = useCallback(() => {
    const allScenes = [...unassigned]
    if (allScenes.length === 0) return
    setSchedule((prev) => {
      let sceneIdx = 0
      return prev.map((d) => {
        const addCount = Math.min(allScenes.length - sceneIdx, 2)
        const added = allScenes.slice(sceneIdx, sceneIdx + addCount)
        sceneIdx += addCount
        return { ...d, scenes: [...d.scenes, ...added] }
      })
    })
    setUnassigned([])
  }, [unassigned])

  const saveSchedule = useCallback(() => {
    setSaving(true)
    setTimeout(() => setSaving(false), 800)
  }, [])

  /* ─── Calendar helpers ─── */
  const weekStart = new Date('2025-06-01')
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const getDaySchedule = (dateStr: string) => schedule.find((d) => d.date === dateStr)

  /* ─── Render ─── */
  return (
    <div className="min-h-[100dvh] bg-[#060606] text-[#F0F0F0]">
      <div className="container-lg py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-space-grotesk text-3xl font-semibold text-[#F0F0F0] mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#D4A853]" />
              Scheduling
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              Drag-drop stripboard, day timeline, calendar view.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-[#131313] border border-[#242424] rounded-md p-1">
              <button
                onClick={() => setView('stripboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'stripboard' ? 'bg-[#D4A853] text-[#060606]' : 'text-[#A3A3A3] hover:text-[#F0F0F0]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Stripboard
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  view === 'calendar' ? 'bg-[#D4A853] text-[#060606]' : 'text-[#A3A3A3] hover:text-[#F0F0F0]'
                }`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>
            <button className="btn-secondary text-sm" onClick={autoSchedule}>
              <Wand2 className="w-4 h-4" />
              Auto-Schedule
            </button>
            <button className="btn-primary text-sm" onClick={addScene}>
              <Plus className="w-4 h-4" />
              Add Scene
            </button>
            <button className="btn-secondary text-sm" onClick={saveSchedule} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* ─── STRIPBOARD VIEW ─── */}
        {view === 'stripboard' && (
          <div className="space-y-6">
            {/* Unassigned pool */}
            <div
              className="card-cinex"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, 'unassigned')}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-space-grotesk text-base font-medium flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#D4A853]" />
                  Unassigned Scenes ({unassigned.length})
                </h2>
                <p className="text-xs text-[#6B6B6B]">Drag scenes into a day below</p>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {unassigned.map((scene) => (
                  <div
                    key={scene.id}
                    draggable
                    onDragStart={() => onDragStart(scene, 'unassigned')}
                    className="flex items-center gap-2 bg-[#0D0D0D] border border-[#242424] rounded-lg px-3 py-2 cursor-move hover:border-[#D4A853] transition-colors"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    <span className="text-xs font-bold text-[#D4A853]">#{scene.number}</span>
                    <span className="text-xs max-w-[160px] truncate">{scene.heading}</span>
                    <button
                      className="ml-1 p-0.5 rounded hover:bg-[#242424] text-[#E74C3C]"
                      onClick={() => removeScene(scene.id, 'unassigned')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {unassigned.length === 0 && (
                  <p className="text-xs text-[#6B6B6B] italic">All scenes are scheduled</p>
                )}
              </div>
            </div>

            {/* Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {schedule.map((day) => {
                const totalMin = day.scenes.reduce((sum, s) => sum + timeToMin(s.estTime), 0)
                return (
                  <div
                    key={day.id}
                    className="card-cinex"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, day.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium">{day.label}</h3>
                        <p className="text-xs text-[#6B6B6B]">{day.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{day.scenes.length} scenes</p>
                        <p className="text-[10px] text-[#6B6B6B]">{formatTime(totalMin)} est.</p>
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[60px]">
                      {day.scenes.map((scene) => (
                        <div
                          key={scene.id}
                          draggable
                          onDragStart={() => onDragStart(scene, day.id)}
                          className={`flex items-center gap-2 border-l-2 rounded-md px-3 py-2 cursor-move hover:brightness-110 transition-all ${dayOrNightBg(scene.dayOrNight)}`}
                        >
                          <GripVertical className="w-3.5 h-3.5 text-[#6B6B6B]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#D4A853]">#{scene.number}</span>
                              <span className={`text-[10px] font-medium uppercase ${dayOrNightColor(scene.dayOrNight)}`}>
                                {scene.dayOrNight}
                              </span>
                            </div>
                            <p className="text-xs truncate">{scene.heading}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B]">
                                <Clock className="w-3 h-3" />
                                {scene.estTime}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B]">
                                <MapPin className="w-3 h-3" />
                                {scene.location}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B]">
                                <Users className="w-3 h-3" />
                                {scene.cast.join(', ')}
                              </span>
                            </div>
                          </div>
                          <button
                            className="p-1 rounded hover:bg-black/20 text-[#E74C3C]"
                            onClick={() => removeScene(scene.id, day.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {day.scenes.length === 0 && (
                        <div className="border-2 border-dashed border-[#242424] rounded-md p-4 text-center">
                          <p className="text-xs text-[#6B6B6B]">Drop scenes here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── CALENDAR VIEW ─── */}
        {view === 'calendar' && (
          <div className="card-cinex">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-space-grotesk text-base font-medium">Week View</h2>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded hover:bg-[#242424]">
                  <ChevronLeft className="w-4 h-4 text-[#A3A3A3]" />
                </button>
                <span className="text-sm text-[#A3A3A3]">Jun 1 – Jun 7, 2025</span>
                <button className="p-1 rounded hover:bg-[#242424]">
                  <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs text-[#6B6B6B] uppercase py-2 border-b border-[#242424]">
                  {d}
                </div>
              ))}
              {weekDays.map((d) => {
                const dateStr = d.toISOString().split('T')[0]
                const ds = getDaySchedule(dateStr)
                const isToday = d.getDate() === 2 // highlight Day 1
                return (
                  <div
                    key={dateStr}
                    className={`min-h-[140px] border rounded-lg p-2 transition-colors ${
                      isToday ? 'border-[#D4A853] bg-[#D4A853]/5' : 'border-[#242424] bg-[#0D0D0D]'
                    }`}
                    onDragOver={onDragOver}
                    onDrop={(e) => {
                      const daySchedule = schedule.find((s) => s.date === dateStr)
                      onDrop(e, daySchedule?.id ?? 'unassigned')
                    }}
                  >
                    <p className={`text-xs font-medium mb-2 ${isToday ? 'text-[#D4A853]' : 'text-[#A3A3A3]'}`}>
                      {d.getDate()}
                    </p>
                    <div className="space-y-1">
                      {ds?.scenes.map((scene) => (
                        <div
                          key={scene.id}
                          draggable
                          onDragStart={() => onDragStart(scene, ds.id)}
                          className={`text-[10px] px-1.5 py-1 rounded border-l-2 cursor-move ${dayOrNightBg(scene.dayOrNight)}`}
                        >
                          <span className="font-bold">#{scene.number}</span> {scene.heading.slice(0, 20)}…
                        </div>
                      ))}
                      {(!ds || ds.scenes.length === 0) && (
                        <p className="text-[10px] text-[#333333] italic">No scenes</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
