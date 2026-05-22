import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../store/ThemeContext'
import ParticleBackground from '../organisms/ParticleBackground'
import LazyGraphScene from '../organisms/LazyGraphScene'
import HeroOverlay from '../organisms/HeroOverlay'
import DetailPanel from '../organisms/DetailPanel'
import type { MindMapNode, GraphData } from '../../types/mindmap'

interface MainLayoutProps {
  data: GraphData
  selectedNodeId: string | null
  selectedNode: MindMapNode | null
  onSelect: (id: string | null) => void
  onClose: () => void
  isMobile: boolean
}

/**
 * Template: layout principal com tema dinâmico (dark/light).
 * 
 * Camadas:
 * 1. ParticleBackground (fundo dinâmico)
 * 2. GraphScene (moléculas 3D - lazy loaded)
 * 3. HeroOverlay (título, quando sem seleção)
 * 4. DetailPanel (conteúdo expandido, quando com seleção)
 * 
 * NOTA: O layout considera a sidebar de 256px à esquerda
 * (65rem) para centralizar o grafo corretamente.
 */
const MainLayout: React.FC<MainLayoutProps> = React.memo(
  ({ data, selectedNodeId, selectedNode, onSelect, onClose, isMobile }) => {
    const { colors } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    return (
      <div
        className="relative h-screen w-screen overflow-hidden"
        style={{
          background: colors.bgGradient,
          paddingLeft: isMobile ? 0 : '16rem', // Espaço para sidebar (256px)
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
        }}
      >
        {/* Camada 1: Fundo de partículas */}
        <ParticleBackground opacity={0.35} />

        {/* Camada 2: Grafo 3D */}
        <motion.div
          data-tour="graph"
          animate={{
            scale: selectedNode ? 1.0 : 1,
            filter: selectedNode ? 'brightness(1.05)' : 'brightness(1)',
          }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
          style={{ left: isMobile ? 0 : '16rem' }}
        >
          <LazyGraphScene
            data={data}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
          />
        </motion.div>

        {/* Camada 3: Título (apenas quando sem seleção) */}
        {!selectedNode && <HeroOverlay isMobile={isMobile} />}

        {/* Camada 4: Painel de detalhes (apenas quando com seleção) */}
        <DetailPanel
          node={selectedNode}
          onClose={onClose}
          isMobile={isMobile}
        />
      </div>
    )
  },
)

MainLayout.displayName = 'MainLayout'
export default MainLayout
