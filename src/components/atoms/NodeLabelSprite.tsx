import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { getLabelTexture } from '../../utils/threeHelpers'

interface NodeLabelSpriteProps {
  text: string
  color: string
  /** Posição Y offset acima da esfera (default: 8) */
  yOffset?: number
  /** Tamanho do sprite (default: 20) */
  size?: number
}

/**
 * Sprite 3D com texto renderizado em canvas.
 * Sempre fica de frente para a câmera (billboard).
 * GPU-eficiente: textura é cacheadada por text+color.
 */
const NodeLabelSprite: React.FC<NodeLabelSpriteProps> = React.memo(
  ({ text, color, yOffset = 8, size = 20 }) => {
    const ref = useRef<THREE.Sprite>(null!)

    const sprite = useMemo(() => {
      const texture = getLabelTexture({ text, color })
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      })
      const s = new THREE.Sprite(material)
      s.position.y = yOffset
      s.scale.set(size, size * 0.4, 1)
      return s
    }, [text, color, yOffset, size])

    // Cleanup
    useEffect(() => {
      return () => {
        sprite.material.map?.dispose()
        sprite.material.dispose()
      }
    }, [sprite])

    return <primitive object={sprite} ref={ref} />
  },
)

NodeLabelSprite.displayName = 'NodeLabelSprite'
export default NodeLabelSprite
