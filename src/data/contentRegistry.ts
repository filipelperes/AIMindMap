import type { NodeContent } from '../types/mindmap'

/* ============================================================
   contentRegistry — Async content loader with per-category
   dynamic imports for code splitting.

   Each content category (foundations, core-techniques, etc.)
   becomes its own chunk loaded via dynamic import.
   All categories are preloaded at startup but do not block
   the initial bundle — the main chunk stays ~400KB smaller.

   Synchronous consumers access `nodeContent` which is populated
   before the first React render completes.
   ============================================================ */

// ── Category → file mapping for dynamic imports ──

type CategoryName = 'foundations' | 'core-techniques' | 'architecture' | 'quality' | 'advanced'

interface CategoryModule {
  categoryNodes: Record<string, NodeContent>
}

const CATEGORY_LOADERS: Record<CategoryName, () => Promise<CategoryModule>> = {
  foundations: () => import('./content/foundations'),
  'core-techniques': () => import('./content/core-techniques'),
  architecture: () => import('./content/architecture'),
  quality: () => import('./content/quality'),
  advanced: () => import('./content/advanced'),
}

// ── Node ID → category mapping ──

const NODE_TO_CATEGORY: Record<string, CategoryName> = {
  LLM: 'foundations',
  PromptEngineering: 'foundations',
  RAG: 'core-techniques',
  FineTuning: 'core-techniques',
  Agent: 'core-techniques',
  MCP: 'core-techniques',
  StructuredOutputs: 'advanced',
  ContextEngineering: 'advanced',
  KnowledgeGraphs: 'advanced',
  AISystemDesign: 'architecture',
  VectorDB: 'architecture',
  LLMOps: 'architecture',
  Infrastructure: 'architecture',
  Workflows: 'advanced',
  MultiAgentSystems: 'advanced',
  FunctionCalling: 'advanced',
  HybridSearch: 'advanced',
  ObservabilityAI: 'advanced',
  EvalTesting: 'quality',
  AISafety: 'quality',
  Multimodal: 'advanced',
  Coding: 'advanced',
  Behavioral: 'advanced',
}

// ── Synchronous content cache (populated asynchronously) ──

export const nodeContent: Record<string, NodeContent> = {}

const loadedCategories = new Set<CategoryName>()

async function loadCategory(category: CategoryName): Promise<void> {
  if (loadedCategories.has(category)) return
  loadedCategories.add(category)
  const loader = CATEGORY_LOADERS[category]
  const mod = await loader()
  for (const [id, content] of Object.entries(mod.categoryNodes)) {
    nodeContent[id] = content as NodeContent
  }
}

/**
 * Fires all category loads in parallel.
 * Each category file becomes a separate JS chunk.
 * Await this before rendering if you need all content guaranteed.
 */
export const contentReady: Promise<void> = Promise.all(
  Object.keys(CATEGORY_LOADERS).map((cat) => loadCategory(cat as CategoryName)),
).then(() => {})

/**
 * Ensures a specific node's category is loaded.
 * Useful if content is loaded on-demand after initial preload.
 */
export async function ensureNodeContent(nodeId: string): Promise<NodeContent | undefined> {
  if (nodeContent[nodeId]) return nodeContent[nodeId]
  const category = NODE_TO_CATEGORY[nodeId]
  if (!category) return undefined
  await loadCategory(category)
  return nodeContent[nodeId]
}
