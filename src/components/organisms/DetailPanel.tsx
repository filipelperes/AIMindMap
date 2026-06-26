import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Badge from '../atoms/Badge'
import CloseButton from '../atoms/CloseButton'
import ScrollableArea from '../atoms/ScrollableArea'
import NodeContentRenderer from './NodeContentRenderer'
import { useTheme } from '../../store/ThemeContext'
import { useLocalizedNodeContent } from '../../hooks/useLocalizedNodeContent'
import type { MindMapNode } from '../../types/mindmap'

interface DetailPanelProps {
  node: MindMapNode | null
  onClose: () => void
  panelWidth?: number | string
  isMobile?: boolean
}

/**
 * Organism: detail panel with expanded content.
 * Header, group badge and close button are fixed at top.
 * Summary, sections, tips and examples scroll below.
 */
const DetailPanel: React.FC<DetailPanelProps> = React.memo(
  ({ node, onClose, panelWidth = 420, isMobile = false }) => {
    const { getGroupPalette } = useTheme()
    const { t } = useTranslation()

    // Hooks must be called unconditionally — call before early return
    const localizedNode = useLocalizedNodeContent(node)

    if (!node) return null

    const palette = getGroupPalette(node.group)
    const content = localizedNode?.content ?? node.content
    const isLoading = !content
    const hasEveryday = content?.everydayExample
    const hasTip = content?.quickTip

    return (
      <AnimatePresence>
        {/* Transparent backdrop — clicking outside closes the panel */}
        <motion.div
          key={`backdrop-${node.id}`}
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        />
        <motion.aside
          data-tour="panel"
          key={node.id}
          initial={
            isMobile
              ? { opacity: 0, y: 400 }
              : { opacity: 0, x: 400 }
          }
          animate={
            isMobile
              ? { opacity: 1, y: 0 }
              : { opacity: 1, x: 0 }
          }
          exit={
            isMobile
              ? { opacity: 0, y: 400 }
              : { opacity: 0, x: 400 }
          }
          transition={{ type: 'spring', damping: 30, stiffness: 220, mass: 0.8 }}
          className={`z-50 flex flex-col overflow-hidden rounded-3xl border dark:bg-abyss/72 bg-white/78 dark:border-white/10 border-cyber/12 ${
            isMobile
              ? 'fixed inset-x-4 bottom-4 top-auto max-h-[85vh] p-5'
              : 'fixed right-6 top-6 bottom-6 p-6'
          }`}
          style={{
            ...(isMobile ? {} : { width: panelWidth }),
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            boxShadow: 'var(--shadow-panel)',
          }}
        >
          {/* ── Fixed header + badge (do NOT scroll) ── */}
          <div className="shrink-0 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full shadow-lg"
                    style={{
                      backgroundColor: palette.base,
                      boxShadow: `0 0 12px ${palette.emissive}`,
                    }}
                  />
                  <h2 className="text-3xl font-bold truncate text-text-primary"
                  >
                    {node.id}
                  </h2>
                  {node.learningStep && (
                    <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 text-text-muted"
                    >
                      {t('detailPanel.step', { step: node.learningStep })}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm truncate text-text-secondary"
                >
                  {node.description}
                </p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            {/* Group badge */}
            <div className="flex items-center gap-2">
              <Badge
                label={palette.label}
                baseColor={palette.base}
                glowColor={palette.emissive}
                textColor={palette.accent}
              />
              {hasTip && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium border dark:bg-amber-500/10 bg-amber-600/8 dark:text-amber-400 text-amber-600 dark:border-amber-500/20 border-amber-600/20"
                >
                  ⚡ {t('detailPanel.quickTip')}
                </span>
              )}
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <ScrollableArea className="mt-5 space-y-5 pr-1 min-h-0">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Summary */}
                <p className="text-sm leading-relaxed text-text-primary"
                >
                  {content.summary}
                </p>

                {/* Organized sections (nothing fixed) */}
                {content.sections.map((section, i) => (
                  <NodeContentRenderer
                    key={i}
                    section={section}
                    groupColor={palette.accent}
                  />
                ))}
              </>
            )}

            {/* Quick Tip — in the scroll, not fixed */}
            {hasTip && (
              <div
                className="rounded-xl border p-3 hover-lift"
                style={{
                  borderColor: `${palette.base}30`,
                  backgroundColor: `${palette.base}0C`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex gap-2">
                  <span className="text-sm">⚡</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 dark:text-zinc-500 text-cyber"
                    >
                      {t('detailPanel.quickTip')}
                    </p>
                    <p className="text-xs leading-relaxed text-text-secondary"
                    >
                      {content.quickTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Everyday Example — in the scroll, not fixed */}
            {hasEveryday && (
              <div
                className="rounded-xl border p-3 hover-lift"
                style={{
                  borderColor: `${palette.emissive}25`,
                  backgroundColor: `${palette.emissive}0A`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex gap-2">
                  <span className="text-sm">💡</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 dark:text-zinc-500 text-cyber"
                    >
                      {t('detailPanel.everydayExample')}
                    </p>
                    <p className="text-xs leading-relaxed text-text-secondary"
                    >
                      {content.everydayExample}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollableArea>
        </motion.aside>
      </AnimatePresence>
    )
  },
)

DetailPanel.displayName = 'DetailPanel'
export default DetailPanel

/* ── Internal loading skeleton ── */

const LoadingSkeleton: React.FC = React.memo(() => {
  const pulse = 'animate-pulse rounded-md'
  return (
    <div className="space-y-4">
      <div className={`${pulse} h-4 w-full dark:bg-white/6 bg-black/6`} />
      <div className={`${pulse} h-4 w-5/6 dark:bg-white/6 bg-black/6`} />
      <div className={`${pulse} h-4 w-4/6 dark:bg-white/6 bg-black/6`} />
      <div className="pt-3">
        <div className={`${pulse} h-24 w-full rounded-lg dark:bg-white/6 bg-black/6`} />
      </div>
      <div className={`${pulse} h-24 w-full rounded-lg dark:bg-white/6 bg-black/6`} />
    </div>
  )
})
