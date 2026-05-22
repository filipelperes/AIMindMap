import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import NodeSphere from '../atoms/NodeSphere'
import NodeLabelSprite from '../atoms/NodeLabelSprite'
import { useThreeJSDisposal } from '../../hooks/useThreeJSDisposal'
import type { GroupPalette } from '../../types/mindmap'

interface NodeWithLabelProps {
  palette: GroupPalette
  isSelected: boolean
  isHovered?: boolean
  label: string
  /** Raio da esfera (default: 5) */
  radius?: number
  /** Posição X */
  x?: number
  y?: number
  z?: number
}

/**
 * Molécula que combina uma NodeSphere + NodeLabelSprite
 * em um THREE.Group. Representa um nó completo do grafo.
 * 
 * Importante: o grupo usa position diretamente (mutável)
 * para evitar re-renders do React a cada frame de física.
 */
const NodeWithLabel: React.FC<NodeWithLabelProps> = React.memo(
  ({ palette, isSelected, isHovered = false, label, radius = 5, x = 0, y = 0, z = 0 }) => {
    const groupRef = useRef<THREE.Group>(null!)
    useThreeJSDisposal(groupRef)

    const group = useMemo(() => {
      const g = new THREE.Group()
      g.position.set(x, y, z)
      return g
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Atualiza posição sem re-render
    useEffect(() => {
      group.position.set(x, y, z)
    }, [group, x, y, z])

    return (
      <primitive object={group} ref={groupRef}>
        <NodeSphere
          palette={palette}
          isSelected={isSelected}
          isHovered={isHovered}
          radius={radius}
        />
        <NodeLabelSprite
          text={label}
          color={palette.accent}
          yOffset={radius + 4}
          size={radius * 4}
        />
      </primitive>
    )
  },
)

NodeWithLabel.displayName = 'NodeWithLabel'
export default NodeWithLabel
