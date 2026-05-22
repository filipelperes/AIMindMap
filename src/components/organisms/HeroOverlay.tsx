import React from 'react'
import { motion } from 'framer-motion'
import { getLearningPath } from '../../data/map'
import { useTheme } from '../../store/ThemeContext'

interface HeroOverlayProps {
  isMobile?: boolean
}

const SECTIONS = [
  { label: '14 Tópicos', desc: 'Fundamentos a Produção' },
  { label: 'Step-by-Step', desc: 'Roteiro de aprendizado' },
  { label: '100+ Q&A', desc: 'Perguntas de entrevistas' },
  { label: 'Código & Exemplos', desc: 'Implementações reais' },
]

/**
 * HeroOverlay — Título principal e navegação inicial.
 * Mostrado quando nenhuma molécula está selecionada.
 */
const HeroOverlay: React.FC<HeroOverlayProps> = React.memo(
  ({ isMobile = false }) => {
    const { mode } = useTheme()
    const steps = getLearningPath()

    return (
      <motion.div
        data-tour="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute z-40"
        style={{
          left: isMobile ? '5%' : '19rem',
          top: isMobile ? '3rem' : '3rem',
          right: isMobile ? '5%' : 'auto',
          maxWidth: isMobile ? '90%' : 560,
        }}
      >
        {/* Título principal */}
        <div className="animate-stagger-fade-in delay-100">
          <h1
            className={`mb-2 font-black ${
              isMobile ? 'text-4xl' : 'text-6xl'
            }`}
            style={{
              color: mode === 'dark' ? '#ffffff' : '#0A0A1A',
              textShadow: mode === 'dark'
                ? '0 0 40px rgba(0,255,240,0.3), 0 0 80px rgba(0,255,240,0.1)'
                : '0 0 40px rgba(124,58,237,0.15), 0 0 80px rgba(124,58,237,0.05)',
            }}
          >
            AI{' '}
            <span className="animate-gradient-shift bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              MINDMAP
            </span>
          </h1>
        </div>

        <p className={`animate-stagger-fade-in delay-300 mb-6 leading-relaxed drop-shadow-md ${
          isMobile ? 'text-sm' : 'text-base'
        }`}
          style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F6E' }}
        >
          Um mapa interativo 3D do ecossistema de AI Engineering.
          <br />
          Cada molécula é um tópico. Gire, clique, explore.
        </p>

        {/* Stats badges */}
        <div className="animate-stagger-fade-in delay-500 pointer-events-auto mb-8 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <span
              key={s.label}
              className="glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium hover-lift"
              style={{
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.12)',
                color: mode === 'dark' ? '#D4D4D8' : '#3F3F6E',
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-breathe-glow" />
              {s.label}
              <span style={{ color: mode === 'dark' ? '#71717A' : '#8B8BA7' }}>·</span>
              <span style={{ color: mode === 'dark' ? '#71717A' : '#8B8BA7' }}>{s.desc}</span>
            </span>
          ))}
        </div>

        {/* Learning path mini preview */}
        <div className="animate-stagger-fade-in delay-700 pointer-events-auto space-y-0.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: mode === 'dark' ? '#71717A' : '#6D28D9' }}
          >
            ROTEIRO DE APRENDIZADO
          </p>
          <div className="flex flex-wrap gap-1.5">
            {steps.slice(0, isMobile ? 5 : 7).map((node, i) => (
              <span
                key={node.id}
                className="glass-light inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium hover-lift"
                style={{
                  color: mode === 'dark' ? '#A1A1AA' : '#3F3F6E',
                }}
              >
                <span style={{ color: mode === 'dark' ? '#52525B' : '#8B8BA7' }}>{i + 1}.</span>
                {node.id}
              </span>
            ))}
            <span
              className="glass-light inline-flex items-center rounded-full px-2.5 py-1 text-[10px]"
              style={{
                color: mode === 'dark' ? '#71717A' : '#8B8BA7',
              }}
            >
              +{steps.length - (isMobile ? 5 : 7)} mais
            </span>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="animate-stagger-fade-in delay-1000 pointer-events-auto mt-8 text-[11px]"
          style={{ color: mode === 'dark' ? '#52525B' : '#8B8BA7' }}
        >
          🖱 Clique para explorar · <kbd className="glass-light rounded px-1.5 py-0.5 font-mono"
            style={{
              color: mode === 'dark' ? '#71717A' : '#6D28D9',
            }}
          >+</kbd> <kbd className="glass-light rounded px-1.5 py-0.5 font-mono"
            style={{
              color: mode === 'dark' ? '#71717A' : '#6D28D9',
            }}
          >-</kbd> zoom · <kbd className="glass-light rounded px-1.5 py-0.5 font-mono"
            style={{
              color: mode === 'dark' ? '#71717A' : '#6D28D9',
            }}
          >R</kbd> reset
        </p>
      </motion.div>
    )
  },
)

HeroOverlay.displayName = 'HeroOverlay'
export default HeroOverlay
