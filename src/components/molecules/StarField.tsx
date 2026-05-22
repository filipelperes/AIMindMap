import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface StarFieldProps {
  /** Número de partículas (default: 3000) */
  count?: number
  /** Dispersão máxima (default: 15) */
  spread?: number
  /** Cor (default: '#00FFF0') */
  color?: string
  /** Tamanho da partícula (default: 0.02) */
  size?: number
  /** Velocidade de rotação X (default: 0.05) */
  rotationSpeedX?: number
  /** Velocidade de rotação Y (default: 0.04) */
  rotationSpeedY?: number
  /** Atraso em ms para fade-in (default: 0) */
  delay?: number
}

const StarField: React.FC<StarFieldProps> = React.memo(
  ({
    count = 3000,
    spread = 15,
    color = '#00FFF0',
    size = 0.02,
    rotationSpeedX = 0.05,
    rotationSpeedY = 0.04,
    delay = 0,
  }) => {
    const ref = useRef<THREE.Points>(null!)
    const [opacity, setOpacity] = useState(delay === 0 ? 1 : 0)

    useEffect(() => {
      if (delay === 0) return
      const timer = setTimeout(() => setOpacity(1), delay)
      return () => clearTimeout(timer)
    }, [delay])

    const positions = useMemo(() => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * spread
      }
      return pos
    }, [count, spread])

    useFrame((_, delta) => {
      if (ref.current) {
        ref.current.rotation.x -= delta * rotationSpeedX
        ref.current.rotation.y -= delta * rotationSpeedY
      }
    })

    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
          <PointMaterial
            transparent
            color={color}
            size={size}
            sizeAttenuation
            depthWrite={false}
            opacity={opacity}
          />
        </Points>
      </group>
    )
  },
)

StarField.displayName = 'StarField'
export default StarField
