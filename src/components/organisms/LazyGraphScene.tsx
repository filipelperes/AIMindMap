import React, { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../store/ThemeContext'

// Lazy load the heavy 3D components → code splitting automático
const GraphScene = lazy(() => import('./GraphScene'))

interface LazyGraphSceneProps {
  data: any
  selectedNodeId: string | null
  onSelect: (nodeId: string | null) => void
}

/**
 * Loading state com partículas animadas e fade-in.
 * Transição suave para o universo 3D.
 */
const GraphLoading: React.FC = React.memo(() => {
  const { mode } = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: mode === 'dark' ? '#080B1A' : '#F0F4FF' }}
    >
      <div className="text-center">
        {/* Partículas animadas */}
        <div className="relative mb-6 flex items-center justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                backgroundColor: ['#FF006E', '#00E676', '#00B0FF', '#D500F9', '#00FFF0'][i],
                filter: 'blur(1px)',
              }}
              animate={{
                x: [0, Math.cos(i * 1.256) * 40, 0],
                y: [0, Math.sin(i * 1.256) * 40, 0],
                opacity: [0, 1, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="text-2xl">🌌</div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm"
          style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
        >
          Montando universo 3D...
        </motion.div>
      </div>
    </motion.div>
  )
})

GraphLoading.displayName = 'GraphLoading'

/**
 * LazyGraphScene — carrega o Three.js sob demanda.
 * 
 * Code Splitting:
 * - react-force-graph-3d e three.js são carregados via React.lazy()
 * - O chunk 'force-graph' (~2MB) só é baixado quando necessário
 * - Animações de entrada com fade-in para experiência fluida
 */
const LazyGraphScene: React.FC<LazyGraphSceneProps> = React.memo(
  ({ data, selectedNodeId, onSelect }) => {
    const [ready, setReady] = useState(false)

    useEffect(() => {
      const timer = setTimeout(() => setReady(true), 100)
      return () => clearTimeout(timer)
    }, [])

    return (
      <AnimatePresence mode="wait">
        {!ready ? (
          <GraphLoading key="loading" />
        ) : (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <Suspense fallback={<GraphLoading />}>
              <GraphScene
                data={data}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)

LazyGraphScene.displayName = 'LazyGraphScene'
export default LazyGraphScene
