import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../store/ThemeContext'

const TOUR_KEY = 'aimindmap-tour-completed'

interface TourStep {
  icon: string
  title: string
  description: string
  highlight?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: '🧠',
    title: 'Bem-vindo ao AI MindMap!',
    description: 'Explore o ecossistema de AI Engineering em 3D. Cada molécula é um tópico essencial — clique para aprender.',
    highlight: '[data-tour="hero"]'
  },
  {
    icon: '🎯',
    title: 'Roteiro Step-by-Step',
    description: 'Use o menu lateral para seguir um caminho de aprendizado organizado, do básico ao avançado. Use ← → do teclado para navegar.',
    highlight: '[data-tour="sidebar"]'
  },
  {
    icon: '🔄',
    title: 'Moléculas Interativas',
    description: 'Arraste as moléculas para explorar. Elas flutuam como estrelas no espaço. Clique para ver detalhes. Use + - para zoom, R para resetar.',
    highlight: '[data-tour="graph"]'
  },
  {
    icon: '📚',
    title: 'Conteúdo Rico',
    description: 'Cada molécula tem Q&A, exemplos do cotidiano, código prático e dicas rápidas. Ideal para entrevistas e aprendizado diário.',
    highlight: '[data-tour="panel"]'
  },
  {
    icon: '📋',
    title: 'Cheatsheet de Comandos',
    description: 'Acesse o cheatsheet com atalhos e dicas rápidas para navegar mais rápido pelo MindMap e consultar comandos essenciais.',
    highlight: '[data-tour="cheatsheet"]'
  },
  {
    icon: '⌨️',
    title: 'Atalhos do Teclado',
    description: 'Domine os atalhos: ← → para navegar entre tópicos, + - para zoom, R para resetar a câmera, F para busca rápida. Navegue como um profissional.',
    highlight: '[data-tour="shortcuts"]'
  },
  {
    icon: '🌓',
    title: 'Modo Claro/Escuro',
    description: 'Alternne entre temas no menu lateral. O app lembra sua preferência. Comece explorando!',
    highlight: '[data-tour="theme"]'
  }
]

interface WelcomeTourProps {
  forceClose?: number
}

const WelcomeTour: React.FC<WelcomeTourProps> = React.memo(({ forceClose }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(true)
  const { mode } = useTheme()
  const glowRef = useRef<HTMLDivElement>(null)
  const [glowPosition, setGlowPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (forceClose && isOpen) completeTour()
  }, [forceClose])

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY)
    if (!completed) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasCompleted(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !TOUR_STEPS[currentStep]?.highlight) return

    const updateGlowPosition = () => {
      const el = document.querySelector(TOUR_STEPS[currentStep].highlight!)
      if (el) {
        const rect = el.getBoundingClientRect()
        setGlowPosition({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        })
      }
    }

    updateGlowPosition()
    window.addEventListener('resize', updateGlowPosition)
    const timer = setTimeout(updateGlowPosition, 100)

    return () => {
      window.removeEventListener('resize', updateGlowPosition)
      clearTimeout(timer)
    }
  }, [currentStep, isOpen])

  const completeTour = () => {
    localStorage.setItem(TOUR_KEY, 'true')
    setIsOpen(false)
    setHasCompleted(true)
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1)
    }
  }

  if (hasCompleted) return null

  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1
  const isFirst = currentStep === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {step.highlight && (
            <motion.div
              ref={glowRef}
              className="fixed z-[99] pointer-events-none rounded-2xl"
              style={{
                top: glowPosition.top,
                left: glowPosition.left,
                width: glowPosition.width,
                height: glowPosition.height,
                border: '2px solid rgba(0,255,240,0.5)',
              }}
              animate={{
                boxShadow: [
                  '0 0 12px 2px rgba(0,255,240,0.15), 0 0 30px 6px rgba(0,255,240,0.08)',
                  '0 0 20px 6px rgba(0,255,240,0.35), 0 0 50px 12px rgba(0,255,240,0.15)',
                  '0 0 12px 2px rgba(0,255,240,0.15), 0 0 30px 6px rgba(0,255,240,0.08)',
                ],
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={completeTour}
          />

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -30 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 250,
              mass: 0.7,
            }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(40px)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === currentStep ? 24 : 8,
                      height: 6,
                      backgroundColor: i === currentStep
                        ? '#00FFF0'
                        : mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    }}
                    animate={i === currentStep ? {
                      scale: [1, 1.25, 1],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={completeTour}
                className="text-xs font-medium cursor-pointer transition-all hover:opacity-70"
                style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
              >
                Pular
              </button>
            </div>

            <motion.div
              className="mb-4 text-5xl text-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {step.icon}
            </motion.div>

            <motion.h2
              className="mb-2 text-2xl font-bold text-center"
              style={{ color: mode === 'dark' ? '#F0F4FF' : '#1A1A2E' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            >
              {step.title}
            </motion.h2>

            <motion.p
              className="mb-8 text-sm leading-relaxed text-center"
              style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            >
              {step.description}
            </motion.p>

            <div className="flex items-center justify-between">
              <motion.button
                onClick={prevStep}
                disabled={isFirst}
                whileHover={!isFirst ? { scale: 1.05, x: -2 } : {}}
                whileTap={!isFirst ? { scale: 0.95 } : {}}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                ← Anterior
              </motion.button>

              <span
                className="text-xs tabular-nums"
                style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
              >
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>

              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-6 py-2 text-sm font-bold text-white transition-all cursor-pointer"
                style={{ backgroundColor: '#7C3AED' }}
              >
                {isLast ? '✨ Começar!' : 'Próximo →'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

WelcomeTour.displayName = 'WelcomeTour'
export default WelcomeTour
