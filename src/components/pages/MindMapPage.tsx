import React, { useCallback, useEffect, useState } from 'react'
import MainLayout from '../templates/MainLayout'
import SidebarNav from '../organisms/SidebarNav'
import WelcomeTour from '../organisms/WelcomeTour'
import { useNodeSelection } from '../../hooks/useNodeSelection'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { graphData } from '../../data/map'

/**
 * Página principal do MindMap.
 * Agora inclui:
 * - SidebarNav com step-by-step
 * - Export screenshot (captura canvas 3D)
 * - Code Splitting: GraphScene é lazy-loaded
 */
const MindMapPage: React.FC = React.memo(() => {
  const { selectedNodeId, selectedNode, selectNode, deselectNode } =
    useNodeSelection(graphData.nodes)
  const { isMobile } = useResponsiveLayout()
  const [closeSignal, setCloseSignal] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  /**
   * Exporta screenshot do canvas 3D.
   * Percorre o DOM para encontrar o canvas do Three.js.
   */
  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `ai-mindmap-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  // Atalhos de teclado: ESC fecha modais, E exporta screenshot
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        deselectNode()
        setCloseSignal(t => t + 1)
      } else if (e.key === 'e' || e.key === 'E') {
        handleExport()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [deselectNode, handleExport])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Sidebar de navegação */}
      <SidebarNav
        data={graphData}
        selectedNodeId={selectedNodeId}
        onSelect={selectNode}
        onClose={deselectNode}
        isMobile={isMobile}
        onExport={handleExport}
        forceCloseMobile={closeSignal}
        onMobileOpenChange={setIsMobileSidebarOpen}
      />

      {/* Welcome Tour — overlay de boas-vindas na primeira visita */}
      <WelcomeTour forceClose={closeSignal} />

      {/* Layout principal com grafo 3D */}
      <MainLayout
        isMobileSidebarOpen={isMobileSidebarOpen}
        data={graphData}
        selectedNodeId={selectedNodeId}
        selectedNode={selectedNode}
        onSelect={selectNode}
        onClose={deselectNode}
        isMobile={isMobile}
      />
    </div>
  )
})

MindMapPage.displayName = 'MindMapPage'
export default MindMapPage
