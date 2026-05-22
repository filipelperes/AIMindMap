import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../store/ThemeContext'

const TOUR_KEY = 'aimindmap-tour-completed'

interface TourStep {
  icon: string
  title: string
  description: string
  highlight?: string // CSS selector to highlight
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
    icon: '🌓',
    title: 'Modo Claro/Escuro',
    description: 'Alternne entre temas no menu lateral. O app lembra sua preferência. Comece explorando!',
    highlight: '[data-tour="theme"]'
  }
]

const WelcomeTour: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(true)
  const { mode } = useTheme()

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY)
    if (!completed) {
      // Pequeno delay para o 3D carregar
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasCompleted(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={completeTour}
          />

          {/* Tooltip card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-8 shadow-2xl"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(8,11,26,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Step indicator */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: i === currentStep ? 24 : 8,
                      backgroundColor: i === currentStep
                        ? '#00FFF0'
                        : mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={completeTour}
                className="text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
              >
                Pular
              </button>
            </div>

            {/* Icon */}
            <div className="mb-4 text-5xl">{step.icon}</div>

            {/* Title */}
            <h2
              className="mb-2 text-2xl font-bold"
              style={{ color: mode === 'dark' ? '#F0F4FF' : '#1A1A2E' }}
            >
              {step.title}
            </h2>

            {/* Description */}
            <p
              className="mb-8 text-sm leading-relaxed"
              style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={isFirst}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                ← Anterior
              </button>

              <span
                className="text-xs"
                style={{ color: mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
              >
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>

              <button
                onClick={nextStep}
                className="rounded-xl px-6 py-2 text-sm font-bold text-white transition-all hover:scale-105 cursor-pointer"
                style={{ backgroundColor: '#7C3AED' }}
              >
                {isLast ? '✨ Começar!' : 'Próximo →'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

WelcomeTour.displayName = 'WelcomeTour'
export default WelcomeTour
