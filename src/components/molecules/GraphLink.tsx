import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThreeJSDisposal } from '../../hooks/useThreeJSDisposal'

interface GraphLinkProps {
  /** Posição inicial do link */
  start: { x: number; y: number; z: number }
  /** Posição final do link */
  end: { x: number; y: number; z: number }
  /** Cor (default: rgba(255,255,255,0.15)) */
  color?: string
  /** Largura da linha (default: 1.5) */
  width?: number
  /** Destacado? (default: false) */
  highlighted?: boolean
}

/**
 * Link 3D entre dois nós do grafo.
 * Usa BufferGeometry com um único segmento.
 */
const GraphLink: React.FC<GraphLinkProps> = React.memo(
  ({ start, end, color = 'rgba(255,255,255,0.15)', width = 1.5, highlighted = false }) => {
    const ref = useRef<THREE.Line>(null!)
    useThreeJSDisposal(ref)

    const line = useMemo(() => {
      const points = [
        new THREE.Vector3(start.x, start.y, start.z),
        new THREE.Vector3(end.x, end.y, end.z),
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: highlighted ? '#ffffff' : color,
        linewidth: width, // Nota: linewidth >1 não funciona em todos os GPUs
        transparent: true,
        opacity: highlighted ? 1 : 0.3,
      })
      return new THREE.Line(geometry, material)
    }, [start, end, color, width, highlighted]) // eslint-disable-line react-hooks/exhaustive-deps

    // Atualiza posições e cor
    useEffect(() => {
      const points = [
        new THREE.Vector3(start.x, start.y, start.z),
        new THREE.Vector3(end.x, end.y, end.z),
      ]
      line.geometry.dispose()
      line.geometry = new THREE.BufferGeometry().setFromPoints(points)
      ;(line.material as THREE.LineBasicMaterial).color.set(
        highlighted ? '#ffffff' : color,
      )
      ;(line.material as THREE.LineBasicMaterial).opacity = highlighted ? 1 : 0.3
    }, [line, start, end, color, highlighted])

    // Cleanup da geometria antiga
    useEffect(() => {
      return () => {
        line.geometry.dispose()
        line.material.dispose()
      }
    }, [line])

    return <primitive object={line} ref={ref} />
  },
)

GraphLink.displayName = 'GraphLink'
export default GraphLink
