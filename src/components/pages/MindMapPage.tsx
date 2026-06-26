import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MainLayout from '../templates/MainLayout'
import SidebarNav from '../organisms/SidebarNav'
import WelcomeTour from '../organisms/WelcomeTour'
import { useNodeSelection } from '../../hooks/useNodeSelection'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useLocale } from '../../i18n/LocaleContext'
import { graphData } from '../../data/map'

/**
 * Main MindMap page.
 * Now includes:
 * - SidebarNav with step-by-step
 * - Export screenshot (captures 3D canvas)
 * - Code Splitting: GraphScene is lazy-loaded
 */
const MindMapPage: React.FC = React.memo(() => {
  const { selectedNodeId, selectedNode, selectNode, deselectNode } =
    useNodeSelection(graphData.nodes)
  const { isMobile } = useResponsiveLayout()
  const { t } = useTranslation()
  const { formatDate } = useLocale()
  const [closeSignal, setCloseSignal] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  /**
   * Exports screenshot from 3D canvas.
   * Traverses the DOM to find the Three.js canvas.
   */
  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const link = document.createElement('a')
    link.download = t('mindmapPage.exportFilename', { date: formatDate(new Date()) }) + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [t, formatDate])

  // Keyboard shortcuts: ESC closes modals, E exports screenshot
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
      {/* Navigation sidebar */}
      <SidebarNav
        selectedNodeId={selectedNodeId}
        onSelect={selectNode}
        onClose={deselectNode}
        isMobile={isMobile}
        onExport={handleExport}
        forceCloseMobile={closeSignal}
        onMobileOpenChange={setIsMobileSidebarOpen}
      />

      {/* Welcome Tour — welcome overlay on first visit */}
      <WelcomeTour forceClose={closeSignal} />

      {/* Main layout with 3D graph */}
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
