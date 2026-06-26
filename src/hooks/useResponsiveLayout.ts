import { useState, useEffect } from 'react'
import {
  isMobileWidth,
  getSidebarWidth,
  getGraphScale,
  type DeviceTier,
  getDeviceTier,
} from '../utils/responsiveUtils'

/* ============================================================
   useResponsiveLayout — Hook that observes the viewport and
   returns responsive layout values.
   ============================================================ */

interface ResponsiveLayout {
  /** Viewport width */
  viewportWidth: number
  /** Is viewport mobile? (< 768px) */
  isMobile: boolean
  /** Device tier */
  tier: DeviceTier
  /** Sidebar width */
  sidebarWidth: number | string
  /** 3D graph scale */
  graphScale: number
}

/**
 * Hook that tracks window resize and returns
 * layout values adapted to the viewport.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      // Debounce to avoid firing on every pixel
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth)
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    // Also listen to orientation changes on mobile
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
