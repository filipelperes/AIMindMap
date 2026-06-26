import React, { useRef, useEffect } from 'react'
import { useTheme } from '../../store/ThemeContext'

/* ============================================================
   ParticleBackground — star field rendered on 2D Canvas.

   Creates a subtle, elegant star field that sits BEHIND the
   3D graph. Stars are:
   - Scattered (not clustered like dust)
   - Distinct (each with its own size, brightness, twinkle)
   - Glowing (radial gradient for a soft star-like bloom)
   - Drifting slowly (parallax layers, not 3D rotation)
   - Twinkling (each star pulses at its own rhythm)

   NOT a "dust cloud" — this is a calm night-sky star field.
   ============================================================ */

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
  driftX: number
  driftY: number
  hue: number
  layer: number // 0=near, 1=mid, 2=far
}

interface ParticleBackgroundProps {
  opacity?: number
  dense?: boolean
}

const STARS_DEFAULT = 500
const STARS_DENSE = 900

// Colors palette for stars (subtle — mostly white with hints of color)
// Dark mode: white/light stars on dark bg → high contrast
// Light mode: dark stars on light bg → need darker hues for visibility
const DARK_STAR_HUES = [0, 0, 0, 0, 0, 220, 280, 200, 160, 40]
// Light mode uses darker hues so stars contrast against the light gradient bg.
// Hue=0 means "neutral/dark" instead of white; rest use darker color variants.
const LIGHT_STAR_HUES = [0, 0, 240, 280, 200, 340, 160, 40, 20, 300]

// Cache radial gradients per star size to avoid re-creating every frame
// Key: starSize, Value: CanvasGradient
// Bounded to 50 entries to prevent unbounded memory growth (M3).
const GRADIENT_CACHE_MAX = 50
const gradientCache = new Map<string, CanvasGradient>()
const gradientAccessQueue: string[] = [] // LRU tracking

function getStarGradient(
  ctx: CanvasRenderingContext2D,
  size: number,
  hue: number,
  isDark: boolean,
): CanvasGradient {
  const key = `${size}-${hue}-${isDark ? 'd' : 'l'}`
  const cached = gradientCache.get(key)
  if (cached) {
    // Move to end of access queue (LRU promotion)
    const idx = gradientAccessQueue.indexOf(key)
    if (idx !== -1) {
      gradientAccessQueue.splice(idx, 1)
      gradientAccessQueue.push(key)
    }
    return cached
  }

  const r = size * 4 // gradient radius is 4x star size for soft glow
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r)

  if (isDark) {
    // ── Dark mode: bright stars on dark background ──
    if (hue !== 0) {
      // Colored star — vibrant glow
      gradient.addColorStop(0, `hsla(${hue}, 80%, 85%, 1)`)
      gradient.addColorStop(0.15, `hsla(${hue}, 70%, 70%, 0.5)`)
      gradient.addColorStop(0.4, `hsla(${hue}, 60%, 60%, 0.12)`)
      gradient.addColorStop(1, `hsla(${hue}, 50%, 50%, 0)`)
    } else {
      // White star
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.6)')
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    }
  } else {
    // ── Light mode: dark/subtle stars on light background ──
    // Using significantly darker tones so stars actually contrast against
    // the light gradient bg (#F0F4FF → #EAE6FF → #F5F0FF).
    if (hue !== 0) {
      // Colored star — deep, saturated tones for visibility on light bg
      gradient.addColorStop(0, `hsla(${hue}, 70%, 22%, 1)`)
      gradient.addColorStop(0.15, `hsla(${hue}, 60%, 18%, 0.6)`)
      gradient.addColorStop(0.4, `hsla(${hue}, 50%, 15%, 0.18)`)
      gradient.addColorStop(1, `hsla(${hue}, 40%, 12%, 0)`)
    } else {
      // Dark charcoal star for light bg — dark enough to be clearly visible
      gradient.addColorStop(0, 'rgba(25, 25, 55, 1)')
      gradient.addColorStop(0.15, 'rgba(25, 25, 55, 0.55)')
      gradient.addColorStop(0.4, 'rgba(25, 25, 55, 0.18)')
      gradient.addColorStop(1, 'rgba(25, 25, 55, 0)')
    }
  }

  // Evict oldest entry if at capacity (LRU)
  if (gradientCache.size >= GRADIENT_CACHE_MAX) {
    const oldest = gradientAccessQueue.shift()
    if (oldest) gradientCache.delete(oldest)
  }

  gradientCache.set(key, gradient)
  gradientAccessQueue.push(key)
  return gradient
}

/**
 * Star field background rendered on 2D Canvas.
 * Designed to feel like a calm night sky, NOT dust particles.
 * Sits behind the 3D graph at all times.
 */
const ParticleBackground: React.FC<ParticleBackgroundProps> = React.memo(
  ({ opacity = 1, dense = false }) => {
    const { mode, isDark } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef(0)
    const starsRef = useRef<Star[]>([])
    const lastTimeRef = useRef(0)
    const opacityRef = useRef(opacity)
    opacityRef.current = opacity
    const isDarkRef = useRef(isDark)
    isDarkRef.current = isDark
    const offsetRef = useRef({ x: 0, y: 0 })

    // ── Star generation — sparse, varied, star-like ──
    const starCount = dense ? STARS_DENSE : STARS_DEFAULT

    // ── Initialize star positions/sizes/speeds (only when count changes) ──
    // Separated from hue (which depends on mode) to avoid regenerating all 900
    // stars when user toggles theme (M2).
    useEffect(() => {
      const stars: Star[] = new Array(starCount)
      const w = window.innerWidth
      const h = window.innerHeight

      for (let i = 0; i < starCount; i++) {
        const layer = Math.floor(Math.random() * 3) // 0, 1, 2
        const layerFactor = 1 + layer * 0.5 // farther layers appear smaller

        stars[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          size: (0.3 + Math.random() * 1.4) / layerFactor,
          baseOpacity: 0.15 + Math.random() * 0.55,
          twinkleSpeed: 0.3 + Math.random() * 1.5,
          twinklePhase: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * 0.3 * layerFactor,
          driftY: (Math.random() - 0.5) * 0.3 * layerFactor,
          hue: 0, // will be set by hue effect below
          layer,
        }
      }

      starsRef.current = stars
    }, [starCount])

    // ── Update star hues when theme changes (no position regeneration) ──
    useEffect(() => {
      const hues = mode === 'dark' ? DARK_STAR_HUES : LIGHT_STAR_HUES
      const stars = starsRef.current
      if (stars.length === 0) return
      for (let i = 0; i < stars.length; i++) {
        stars[i].hue = hues[Math.floor(Math.random() * hues.length)]
      }
    }, [mode])

    // ── Render loop ──
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')!
      lastTimeRef.current = performance.now()
      offsetRef.current = { x: 0, y: 0 }

      const resize = () => {
        const dpr = window.devicePixelRatio || 1
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
      }

      resize()
      window.addEventListener('resize', resize)

      let isVisible = true

      const handleVisibility = () => {
        if (document.hidden) {
          isVisible = false
          cancelAnimationFrame(animRef.current)
        } else {
          isVisible = true
          lastTimeRef.current = performance.now()
          animRef.current = requestAnimationFrame(animate)
        }
      }

      document.addEventListener('visibilitychange', handleVisibility)

      const animate = (time: number) => {
        if (!isVisible) return

        const delta = Math.min((time - lastTimeRef.current) / 1000, 0.05)
        lastTimeRef.current = time

        const dpr = window.devicePixelRatio || 1
        const w = canvas.width
        const h = canvas.height
        const vw = w / dpr
        const vh = h / dpr

        // ── Clear ──
        ctx.clearRect(0, 0, w, h)

        const stars = starsRef.current
        const off = offsetRef.current

        // Update drift offset (continuous slow scrolling)
        off.x += delta * 0.30
        off.y += delta * 0.16

        const darkModeNow = isDarkRef.current

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i]

          // ── Star position with parallax drift ──
          const layerParallax = 1 + star.layer * 0.4
          let sx = star.x + off.x * star.driftX * layerParallax
          let sy = star.y + off.y * star.driftY * layerParallax

          // Wrap around edges using proper modulo — handles any magnitude of offset,
          // even after hours of continuous drift accumulation.
          const margin = 20
          const totalW = vw + margin * 2
          const totalH = vh + margin * 2
          sx = ((sx + margin) % totalW + totalW) % totalW - margin
          sy = ((sy + margin) % totalH + totalH) % totalH - margin

          // ── Twinkle ──
          const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinklePhase)

          // Light mode needs higher opacity and larger size to be visible
          // against the bright gradient background (#F0F4FF → #EAE6FF).
          const modeOpacityScale = darkModeNow ? 1.0 : 1.8
          const modeSizeScale = darkModeNow ? 1.0 : 1.6
          const starOpacity = star.baseOpacity * twinkle * modeOpacityScale

          // ── Render star with glow ──
          const finalOpacity = Math.min(opacityRef.current * starOpacity, 1)

          // Skip nearly invisible stars
          if (finalOpacity < 0.01) continue

          const screenSize = star.size * dpr * modeSizeScale
          const cx = sx * dpr
          const cy = sy * dpr

          // ── Draw glow (radial gradient) ──
          ctx.save()
          ctx.translate(cx, cy)
          const gradient = getStarGradient(ctx, star.size, star.hue, darkModeNow)
          const glowRadius = screenSize * 4
          ctx.globalAlpha = finalOpacity * (darkModeNow ? 0.35 : 0.55)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2)
          ctx.fill()

          // ── Draw star core (brighter center) ──
          // Note: globalAlpha already handles opacity — fillStyle uses alpha=1
          // (solid) to avoid double-alpha multiplication that would cut visibility.
          if (star.hue !== 0) {
            // Colored star core — lower lightness on light bg for contrast
            const lightness = darkModeNow ? 75 : 18
            ctx.globalAlpha = finalOpacity
            ctx.fillStyle = `hsla(${star.hue}, 70%, ${lightness}%, 1)`
          } else if (darkModeNow) {
            // White star core on dark bg
            ctx.globalAlpha = finalOpacity
            ctx.fillStyle = 'rgb(255, 255, 255)'
          } else {
            // Dark star core on light bg (deep charcoal)
            ctx.globalAlpha = finalOpacity
            ctx.fillStyle = 'rgb(25, 25, 55)'
          }
          ctx.beginPath()
          ctx.arc(0, 0, screenSize, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        }

        ctx.globalAlpha = 1
        animRef.current = requestAnimationFrame(animate)
      }

      animRef.current = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(animRef.current)
        document.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('resize', resize)
      }
      // opacity and mode removed from deps — read via ref or separate effects.
      // The animation loop reads starsRef.current dynamically every frame,
      // so it automatically picks up new positions (starCount change) and
      // new hues (mode change) without restarting the render loop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 1 }}
        aria-hidden="true"
      />
    )
  },
)

ParticleBackground.displayName = 'ParticleBackground'
export default ParticleBackground
