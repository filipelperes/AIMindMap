import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeProvider } from './store/ThemeContext'
import { LocaleProvider } from './i18n/LocaleContext'

/**
 * Application entry point.
 * ThemeProvider wraps the entire app for dark/light mode.
 * LocaleProvider enables language switching and user-level date/time locale.
 * GraphScene is lazy-loaded via code splitting.
 */
const MindMapPage = React.lazy(() => import('./components/pages/MindMapPage'))

/**
 * Loading fallback while the 3D chunk loads.
 */
const LoadingFallback: React.FC = React.memo(() => {
  const { t } = useTranslation()
  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-[var(--bg-primary)]"
    >
      <div className="text-center">
        <div className="mb-4 text-4xl animate-pulse">🧠</div>
        <div className="text-sm text-zinc-500">{t('app.loading')}</div>
      </div>
    </div>
  )
})

LoadingFallback.displayName = 'LoadingFallback'

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <Suspense fallback={<LoadingFallback />}>
          <MindMapPage />
        </Suspense>
      </LocaleProvider>
    </ThemeProvider>
  )
}
