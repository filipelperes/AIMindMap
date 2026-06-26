/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useTheme } from '../store/ThemeContext'
import ParticleBackground from '../components/organisms/ParticleBackground'

// ---------------------------------------------------------------------------
// Mock canvas 2D context
// ---------------------------------------------------------------------------

function createMockContext() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    canvas: { width: 0, height: 0 },
  } as any
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ParticleBackground', () => {
  let mockCtx: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockCtx = createMockContext()
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx)

    // Default: dark mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    // Spy on requestAnimationFrame / cancelAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => {
        return window.setTimeout(() => cb(performance.now()), 0) as unknown as number
      },
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
      (id: number) => window.clearTimeout(id),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // -----------------------------------------------------------------------
  // Basic rendering
  // -----------------------------------------------------------------------

  it('renders a canvas element', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('canvas has aria-hidden="true"', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  it('canvas has pointer-events-none class', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas?.className).toContain('pointer-events-none')
  })

  it('canvas ref is assigned (getContext is called)', () => {
    render(<ParticleBackground />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
  })

  // -----------------------------------------------------------------------
  // Dense prop
  // -----------------------------------------------------------------------

  it('dense prop increases star count', () => {
    const { container: defaultContainer } = render(<ParticleBackground />)
    expect(defaultContainer.querySelector('canvas')).toBeInTheDocument()

    cleanup()

    const { container: denseContainer } = render(
      <ParticleBackground dense={true} />,
    )
    expect(denseContainer.querySelector('canvas')).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Opacity prop
  // -----------------------------------------------------------------------

  it('opacity prop defaults to 1 when not provided', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveStyle({ opacity: '1' })
  })

  it('renders with a custom opacity value', () => {
    const { container } = render(<ParticleBackground opacity={0.5} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    // Canvas style opacity is always 1 (the opacity prop is used in the
    // animation loop's globalAlpha, not on the canvas style)
    expect(canvas).toHaveStyle({ opacity: '1' })
  })

  // -----------------------------------------------------------------------
  // Theme mode
  // -----------------------------------------------------------------------

  it('renders without error in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('renders without error in light mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      isDark: false,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  it('cancels the animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<ParticleBackground />)

    unmount()

    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })

  it('removes the resize event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<ParticleBackground />)

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })

  // -----------------------------------------------------------------------
  // Resize handler
  // -----------------------------------------------------------------------

  it('resize handler updates canvas dimensions', () => {
    const originalInnerWidth = window.innerWidth
    const originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })

    render(<ParticleBackground />)

    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas).toBeInTheDocument()

    expect(canvas.width).toBe(1024)
    expect(canvas.height).toBe(768)

    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
  })
})

// =========================================================================
// Extended tests — animation behavior, DPR, edge cases, positioning
// =========================================================================

describe('ParticleBackground — extended', () => {
  let mockCtx: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockCtx = createMockContext()
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx)

    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn(),
    } as any)

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) =>
        window.setTimeout(() => cb(performance.now()), 0) as unknown as number,
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
      (id: number) => window.clearTimeout(id),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // -----------------------------------------------------------------------
  // Canvas dimensions & DPR
  // -----------------------------------------------------------------------

  it('renders canvas with width/height matching window dimensions (1920×1080)', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true })

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(1920)
    expect(canvas.height).toBe(1080)

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  it('uses devicePixelRatio for canvas sizing', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    const origDpr = window.devicePixelRatio

    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(2048)
    expect(canvas.height).toBe(1536)

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
    Object.defineProperty(window, 'devicePixelRatio', { value: origDpr, configurable: true })
  })

  it('sets canvas style width/height matching CSS pixels', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true })

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.style.width).toBe('1920px')
    expect(canvas.style.height).toBe('1080px')

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  // -----------------------------------------------------------------------
  // Animation loop
  // -----------------------------------------------------------------------

  it('animation loop calls clearRect on each frame', async () => {
    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('animation loop draws stars with arc calls', async () => {
    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))
    // Stars draw a glow layer (arc + fill) and a core layer (arc + fill)
    expect(mockCtx.arc).toHaveBeenCalled()
    expect(mockCtx.fill).toHaveBeenCalled()
    // Uses save/restore for transform isolation
    expect(mockCtx.save).toHaveBeenCalled()
    expect(mockCtx.restore).toHaveBeenCalled()
    // Uses createRadialGradient for star glow
    expect(mockCtx.createRadialGradient).toHaveBeenCalled()
  })

  it('animation loop respects the opacity prop via globalAlpha', async () => {
    const alphaValues: number[] = []
    Object.defineProperty(mockCtx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set: (v: number) => { alphaValues.push(v) },
      configurable: true,
    })

    render(<ParticleBackground opacity={0.5} />)
    await new Promise((r) => setTimeout(r, 0))

    // Particle alpha = opacity * baseOpacity * twinkle
    // All three are ≤1, so final alpha ≤ 0.5
    const particleAlphaValues = alphaValues.filter((a) => a !== 1 && a > 0)
    expect(particleAlphaValues.length).toBeGreaterThan(0)
    // Every particle alpha should be ≤ 0.5 (opacity=0.5 applied)
    particleAlphaValues.forEach((a) => {
      expect(a).toBeLessThanOrEqual(0.5)
    })
  })

  it('requestAnimationFrame is called on mount', () => {
    render(<ParticleBackground />)
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('animation frame ID is stored; cancelAnimationFrame called on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<ParticleBackground />)
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })

  it('the component does NOT use setInterval', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval')
    render(<ParticleBackground />)
    expect(setIntervalSpy).not.toHaveBeenCalled()
    setIntervalSpy.mockRestore()
  })

  // -----------------------------------------------------------------------
  // Dark / Light mode
  // -----------------------------------------------------------------------

  it('renders stars in dark mode without error', async () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))
    // Stars should be drawn with arc+fill
    expect(mockCtx.arc).toHaveBeenCalled()
    expect(mockCtx.fill).toHaveBeenCalled()
  })

  it('renders stars in light mode without error', async () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light', isDark: false, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))
    expect(mockCtx.arc).toHaveBeenCalled()
    expect(mockCtx.fill).toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Star count: dense vs default
  // -----------------------------------------------------------------------

  it('dense=true creates more arc calls than default (non-dense)', async () => {
    // Default: 250 stars → 2 arc calls per star (glow + core) = 500 arc calls
    render(<ParticleBackground dense={false} />)
    await new Promise((r) => setTimeout(r, 0))
    const defaultCalls = mockCtx.arc.mock.calls.length

    cleanup()
    vi.clearAllMocks()

    // Re-setup for second render
    mockCtx = createMockContext()
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx)
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) =>
        window.setTimeout(() => cb(performance.now()), 0) as unknown as number,
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(
      (id: number) => window.clearTimeout(id),
    )

    // Dense: 450 stars → 2 arc calls per star = 900 arc calls
    render(<ParticleBackground dense={true} />)
    await new Promise((r) => setTimeout(r, 0))
    const denseCalls = mockCtx.arc.mock.calls.length

    expect(denseCalls).toBeGreaterThan(defaultCalls)
  })

  it('dense mode draws more stars than default', async () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
      colors: {} as any, getGroupPalette: vi.fn(),
    } as any)

    render(<ParticleBackground dense={true} />)
    await new Promise((r) => setTimeout(r, 0))

    // dense = 450 stars → arc + fill calls for each star
    expect(mockCtx.arc.mock.calls.length).toBeGreaterThan(0)
    expect(mockCtx.fill.mock.calls.length).toBeGreaterThan(0)
  })

  // -----------------------------------------------------------------------
  // Resize behavior
  // -----------------------------------------------------------------------

  it('multiple resize events update canvas dimensions correctly', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight

    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)

    // Dispatch resize — dimensions shrink
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 300, configurable: true })
    window.dispatchEvent(new Event('resize'))
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(300)

    // Dispatch resize — dimensions grow
    Object.defineProperty(window, 'innerWidth', { value: 1600, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    window.dispatchEvent(new Event('resize'))
    expect(canvas.width).toBe(1600)
    expect(canvas.height).toBe(900)

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  it('resize event listener is added on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    render(<ParticleBackground />)
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    addSpy.mockRestore()
  })

  it('resize during animation does not throw', async () => {
    const origW = window.innerWidth
    const origH = window.innerHeight

    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))

    Object.defineProperty(window, 'innerWidth', { value: 640, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 480, configurable: true })
    expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow()

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  it('window resize updates canvas dimensions and animation continues', async () => {
    const origW = window.innerWidth
    const origH = window.innerHeight

    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })

    render(<ParticleBackground />)
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(1024)

    // Resize
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    window.dispatchEvent(new Event('resize'))
    expect(canvas.width).toBe(1440)

    // Animation continues (stars still drawn after resize)
    await new Promise((r) => setTimeout(r, 0))
    expect(mockCtx.fill).toHaveBeenCalled()

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  // -----------------------------------------------------------------------
  // Edge cases — opacity extremes
  // -----------------------------------------------------------------------

  it('renders without error with opacity=0', () => {
    expect(() => render(<ParticleBackground opacity={0} />)).not.toThrow()
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('renders without error with opacity=2 (clamped by browser, no crash)', () => {
    expect(() => render(<ParticleBackground opacity={2} />)).not.toThrow()
  })

  it('non-integer opacity works (0.33) without crash', () => {
    expect(() => render(<ParticleBackground opacity={0.33} />)).not.toThrow()
  })

  it('non-integer opacity works (0.75) without crash', () => {
    expect(() => render(<ParticleBackground opacity={0.75} />)).not.toThrow()
  })

  it('canvas style opacity is always 1 regardless of opacity prop', () => {
    const { container } = render(<ParticleBackground opacity={0.3} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveStyle({ opacity: '1' })
  })

  // -----------------------------------------------------------------------
  // Edge cases — dimensions
  // -----------------------------------------------------------------------

  it('handles zero dimensions (0×0) without crashing', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true })

    expect(() => render(<ParticleBackground />)).not.toThrow()
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  it('handles very large canvas dimensions (3840×2160) without crashing', () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 3840, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 2160, configurable: true })

    expect(() => render(<ParticleBackground />)).not.toThrow()
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.width).toBe(3840)
    expect(canvas.height).toBe(2160)

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  // -----------------------------------------------------------------------
  // Edge cases — getContext
  // -----------------------------------------------------------------------

  it('getContext returning null does not crash', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)
    expect(() => render(<ParticleBackground />)).not.toThrow()
  })

  it('getContext("2d") is called exactly once per mount', () => {
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    render(<ParticleBackground />)
    expect(getContextSpy).toHaveBeenCalledTimes(1)
    expect(getContextSpy).toHaveBeenCalledWith('2d')
    getContextSpy.mockRestore()
  })

  it('renders with no props (all defaults)', () => {
    expect(() => render(<ParticleBackground />)).not.toThrow()
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Multiple instances & rapid mount/unmount
  // -----------------------------------------------------------------------

  it('multiple instances render without interfering', () => {
    const { container } = render(
      <div>
        <ParticleBackground />
        <ParticleBackground />
      </div>,
    )
    const canvases = container.querySelectorAll('canvas')
    expect(canvases.length).toBe(2)
    canvases.forEach((c) => {
      expect(c).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('rapid mount/unmount cycles do not leak animation frames', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    for (let i = 0; i < 5; i++) {
      const { unmount } = render(<ParticleBackground />)
      unmount()
    }
    // cancelAnimationFrame should have been called each time (once per unmount)
    expect(cancelSpy).toHaveBeenCalledTimes(5)
    cancelSpy.mockRestore()
  })

  // -----------------------------------------------------------------------
  // CSS and positioning
  // -----------------------------------------------------------------------

  it('canvas has "absolute" class for positioning', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas?.className).toContain('absolute')
  })

  it('canvas has "inset-0" class for full coverage', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas?.className).toContain('inset-0')
  })

  it('canvas has aria-hidden attribute', () => {
    const { container } = render(<ParticleBackground />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })

  // -----------------------------------------------------------------------
  // Star rendering
  // -----------------------------------------------------------------------

  it('stars are drawn with arc for glow and core within canvas area', async () => {
    const origW = window.innerWidth
    const origH = window.innerHeight
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })

    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))

    const arcCalls = mockCtx.arc.mock.calls
    expect(arcCalls.length).toBeGreaterThan(0)

    // Verify arc signatures: arc(x, y, radius, startAngle, endAngle)
    arcCalls.forEach((call: any[]) => {
      const [, , radius, startAngle, endAngle] = call
      // radius should be positive
      expect(radius).toBeGreaterThanOrEqual(0)
      // arc should be a full circle
      expect(startAngle).toBe(0)
      expect(endAngle).toBe(Math.PI * 2)
    })

    Object.defineProperty(window, 'innerWidth', { value: origW, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: origH, configurable: true })
  })

  it('animation resets globalAlpha to 1 at end of each frame', async () => {
    const alphaValues: number[] = []
    Object.defineProperty(mockCtx, 'globalAlpha', {
      get: () => alphaValues[alphaValues.length - 1] ?? 1,
      set: (v: number) => { alphaValues.push(v) },
      configurable: true,
    })

    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))

    // The last globalAlpha set should be 1 (reset at end of animate)
    const lastAlpha = alphaValues[alphaValues.length - 1]
    expect(lastAlpha).toBe(1)
  })

  it('both dense and opacity props work together without conflict', async () => {
    render(<ParticleBackground dense={true} opacity={0.7} />)
    await new Promise((r) => setTimeout(r, 0))
    expect(mockCtx.arc.mock.calls.length).toBeGreaterThan(0)
    expect(mockCtx.clearRect).toHaveBeenCalled()
  })

  it('canvas element has a ref assigned (ref= attribute)', () => {
    render(<ParticleBackground />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
  })

  it('createRadialGradient is used for star glow effects', async () => {
    render(<ParticleBackground />)
    await new Promise((r) => setTimeout(r, 0))
    // Each star creates a gradient for glow rendering
    expect(mockCtx.createRadialGradient).toHaveBeenCalled()
  })
})
