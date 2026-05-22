import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import StarField from '../molecules/StarField'

interface ParticleBackgroundProps {
  opacity?: number
  dense?: boolean
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = React.memo(
  ({ opacity = 1, dense = false }) => {
    const layers = useMemo(() => {
      if (dense) {
        return [
          { count: 3000, spread: 30, color: '#7C3AED', size: 0.02, speedX: 0.02, speedY: 0.015 },
          { count: 2500, spread: 18, color: '#00FFF0', size: 0.03, speedX: 0.04, speedY: 0.03 },
          { count: 1500, spread: 25, color: '#FF006E', size: 0.02, speedX: 0.03, speedY: 0.025 },
          { count: 1000, spread: 35, color: '#00E676', size: 0.015, speedX: 0.025, speedY: 0.02 },
          { count: 800, spread: 15, color: '#FFAB00', size: 0.025, speedX: 0.05, speedY: 0.04 },
        ]
      }
      return [
        { count: 2000, spread: 20, color: '#7C3AED', size: 0.015, speedX: 0.03, speedY: 0.02 },
        { count: 1500, spread: 12, color: '#00FFF0', size: 0.025, speedX: 0.06, speedY: 0.05 },
        { count: 500, spread: 18, color: '#FF006E', size: 0.015, speedX: 0.04, speedY: 0.03 },
      ]
    }, [dense])

    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity }}
      >
        <Canvas camera={{ position: [0, 0, 1], fov: 60 }} gl={{ alpha: true, antialias: false }}>
          {layers.map((layer, i) => (
            <StarField
              key={i}
              count={layer.count}
              spread={layer.spread}
              color={layer.color}
              size={layer.size}
              rotationSpeedX={layer.speedX}
              rotationSpeedY={layer.speedY}
              delay={i * 0.5}
            />
          ))}
        </Canvas>
      </div>
    )
  },
)

ParticleBackground.displayName = 'ParticleBackground'
export default ParticleBackground
