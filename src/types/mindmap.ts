export interface MindMapNode {
  id: string
  group: number
  description: string
  val?: number
  content: NodeContent
  x?: number
  y?: number
  z?: number
  /** Velocidade de rotação própria da molécula (rad/s) */
  spinSpeed?: number
  /** Ordem no caminho de aprendizado (step-by-step) */
  learningStep?: number
  /** Categoria cheatsheet */
  cheatsheet?: CheatsheetCategory
  /** Estatísticas ou metadata adicional do nó */
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
  /** Exemplo do cotidiano / analogia do mundo real */
  everydayExample?: string
  /** Dica rápida para o cheatsheet */
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
  /** Corpo do texto (opcional para seções que usam items ou qa) */
  body?: string
  code?: { language: string; source: string }
  items?: string[]
  /** Pergunta e resposta para seções do tipo qa-list */
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
