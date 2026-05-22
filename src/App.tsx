import React, { Suspense } from 'react'
import { ThemeProvider } from './store/ThemeContext'

/**
 * Ponto de entrada da aplicação.
 * ThemeProvider encapsula todo o app para dark/light mode.
 * GraphScene é lazy-loaded via code splitting.
 */
const MindMapPage = React.lazy(() => import('./components/pages/MindMapPage'))

/**
 * Loading fallback enquanto o chunk 3D carrega.
 */
const LoadingFallback: React.FC = React.memo(() => (
  <div
    className="flex h-screen w-screen items-center justify-center"
    style={{ background: '#080B1A' }}
  >
    <div className="text-center">
      <div className="mb-4 text-4xl animate-pulse">🧠</div>
      <div className="text-sm text-zinc-500">Carregando universo AI...</div>
    </div>
  </div>
))

LoadingFallback.displayName = 'LoadingFallback'

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingFallback />}>
        <MindMapPage />
      </Suspense>
    </ThemeProvider>
  )
}
