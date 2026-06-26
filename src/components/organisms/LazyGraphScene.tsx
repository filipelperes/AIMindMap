import React, { lazy, Suspense, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { GraphData } from '../../types/mindmap'

// Lazy load the heavy 3D components → automatic code splitting
const GraphScene = lazy(() => import('./GraphScene'))

interface LazyGraphSceneProps {
  data: GraphData
  selectedNodeId: string | null
  onSelect: (nodeId: string | null) => void
}

/**
 * Loading state with animated particles and fade-in.
 * Smooth transition to the 3D universe.
 */
const GraphLoading: React.FC = React.memo(() => {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="dark:bg-abyss bg-[#F0F4FF] absolute inset-0 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Animated particles */}
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
          className="text-sm dark:text-white/40 text-black/40"
        >
          {t('graphScene.mounting')}
        </motion.div>
      </div>
    </motion.div>
  )
})

GraphLoading.displayName = 'GraphLoading'

/**
 * LazyGraphScene — loads Three.js on demand.
 * 
 * Code Splitting:
 * - react-force-graph-3d and three.js are loaded via React.lazy()
 * - The 'force-graph' chunk (~2MB) is only downloaded when needed
 * - Entrance animations with fade-in for a fluid experience
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
