export interface MindMapNode {
  id: string
  group: number
  description: string
  val?: number
  /** Content is loaded asynchronously via contentRegistry.
   *  It is guaranteed to be populated before the first React render
   *  via contentReady promise in main.tsx. */
  content?: NodeContent
  x?: number
  y?: number
  z?: number
  /** Molecule's own rotation speed (rad/s) */
  spinSpeed?: number
  /** Order in the learning path (step-by-step) */
  learningStep?: number
  /** Cheatsheet category */
  cheatsheet?: CheatsheetCategory
  /** Stats or additional node metadata */
  stat?: number
}

export type CheatsheetCategory =
  | 'foundations'
  | 'core-techniques'
  | 'advanced'
  | 'production'
  | 'reference'

export interface NodeContent {
  summary: string
  sections: ContentSection[]
  /** Everyday example / real-world analogy */
  everydayExample?: string
  /** Quick tip for the cheatsheet */
  quickTip?: string
}

export type SectionType =
  | 'overview'
  | 'key-concepts'
  | 'how-it-works'
  | 'code-example'
  | 'architecture'
  | 'pros-cons'
  | 'related-links'
  | 'qa-list'
  | 'analogy'
  | 'cheatsheet-entry'
  | 'everyday-scenario'

export interface ContentSection {
  title: string
  type: SectionType
  /** Body text (optional for sections that use items or qa) */
  body?: string
  code?: { language: string; source: string }
  items?: string[]
  /** Question and answer for qa-list sections */
  qa?: { question: string; answer: string }[]
}

export interface GraphData {
  nodes: MindMapNode[]
  links: { source: string; target: string }[]
}

export interface GroupPalette {
  base: string
  emissive: string
  accent: string
  label: string
}
