import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import StarField from '../molecules/StarField'

interface ParticleBackgroundProps {
  opacity?: number
}

/**
 * Fundo animado com partículas 3D multicoloridas.
 * Usa dois campos de estrelas com cores complementares para
 * criar profundidade e movimento.
 */
const ParticleBackground: React.FC<ParticleBackgroundProps> = React.memo(
  (_props) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const timer = setTimeout(() => setVisible(true), 200)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Canvas camera={{ position: [0, 0, 1] }}>
          {/* Camada de fundo: partículas roxas lentas */}
          <div className="animate-stagger-fade-in delay-100">
            <StarField
              count={2000}
              spread={20}
              color="#7C3AED"
              size={0.015}
              rotationSpeedX={0.03}
              rotationSpeedY={0.02}
            />
          </div>
          {/* Camada de frente: partículas ciano rápidas */}
          <div className="animate-stagger-fade-in delay-400">
            <StarField
              count={1500}
              spread={12}
              color="#00FFF0"
              size={0.025}
              rotationSpeedX={0.06}
              rotationSpeedY={0.05}
            />
          </div>
          {/* Pontos rosas ocasionais */}
          <div className="animate-stagger-fade-in delay-700">
            <StarField
              count={500}
              spread={18}
              color="#FF006E"
              size={0.015}
              rotationSpeedX={0.04}
              rotationSpeedY={0.03}
            />
          </div>
        </Canvas>
      </div>
    )
  },
)

ParticleBackground.displayName = 'ParticleBackground'
export default ParticleBackground
