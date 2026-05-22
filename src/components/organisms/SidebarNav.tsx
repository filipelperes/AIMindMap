import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getLearningPath, getCurrentStep } from '../../data/map'
import { getGroupColor } from '../../constants/colors'
import ThemeToggle from '../atoms/ThemeToggle'
import { useTheme } from '../../store/ThemeContext'
import type { MindMapNode, GraphData } from '../../types/mindmap'

interface SidebarNavProps {
  data: GraphData
  selectedNodeId: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
  isMobile: boolean
  onExport?: () => void
}

const TOTAL_STEPS = 15

/**
 * Sidebar de navegação — menu step-by-step sempre visível.
 * 
 * Funcionalidades:
 * - Lista completa dos steps de aprendizado
 * - Clique em cada step navega até a molécula
 * - Botões Previous/Next step
 * - Atalhos de teclado: ← (prev), → (next), Esc (fechar)
 * - Tema toggle + export screenshot
 * - Versão compacta para mobile (hamburger)
 */
const SidebarNav: React.FC<SidebarNavProps> = React.memo(
  ({ selectedNodeId, onSelect, onClose, isMobile, onExport }) => {
    const { mode } = useTheme()
    const [isOpen, setIsOpen] = useState(!isMobile) // Desktop always open
    const steps = getLearningPath()
    const currentStep = getCurrentStep(selectedNodeId)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleStepClick = useCallback((node: MindMapNode) => {
      onSelect(node.id)
      if (isMobile) setIsOpen(false)
    }, [onSelect, isMobile])

    const goToStep = useCallback((step: number) => {
      const target = steps.find(s => (s.learningStep ?? 0) === step)
      if (target) {
        handleStepClick(target)
      }
    }, [steps, handleStepClick])

    const goNext = useCallback(() => {
      const next = Math.min(currentStep + 1, TOTAL_STEPS)
      goToStep(next)
    }, [currentStep, goToStep])

    const goPrev = useCallback(() => {
      const prev = Math.max(currentStep - 1, 1)
      goToStep(prev)
    }, [currentStep, goToStep])

    // Keyboard shortcuts
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') goNext()
        else if (e.key === 'ArrowLeft') goPrev()
        else if (e.key === 'Escape' && isMobile) setIsOpen(false)
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }, [goNext, goPrev, isMobile])

    // Auto-scroll to current step
    useEffect(() => {
      if (scrollRef.current && currentStep > 0) {
        const el = scrollRef.current.querySelector(`[data-step="${currentStep}"]`)
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, [currentStep])

    const sidebarContent = (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="text-sm font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI MINDMAP
            </span>
          </div>
          <div className="flex items-center gap-1" data-tour="theme">
            <ThemeToggle />
            {onExport && (
              <button
                onClick={onExport}
                aria-label="Exportar screenshot"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:scale-110 cursor-pointer hover-glow"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)',
                  color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(124,58,237,0.6)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:scale-110 cursor-pointer hover-glow"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)',
                  color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(124,58,237,0.6)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navegação prev/next */}
        <div className="mb-3 flex items-center gap-2 shrink-0">
          <button
            onClick={goPrev}
            disabled={currentStep <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-30 cursor-pointer hover-lift"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)',
              color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(124,58,237,0.8)',
              border: mode === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(124,58,237,0.08)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Anterior
          </button>
          <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(124,58,237,0.4)' }}>
            Step {currentStep || '-'} / {TOTAL_STEPS}
          </span>
          <button
            onClick={goNext}
            disabled={currentStep >= TOTAL_STEPS}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-30 cursor-pointer hover-lift"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)',
              color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(124,58,237,0.8)',
              border: mode === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(124,58,237,0.08)',
            }}
          >
            Próximo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Lista de steps */}
        <div ref={scrollRef} className="flex-1 space-y-0.5 overflow-y-auto pr-1 scrollbar-thin">
          {selectedNodeId && (
            <button
              onClick={onClose}
              className="mb-2 w-full rounded-lg py-2 text-center text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              }}
            >
              ← Visão geral
            </button>
          )}

          {steps.map((node) => {
            const palette = getGroupColor(node.group)
            const isActive = node.id === selectedNodeId
            const isCompleted = (node.learningStep ?? 0) < currentStep

            return (
              <button
                key={node.id}
                data-step={node.learningStep}
                onClick={() => handleStepClick(node)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs cursor-pointer group hover-lift"
                style={{
                  backgroundColor: isActive ? `${palette.base}20` : 'transparent',
                  borderLeft: `2px solid ${isActive ? palette.base : 'transparent'}`,
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  boxShadow: isActive ? `0 0 20px ${palette.emissive}20` : 'none',
                  transform: isActive ? 'translateX(4px)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)'
                    e.currentTarget.style.transform = 'translateX(3px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'none'
                  }
                }}
              >
                {/* Step number */}
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: isActive ? palette.base : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                    color: isActive ? '#ffffff' : (mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                  }}
                >
                  {isCompleted ? '✓' : node.learningStep}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate font-medium"
                    style={{ color: isActive ? palette.accent : (mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') }}
                  >
                    {node.id}
                  </div>
                  <div className="truncate" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: '9px' }}>
                    {palette.label}
                  </div>
                </div>

                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: palette.base, boxShadow: `0 0 6px ${palette.emissive}` }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer hints */}
        <div className="mt-3 shrink-0 space-y-1 text-[9px]" style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
          <p>← → Navegar · Clique step para ir</p>
          <p>+ - Zoom · R Reset · Esc Fechar</p>
        </div>
      </div>
    )

    // Mobile: hamburger toggle + drawer
    if (isMobile) {
      return (
        <>
          {/* Hamburger button */}
          <button
            onClick={() => setIsOpen(true)}
            className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border cursor-pointer hover:scale-110 hover-glow"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.6)' : 'rgba(255,255,255,0.75)',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.15)',
              color: mode === 'dark' ? '#ffffff' : '#6D28D9',
              backdropFilter: 'blur(16px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
            }}
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Drawer */}
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/50"
                  onClick={() => setIsOpen(false)}
                />
                <motion.aside
                  data-tour="sidebar"
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  className="fixed left-0 top-0 bottom-0 z-50 flex w-72 flex-col border-r p-4"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.88)' : 'rgba(255,255,255,0.82)',
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)',
                    backdropFilter: 'blur(32px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
                    boxShadow: mode === 'dark'
                      ? '4px 0 32px rgba(0,0,0,0.4)'
                      : '4px 0 32px rgba(124,58,237,0.08)',
                  }}
                >
                  {sidebarContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )
    }

    // Desktop: always-visible sidebar
    return (
      <aside
        data-tour="sidebar"
        className="fixed left-0 top-0 bottom-0 z-40 flex w-64 flex-col border-r p-4"
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.82)' : 'rgba(255,255,255,0.78)',
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.10)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          boxShadow: mode === 'dark'
            ? '4px 0 24px rgba(0,0,0,0.3)'
            : '4px 0 24px rgba(124,58,237,0.06)',
        }}
      >
        {sidebarContent}
      </aside>
    )
  },
)

SidebarNav.displayName = 'SidebarNav'
export default SidebarNav
