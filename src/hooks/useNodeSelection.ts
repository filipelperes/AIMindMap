import { useState, useMemo, useCallback } from 'react'
import type { MindMapNode } from '../types/mindmap'

/* ============================================================
   useNodeSelection — Manages node selection state.
   Extracted from the original App.tsx into a reusable hook.
   ============================================================ */

interface UseNodeSelectionReturn {
  selectedNodeId: string | null
  selectedNode: MindMapNode | null
  selectNode: (id: string | null) => void
  deselectNode: () => void
  isSelected: (id: string) => boolean
}

/**
 * Hook that manages which mindmap node is selected.
 * @param nodes — Complete list of nodes for derivation.
 */
export function useNodeSelection(nodes: MindMapNode[]): UseNodeSelectionReturn {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedNode = useMemo<MindMapNode | null>(() => {
    if (selectedNodeId === null) return null
    return nodes.find((n) => n.id === selectedNodeId) ?? null
  }, [selectedNodeId, nodes])

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  const deselectNode = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedNodeId === id,
    [selectedNodeId],
  )

  return {
    selectedNodeId,
    selectedNode,
    selectNode,
    deselectNode,
    isSelected,
  }
}
