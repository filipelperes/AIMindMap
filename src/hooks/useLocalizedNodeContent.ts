import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getLocalizedContent, getLocalizedContentAsync } from '../data/contentLocales'
import type { MindMapNode } from '../types/mindmap'

/**
 * Hook that merges the selected node with localized content.
 *
 * Content is loaded via dynamic imports (per-category code splitting) so
 * on very first access the chunks may still be arriving. The hook handles
 * both fast-path (already cached) and slow-path (await dynamic import).
 *
 * Falls back to English for any untranslated content.
 */
export function useLocalizedNodeContent(
  node: MindMapNode | null,
): MindMapNode | null {
  const { i18n } = useTranslation()

  // Bump version when async content finishes loading so React re-renders.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!node) return

    // If content is already cached, no async work needed.
    if (getLocalizedContent(node.id, i18n.language)) return

    // Slow path — content chunk hasn't arrived yet; wait for it.
    let cancelled = false
    getLocalizedContentAsync(node.id, i18n.language).then(() => {
      if (!cancelled) setVersion((v) => v + 1)
    })

    return () => {
      cancelled = true
    }
  }, [node?.id, i18n.language])

  // ── Memoized render path — stable reference for identical inputs ──

  return useMemo(() => {
    if (!node) return null

    const localized = getLocalizedContent(node.id, i18n.language)
    if (localized) {
      // Spread preserves all node fields + overwrites content with localized version
      return { ...node, content: localized }
    }

    // Content not yet loaded — return bare node (DetailPanel shows skeleton)
    return node
    // version is included so the memo recomputes when async content arrives
  }, [node, i18n.language, version])
}
