import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { getSphereGeometry, getNodeMaterial } from '../../utils/threeHelpers'
import { useThreeJSDisposal } from '../../hooks/useThreeJSDisposal'
import type { GroupPalette } from '../../types/mindmap'

interface NodeSphereProps {
  palette: GroupPalette
  isSelected: boolean
  isHovered?: boolean
  /** Raio da esfera (default: 5) */
  radius?: number
  /** Posição X */
  x?: number
  /** Posição Y */
  y?: number
  /** Posição Z */
  z?: number
}

/**
 * Esfera 3D com material emissivo. Átomo base para nós do grafo.
 * GPU-eficiente: geometria e material são cacheados (ver threeHelpers).
 */
const NodeSphere: React.FC<NodeSphereProps> = React.memo(
  ({ palette, isSelected, isHovered = false, radius = 5, x = 0, y = 0, z = 0 }) => {
    const ref = useRef<THREE.Mesh>(null!)
    useThreeJSDisposal(ref)

    const meshRef = useRef<THREE.Mesh | null>(null)
    if (!meshRef.current) {
      const geometry = getSphereGeometry(radius)
      const material = getNodeMaterial(palette, isSelected, isHovered)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      meshRef.current = mesh
    }

    // Atualiza posição
    useEffect(() => {
      if (meshRef.current) {
        meshRef.current.position.set(x, y, z)
      }
    }, [x, y, z])

    // Atualiza material quando cor/estado muda
    useEffect(() => {
      if (meshRef.current) {
        const newMat = getNodeMaterial(palette, isSelected, isHovered)
        meshRef.current.material = newMat
      }
    }, [palette, isSelected, isHovered])

    return <primitive object={meshRef.current} ref={ref} />
  },
)

NodeSphere.displayName = 'NodeSphere'
export default NodeSphere
