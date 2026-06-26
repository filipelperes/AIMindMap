import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const TOUR_KEY = 'aimindmap-tour-completed'

const TOUR_HIGHLIGHTS = [
  '[data-tour="hero"]',
  '[data-tour="sidebar"]',
  '[data-tour="graph"]',
  '[data-tour="panel"]',
  '[data-tour="cheatsheet"]',
  '[data-tour="shortcuts"]',
  '[data-tour="theme"]',
]

const TOUR_ICONS = ['🧠', '🎯', '🔄', '📚', '📋', '⌨️', '🌓']

const TOTAL_TOUR_STEPS = 7

interface WelcomeTourProps {
  forceClose?: number
}

const WelcomeTour: React.FC<WelcomeTourProps> = React.memo(({ forceClose }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(true)
  const { t } = useTranslation()
  const glowRef = useRef<HTMLDivElement>(null)
  const [glowPosition, setGlowPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (forceClose && isOpen) completeTour()
  }, [forceClose, isOpen])

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
    if (!isOpen || !TOUR_HIGHLIGHTS[currentStep]) return

    const updateGlowPosition = () => {
      const el = document.querySelector(TOUR_HIGHLIGHTS[currentStep])
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
    if (currentStep < TOTAL_TOUR_STEPS - 1) {
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

  const isLast = currentStep === TOTAL_TOUR_STEPS - 1
  const isFirst = currentStep === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {TOUR_HIGHLIGHTS[currentStep] && (
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
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-8 shadow-2xl dark:bg-abyss/95 bg-white/95 dark:border-white/10 border-black/10"
            style={{
              backdropFilter: 'blur(40px)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_TOUR_STEPS }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`rounded-full transition-all duration-500 ${
                      i === currentStep ? 'bg-neural' : 'dark:bg-white/15 bg-black/15'
                    }`}
                    style={{
                      width: i === currentStep ? 24 : 8,
                      height: 6,
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
                className="text-xs font-medium cursor-pointer transition-all hover:opacity-70 dark:text-white/30 text-black/30"
              >
                {t('tour.skip')}
              </button>
            </div>

            <motion.div
              className="mb-4 text-5xl text-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {TOUR_ICONS[currentStep]}
            </motion.div>

            <motion.h2
              className="mb-2 text-2xl font-bold text-center dark:text-[#F0F4FF] text-[#1A1A2E]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            >
              {t(`tour.steps.${currentStep}.title`)}
            </motion.h2>

            <motion.p
              className="mb-8 text-sm leading-relaxed text-center dark:text-white/60 text-black/60"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            >
              {t(`tour.steps.${currentStep}.description`)}
            </motion.p>

            <div className="flex items-center justify-between">
              <motion.button
                onClick={prevStep}
                disabled={isFirst}
                whileHover={!isFirst ? { scale: 1.05, x: -2 } : {}}
                whileTap={!isFirst ? { scale: 0.95 } : {}}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed dark:bg-white/6 bg-black/5 dark:text-white/70 text-black/70"
              >
                {t('tour.previous')}
              </motion.button>

              <span
                className="text-xs tabular-nums dark:text-white/30 text-black/30"
              >
                {t('tour.stepCounter', { current: currentStep + 1, total: TOTAL_TOUR_STEPS })}
              </span>

              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-6 py-2 text-sm font-bold text-white transition-all cursor-pointer"
                style={{ backgroundColor: '#7C3AED' }}
              >
                {isLast ? t('tour.start') : t('tour.next')}
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
