import type { NodeContent } from '../types/mindmap'
import { nodeContent as enContent, contentReady } from './content'

// Portuguese (Brazil) content overrides
// Start with empty — translations will be added incrementally
const ptContent: Partial<Record<string, Partial<NodeContent>>> = {}

/**
 * Returns localized content for a node, falling back to English.
 * Content must already be loaded — returns `undefined` if the node's
 * category chunk hasn't arrived yet.
 *
 * @param nodeId - The node ID (e.g. 'LLM', 'RAG')
 * @param language - Current language code (e.g. 'en-US', 'pt-BR')
 */
export function getLocalizedContent(
  nodeId: string,
  language: string,
): NodeContent | undefined {
  // Start with English as base
  const base = enContent[nodeId]
  if (!base) return base

  // If language is English, return directly
  if (language === 'en-US') return base

  // For other languages, merge with overrides
  if (language === 'pt-BR' && ptContent[nodeId]) {
    return deepMerge(base, ptContent[nodeId] as Partial<NodeContent>)
  }

  return base
}

/**
 * Async version — ensures the node's content is loaded before resolving.
 * Use this when you need guaranteed content (e.g. after user interaction).
 */
export async function getLocalizedContentAsync(
  nodeId: string,
  language: string,
): Promise<NodeContent | undefined> {
  // Wait for all content chunks to land
  await contentReady
  return getLocalizedContent(nodeId, language)
}

/**
 * Deep merges partial content into base, preserving untranslated fields.
 */
function deepMerge(
  base: NodeContent,
  override: Partial<NodeContent>,
): NodeContent {
  return {
    ...base,
    ...override,
    sections: override.sections ?? base.sections,
  }
}
