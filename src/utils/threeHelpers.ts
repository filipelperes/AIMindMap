import * as THREE from 'three'
import type { GroupPalette } from '../types/mindmap'

/* ============================================================
   threeHelpers — Factory functions com cache para geometrias,
   materiais e texturas Three.js. Evita recriação em cada render.
   ============================================================ */

// ---- Cache de Geometrias ----

const sphereGeoCache = new Map<number, THREE.SphereGeometry>()

/** Retorna uma SphereGeometry compartilhada para o raio informado. */
export function getSphereGeometry(radius: number): THREE.SphereGeometry {
  if (!sphereGeoCache.has(radius)) {
    sphereGeoCache.set(radius, new THREE.SphereGeometry(radius, 32, 32))
  }
  return sphereGeoCache.get(radius)!
}

const boxGeoCache = new Map<string, THREE.BoxGeometry>()

/** Retorna uma BoxGeometry compartilhada. */
export function getBoxGeometry(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w}x${h}x${d}`
  if (!boxGeoCache.has(key)) {
    boxGeoCache.set(key, new THREE.BoxGeometry(w, h, d))
  }
  return boxGeoCache.get(key)!
}

// ---- Cache de Materiais ----

interface MaterialKey {
  base: string
  emissive: string
  emissiveIntensity: number
  metalness: number
  roughness: number
}

const materialKeyStr = (k: MaterialKey): string =>
  `${k.base}|${k.emissive}|${k.emissiveIntensity}|${k.metalness}|${k.roughness}`

const materialCache = new Map<string, THREE.MeshStandardMaterial>()

/** Retorna um MeshStandardMaterial compartilhado com base na palette + estado. */
export function getNodeMaterial(
  palette: GroupPalette,
  isSelected: boolean,
  isHovered = false,
): THREE.MeshStandardMaterial {
  const intensity = isHovered ? 4 : isSelected ? 3 : 2
  const key: MaterialKey = {
    base: palette.base,
    emissive: palette.emissive,
    emissiveIntensity: intensity,
    metalness: 0.1,
    roughness: 0.3,
  }
  const sk = materialKeyStr(key)
  if (!materialCache.has(sk)) {
    materialCache.set(
      sk,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(palette.base),
        emissive: new THREE.Color(palette.emissive),
        emissiveIntensity: intensity,
        metalness: 0.1,
        roughness: 0.3,
      }),
    )
  }
  return materialCache.get(sk)!
}

// ---- Cache de Texturas (Sprite Labels) ----

const spriteTextureCache = new Map<string, THREE.CanvasTexture>()

interface LabelOptions {
  text: string
  color: string
  fontSize?: number
  glowColor?: string
  glowSize?: number
}

/** Cria (ou retorna do cache) uma CanvasTexture com o texto formatado. */
export function getLabelTexture({
  text,
  color,
  fontSize = 48,
  glowColor = 'rgba(255,255,255,0.3)',
  glowSize = 12,
}: LabelOptions): THREE.CanvasTexture {
  const key = `${text}|${color}|${fontSize}|${glowColor}|${glowSize}`
  if (spriteTextureCache.has(key)) {
    return spriteTextureCache.get(key)!
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const deviceRatio = Math.min(window.devicePixelRatio || 1, 2)

  // Medir texto primeiro para dimensionar o canvas
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

  // Glow externo
  ctx.shadowColor = glowColor
  ctx.shadowBlur = glowSize
  ctx.fillStyle = color
  ctx.fillText(text, cx, cy)

  // Glow interno (mais intenso)
  ctx.shadowBlur = glowSize / 2
  ctx.fillText(text, cx, cy)

  // Texto principal (sem glow para ficar nítido)
  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, cx, cy)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  spriteTextureCache.set(key, texture)
  return texture
}

// ---- Disposal Helper ----

/** Percorre um Object3D e faz dispose de todas as geometrias e materiais. */
export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose())
      } else {
        child.material.dispose()
      }
    }
    if (child instanceof THREE.Sprite) {
      child.material.map?.dispose()
      child.material.dispose()
    }
  })
}

/** Limpa todos os caches (útil em hot-reload ou testes). */
export function clearCaches(): void {
  sphereGeoCache.clear()
  boxGeoCache.clear()
  materialCache.clear()
  spriteTextureCache.clear()
}
