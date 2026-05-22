import { useState, useEffect } from 'react'
import {
  isMobileWidth,
  getSidebarWidth,
  getGraphScale,
  type DeviceTier,
  getDeviceTier,
} from '../utils/responsiveUtils'

/* ============================================================
   useResponsiveLayout — Hook que observa a viewport e
   retorna valores de layout responsivo.
   ============================================================ */

interface ResponsiveLayout {
  /** Largura da viewport */
  viewportWidth: number
  /** Viewport é mobile? (< 768px) */
  isMobile: boolean
  /** Tier do dispositivo */
  tier: DeviceTier
  /** Largura do painel lateral */
  sidebarWidth: number | string
  /** Escala do grafo 3D */
  graphScale: number
}

/**
 * Hook que acompanha o resize da janela e retorna
 * valores de layout adaptados ao viewport.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      // Debounce para não disparar em cada pixel
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth)
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    // Também ouvir mudanças de orientação no mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => setViewportWidth(window.innerWidth), 200)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return {
    viewportWidth,
    isMobile: isMobileWidth(viewportWidth),
    tier: getDeviceTier(viewportWidth),
    sidebarWidth: getSidebarWidth(viewportWidth),
    graphScale: getGraphScale(viewportWidth),
  }
}
