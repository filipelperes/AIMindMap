import { SphereGeometry, Mesh, TorusGeometry, MeshBasicMaterial, CanvasTexture } from 'three'

/* ============================================================
   threeHelpers — Factory functions with cache for Three.js geometries,
   label textures, and pulsating ring meshes.
   Avoids recreation on each render or theme toggle.
   ============================================================ */

// ---- Geometry Cache ----

const sphereGeoCache = new Map<number, SphereGeometry>()

/** Returns a shared SphereGeometry for the given radius. */
export function getSphereGeometry(radius: number): SphereGeometry {
  if (!sphereGeoCache.has(radius)) {
    sphereGeoCache.set(radius, new SphereGeometry(radius, 32, 32))
  }
  return sphereGeoCache.get(radius)!
}

// ---- Pulsing Ring Cache ----

/** Shared pool of pulsing ring meshes keyed by radius + color. */
const pulsingRingCache = new Map<string, Mesh>()

function ringCacheKey(radius: number, color: string): string {
  return `${radius}|${color}`
}

/**
 * Returns a shared outer pulsing ring mesh for the given radius and palette.
 * Geometry and material are cached — only the instance mesh is returned per call.
 * The caller should add it to the scene (or decorGroup) and animate opacity/scale.
 */
export function getPulsingRing(radius: number, color: string): Mesh {
  const key = ringCacheKey(radius, color)
  const cached = pulsingRingCache.get(key)
  if (cached) return cached.clone()

  const ringGeo = new TorusGeometry(radius * 1.8, 0.08, 8, 48)
  const ringMat = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.4,
  })

  const ring = new Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 3

  // Store the original in cache
  pulsingRingCache.set(key, ring.clone())
  return ring
}

// ---- Texture Cache (Sprite Labels) ----

const spriteTextureCache = new Map<string, CanvasTexture>()

interface LabelOptions {
  text: string
  color: string
  fontSize?: number
  glowColor?: string
  glowSize?: number
  textColor?: string
}

/** Creates (or returns from cache) a CanvasTexture with formatted text. */
export function getLabelTexture({
  text,
  color,
  fontSize = 48,
  glowColor = 'rgba(255,255,255,0.3)',
  glowSize = 12,
  textColor = '#ffffff',
}: LabelOptions): CanvasTexture {
  const key = `${text}|${color}|${fontSize}|${glowColor}|${glowSize}|${textColor}`
  if (spriteTextureCache.has(key)) {
    return spriteTextureCache.get(key)!
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const deviceRatio = Math.min(window.devicePixelRatio || 1, 2)

  // Measure text first to size the canvas
  ctx.font = `bold ${fontSize}px Inter, sans-serif`
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const padding = glowSize * 2 + 20
  const w = Math.ceil((textWidth + padding) * deviceRatio)
  const h = Math.ceil((fontSize * 1.8) * deviceRatio)

  canvas.width = w
  canvas.height = h

  ctx.scale(deviceRatio, deviceRatio)
  ctx.font = `bold ${fontSize}px Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const cx = (textWidth + padding) / 2
  const cy = (fontSize * 1.8) / 2

  // Outer glow
  ctx.shadowColor = glowColor
  ctx.shadowBlur = glowSize
  ctx.fillStyle = color
  ctx.fillText(text, cx, cy)

  // Inner glow (more intense)
  ctx.shadowBlur = glowSize / 2
  ctx.fillText(text, cx, cy)

  // Main text (no glow for sharpness)
  ctx.shadowBlur = 0
  ctx.fillStyle = textColor
  ctx.fillText(text, cx, cy)

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  spriteTextureCache.set(key, texture)
  return texture
}
