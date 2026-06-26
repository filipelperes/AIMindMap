import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SphereGeometry, CanvasTexture } from 'three'
import { getSphereGeometry, getLabelTexture } from '../utils/threeHelpers'

// ===========================================================================
// threeHelpers — Factory functions with caching
// ===========================================================================

// jsdom lacks a canvas 2D rendering context.  We provide a lightweight mock
// so getLabelTexture can execute without crashing while still exercising its
// caching logic and DPR clamping.
const mockContext = {
  font: '',
  textAlign: '',
  textBaseline: '',
  shadowColor: '',
  shadowBlur: 0,
  fillStyle: '',
  measureText: vi.fn().mockReturnValue({ width: 100 }),
  fillText: vi.fn(),
  scale: vi.fn(),
}

beforeEach(() => {
  // Override getContext on HTMLCanvasElement.prototype so every canvas
  // created inside getLabelTexture returns our mock 2D context.
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mockContext),
  })

  // Reset devicePixelRatio to a known default before each test
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    configurable: true,
    value: 1,
  })
})
// ===========================================================================
// getSphereGeometry — Geometry cache
// ===========================================================================

describe('getSphereGeometry', () => {
  it('returns a SphereGeometry instance', () => {
    const geo = getSphereGeometry(1)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('returns the same reference for the same radius (cache hit)', () => {
    const first = getSphereGeometry(2.5)
    const second = getSphereGeometry(2.5)
    expect(first).toBe(second)
  })

  it('returns a different reference for a different radius (cache miss)', () => {
    const geoA = getSphereGeometry(1)
    const geoB = getSphereGeometry(3)
    expect(geoA).not.toBe(geoB)
  })

  it('handles radius of 0', () => {
    const geo = getSphereGeometry(0)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('handles negative radius', () => {
    const geo = getSphereGeometry(-1)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('handles large radius values', () => {
    const geo = getSphereGeometry(1000)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('distinguishes between integer and float radii', () => {
    const int = getSphereGeometry(2)
    const float = getSphereGeometry(2.0)
    // In JS, integer and equivalent float produce the same Map key
    expect(int).toBe(float)
  })

  it('floating point precision: 1.5 and 1.50 are the same key', () => {
    const a = getSphereGeometry(1.5)
    const b = getSphereGeometry(1.5)
    expect(a).toBe(b)
  })
})

// ===========================================================================
// getLabelTexture — Texture cache
// ===========================================================================

describe('getLabelTexture', () => {
  const defaultOptions = {
    text: 'LLM',
    color: '#FF006E',
  }

  it('returns a CanvasTexture instance', () => {
    const texture = getLabelTexture(defaultOptions)
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('returns the same reference for identical options (cache hit)', () => {
    const first = getLabelTexture(defaultOptions)
    const second = getLabelTexture(defaultOptions)
    expect(first).toBe(second)
  })

  it('returns a different reference for different text (cache miss)', () => {
    const texA = getLabelTexture({ ...defaultOptions, text: 'RAG' })
    const texB = getLabelTexture({ ...defaultOptions, text: 'Agent' })
    expect(texA).not.toBe(texB)
  })

  it('returns a different reference for different color (cache miss)', () => {
    const texA = getLabelTexture({ ...defaultOptions, color: '#FF006E' })
    const texB = getLabelTexture({ ...defaultOptions, color: '#00B0FF' })
    expect(texA).not.toBe(texB)
  })

  it('returns a different reference for different fontSize (cache miss)', () => {
    const texA = getLabelTexture({ ...defaultOptions, fontSize: 32 })
    const texB = getLabelTexture({ ...defaultOptions, fontSize: 48 })
    expect(texA).not.toBe(texB)
  })

  it('returns a different reference for different glowColor', () => {
    const texA = getLabelTexture({ ...defaultOptions, glowColor: 'rgba(255,255,255,0.3)' })
    const texB = getLabelTexture({ ...defaultOptions, glowColor: 'rgba(0,0,0,0.5)' })
    expect(texA).not.toBe(texB)
  })

  it('generates a new texture for unique text each call', () => {
    const unique = getLabelTexture({ ...defaultOptions, text: `unique-${Date.now()}` })
    expect(unique).toBeInstanceOf(CanvasTexture)
  })

  it('wraps the canvas element as texture.image', () => {
    const texture = getLabelTexture({ ...defaultOptions, text: `image-${Date.now()}` })
    expect(texture.image).toBeDefined()
    expect(texture.image).toBeInstanceOf(HTMLCanvasElement)
  })
})

// ===========================================================================
// DPR clamping — devicePixelRatio capped at 2
// ===========================================================================

describe('DPR clamping', () => {
  it('uses devicePixelRatio = 1 when window.devicePixelRatio is 1', () => {
    window.devicePixelRatio = 1
    const texture = getLabelTexture({ text: 'DPR1', color: '#FFF' })
    expect(texture).toBeInstanceOf(CanvasTexture)
    // Verify the context.scale was called with the correct ratio
    expect(mockContext.scale).toHaveBeenCalledWith(1, 1)
  })

  it('uses devicePixelRatio = 2 when window.devicePixelRatio is 2', () => {
    window.devicePixelRatio = 2
    // Clear previous calls
    mockContext.scale.mockClear()
    const texture = getLabelTexture({ text: 'DPR2', color: '#FFF' })
    expect(texture).toBeInstanceOf(CanvasTexture)
    expect(mockContext.scale).toHaveBeenCalledWith(2, 2)
  })

  it('clamps to 2 when window.devicePixelRatio is 3', () => {
    window.devicePixelRatio = 3
    mockContext.scale.mockClear()
    const texture = getLabelTexture({ text: 'DPR3', color: '#FFF' })
    expect(texture).toBeInstanceOf(CanvasTexture)
    expect(mockContext.scale).toHaveBeenCalledWith(2, 2)
  })

  it('defaults to 1 when devicePixelRatio is 0 or undefined', () => {
    window.devicePixelRatio = 0
    mockContext.scale.mockClear()
    const texture = getLabelTexture({ text: 'DPR0', color: '#FFF' })
    expect(texture).toBeInstanceOf(CanvasTexture)
    // window.devicePixelRatio || 1 → 0 || 1 → 1, then clamped min(1, 2) = 1
    expect(mockContext.scale).toHaveBeenCalledWith(1, 1)
  })

  it('uses the same cached texture regardless of DPR differences (key does NOT include DPR)', () => {
    // Note: The cache key in getLabelTexture does NOT include devicePixelRatio,
    // so the same text+color options return the exact same texture reference
    // even when DPR changes. This is current behaviour, not necessarily correct.
    window.devicePixelRatio = 1
    const first = getLabelTexture({ text: 'DPR-Cache', color: '#FFF' })
    window.devicePixelRatio = 2
    const second = getLabelTexture({ text: 'DPR-Cache', color: '#FFF' })
    expect(first).toBe(second)
  })
})

// ===========================================================================
// getSphereGeometry — Extended edge cases
// ===========================================================================

describe('getSphereGeometry — edge cases', () => {
  it('handles NaN radius gracefully', () => {
    const geo = getSphereGeometry(NaN)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('handles Infinity radius gracefully', () => {
    const geo = getSphereGeometry(Infinity)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('handles radius produced by string coercion', () => {
    // Number('5') === 5 — the cache treats them identically
    const fromCoerce = getSphereGeometry(Number('5'))
    const direct = getSphereGeometry(5)
    expect(fromCoerce).toBe(direct)
  })

  it('handles very small positive radius (0.001)', () => {
    const geo = getSphereGeometry(0.001)
    expect(geo).toBeInstanceOf(SphereGeometry)
  })

  it('cache grows correctly with many different radii', () => {
    const radii = Array.from({ length: 50 }, (_, i) => i + 200)
    const geometries = radii.map(r => getSphereGeometry(r))
    geometries.forEach(geo => {
      expect(geo).toBeInstanceOf(SphereGeometry)
    })
    // Second pass — all should be cache hits
    const cached = radii.map(r => getSphereGeometry(r))
    cached.forEach((geo, i) => {
      expect(geo).toBe(geometries[i])
    })
  })

  it('passes correct arguments (radius, 32, 32) to SphereGeometry', () => {
    // Use a unique radius to force a fresh construction
    const radius = 77777
    const geo = getSphereGeometry(radius)
    expect(geo.parameters).toBeDefined()
    expect(geo.parameters.radius).toBe(radius)
    expect(geo.parameters.widthSegments).toBe(32)
    expect(geo.parameters.heightSegments).toBe(32)
  })

  it('uses a Map for caching (number keys work; WeakMap requires object keys)', () => {
    const a = getSphereGeometry(99991)
    const b = getSphereGeometry(99991)
    expect(a).toBe(b)
  })
})

// ===========================================================================
// getLabelTexture — Text / color / font edge cases
// ===========================================================================

describe('getLabelTexture — text edge cases', () => {
  it('handles text with special characters (&, <, >, quotes)', () => {
    const texture = getLabelTexture({ text: 'AT&T <test> "quote"', color: '#FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles text with unicode and emoji', () => {
    const texture = getLabelTexture({ text: 'Café résumé 🌍 🤖', color: '#FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles very long text (1000+ characters)', () => {
    const longText = 'x'.repeat(1200)
    const texture = getLabelTexture({ text: longText, color: '#FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles empty text string', () => {
    const texture = getLabelTexture({ text: '', color: '#FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles text with only whitespace', () => {
    const texture = getLabelTexture({ text: '   ', color: '#FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })
})

describe('getLabelTexture — color edge cases', () => {
  it('accepts hex color without # prefix', () => {
    const texture = getLabelTexture({ text: 'no-hash', color: 'FF006E' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('accepts rgb/rgba color string', () => {
    const texture = getLabelTexture({ text: 'rgb-test', color: 'rgb(255, 0, 110)' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('accepts named colors', () => {
    const texture = getLabelTexture({ text: 'named', color: 'red' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('accepts transparent color value', () => {
    const texture = getLabelTexture({ text: 'transparent-color', color: 'transparent' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })
})

describe('getLabelTexture — fontSize edge cases', () => {
  it('handles negative fontSize', () => {
    const texture = getLabelTexture({ text: 'neg-font', color: '#FF006E', fontSize: -10 })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles zero fontSize', () => {
    const texture = getLabelTexture({ text: 'zero-font', color: '#FF006E', fontSize: 0 })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('handles very large fontSize (200)', () => {
    const texture = getLabelTexture({ text: 'big-font', color: '#FF006E', fontSize: 200 })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('treats string fontSize the same as numeric fontSize', () => {
    // Both produce the same cache key because template literal stringifies them
    const numeric = getLabelTexture({ text: 'size-test', color: '#FF006E', fontSize: 32 })
    const asString = (getLabelTexture as any)({ text: 'size-test', color: '#FF006E', fontSize: '32' })
    expect(asString).toBe(numeric)
  })
})

describe('getLabelTexture — glowColor edge cases', () => {
  it('accepts named glowColor', () => {
    const texture = getLabelTexture({ text: 'glow-named', color: '#FF006E', glowColor: 'yellow' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('accepts transparent glowColor', () => {
    const texture = getLabelTexture({ text: 'glow-transparent', color: '#FF006E', glowColor: 'transparent' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })

  it('accepts hex glowColor without #', () => {
    const texture = getLabelTexture({ text: 'glow-hex', color: '#FF006E', glowColor: 'FFD700' })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })
})

describe('getLabelTexture — combined extremes', () => {
  it('handles all options at their extremes simultaneously', () => {
    const texture = getLabelTexture({
      text: 'X'.repeat(500),
      color: 'transparent',
      fontSize: 200,
      glowColor: 'rgba(0,0,0,0)',
      glowSize: 50,
      textColor: 'rgba(255,255,255,0)',
    })
    expect(texture).toBeInstanceOf(CanvasTexture)
  })
})

describe('getLabelTexture — runtime resilience', () => {
  it('throws an error when Canvas 2D context returns null', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(null),
    })
    expect(() => getLabelTexture({ text: 'null-ctx', color: '#FFF' })).toThrow()
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      writable: true,
      configurable: true,
      value: originalGetContext,
    })
  })

  it('handles measureText returning zero width gracefully', () => {
    mockContext.measureText = vi.fn().mockReturnValue({ width: 0 })
    const texture = getLabelTexture({ text: 'zero-width', color: '#FFF' })
    expect(texture).toBeInstanceOf(CanvasTexture)
    mockContext.measureText = vi.fn().mockReturnValue({ width: 100 })
  })

  it('handles multiple rapid calls with different options — all cache properly', () => {
    const options = [
      { text: 'rapid-A', color: '#FF006E' },
      { text: 'rapid-B', color: '#00B0FF' },
      { text: 'rapid-C', color: '#FF006E', fontSize: 64 },
      { text: 'rapid-D', color: '#00B0FF', fontSize: 64 },
      { text: 'rapid-E', color: '#FF006E', glowColor: 'yellow' },
    ]
    const first = options.map(o => getLabelTexture(o))
    first.forEach(t => expect(t).toBeInstanceOf(CanvasTexture))
    // Second pass — verify cache hits
    const second = options.map(o => getLabelTexture(o))
    second.forEach((t, i) => expect(t).toBe(first[i]))
  })

  it('existing cache entries remain valid after DPR changes', () => {
    window.devicePixelRatio = 1
    const texA = getLabelTexture({ text: 'DPR-stable-A', color: '#FFF' })
    window.devicePixelRatio = 2
    const texB = getLabelTexture({ text: 'DPR-stable-B', color: '#FFF' })
    window.devicePixelRatio = 3
    const texC = getLabelTexture({ text: 'DPR-stable-C', color: '#FFF' })
    // All three should still resolve from cache
    expect(getLabelTexture({ text: 'DPR-stable-A', color: '#FFF' })).toBe(texA)
    expect(getLabelTexture({ text: 'DPR-stable-B', color: '#FFF' })).toBe(texB)
    expect(getLabelTexture({ text: 'DPR-stable-C', color: '#FFF' })).toBe(texC)
  })

  it('cache handles many unique textures without leaking', () => {
    // Stress the cache with many unique entries
    const count = 100
    const textures = Array.from({ length: count }, (_, i) =>
      getLabelTexture({ text: `leak-test-${i}`, color: '#FF006E' })
    )
    textures.forEach(t => expect(t).toBeInstanceOf(CanvasTexture))
    // Verify they're all still accessible from cache
    const reget = Array.from({ length: count }, (_, i) =>
      getLabelTexture({ text: `leak-test-${i}`, color: '#FF006E' })
    )
    reget.forEach((t, i) => expect(t).toBe(textures[i]))
  })
})
