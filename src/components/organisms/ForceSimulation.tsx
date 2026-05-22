import React, { useEffect } from 'react'
import { useForceSimulation } from '../../hooks/useForceSimulation'
import type { GraphData } from '../../types/mindmap'

interface ForceSimulationProps {
  /** Dados do grafo (nós + links) */
  data: GraphData
  /** Ref para expor os nós simulados ao GraphScene */
  nodesRef: React.MutableRefObject<any[]>
  /** Callback quando a simulação inicializar */
  onReady?: () => void
}

/**
 * Organismo que orquestra a simulação física d3-force-3d.
 * Não renderiza nada visualmente — apenas atualiza posições
 * via ref para o GraphScene consumir.
 * 
 * Estratégia anti-gravidade:
 * - Sem força central (center = null)
 * - Repulsão entre nós (charge)
 * - Molas nos links (link)
 * - Perturbação aleatória para flutuação
 * - RAG fixo em (0,0,0)
 */
const ForceSimulation: React.FC<ForceSimulationProps> = ({
  data,
  nodesRef,
  onReady,
}) => {
  const { nodesRef: simNodesRef } = useForceSimulation({
    nodes: data.nodes,
    links: data.links,
    centerId: 'RAG',
    radius: 50,
    chargeStrength: -80,
    linkDistance: 40,
    driftStrength: 0.02,
  })

  // Sincronizar refs
  useEffect(() => {
    nodesRef.current = simNodesRef.current
    onReady?.()
  }, [simNodesRef, nodesRef, onReady])

  return null // Componente invisível — só lógica
}

ForceSimulation.displayName = 'ForceSimulation'
export default ForceSimulation
