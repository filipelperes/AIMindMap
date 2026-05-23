import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ThemeMode, ThemeColors } from '../constants/theme'
import { darkTheme, lightTheme, getGroupPaletteForTheme } from '../constants/theme'
import type { GroupPalette } from '../types/mindmap'

interface ThemeContextType {
  mode: ThemeMode
  colors: ThemeColors
  toggle: () => void
  setMode: (mode: ThemeMode) => void
  getGroupPalette: (group: number) => GroupPalette
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'aimindmap-theme'

/**
 * Provider do tema que gerencia dark/light mode.
 * Persiste preferência no localStorage.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (stored === 'dark' || stored === 'light') return stored
      // Se o sistema prefere light mode, use light
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    }
    return 'dark'
  })

  const colors = useMemo(() => mode === 'dark' ? darkTheme : lightTheme, [mode])

  const toggle = useCallback(() => {
    setModeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }, [])

  const getGroupPalette = useCallback((group: number): GroupPalette => {
    return getGroupPaletteForTheme(group, mode)
  }, [mode])

  // Aplicar atributo data-theme no <html> para CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  // Sincronizar com prefers-color-scheme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setModeState(e.matches ? 'light' : 'dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle, setMode, getGroupPalette, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para acessar o tema atual.
 */
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
