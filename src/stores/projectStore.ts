/* ─────────────────────────────────────────────
   projectStore.ts — Unified Project Script Store
   ONE SCRIPT drives: Breakdown, Shot List, Storyboard,
   Pre-Viz, Scheduling, and all other features.
   ───────────────────────────────────────────── */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Scene {
  id: string
  number: number
  heading: string
  description: string
  characters: string[]
  lineIndex: number
  intExt: 'INT.' | 'EXT.' | 'I/E.'
  location: string
  time: string
}

export interface ProjectCharacter {
  name: string
  scenes: number[]
  dialogueCount: number
}

export interface Shot {
  id: string
  number: number
  sceneId: string
  description: string
  angle: string
  movement: string
  lens: string
  notes: string
  duration: number
  status: 'planned' | 'filmed' | 'edited' | 'cut'
  complexity: 'simple' | 'medium' | 'complex'
  lighting: string
  sound: string
  equipment: string[]
}

export interface StoryFrame {
  id: string
  number: number
  sceneId: string
  description: string
  image: string | null
  notes: string
  status: 'draft' | 'approved' | 'revised' | 'cut'
  createdAt: string
  annotations?: Array<{ id: string; type: string; x: number; y: number; text?: string; color: string }>
}

export interface PrevisVideo {
  id: string
  prompt: string
  status: 'generating' | 'completed' | 'failed'
  url?: string
  createdAt: string
  duration: number
  ratio: string
  model: string
  provider: string
}

export interface BreakdownElement {
  id: string
  type: 'scene' | 'cast' | 'props' | 'location' | 'wardrobe' | 'equipment' | 'vfx' | 'sound' | 'makeup'
  text: string
  sceneId: string
}

export interface Project {
  id: string
  title: string
  scriptContent: string
  createdAt: string
  updatedAt: string
  scenes: Scene[]
  characters: ProjectCharacter[]
  shots: Shot[]
  frames: StoryFrame[]
  previsVideos: PrevisVideo[]
  breakdownElements: BreakdownElement[]
  pageCount: number
  wordCount: number
  estimatedMinutes: number
}

/* ─── Fountain Parser Helpers ─── */
const detectLineType = (line: string): 'heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'note' | 'unknown' => {
  const trimmed = line.trim()
  if (!trimmed) return 'unknown'
  if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.') || trimmed.startsWith('I/E.') || trimmed.startsWith('EST.')) return 'heading'
  if (/^\d+\.?\s+/.test(trimmed) && (trimmed.includes('INT') || trimmed.includes('EXT'))) return 'heading'
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return 'parenthetical'
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 1 && trimmed.length < 60 && !trimmed.includes('.')) return 'character'
  if (trimmed.startsWith('FADE ') || trimmed.startsWith('CUT ') || trimmed.startsWith('DISSOLVE') || trimmed.startsWith('SMASH CUT') || trimmed.startsWith('JUMP CUT') || trimmed.endsWith('TO:')) return 'transition'
  return 'action'
}

const parseScenesFromScript = (content: string): Scene[] => {
  const lines = content.split('\n')
  const scenes: Scene[] = []
  let sceneNum = 0
  let currentDescription: string[] = []
  let currentChars = new Set<string>()

  lines.forEach((line, idx) => {
    const type = detectLineType(line)
    const trimmed = line.trim()

    if (type === 'heading') {
      // Save previous scene
      if (scenes.length > 0) {
        scenes[scenes.length - 1].description = currentDescription.join(' ').slice(0, 200)
        scenes[scenes.length - 1].characters = Array.from(currentChars)
      }

      sceneNum++
      currentDescription = []
      currentChars = new Set<string>()

      const intExt = trimmed.startsWith('INT.') ? 'INT.' : trimmed.startsWith('EXT.') ? 'EXT.' : 'I/E.'
      const locTimeMatch = trimmed.match(/(?:INT\.?|EXT\.?|I\/E\.?)\s+(.+?)\s*[-–—]\s*(.+)/i)
      const location = locTimeMatch ? locTimeMatch[1].trim() : trimmed
      const time = locTimeMatch ? locTimeMatch[2].trim() : 'DAY'

      scenes.push({
        id: `scene-${sceneNum}`,
        number: sceneNum,
        heading: trimmed,
        description: '',
        characters: [],
        lineIndex: idx,
        intExt,
        location,
        time,
      })
    } else if (type === 'character') {
      const name = trimmed.replace(/\s*\(.*\)\s*$/, '')
      if (name.length > 1 && name.length < 50) {
        currentChars.add(name)
      }
    } else if (type === 'action') {
      if (trimmed) currentDescription.push(trimmed)
    }
  })

  // Finalize last scene
  if (scenes.length > 0) {
    scenes[scenes.length - 1].description = currentDescription.join(' ').slice(0, 200)
    scenes[scenes.length - 1].characters = Array.from(currentChars)
  }

  return scenes
}

const extractCharactersFromScenes = (scenes: Scene[]): ProjectCharacter[] => {
  const charMap = new Map<string, { scenes: Set<number>; dialogueCount: number }>()

  scenes.forEach((scene) => {
    scene.characters.forEach((name) => {
      if (!charMap.has(name)) charMap.set(name, { scenes: new Set(), dialogueCount: 0 })
      charMap.get(name)!.scenes.add(scene.number)
      charMap.get(name)!.dialogueCount++
    })
  })

  return Array.from(charMap.entries())
    .map(([name, data]) => ({
      name,
      scenes: Array.from(data.scenes),
      dialogueCount: data.dialogueCount,
    }))
    .sort((a, b) => b.scenes.length - a.scenes.length)
}

const estimatePageCount = (content: string): number => {
  const lines = content.split('\n').filter((l) => l.trim())
  let pageCount = 0
  let linesOnPage = 0
  const LINES_PER_PAGE = 55

  lines.forEach((line) => {
    const type = detectLineType(line)
    const lineHeight = type === 'heading' || type === 'transition' ? 2 : type === 'character' ? 1 : 1.5
    linesOnPage += lineHeight
    if (linesOnPage >= LINES_PER_PAGE) {
      pageCount++
      linesOnPage = 0
    }
  })
  if (linesOnPage > 0) pageCount++
  return Math.max(pageCount, 1)
}

const countWords = (content: string): number => content.trim().split(/\s+/).filter(Boolean).length

/* ─── Auto-Generate Shots from Script ─── */
const generateShotsFromScenes = (scenes: Scene[]): Shot[] => {
  const shots: Shot[] = []
  let shotNum = 1

  scenes.forEach((scene) => {
    // Scene establishing shot
    shots.push({
      id: `shot-${shotNum}`,
      number: shotNum++,
      sceneId: scene.id,
      description: `Establish ${scene.intExt} ${scene.location}`,
      angle: scene.intExt === 'INT.' ? 'Wide Shot' : scene.intExt === 'EXT.' ? 'Wide Shot' : 'Aerial',
      movement: 'Static',
      lens: '24mm',
      notes: `Scene ${scene.number}: ${scene.description.slice(0, 80)}`,
      duration: 4,
      status: 'planned',
      complexity: 'simple',
      lighting: scene.time === 'NIGHT' ? 'Practical/Practical' : 'Natural',
      sound: 'Ambient',
      equipment: ['Tripod'],
    })

    // Character shots
    scene.characters.forEach((char) => {
      shots.push({
        id: `shot-${shotNum}`,
        number: shotNum++,
        sceneId: scene.id,
        description: `${char} in ${scene.location}`,
        angle: scene.characters.length > 1 ? 'Medium Shot' : 'Close-Up',
        movement: 'Static',
        lens: scene.characters.length > 1 ? '50mm' : '85mm',
        notes: `Character coverage for ${char}`,
        duration: 3,
        status: 'planned',
        complexity: 'simple',
        lighting: scene.time === 'NIGHT' ? 'Dramatic key' : 'Key + Fill',
        sound: 'Boom mic',
        equipment: ['Tripod', 'Boom mic'],
      })
    })

    // Coverage shot for dialogue scenes
    if (scene.characters.length > 1) {
      shots.push({
        id: `shot-${shotNum}`,
        number: shotNum++,
        sceneId: scene.id,
        description: `Two-shot: ${scene.characters.slice(0, 2).join(' + ')}`,
        angle: 'Over-Shoulder',
        movement: 'Static',
        lens: '50mm',
        notes: 'Dialogue coverage, reverse angle needed',
        duration: 5,
        status: 'planned',
        complexity: 'medium',
        lighting: scene.time === 'NIGHT' ? 'Three-point' : 'Key + Fill',
        sound: 'Boom + Lav',
        equipment: ['Dolly', 'Boom mic', 'Lavalier'],
      })
    }
  })

  return shots
}

/* ─── Auto-Generate Frames from Scenes ─── */
const generateFramesFromScenes = (scenes: Scene[]): StoryFrame[] => {
  const frames: StoryFrame[] = []

  scenes.forEach((scene) => {
    frames.push({
      id: `frame-${scene.id}`,
      number: scene.number,
      sceneId: scene.id,
      description: `Scene ${scene.number}: ${scene.heading} — ${scene.description.slice(0, 120)}`,
      image: null,
      notes: `Characters: ${scene.characters.join(', ') || 'None'}`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
    })
  })

  return frames
}

/* ─── Breakdown from Script ─── */
const generateBreakdownFromScript = (scenes: Scene[], content: string): BreakdownElement[] => {
  const elements: BreakdownElement[] = []
  const lines = content.split('\n')

  // Props keywords
  const propKeywords = ['gun', 'phone', 'laptop', 'car', 'bag', 'wallet', 'file', 'document', 'book', 'chair', 'table', 'flashlight', 'knife', 'key', 'letter', 'camera', 'briefcase', 'umbrella']
  const wardrobeKeywords = ['uniform', 'dress', 'suit', 'coat', 'jacket', 'shirt', 'hat', 'shoes', 'boots', 'sari', 'kurta', 'lehenga', 'dhoti', 'sherwani', 'police uniform']
  const vfxKeywords = ['explosion', 'fire', 'rain', 'snow', 'blood', 'ghost', 'monster', 'alien', 'spaceship', 'cg', 'cgi', 'green screen', 'vfx', 'digital']

  scenes.forEach((scene) => {
    elements.push({ id: `el-${scene.id}-scene`, type: 'scene', text: `Scene ${scene.number}`, sceneId: scene.id })
    elements.push({ id: `el-${scene.id}-loc`, type: 'location', text: scene.location, sceneId: scene.id })

    scene.characters.forEach((char) => {
      elements.push({ id: `el-${scene.id}-${char}`, type: 'cast', text: char, sceneId: scene.id })
    })
  })

  // Scan lines for props, wardrobe, VFX
  lines.forEach((line, idx) => {
    const lower = line.toLowerCase()
    let sceneId = scenes[0]?.id || 'unknown'
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (scenes[i].lineIndex <= idx) {
        sceneId = scenes[i].id
        break
      }
    }

    propKeywords.forEach((prop) => {
      if (lower.includes(prop) && !elements.find((e) => e.text.toLowerCase() === prop && e.sceneId === sceneId)) {
        elements.push({ id: `el-prop-${idx}`, type: 'props', text: prop.charAt(0).toUpperCase() + prop.slice(1), sceneId })
      }
    })

    wardrobeKeywords.forEach((w) => {
      if (lower.includes(w) && !elements.find((e) => e.text.toLowerCase() === w && e.sceneId === sceneId)) {
        elements.push({ id: `el-wd-${idx}`, type: 'wardrobe', text: w.charAt(0).toUpperCase() + w.slice(1), sceneId })
      }
    })

    vfxKeywords.forEach((v) => {
      if (lower.includes(v) && !elements.find((e) => e.text.toLowerCase() === v && e.sceneId === sceneId)) {
        elements.push({ id: `el-vfx-${idx}`, type: 'vfx', text: v.charAt(0).toUpperCase() + v.slice(1), sceneId })
      }
    })
  })

  return elements
}

/* ─── Previs Prompts from Scenes ─── */
const generatePrevisPrompts = (scenes: Scene[]): PrevisVideo[] => {
  return scenes.map((scene) => ({
    id: `previs-${scene.id}`,
    prompt: `Cinematic ${scene.intExt === 'EXT.' ? 'exterior' : 'interior'} scene: ${scene.description}. ${scene.time === 'NIGHT' ? 'Night scene with dramatic lighting.' : 'Day scene with natural lighting.'} Characters: ${scene.characters.join(', ') || 'N/A'}.`,
    status: 'completed' as const,
    createdAt: new Date().toISOString().split('T')[0],
    duration: 5,
    ratio: '16:9',
    model: 'gen-4-turbo',
    provider: 'Runway',
  }))
}

/* ─── Default Sample Script ─── */
export const SAMPLE_SCRIPT = `TITLE: NEON SHADOWS

AUTHOR: Anonymous
DRAFT DATE: 2026-04-15

FADE IN:

EXT. HYDERABAD CITY STREET - NIGHT

Rain pours down on the neon-lit streets of Hyderabad. AMBER (28, determined, soaked) runs through the alley, clutching a leather bag.

She stops at a dead end. Footsteps echo behind her. AMBER turns to see RAJ (35, menacing, umbrella in hand) approaching slowly.

AMBER
(whispering to herself)
Not tonight. Not after everything.

RAJ
You can't run from your past, Amber.

Amber opens the bag. Inside: a vintage film reel.

AMBER
This is the only copy. You want it? Come get it.

She throws the reel into the air. As Raj lunges for it, Amber sprints past him, disappearing into the monsoon.

CUT TO:

INT. AMBER'S APARTMENT - LATER

Dimly lit. Amber slams the door. She slides down, catching her breath. Rain drips from her hair.

AMBER
(to herself)
They'll never find it now.

She pulls out the film reel. A label reads: "PROJECT FIREWALL - 1987"

AMBER (V.O.)
Some stories are buried for a reason.

DISSOLVE TO:

EXT. ROOFTOP - DAWN

Amber stands at the edge, watching the city wake. The sun breaks through the clouds.

AMBER
Tomorrow, the truth comes out.

FADE TO BLACK.

THE END`

/* ─── Create Default Project ─── */
const createDefaultProject = (): Project => {
  const scenes = parseScenesFromScript(SAMPLE_SCRIPT)
  const characters = extractCharactersFromScenes(scenes)
  const shots = generateShotsFromScenes(scenes)
  const frames = generateFramesFromScenes(scenes)
  const breakdownElements = generateBreakdownFromScript(scenes, SAMPLE_SCRIPT)
  const previs = generatePrevisPrompts(scenes)

  return {
    id: 'project-1',
    title: 'Neon Shadows',
    scriptContent: SAMPLE_SCRIPT,
    createdAt: '2026-04-15',
    updatedAt: '2026-04-15',
    scenes,
    characters,
    shots,
    frames,
    previsVideos: previs,
    breakdownElements,
    pageCount: estimatePageCount(SAMPLE_SCRIPT),
    wordCount: countWords(SAMPLE_SCRIPT),
    estimatedMinutes: Math.round(estimatePageCount(SAMPLE_SCRIPT) * 0.5),
  }
}

/* ─── Store Interface ─── */
interface ProjectStore {
  activeProjectId: string | null
  projects: Project[]

  // Getters
  getActiveProject: () => Project | null
  getScenes: () => Scene[]
  getCharacters: () => ProjectCharacter[]
  getShots: () => Shot[]
  getFrames: () => StoryFrame[]
  getPrevisVideos: () => PrevisVideo[]
  getBreakdownElements: () => BreakdownElement[]

  // Setters
  setActiveProject: (id: string) => void
  createProject: (title: string) => void
  deleteProject: (id: string) => void

  // Script operations
  updateScript: (content: string) => void
  syncFromScript: () => void

  // Child updates
  updateShots: (shots: Shot[]) => void
  updateFrames: (frames: StoryFrame[]) => void
  updatePrevisVideos: (videos: PrevisVideo[]) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      activeProjectId: 'project-1',
      projects: [createDefaultProject()],

      getActiveProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find((p) => p.id === activeProjectId) || projects[0] || null
      },

      getScenes: () => get().getActiveProject()?.scenes || [],
      getCharacters: () => get().getActiveProject()?.characters || [],
      getShots: () => get().getActiveProject()?.shots || [],
      getFrames: () => get().getActiveProject()?.frames || [],
      getPrevisVideos: () => get().getActiveProject()?.previsVideos || [],
      getBreakdownElements: () => get().getActiveProject()?.breakdownElements || [],

      setActiveProject: (id) => set({ activeProjectId: id }),

      createProject: (title) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          title,
          scriptContent: '',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          scenes: [],
          characters: [],
          shots: [],
          frames: [],
          previsVideos: [],
          breakdownElements: [],
          pageCount: 0,
          wordCount: 0,
          estimatedMinutes: 0,
        }
        set((s) => ({
          projects: [...s.projects, newProject],
          activeProjectId: newProject.id,
        }))
      },

      deleteProject: (id) => {
        set((s) => {
          const remaining = s.projects.filter((p) => p.id !== id)
          return {
            projects: remaining,
            activeProjectId: remaining.length > 0 ? remaining[0].id : null,
          }
        })
      },

      updateScript: (content) => {
        set((s) => {
          const project = s.projects.find((p) => p.id === s.activeProjectId)
          if (!project) return s

          const scenes = parseScenesFromScript(content)
          const characters = extractCharactersFromScenes(scenes)
          const updatedProject: Project = {
            ...project,
            scriptContent: content,
            scenes,
            characters,
            pageCount: estimatePageCount(content),
            wordCount: countWords(content),
            estimatedMinutes: Math.round(estimatePageCount(content) * 0.5),
            updatedAt: new Date().toISOString().split('T')[0],
          }
          return {
            projects: s.projects.map((p) => (p.id === s.activeProjectId ? updatedProject : p)),
          }
        })
      },

      syncFromScript: () => {
        set((s) => {
          const project = s.projects.find((p) => p.id === s.activeProjectId)
          if (!project || !project.scriptContent) return s

          const shots = generateShotsFromScenes(project.scenes)
          const frames = generateFramesFromScenes(project.scenes)
          const breakdownElements = generateBreakdownFromScript(project.scenes, project.scriptContent)
          const previs = generatePrevisPrompts(project.scenes)

          const updatedProject: Project = {
            ...project,
            shots,
            frames,
            breakdownElements,
            previsVideos: previs,
            updatedAt: new Date().toISOString().split('T')[0],
          }

          return {
            projects: s.projects.map((p) => (p.id === s.activeProjectId ? updatedProject : p)),
          }
        })
      },

      updateShots: (shots) => {
        set((s) => {
          const project = s.projects.find((p) => p.id === s.activeProjectId)
          if (!project) return s
          return {
            projects: s.projects.map((p) =>
              p.id === s.activeProjectId ? { ...p, shots } : p
            ),
          }
        })
      },

      updateFrames: (frames) => {
        set((s) => {
          const project = s.projects.find((p) => p.id === s.activeProjectId)
          if (!project) return s
          return {
            projects: s.projects.map((p) =>
              p.id === s.activeProjectId ? { ...p, frames } : p
            ),
          }
        })
      },

      updatePrevisVideos: (previsVideos) => {
        set((s) => {
          const project = s.projects.find((p) => p.id === s.activeProjectId)
          if (!project) return s
          return {
            projects: s.projects.map((p) =>
              p.id === s.activeProjectId ? { ...p, previsVideos } : p
            ),
          }
        })
      },
    }),
    { name: 'cinex-projects', version: 1 }
  )
)
