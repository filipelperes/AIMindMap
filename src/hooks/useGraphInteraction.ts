import { useRef, useCallback } from 'react'
import { normalizePointer, isTap } from '../utils/pointerUtils'
import type { NormalizedPointer } from '../utils/pointerUtils'

/* ============================================================
   useGraphInteraction — Hook para eventos de interação
   unificados (mouse + touch) no grafo 3D.
   
   Lida com:
   - Clique/Tap em nós
   - Hover (mouse apenas)
   - Drag (arrastar viewport)
   ============================================================ */

interface UseGraphInteractionOptions {
  /** Callback disparado quando um nó é clicado/tapado */
  onNodeClick?: (nodeId: string) => void
  /** Callback disparado no hover do nó (mouse) */
  onNodeHover?: (nodeId: string | null) => void
  /** Tolerância em px para distinguir tap de drag (default: 10) */
  tapThreshold?: number
}

interface UseGraphInteractionReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
  }
}

/**
 * Hook que retorna handlers unificados pointer para o canvas 3D.
 * Funciona tanto para mouse quanto para touch.
 */
export function useGraphInteraction({
  onNodeClick,
  onNodeHover,
  tapThreshold = 10,
}: UseGraphInteractionOptions): UseGraphInteractionReturn {
  const pointerStart = useRef<NormalizedPointer | null>(null)
  const isDragging = useRef(false)
  const lastHoveredId = useRef<string | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = normalizePointer(e.nativeEvent as any)
    isDragging.current = false
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerStart.current) return

      const pointerEnd = normalizePointer(e.nativeEvent as any)

      // Se não houve drag significativo, é um tap/click
      if (!isDragging.current && isTap(pointerStart.current, pointerEnd, tapThreshold)) {
        // O ForceGraph3D gerencia o raycasting internamente
        // Disparamos o evento e deixamos o gráfico identificar o nó
        const target = e.target as HTMLElement
        const nodeId = target.getAttribute('data-node-id')
        if (nodeId && onNodeClick) {
          onNodeClick(nodeId)
        }
      }

      pointerStart.current = null
      isDragging.current = false
    },
    [onNodeClick, tapThreshold],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Detectar drag
      if (pointerStart.current && e.buttons > 0) {
        isDragging.current = true
      }

      // Hover apenas para mouse (não touch)
      if (e.pointerType === 'mouse' && onNodeHover) {
        const target = e.target as HTMLElement
        const nodeId = target.getAttribute('data-node-id')

        if (nodeId !== lastHoveredId.current) {
          lastHoveredId.current = nodeId
          onNodeHover(nodeId)
        }
      }
    },
    [onNodeHover],
  )

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
    },
  }
}
