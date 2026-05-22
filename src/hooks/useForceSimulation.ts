import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3-force-3d'
import type { MindMapNode } from '../types/mindmap'
import { computeInitialPositions } from '../services/graphLayout'
import type { PositionedNode } from '../services/graphLayout'

/* ============================================================
   useForceSimulation — Simulação d3-force-3d com física
   anti-gravidade. Nós flutuam livremente com perturbação
   contínua.
   
   Configurado para efeito de inércia: baixo decaimento,
   baixo atrito, sem gravidade central.
   ============================================================ */

export interface SimulatedNode extends PositionedNode {
  vx?: number
  vy?: number
  vz?: number
}

interface UseForceSimulationOptions {
  nodes: MindMapNode[]
  links: { source: string; target: string }[]
  centerId?: string
  radius?: number
  chargeStrength?: number
  linkDistance?: number
  driftStrength?: number
}

interface UseForceSimulationReturn {
  nodesRef: React.MutableRefObject<SimulatedNode[]>
  restart: () => void
  stop: () => void
  reheat: () => void
}

/**
 * Hook que gerencia uma simulação d3-force-3d com nós flutuantes.
 * As posições são atualizadas via ref (mutável) para evitar
 * re-renders do React a 60fps.
 */
export function useForceSimulation({
  nodes,
  links,
  centerId = 'RAG',
  radius = 50,
  chargeStrength = -80,
  linkDistance = 40,
  driftStrength = 0.02,
}: UseForceSimulationOptions): UseForceSimulationReturn {
  const nodesRef = useRef<SimulatedNode[]>([])
  const simRef = useRef<d3.ForceSimulation | null>(null)

  const init = useCallback(() => {
    // Parar simulação anterior
    if (simRef.current) {
      simRef.current.stop()
    }

    // Posicionar nós
    const positioned = computeInitialPositions(nodes, centerId, radius)
    const simNodes = positioned as SimulatedNode[]
    nodesRef.current = simNodes

    // Criar simulação
    const sim: any = d3.forceSimulation(simNodes as any)
    sim.force('center', null)
    sim.force('charge', d3.forceCharge(chargeStrength))
    sim.force(
      'link',
      d3
        .forceLink(
          links.map((l) => ({
            source: simNodes.findIndex((n) => n.id === l.source),
            target: simNodes.findIndex((n) => n.id === l.target),
          })),
        )
        .distance(linkDistance)
        .strength(0.3),
    )
    sim.force('collide', d3.forceCollide(8))
    sim.alphaDecay(0.02)
    sim.velocityDecay(0.1)

    // Tick: perturbação flutuante + fixar centro
    sim.on('tick', () => {
      const snodes = nodesRef.current
      for (let i = 0; i < snodes.length; i++) {
        const n = snodes[i]
        if (n.id === centerId) {
          n.x = 0
          n.y = 0
          n.z = 0
          n.vx = 0
          n.vy = 0
          n.vz = 0
        } else {
          // Perturbação aleatória para efeito flutuante
          n.vx! += (Math.random() - 0.5) * driftStrength
          n.vy! += (Math.random() - 0.5) * driftStrength
          n.vz! += (Math.random() - 0.5) * driftStrength
          // Damping suave para não escaparem
          n.vx! *= 0.99
          n.vy! *= 0.99
          n.vz! *= 0.99
        }
      }
    })

    simRef.current = sim

    // Aquecimento inicial
    sim.alpha(1)
    sim.restart()

    // Esfriamento para estado estável mas com movimento residual
    setTimeout(() => {
      sim.alpha(0.3)
    }, 3000)
  }, [nodes, links, centerId, radius, chargeStrength, linkDistance, driftStrength])

  // Inicializar no mount
  useEffect(() => {
    init()
    return () => {
      if (simRef.current) {
        simRef.current.stop()
        simRef.current = null
      }
    }
  }, [init])

  const restart = useCallback(() => {
    init()
  }, [init])

  const stop = useCallback(() => {
    if (simRef.current) {
      simRef.current.stop()
    }
  }, [])

  const reheat = useCallback(() => {
    if (simRef.current) {
      ;(simRef.current as any).alpha(0.5)
      ;(simRef.current as any).restart()
    }
  }, [])

  return { nodesRef, restart, stop, reheat }
}
