import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ThemeMode } from '../constants/theme'
import { getGroupPaletteForTheme } from '../constants/theme'
import type { GroupPalette } from '../types/mindmap'

export interface ThemeContextType {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
  getGroupPalette: (group: number) => GroupPalette
  isDark: boolean
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const ThemeContext = createContext<ThemeContextType | null>(null)

const STORAGE_KEY = 'aimindmap-theme'

/**
 * Theme provider that manages dark/light mode.
 * Persists preference in localStorage.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (stored === 'dark' || stored === 'light') return stored
      // If the system prefers light mode, use light
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
    }
    return 'dark'
  })

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

  // Apply data-theme attribute on <html> for CSS variables
  // and sync meta[name="theme-color"] for mobile browser chrome.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? '#080B1A' : '#F0F4FF')
    }
  }, [mode])

  // Synchronize with prefers-color-scheme
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

  const ctx = useMemo(() => ({
    mode, toggle, setMode, getGroupPalette, isDark: mode === 'dark',
  }), [mode, toggle, setMode, getGroupPalette])

  return (
    <ThemeContext.Provider value={ctx}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access the current theme.
 */
/* eslint-disable-next-line react-refresh/only-export-components */
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


