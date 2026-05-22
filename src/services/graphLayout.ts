import type { MindMapNode } from '../types/mindmap'

/* ============================================================
   graphLayout — Posicionamento inicial dos nós no espaço 3D.
   
   Os nós são distribuídos numa esfera de Fibonacci para
   espaçamento uniforme, com o nó central (LLM) em (0,0,0).
   Nenhum nó é fixado — todos flutuam livremente.
   ============================================================ */

export interface PositionedNode extends MindMapNode {
  x: number
  y: number
  z: number
  fx?: number | null
  fy?: number | null
  fz?: number | null
}

/**
 * Gera posições numa esfera de Fibonacci para distribuição
 * uniforme de N pontos na superfície de uma esfera.
 */
function fibonacciSphere(count: number, radius: number): { x: number; y: number; z: number }[] {
  if (count === 0) return []

  const positions: { x: number; y: number; z: number }[] = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count)
    const phi = 2 * Math.PI * i / goldenRatio

    positions.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
    })
  }

  return positions
}

/**
 * Computa posições iniciais para todos os nós.
 * Nenhum nó é fixado — todos flutuam livremente com inércia.
 *
 * @param nodes — Lista completa de nós.
 * @param centerId — ID do nó central (default: 'LLM').
 * @param radius — Raio da esfera de distribuição (default: 60).
 */
export function computeInitialPositions(
  nodes: MindMapNode[],
  centerId = 'LLM',
  radius = 60,
): PositionedNode[] {
  const others = nodes.filter((n) => n.id !== centerId)
  const positions = fibonacciSphere(others.length, radius)

  const result: PositionedNode[] = []
  let otherIndex = 0

  for (const node of nodes) {
    if (node.id === centerId) {
      // Nó central em (0,0,0) sem fixar
      result.push({
        ...node,
        x: 0,
        y: 0,
        z: 0,
      })
    } else {
      const pos = positions[otherIndex] ?? { x: 0, y: 0, z: 0 }
      result.push({
        ...node,
        x: pos.x + (Math.random() - 0.5) * 8,
        y: pos.y + (Math.random() - 0.5) * 8,
        z: pos.z + (Math.random() - 0.5) * 8,
      })
      otherIndex++
    }
  }

  return result
}

/**
 * Retorna os IDs dos nós que são hubs (conectam-se a 3+ outros).
 */
export function findHubNodes(
  links: { source: string; target: string }[],
): string[] {
  const degree = new Map<string, number>()

  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1)
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1)
  }

  return Array.from(degree.entries())
    .filter(([_, count]) => count >= 3)
    .map(([id]) => id)
}
