import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getLearningPath } from '../../data/map'

interface HeroOverlayProps {
  isMobile?: boolean
}

const SECTIONS = [
  { labelKey: 'topics', descKey: 'topics' },
  { labelKey: 'stepByStep', descKey: 'stepByStep' },
  { labelKey: 'qa', descKey: 'qa' },
  { labelKey: 'code', descKey: 'code' },
]

/**
 * HeroOverlay — Main title and initial navigation.
 * Shown when no molecule is selected.
 */
const HeroOverlay: React.FC<HeroOverlayProps> = React.memo(
  ({ isMobile = false }) => {
    const { t } = useTranslation()
    const steps = getLearningPath()

    return (
      <motion.div
        data-tour="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute z-30"
        style={{
          left: isMobile ? '5%' : '17%',
          top: isMobile ? '3.7rem' : '3rem',
          right: isMobile ? '5%' : 'auto',
          maxWidth: isMobile ? '90%' : 560,
        }}
      >
        {/* Main title */}
        <div className="animate-stagger-fade-in delay-100">
          <h1
            className={`mb-2 font-black text-text-primary ${
              isMobile ? 'text-4xl' : 'text-6xl'
            }`}
            style={{
              textShadow: 'var(--shadow-hero-title)',
            }}
          >
            AI{' '}
            <span className="animate-gradient-shift bg-clip-text text-transparent bg-[var(--gradient-hero-title)]">
              MINDMAP
            </span>
          </h1>
        </div>

        <p className={`animate-stagger-fade-in delay-300 mb-6 leading-relaxed drop-shadow-md text-text-secondary ${
          isMobile ? 'text-sm' : 'text-base'
        }`}
        >
          {t('hero.subtitle')}
          <br />
          {t('hero.subtitle2')}
        </p>

        {/* Stats badges */}
        <div className="animate-stagger-fade-in delay-500 pointer-events-auto mb-8 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <span
              key={s.labelKey}
              className="glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover-lift dark:border-white/10 border-cyber/12 text-text-secondary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-breathe-glow" />
              {t(`hero.sections.${s.labelKey}.label`)}
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">{t(`hero.sections.${s.descKey}.desc`)}</span>
            </span>
          ))}
        </div>

        {/* Learning path mini preview */}
        <div className="animate-stagger-fade-in delay-700 pointer-events-auto space-y-0.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest dark:text-zinc-500 text-cyber"
          >
            {t('hero.learningPath')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {steps.slice(0, isMobile ? 5 : 7).map((node, i) => (
              <span
                key={node.id}
                className="glass-light inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium hover-lift text-text-secondary"
              >
                <span className="text-text-muted">{i + 1}.</span>
                {node.id}
              </span>
            ))}
            <span
              className="glass-light inline-flex items-center rounded-full px-2.5 py-1 text-[10px] text-text-muted"
            >
              {t('hero.more', { count: steps.length - (isMobile ? 5 : 7) })}
            </span>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="animate-stagger-fade-in delay-1000 pointer-events-auto mt-8 text-[11px] text-text-muted"
        >
          🖱 {t('hero.subtitle')} · <kbd className="glass-light rounded px-1.5 py-0.5 font-mono dark:text-zinc-500 text-cyber">+</kbd> <kbd className="glass-light rounded px-1.5 py-0.5 font-mono dark:text-zinc-500 text-cyber">-</kbd> zoom · <kbd className="glass-light rounded px-1.5 py-0.5 font-mono dark:text-zinc-500 text-cyber">R</kbd> reset
        </p>
      </motion.div>
    )
  },
)

HeroOverlay.displayName = 'HeroOverlay'
export default HeroOverlay
