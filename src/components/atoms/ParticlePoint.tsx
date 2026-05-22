import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

interface ParticlePointProps {
  /** Posições dos pontos (Float32Array achatado) */
  positions: Float32Array
  /** Cor (default: '#00FFF0') */
  color?: string
  /** Tamanho de cada ponto (default: 0.015) */
  size?: number
  /** Opacidade (default: 1) */
  opacity?: number
}

/**
 * Sistema de pontos Three.js para efeitos de partícula.
 * GPU-eficiente: usa BufferGeometry + Points.
 */
const ParticlePoint: React.FC<ParticlePointProps> = React.memo(
  ({ positions, color = '#00FFF0', size = 0.015, opacity = 1 }) => {
    const ref = useRef<THREE.Points>(null!)

    const points = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        color: new THREE.Color(color),
        size,
        transparent: true,
        opacity,
        sizeAttenuation: true,
        depthWrite: false,
      })

      return new THREE.Points(geometry, material)
    }, [positions, color, size, opacity])

    // Cleanup
    useEffect(() => {
      return () => {
        points.geometry.dispose()
        points.material.dispose()
      }
    }, [points])

    return <primitive object={points} ref={ref} />
  },
)

ParticlePoint.displayName = 'ParticlePoint'
export default ParticlePoint
