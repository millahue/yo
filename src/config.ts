/* ── Motion / spring defaults ── */
export const framerMotionConfig = {
  type: 'spring' as const,
  mass: 5,
  stiffness: 500,
  damping: 50,
  restDelta: 0.0001,
}

/* ── Section labels ── */
export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id']

/* ── Animation metadata ── */
export interface AnimMeta {
  name: string
  file: string
  label: string
  icon: string
}

export const animations: AnimMeta[] = [
  { name: 'Idle',       file: 'animations/Idle.fbx',       label: 'Idle',      icon: '⟳' },
  { name: 'Walking',    file: 'animations/Walking.fbx',    label: 'Walking',   icon: '🚶' },
  { name: 'Running',    file: 'animations/Running.fbx',    label: 'Running',   icon: '🏃' },
  { name: 'Dancing',    file: 'animations/Dancing.fbx',    label: 'Dance',     icon: '💃' },
  { name: 'Jumping',    file: 'animations/Jumping.fbx',    label: 'Jump',      icon: '⬆' },
]
