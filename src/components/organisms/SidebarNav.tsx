import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLearningPath, getCurrentStep } from '../../data/map'

import ThemeToggle from '../atoms/ThemeToggle'
import LocaleSwitcher from '../../i18n/LocaleSwitcher'
import { useTheme } from '../../store/ThemeContext'
import type { MindMapNode } from '../../types/mindmap'

interface SidebarNavProps {
  selectedNodeId: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
  isMobile: boolean
  onExport?: () => void
  forceCloseMobile?: number
  onMobileOpenChange?: (open: boolean) => void
}

const TOTAL_STEPS = 15

/**
 * Navigation sidebar — always-visible step-by-step menu.
 * 
 * Features:
 * - Complete list of learning steps
 * - Click on each step navigates to the molecule
 * - Previous/Next step buttons
 * - Keyboard shortcuts: ← (prev), → (next), Esc (close)
 * - Theme toggle + export screenshot
 * - Compact mobile version (hamburger)
 */
const SidebarNav: React.FC<SidebarNavProps> = React.memo(
  ({ selectedNodeId, onSelect, onClose, isMobile, onExport, forceCloseMobile, onMobileOpenChange }) => {
    const { mode, getGroupPalette } = useTheme()
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(!isMobile) // Desktop always open
    const steps = useMemo(() => getLearningPath(), [])
    const currentStep = useMemo(() => getCurrentStep(selectedNodeId), [selectedNodeId])
    const paletteCache = useMemo(() => {
      const map = new Map<number, ReturnType<typeof getGroupPalette>>()
      steps.forEach(n => {
        if (!map.has(n.group)) map.set(n.group, getGroupPalette(n.group))
      })
      return map
    }, [steps, mode])
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

    // Notify parent of mobile open state
    useEffect(() => {
      onMobileOpenChange?.(isMobile && isOpen)
    }, [isMobile, isOpen, onMobileOpenChange])

    // Force close from parent (ESC key in MindMapPage)
    useEffect(() => {
      if (forceCloseMobile && isMobile) setIsOpen(false)
    }, [forceCloseMobile, isMobile])

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
              {t('sidebar.title')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
            {onExport && (
              <button
                onClick={onExport}
                aria-label={t('sidebar.exportAriaLabel')}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:scale-110 cursor-pointer hover-glow dark:bg-white/6 bg-cyber/6 dark:text-white/50 text-cyber/60"
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
                className="flex h-9 w-9 items-center justify-center rounded-full hover:scale-110 cursor-pointer hover-glow dark:bg-white/6 bg-cyber/6 dark:text-white/50 text-cyber/60"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Previous/Next navigation */}
        <div className="mb-3 flex items-center gap-2 shrink-0">
          <button
            onClick={goPrev}
            disabled={currentStep <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-30 cursor-pointer hover-lift dark:bg-white/6 bg-cyber/6 dark:text-white/70 text-cyber/80 dark:border-white/4 border-cyber/8"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            {t('sidebar.previous')}
          </button>
          <span className="flex-1 text-center text-[10px] font-bold uppercase tracking-widest dark:text-white/30 text-cyber/40">
            {t('sidebar.step', { current: currentStep || '-', total: TOTAL_STEPS })}
          </span>
          <button
            onClick={goNext}
            disabled={currentStep >= TOTAL_STEPS}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-30 cursor-pointer hover-lift dark:bg-white/6 bg-cyber/6 dark:text-white/70 text-cyber/80 dark:border-white/4 border-cyber/8"
          >
            {t('sidebar.next')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Steps list */}
        <div ref={scrollRef} className="flex-1 space-y-0.5 overflow-y-auto pr-1 scrollbar-thin">
          {selectedNodeId && (
            <button
              onClick={onClose}
              className="mb-2 w-full rounded-lg py-2 text-center text-xs font-medium transition-all cursor-pointer dark:bg-white/5 bg-black/5 dark:text-white/50 text-black/50"
            >
              {t('sidebar.overview')}
            </button>
          )}

          {steps.map((node) => {
            const palette = paletteCache.get(node.group) ?? getGroupPalette(node.group)
            const isActive = node.id === selectedNodeId
            const isCompleted = (node.learningStep ?? 0) < currentStep

            return (
              <button
                key={node.id}
                data-step={node.learningStep}
                onClick={() => handleStepClick(node)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs cursor-pointer group hover-lift ${!isActive ? 'hover:dark:bg-white/6 hover:bg-cyber/6 hover:translate-x-[3px]' : ''}`}
                style={{
                  backgroundColor: isActive ? `${palette.base}20` : 'transparent',
                  borderLeft: `2px solid ${isActive ? palette.base : 'transparent'}`,
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  boxShadow: isActive ? `0 0 20px ${palette.emissive}20` : 'none',
                  transform: isActive ? 'translateX(4px)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Step number */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${isActive ? '' : 'dark:bg-white/6 bg-black/6 dark:text-white/40 text-black/40'}`}
                  style={{
                    backgroundColor: isActive ? palette.base : undefined,
                    color: isActive ? '#ffffff' : undefined,
                  }}
                >
                  {isCompleted ? '✓' : node.learningStep}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate font-medium ${isActive ? '' : 'dark:text-white/80 text-black/80'}`}
                    style={{ color: isActive ? palette.accent : undefined }}
                  >
                    {node.id}
                  </div>
                  <div className="truncate dark:text-white/30 text-black/30" style={{ fontSize: '9px' }}>
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
        <div className="mt-3 shrink-0 space-y-1 text-[9px] dark:text-white/20 text-black/20">
          <p>{t('sidebar.footerNav')}</p>
          <p>{t('sidebar.footerZoom')}</p>
        </div>
      </div>
    )

    // Mobile: hamburger toggle + drawer
    if (isMobile) {
      return (
        <>
          {/* Hamburger: backdrop-filter removed — small button (40x40) doesn't need expensive GPU compositing */}
          <button
            onClick={() => setIsOpen(true)}
            className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border cursor-pointer hover:scale-110 hover-glow dark:bg-abyss/60 bg-white/75 dark:border-white/10 border-cyber/15 dark:text-white text-cyber"
            aria-label={t('sidebar.hamburgerAriaLabel')}
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
                  className="fixed left-0 top-0 bottom-0 z-50 flex w-72 flex-col border-r p-4 dark:bg-abyss/88 bg-white/82 dark:border-white/8 border-cyber/12"
                  style={{
                    backdropFilter: 'blur(24px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                  boxShadow: 'var(--shadow-sidebar-mobile)',
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
        className="fixed left-0 top-0 bottom-0 z-50 flex w-64 flex-col border-r p-4 dark:bg-abyss/72 bg-white/72 dark:border-white/6 border-cyber/12"
        style={{
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          boxShadow: 'var(--shadow-sidebar-desktop)',
        }}
      >
        {sidebarContent}
      </aside>
    )
  },
)

SidebarNav.displayName = 'SidebarNav'
export default SidebarNav
