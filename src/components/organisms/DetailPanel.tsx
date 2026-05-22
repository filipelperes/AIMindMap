import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../atoms/Badge'
import CloseButton from '../atoms/CloseButton'
import ScrollableArea from '../atoms/ScrollableArea'
import NodeContentRenderer from './NodeContentRenderer'
import { getGroupColor } from '../../constants/colors'
import { useTheme } from '../../store/ThemeContext'
import type { MindMapNode, GroupPalette } from '../../types/mindmap'

interface DetailPanelProps {
  node: MindMapNode | null
  onClose: () => void
  panelWidth?: number | string
  isMobile?: boolean
}

/**
 * Organismo: painel de detalhes com conteúdo expandido.
 * TUDO scrollável — nada fixado (shrink-0 removido de everyday/quicktip).
 */
const DetailPanel: React.FC<DetailPanelProps> = React.memo(
  ({ node, onClose, panelWidth = 420, isMobile = false }) => {
    const { mode } = useTheme()
    if (!node) return null

    const palette: GroupPalette = getGroupColor(node.group)
    const hasEveryday = node.content.everydayExample
    const hasTip = node.content.quickTip

    return (
      <AnimatePresence>
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
          className={`z-50 flex flex-col overflow-hidden rounded-3xl border ${
            isMobile
              ? 'fixed inset-x-4 bottom-4 top-auto max-h-[85vh] p-5'
              : 'fixed right-6 top-6 bottom-6 p-6'
          }`}
          style={{
            ...(isMobile ? {} : { width: panelWidth }),
            backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.65)' : 'rgba(255,255,255,0.82)',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.15)',
            backdropFilter: 'blur(28px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
            boxShadow: mode === 'dark'
              ? '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 24px 80px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.05)',
          }}
        >
          {/* ── TUDO scrollável ── */}
          <ScrollableArea className="space-y-5 pr-1">
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
                  <h2 className="text-3xl font-bold truncate"
                    style={{ color: mode === 'dark' ? '#F0F4FF' : '#1A1A2E' }}
                  >
                    {node.id}
                  </h2>
                  {(node as any).learningStep && (
                    <span className="text-[10px] font-bold uppercase tracking-widest shrink-0"
                      style={{ color: mode === 'dark' ? '#71717A' : '#A1A1AA' }}
                    >
                      Step {(node as any).learningStep}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm truncate"
                  style={{ color: mode === 'dark' ? '#A1A1AA' : '#71717A' }}
                >
                  {node.description}
                </p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            {/* Badge do grupo */}
            <div className="flex items-center gap-2">
              <Badge
                label={palette.label}
                baseColor={palette.base}
                glowColor={palette.emissive}
                textColor={palette.accent}
              />
              {hasTip && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium border"
                  style={{
                    backgroundColor: mode === 'dark' ? 'rgba(245,158,11,0.1)' : 'rgba(217,119,6,0.08)',
                    color: mode === 'dark' ? '#FBBF24' : '#D97706',
                    borderColor: mode === 'dark' ? 'rgba(245,158,11,0.2)' : 'rgba(217,119,6,0.2)',
                  }}
                >
                  ⚡ Dica Rápida
                </span>
              )}
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed"
              style={{ color: mode === 'dark' ? '#E4E4E7' : '#3F3F46' }}
            >
              {node.content.summary}
            </p>

            {/* Sessões organizadas (nada fixado) */}
            {node.content.sections.map((section, i) => (
              <NodeContentRenderer
                key={i}
                section={section}
                groupColor={palette.accent}
              />
            ))}

            {/* Quick Tip — organizada no scroll, não fixada */}
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
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: mode === 'dark' ? '#71717A' : '#6D28D9' }}
                    >
                      Dica Rápida
                    </p>
                    <p className="text-xs leading-relaxed"
                      style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F6E' }}
                    >
                      {node.content.quickTip}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Everyday Example — organizada no scroll, não fixada */}
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
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: mode === 'dark' ? '#71717A' : '#6D28D9' }}
                    >
                      Exemplo do Cotidiano
                    </p>
                    <p className="text-xs leading-relaxed"
                      style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F6E' }}
                    >
                      {node.content.everydayExample}
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
