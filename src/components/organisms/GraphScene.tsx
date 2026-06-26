import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ForceGraph3D from 'react-force-graph-3d'
import {
  Group,
  Points,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  AdditiveBlending,
  Object3D,
  Vector3,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  RingGeometry,
  DoubleSide,
  TorusGeometry,
  Color,
  Sprite,
  SpriteMaterial,
  CanvasTexture,
  Mesh,
} from 'three'
import { useTheme } from '../../store/ThemeContext'
import { getSphereGeometry, getLabelTexture, getPulsingRing } from '../../utils/threeHelpers'
import { getDeviceTier } from '../../utils/responsiveUtils'
import type { MindMapNode, GraphData, GroupPalette } from '../../types/mindmap'

interface GraphSceneProps {
  data: GraphData
  selectedNodeId: string | null
  onSelect: (nodeId: string | null) => void
}

const BASE_RADIUS = 5
const HOVER_RADIUS = 7
const SELECTED_RADIUS = 6.5
const LINK_WIDTH = 1.0
const LINK_HOVER_WIDTH = 2.5
const ZOOM_THROTTLE_MS = 100 // Only update zoom React state at ~10fps max

// ─────────────────────────────────────────────
// Per-node wobble parameters for organic floating motion
// Like stars in space — subtle drift with unique personality
// ─────────────────────────────────────────────
interface WobbleParams {
  phaseX: number; phaseY: number; phaseZ: number
  freqX: number; freqY: number; freqZ: number
  amp: number
}

// ─────────────────────────────────────────────
// Sparkle particle data (typed arrays — object-free, cache-friendly)
// ─────────────────────────────────────────────
interface SparkleParticleData {
  angles: Float32Array
  speeds: Float32Array
  radii: Float32Array
  yOffsets: Float32Array
  count: number
}

function createSparkleParticles(group: Group, radius: number, palette: GroupPalette): Points {
  const count = 20
  const geometry = new BufferGeometry()
  const positions = new Float32Array(count * 3)
  const angles = new Float32Array(count)
  const speeds = new Float32Array(count)
  const radii = new Float32Array(count)
  const yOffsets = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    angles[i] = angle
    speeds[i] = 0.5 + Math.random() * 0.5
    radii[i] = radius * (1.5 + Math.random() * 1.0)
    yOffsets[i] = (Math.random() - 0.5) * radius * 1.5
    positions[i * 3] = Math.cos(angle) * radii[i]
    positions[i * 3 + 1] = yOffsets[i]
    positions[i * 3 + 2] = Math.sin(angle) * radii[i]
  }

  geometry.setAttribute('position', new BufferAttribute(positions, 3))

  const material = new PointsMaterial({
    color: palette.emissive,
    size: 0.4,
    transparent: true,
    opacity: 0.6,
    blending: AdditiveBlending,
    depthWrite: false,
  })

  const points = new Points(geometry, material)
  points.userData.angles = angles
  points.userData.speeds = speeds
  points.userData.radii = radii
  points.userData.yOffsets = yOffsets
  points.userData.count = count
  group.add(points)
  return points
}

// ─────────────────────────────────────────────
// Pulsing outer ring for selected/hovered nodes
// Uses cached geometry/material from threeHelpers — no GPU alloc on creation
// ─────────────────────────────────────────────
// (replaced by getPulsingRing from threeHelpers)

// ─────────────────────────────────────────────
// Three.js GPU resource disposal helper
// Prevents GPU memory leaks when replacing decorations
// ─────────────────────────────────────────────
function disposeThreeObject(obj: Object3D): void {
  obj.traverse((child) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = child as any
    if (c.geometry?.dispose) c.geometry.dispose()
    if (c.material) {
      if (Array.isArray(c.material)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        c.material.forEach((m: any) => m?.dispose?.())
      } else {
        c.material.dispose?.()
      }
    }
  })
}

/**
 * Organism: main 3D scene with stellar physics.
 * 
 * Features:
 * - Molecules float like stars (subtle sinusoidal orbit)
 * - Drag inertia (very low velocityDecay)
 * - Each molecule has individual 3D rotation
 * - Label INSIDE (sphere texture) + OUTSIDE (floating sprite)
 * - No gravity, free-floating
 */
const GraphScene: React.FC<GraphSceneProps> = React.memo(
  ({ data, selectedNodeId, onSelect }) => {
  const fgRef = useRef<any>(null!) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const { mode, getGroupPalette } = useTheme()
  const { t } = useTranslation()
  const orbitTimeRef = useRef(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const zoomLevelRef = useRef(1)
  const lastZoomUpdateRef = useRef(0)
  // Use refs for selectedNodeId/hoveredNodeId to avoid restarting the animation loop
  // and prevent unnecessary recreation of nodeThreeObject/link callbacks
  const selectedNodeIdRef = useRef(selectedNodeId)
  selectedNodeIdRef.current = selectedNodeId
  const hoveredNodeIdRef = useRef(hoveredNodeId)
  hoveredNodeIdRef.current = hoveredNodeId
  // Refs for values needed inside nodeThreeObject — avoids unstable closures
  const modeRef = useRef(mode)
  modeRef.current = mode
  const getGroupPaletteRef = useRef(getGroupPalette)
  getGroupPaletteRef.current = getGroupPalette

  // Theme revision counter — only changes on explicit theme toggle (not every render).
  // Used as a dep for nodeThreeObject instead of `mode`/`getGroupPalette` to keep
  // the callback stable across selection changes while still refreshing on theme toggle.
  const [themeRev, setThemeRev] = useState(0)
  useEffect(() => {
    setThemeRev(v => v + 1)
    // Clear texture cache so nodeThreeObject generates fresh textures for the new theme.
    // Don't clear nodeCache — cache path updates materials in-place via getOrCreateTexture.
    textureCacheRef.current.clear()
  }, [mode])

  // Cache for node Three.js groups — avoids recreation on every hover/selection
  const nodeCacheRef = useRef<Map<string, Group>>(new Map())
  // Cache for canvas textures (node ID → { mode → texture })
  // Persists across mode changes: when user toggles theme, textures already exist
  const textureCacheRef = useRef<Map<string, Record<string, CanvasTexture>>>(new Map())

  // ─── ANIMATION: ROTATION + WOBBLE + RINGS + SPRITE BOB + SPARKLES ───
  useEffect(() => {
    // Capture ref values at effect start — cleanup closure captures these,
    // silencing react-hooks/exhaustive-deps warnings for refs that are
    // never reassigned (only mutated via .set/.clear).
    const nodeCache = nodeCacheRef.current
    const textureCache = textureCacheRef.current

    let animId: number
    let lastTime = performance.now()

    // ── Local wobble data — scoped to effect lifecycle, not module-level ──
    // Prevents memory leaks on repeated mount/unmount.
    const wobbleDataLocal = new Map<string, WobbleParams>()
    function getWobbleData(id: string) {
      if (!wobbleDataLocal.has(id)) {
        wobbleDataLocal.set(id, {
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseZ: Math.random() * Math.PI * 2,
          freqX: 0.05 + Math.random() * 0.12,
          freqY: 0.04 + Math.random() * 0.15,
          freqZ: 0.06 + Math.random() * 0.10,
          amp: 0.8 + Math.random() * 2.5,
        })
      }
      return wobbleDataLocal.get(id)!
    }

    // ── Device-aware quality ──
    // Detect device tier once (viewport doesn't change during animation lifetime)
    const deviceTier = getDeviceTier(window.innerWidth)
    const isMobileAnim = deviceTier === 'mobile'
    let frameCount = 0

    // ── Visibility tracking: pause when tab hidden — saves GPU/CPU ──
    let isVisible = true

    const handleVisibility = () => {
      if (document.hidden) {
        isVisible = false
        cancelAnimationFrame(animId)
      } else {
        isVisible = true
        lastTime = performance.now()
        animId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const animate = (time: number) => {
      // Early return when tab is hidden — stops all CPU/GPU work
      if (!isVisible) return

      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      orbitTimeRef.current += delta
      const t = orbitTimeRef.current
      frameCount++
      // Skip sprite + sparkle updates on every other frame for mobile (→ ~30fps for decorations)
      // Core wobble/rotation/pulse always run at 60fps — no visible quality loss
      const skipHeavyFrame = isMobileAnim && frameCount % 2 === 0

      if (fgRef.current) {
        const gData = fgRef.current.graphData()
        if (gData?.nodes) {
          for (const node of gData.nodes) {
            const obj = node.__threeObj as Group | undefined
            if (!obj) continue

            const id = node.id as string
            const isSelected = id === selectedNodeIdRef.current
            // Single wobble lookup per frame per node (was 5+ lookups)
            const wobble = getWobbleData(id)

            // ── Early check: does this node have any active decorations? ──
            // If not, skip decoration-heavy operations (#9 optimization)
            const hasDecorations = !!(obj.userData.ringGroup || obj.userData.pulseRing || obj.userData.sparklePoints)

            // ── 1. Individual rotation ──
            if (!isSelected) {
              const speed = node.spinSpeed ?? 0.1
              obj.rotation.y += speed * delta
              obj.rotation.x += speed * 0.3 * delta
              // Tilt wobble: subtle Z oscillation (~3°)
              obj.rotation.z = Math.sin(t * wobble.freqZ * 0.6 + wobble.phaseZ) * 0.05
            }

            // ── 2. Organic wobble (reuse Vector3 instead of cloning every frame) ──
            // Create Vector3 once per node, then reuse by mutating in-place → 0 allocations/frame
            if (!isSelected) {
              const ox = Math.sin(t * wobble.freqX + wobble.phaseX) * wobble.amp
              const oy = Math.cos(t * wobble.freqY + wobble.phaseY) * wobble.amp
              const oz = Math.sin(t * wobble.freqZ + wobble.phaseZ) * wobble.amp
              if (!obj.userData.orbitOffset) {
                obj.userData.orbitOffset = new Vector3()
              }
              obj.userData.orbitOffset.set(ox, oy, oz)
            } else if (obj.userData.orbitOffset) {
              obj.userData.orbitOffset.set(0, 0, 0)
            }

            // ── 3. Electron orbit ring rotation ──
            // Only runs for nodes with ringGroup (selected nodes)
            if (hasDecorations && obj.userData.ringGroup) {
              obj.userData.ringGroup.rotation.y += delta * 0.5
              obj.userData.ringGroup.rotation.z += delta * 0.3
            }

            // ── 4. Pulsing outer ring ──
            // Only runs for nodes with pulseRing (selected/hovered nodes)
            if (hasDecorations && obj.userData.pulseRing) {
              const pulseMat = obj.userData.pulseRing.material as MeshBasicMaterial
              const pulsePhase = t * 1.5 + id.length
              pulseMat.opacity = 0.3 + Math.sin(pulsePhase) * 0.3
              const s = 1 + Math.sin(t * 1.2 + id.length) * 0.05
              obj.userData.pulseRing.scale.set(s, s, s)
            }

            // ── 5. Breathing scale oscillation (very subtle ±2%) ──
            if (!isSelected && !obj.userData.isHovered) {
              const breathe = 1 + Math.sin(t * 0.5 + wobble.phaseX) * 0.02
              obj.scale.set(breathe, breathe, breathe)
            }

            // ── 6. Sprite independent floating ──
            // Skipped on mobile every other frame to halve trig operations
            if (!skipHeavyFrame && obj.userData.spriteBaseY !== undefined && obj.userData.spriteRef) {
              const sprite = obj.userData.spriteRef as Sprite
              sprite.position.y = obj.userData.spriteBaseY + Math.sin(t * 0.8 + wobble.phaseX) * 1.5
              sprite.position.x = Math.sin(t * 0.5 + wobble.phaseY) * 1.2
              sprite.position.z = Math.cos(t * 0.6 + wobble.phaseZ + 1.0) * 1.0
              const baseScale = obj.userData.spriteScale ?? sprite.scale.x
              const sPulse = 1 + Math.sin(t * 1.1 + wobble.phaseX) * 0.025
              sprite.scale.x = baseScale * sPulse
              sprite.scale.y = baseScale * 0.35 * sPulse
            }

            // ── 7. Sparkle particles orbit animation (typed arrays — no object allocations per frame) ──
            // Skipped on mobile every other frame to reduce trig operations
            // Only runs for nodes with sparklePoints (selected nodes)
            if (!skipHeavyFrame && hasDecorations) {
              const sparklePoints = obj.userData.sparklePoints as Points | undefined
              if (sparklePoints) {
                const { angles, speeds, radii, yOffsets, count } = sparklePoints.userData as SparkleParticleData
                const positions = sparklePoints.geometry.attributes.position.array as Float32Array
                for (let i = 0; i < count; i++) {
                  angles[i] += speeds[i] * delta
                  positions[i * 3] = Math.cos(angles[i]) * radii[i]
                  positions[i * 3 + 1] = yOffsets[i] + Math.sin(t * 0.7 + i) * 0.5
                  positions[i * 3 + 2] = Math.sin(angles[i]) * radii[i]
                }
                sparklePoints.geometry.attributes.position.needsUpdate = true
              }
            }
          }
        }

        // ── Update zoom level display (throttled to avoid re-render every frame) ──
        const now = performance.now()
        if (now - lastZoomUpdateRef.current > ZOOM_THROTTLE_MS) {
          const cam = fgRef.current.camera()
          if (cam) {
            const dist = cam.position.length()
            const newZoom = Math.round(280 / Math.max(dist, 1) * 10) / 10
            if (Math.abs(newZoom - zoomLevelRef.current) > 0.01) {
              zoomLevelRef.current = newZoom
              setZoomLevel(newZoom)
              lastZoomUpdateRef.current = now
            }
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('visibilitychange', handleVisibility)
      wobbleDataLocal.clear()
      // Dispose GPU resources before clearing caches — prevents memory leaks
      nodeCache.forEach((group) => disposeThreeObject(group))
      nodeCache.clear()
      textureCache.forEach((modeEntry) => {
        Object.values(modeEntry).forEach((t) => t.dispose?.())
      })
      textureCache.clear()
    }
  }, [])

    // ─── ZOOM TO NODE ───
    const zoomToNode = useCallback((node: MindMapNode) => {
      const distance = 80
      const distRatio =
        1 + distance / Math.hypot(node.x ?? 0, node.y ?? 0, node.z ?? 0)
      fgRef.current.cameraPosition(
        {
          x: (node.x ?? 0) * distRatio,
          y: (node.y ?? 0) * distRatio,
          z: (node.z ?? 0) * distRatio,
        },
        node,
        1500,
      )
    }, [])

    // ─── RESET CAMERA ON DESELECT ───
    // Tracks previous selectedNodeId to detect transitions from selected → null
    // (panel close, background click, keyboard Escape, or re-clicking the same node).
    // Handles all deselect paths uniformly — no need for duplicate resetCamera calls.
    const prevSelectedRef = useRef<string | null>(selectedNodeId)
    useEffect(() => {
      if (prevSelectedRef.current !== null && selectedNodeId === null) {
        // Node was just deselected → smoothly zoom out to show the full constellation
        if (fgRef.current) {
          fgRef.current.cameraPosition(
            { x: 0, y: 0, z: 280 },
            { x: 0, y: 0, z: 0 },
            800,
          )
        }
      }
      prevSelectedRef.current = selectedNodeId
    }, [selectedNodeId])

    const resetCamera = useCallback(() => {
      fgRef.current.cameraPosition(
        { x: 0, y: 0, z: 280 },
        { x: 0, y: 0, z: 0 },
        1500,
      )
    }, [])

    // ─── SMOOTH ZOOM IN/OUT ───
    const handleZoomIn = useCallback(() => {
      const cam = fgRef.current?.camera()
      if (!cam) return
      const p = cam.position
      fgRef.current.cameraPosition(
        { x: p.x * 0.8, y: p.y * 0.8, z: p.z * 0.8 },
        { x: 0, y: 0, z: 0 },
        400,
      )
    }, [])

    const handleZoomOut = useCallback(() => {
      const cam = fgRef.current?.camera()
      if (!cam) return
      const p = cam.position
      fgRef.current.cameraPosition(
        { x: p.x * 1.25, y: p.y * 1.25, z: p.z * 1.25 },
        { x: 0, y: 0, z: 0 },
        400,
      )
    }, [])

    // ─── NODE CLICK ───
    const handleNodeClick = useCallback(
      (node: MindMapNode) => {
        if (node.id === selectedNodeId) {
          // Camera reset is handled by the deselect useEffect below
          onSelect(null)
        } else {
          zoomToNode(node)
          onSelect(node.id)
        }
      },
      [selectedNodeId, onSelect, zoomToNode],
    )

    // ─── NODE HOVER ───
    const handleNodeHover = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node: any, prevNode: any) => {
        if (prevNode?.__threeObj) {
          const isPrevSelected = prevNode.id === selectedNodeId
          const radius = isPrevSelected ? SELECTED_RADIUS : BASE_RADIUS
          const scale = radius / BASE_RADIUS
          prevNode.__threeObj.scale.set(scale, scale, scale)
          prevNode.__threeObj.userData.isHovered = false
        }

        if (node?.__threeObj) {
          const scale = HOVER_RADIUS / BASE_RADIUS
          node.__threeObj.scale.set(scale, scale, scale)
          node.__threeObj.userData.isHovered = true
        }

        setHoveredNodeId(node?.id ?? null)
      },
      [selectedNodeId],
    )

    // ─── BACKGROUND CLICK (deselect when clicking empty space) ───
    const handleBackgroundClick = useCallback(() => {
      if (selectedNodeId !== null) {
        onSelect(null)
      }
    }, [selectedNodeId, onSelect])

    // ─── HELPER: GET OR CREATE SPHERE TEXTURE (cached by node ID + mode) ───
    const getOrCreateTexture = (node: MindMapNode, palette: GroupPalette): CanvasTexture => {
      const currentMode = modeRef.current
      // Entry per node ID, with sub-map per mode — cache survives theme toggles
      if (!textureCacheRef.current.has(node.id)) {
        textureCacheRef.current.set(node.id, {})
      }
      const modeEntry = textureCacheRef.current.get(node.id)!
      if (modeEntry[currentMode]) return modeEntry[currentMode]

      const labelCanvas = document.createElement('canvas')
      const lctx = labelCanvas.getContext('2d')!
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const canvasSize = 512 * dpr
      labelCanvas.width = canvasSize
      labelCanvas.height = canvasSize
      lctx.scale(dpr, dpr)

      const gradient = lctx.createRadialGradient(256, 256, 0, 256, 256, 256)
      gradient.addColorStop(0, 'rgba(255,255,255,0.05)')
      gradient.addColorStop(0.6, 'rgba(255,255,255,0.02)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      lctx.fillStyle = gradient
      lctx.fillRect(0, 0, 512, 512)

      const fontSize = node.id.length > 10 ? 48 : 64
      lctx.textAlign = 'center'
      lctx.textBaseline = 'middle'
      const titleX = 256
      const titleY = 180

      const baseColor = palette.base
      const emissiveColor = palette.emissive
      const accentColor = palette.accent

      // 1. Deep shadow layer
      lctx.shadowColor = 'rgba(0,0,0,0.8)'
      lctx.shadowBlur = 30
      lctx.shadowOffsetX = 3
      lctx.shadowOffsetY = 3
      lctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
      lctx.fillStyle = baseColor
      lctx.fillText(node.id, titleX, titleY)

      // 2. Glow layer
      lctx.shadowColor = emissiveColor
      lctx.shadowBlur = 25
      lctx.shadowOffsetX = 0
      lctx.shadowOffsetY = 0
      lctx.fillStyle = accentColor
      lctx.fillText(node.id, titleX, titleY)

      // 3. Main text
      lctx.shadowBlur = 0
      lctx.fillStyle = currentMode === 'light' ? '#1A1A2E' : '#FFFFFF'
      lctx.fillText(node.id, titleX, titleY)

      // 4. Subtle accent offset
      lctx.globalAlpha = 0.25
      lctx.fillStyle = accentColor
      lctx.fillText(node.id, titleX + 1.5, titleY + 1.5)
      lctx.globalAlpha = 1.0

      // Subtitle
      lctx.font = `${Math.floor(fontSize * 0.35)}px Inter, sans-serif`
      lctx.fillStyle = currentMode === 'light' ? accentColor : 'rgba(255,255,255,0.5)'
      lctx.fillText(palette.label, 256, 250)

      // Description
      if (node.description) {
        lctx.font = `${Math.floor(fontSize * 0.22)}px Inter, sans-serif`
        lctx.fillStyle = currentMode === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)'
        const desc = node.description.length > 40
          ? node.description.slice(0, 40) + '…'
          : node.description
        lctx.fillText(desc, 256, 300)
      }

      // Step badge
      if (node.learningStep) {
        const step = node.learningStep
        lctx.beginPath()
        lctx.arc(256, 380, 22, 0, Math.PI * 2)
        lctx.fillStyle = baseColor
        lctx.fill()
        lctx.font = `bold 22px Inter, sans-serif`
        lctx.fillStyle = currentMode === 'light' ? '#1A1A2E' : '#FFFFFF'
        lctx.textAlign = 'center'
        lctx.textBaseline = 'middle'
        lctx.fillText(`${step}`, 256, 382)
      }

      const texture = new CanvasTexture(labelCanvas)
      texture.needsUpdate = true
      // Store under current mode — dark textures kept when switching to light and vice-versa
      modeEntry[currentMode] = texture
      return texture
    }

    // ─── HELPER: REFRESH NODE VISUAL STATE ───
    // Shared between nodeThreeObject (theme changes) and the selection effect below.
    // Updates material, sprite, and decorations based on current selection/hover state.
    // State change guard ensures only ~2 nodes do actual work per call.
    const refreshNodeState = (node: MindMapNode | null | undefined): void => {
      if (!node) return
      const id = node.id
      const group = nodeCacheRef.current.get(id)
      if (!group) return

      const data = group.userData
      if (!data?.sphereMesh) return // not fully initialised yet

      const currentMode = modeRef.current
      const palette = getGroupPaletteRef.current(node.group)
      const isSelected = id === selectedNodeIdRef.current
      const isHovered = id === hoveredNodeIdRef.current

      const radius = isSelected
        ? SELECTED_RADIUS
        : isHovered
          ? HOVER_RADIUS
          : BASE_RADIUS

      // ── Update sphere material ──
      const mat = data.sphereMesh.material as MeshStandardMaterial
      const texture = getOrCreateTexture(node, palette)
      if (mat.map !== texture) {
        mat.map = texture
        mat.emissiveMap = texture
        mat.needsUpdate = true
      }
      mat.color.set(palette.base)
      mat.emissive.set(palette.emissive)
      mat.emissiveIntensity = currentMode === 'light' ? (isSelected ? 2.5 : 1.5) : (isSelected ? 3.5 : 2)

      // ── Update sprite for theme/state ──
      if (data.spriteRef) {
        const sprite = data.spriteRef as Sprite
        sprite.material.map = getLabelTexture({
          text: id,
          color: palette.accent,
          fontSize: 42,
          glowColor: palette.emissive,
          glowSize: 10,
          textColor: currentMode === 'light' ? '#1A1A2E' : '#FFFFFF',
        })
        sprite.material.needsUpdate = true
        sprite.position.y = radius + 5
        const spriteScale = radius * 3.5
        sprite.scale.set(spriteScale, spriteScale * 0.35, 1)
        data.spriteBaseY = radius + 5
        data.spriteScale = spriteScale
      }

      // ── State change guard (object pooling / GC reduction) ──
      // When unchanged, skip decoration dispose+recreate entirely.
      // Only ~2 nodes change per click → ~90% reduction in decoration churn.
      const prevSelected = data.wasSelected ?? false
      const prevHovered = data.wasHovered ?? false
      const stateChanged = prevSelected !== isSelected || prevHovered !== isHovered
      data.wasSelected = isSelected
      data.wasHovered = isHovered

      if (stateChanged) {
        // Reuse decorGroup container (object pool: avoid Group allocation)
        if (!data.decorGroup) {
          data.decorGroup = new Group()
          data.decorGroup.name = 'decorations'
          group.add(data.decorGroup)
        }
        const decorGroup = data.decorGroup

        // Clear old children but keep the group itself alive
        while (decorGroup.children.length > 0) {
          disposeThreeObject(decorGroup.children[0])
          decorGroup.remove(decorGroup.children[0])
        }

        // Reset decoration references
        data.ringGroup = undefined
        data.pulseRing = undefined
        data.sparklePoints = undefined

        // ── Reset group scale and hover flag when deselected ──
        // handleNodeHover leaves selected nodes at SELECTED_RADIUS/BASE_RADIUS
        // scale (1.3×) after unhover. Without explicit reset here, the node
        // appears "still selected" even after decorations are removed.
        // (prevSelected is captured before data.wasSelected is overwritten)
        if (!isSelected && prevSelected) {
          group.scale.set(1, 1, 1)
          data.isHovered = false
          group.userData.isHovered = false
        }

        // Glow wireframe + ring (selected)
        if (isSelected) {
          const glowGeo = new SphereGeometry(radius * 1.1, 32, 32)
          const glowMat = new MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.15,
            wireframe: true,
          })
          decorGroup.add(new Mesh(glowGeo, glowMat))

          const ringGeo = new RingGeometry(radius * 1.2, radius * 1.5, 48)
          const ringMat = new MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.08,
            side: DoubleSide,
          })
          const ring = new Mesh(ringGeo, ringMat)
          ring.position.z = -radius * 0.5
          decorGroup.add(ring)
        }

        // Orbit rings (selected)
        if (isSelected) {
          const ringGroup = new Group()
          const ringGeo = new TorusGeometry(radius * 1.8, 0.15, 8, 32)
          const ringMat = new MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.6,
          })
          const ring = new Mesh(ringGeo, ringMat)
          ring.rotation.x = Math.PI / 3
          ringGroup.add(ring)
          const ring2 = ring.clone()
          ring2.rotation.x = -Math.PI / 4
          ring2.rotation.z = Math.PI / 5
          ringGroup.add(ring2)
          decorGroup.add(ringGroup)
          data.ringGroup = ringGroup
        }

        // Pulse ring (selected or hovered) — using cached geometry/material
        if (isSelected || isHovered) {
          const pulseRing = getPulsingRing(radius, palette.emissive)
          decorGroup.add(pulseRing)
          data.pulseRing = pulseRing
        }

        // Sparkle particles (selected)
        if (isSelected) {
          const sparklePoints = createSparkleParticles(decorGroup, radius, palette)
          data.sparklePoints = sparklePoints
        }
      } // endif stateChanged

      data.spinSpeed = node.spinSpeed ?? 0.1
    }

    // ─── SYNC NODE STATE WHEN SELECTION CHANGES ───
    // Instead of forcing ForceGraph3D to reprocess all 24+ nodes (which happens when
    // nodeThreeObject is recreated), we directly update the cached Three.js objects.
    // The state change guard inside refreshNodeState ensures only the 2 affected nodes
    // (old selection + new selection) do actual decoration work.
    useEffect(() => {
      data.nodes.forEach((node) => {
        if (!node) return // guard against null entries (test resilience)
        refreshNodeState(node)
      })
    }, [selectedNodeId, data.nodes])

    // ─── CUSTOM NODE: 3D SPHERE + LABEL + ORBIT RINGS + SPARKLES ───
    // Deps: `[themeRev]` ONLY.
    // - `selectedNodeId` → handled by the useEffect above (direct Three.js mutation)
    // - `hoveredNodeId` → read via ref (handleNodeHover handles scale directly)
    // - `mode`/`getGroupPalette` → read via refs
    // - `themeRev` → only changes on explicit theme toggle → triggers fresh render
    //
    // This means ForceGraph3D only re-processes all nodes on theme toggle,
    // NOT on every selection click — saving 24+ nodeThreeObject calls per click.
    const nodeThreeObject = useCallback(
      (node: MindMapNode) => {
        const palette = getGroupPaletteRef.current(node.group)
        const currentMode = modeRef.current
        const isSelected = node.id === selectedNodeIdRef.current
        const isHovered = node.id === hoveredNodeIdRef.current

        const radius = isSelected
          ? SELECTED_RADIUS
          : isHovered
            ? HOVER_RADIUS
            : BASE_RADIUS

        // ── Check cache first: update in-place instead of recreating ──
        const cached = nodeCacheRef.current.get(node.id)
        if (cached) {
          // Delegate all visual updates to refreshNodeState
          refreshNodeState(node)
          return cached
        }

        // ── FRESH CREATION (first time for this node) ──
        const group = new Group()

        // 1. SPHERE WITH TEXTURE
        const geometry = getSphereGeometry(radius)
        const texture = getOrCreateTexture(node, palette)

        const material = new MeshStandardMaterial({
          map: texture,
          color: new Color(palette.base),
          emissive: new Color(palette.emissive),
          emissiveIntensity: currentMode === 'light' ? (isSelected ? 2.5 : 1.5) : (isSelected ? 3.5 : 2),
          emissiveMap: texture,
          metalness: 0.15,
          roughness: 0.25,
          transparent: true,
        })

        const mesh = new Mesh(geometry, material)
        group.add(mesh)

        // 2. FLOATING SPRITE
        const spriteTexture = getLabelTexture({
          text: node.id,
          color: palette.accent,
          fontSize: 42,
          glowColor: palette.emissive,
          glowSize: 10,
          textColor: currentMode === 'light' ? '#1A1A2E' : '#FFFFFF',
        })

        const spriteMat = new SpriteMaterial({
          map: spriteTexture,
          transparent: true,
          depthWrite: false,
          sizeAttenuation: true,
        })
        const sprite = new Sprite(spriteMat)
        const spriteBaseY = radius + 5
        sprite.position.y = spriteBaseY
        const spriteScale = radius * 3.5
        sprite.scale.set(spriteScale, spriteScale * 0.35, 1)
        group.add(sprite)

        // 3. DECORATIONS GROUP (filled by refreshNodeState below)
        const decorGroup = new Group()
        decorGroup.name = 'decorations'
        group.add(decorGroup)

        // Metadata (minimal — decorations are managed by refreshNodeState)
        group.userData = {
          sphereMesh: mesh,
          spriteRef: sprite,
          decorGroup,
          ringGroup: undefined,
          pulseRing: undefined,
          sparklePoints: undefined,
          spriteBaseY,
          spriteScale,
          spinSpeed: node.spinSpeed ?? 0.1,
          nodeId: node.id,
          wasSelected: false,
          wasHovered: false,
        }

        nodeCacheRef.current.set(node.id, group)

        // Apply current selection/hover state
        refreshNodeState(node)

        return group
      },
      // Deps: Only themeRev (changes only on theme switch).
      // selectedNodeId removed — visual update is handled by the useEffect above.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [themeRev],
    )

    // ─── LINK RENDERING ───
    // Reads hoveredNodeId from ref — no need to recreate function on hover changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkColorFn = useCallback((link: any) => {
        const src = typeof link.source === 'object' ? link.source : null
        const tgt = typeof link.target === 'object' ? link.target : null
        const currentHovered = hoveredNodeIdRef.current
        const hl =
          src?.id === selectedNodeId ||
          tgt?.id === selectedNodeId ||
          src?.id === currentHovered ||
          tgt?.id === currentHovered
        return hl
          ? (mode === 'dark' ? '#ffffff' : '#6D28D9')
          : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.25)')
      },
      [selectedNodeId, mode],
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const linkWidthFn = useCallback((link: any) => {
        const src = typeof link.source === 'object' ? link.source : null
        const tgt = typeof link.target === 'object' ? link.target : null
        const currentHovered = hoveredNodeIdRef.current
        const hl =
          src?.id === selectedNodeId ||
          tgt?.id === selectedNodeId ||
          src?.id === currentHovered ||
          tgt?.id === currentHovered
        return hl ? LINK_HOVER_WIDTH : LINK_WIDTH
      },
      [selectedNodeId],
    )

    // ─── PHYSICS: gentle dispersion then settle ───
    // Molecules look like stars floating in space, but the aesthetic
    // is driven by the animation loop (wobble, rotation, sprite bob)
    // — NOT by perpetual force simulation. Letting the d3 sim settle
    // eliminates layout-thrash jank (~5 min → ~5 sec to settle).
    const physicsConfig = useMemo(() => ({
      d3Gravity: 0,              // Zero gravity → outer space
      d3AlphaDecay: 0.02,        // 40× faster → sim settles in ~300 ticks
      d3VelocityDecay: 0.3,      // Near-default friction → no endless drift
      d3AlphaMin: 0.001,         // Moderate minimum alpha
      warmupTicks: 300,          // Enough ticks to spread out
      cooldownTicks: 100,        // Settle after cooling down
      d3ReheatSimulation: false, // Don't reheat — one-shot layout
    }), [])

    // ─── KEYBOARD ───
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === '+' || e.key === '=') handleZoomIn()
        else if (e.key === '-') handleZoomOut()
        else if (e.key === 'r' || e.key === 'R') resetCamera()
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }, [handleZoomIn, handleZoomOut, resetCamera])

    // ─── MAKE THREE.JS (Three.js) BACKGROUND TRANSPARENT ───
    useEffect(() => {
      const timer = setTimeout(() => {
        try {
          const renderer = fgRef.current?.renderer?.()
          if (renderer) {
            renderer.setClearColor(0x000000, 0)
          }
          const scene = fgRef.current?.scene?.()
          if (scene) {
            scene.background = null
          }
        } catch { /* noop */ }
      }, 50)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="absolute inset-0 touch-manipulation">
        <ForceGraph3D
          ref={fgRef}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          linkOpacity={0.5}
          linkWidth={linkWidthFn}
          linkColor={linkColorFn}
          linkDirectionalParticles={0}
          nodeLabel=""
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={handleBackgroundClick}
          nodeThreeObject={nodeThreeObject}
          {...physicsConfig}
        />

        {/* Zoom Controls (smooth transition + tooltips + zoom level) */}
        <div
          className="absolute bottom-6 z-30 flex flex-col gap-2"
          style={{ right: '1.5rem' }}
        >
          {[ 
            { label: 'zoomIn', icon: 'M10 4v12M4 10h12', action: handleZoomIn },
            { label: 'zoomOut', icon: 'M4 10h12', action: handleZoomOut },
            { label: 'reset', icon: 'M10 3a7 7 0 017 7M10 3l3 3M10 3L7 6M10 17a7 7 0 01-7-7M10 17l-3-3M10 17l3-3', action: resetCamera },
          ].map((btn) => (
            <div key={btn.label} className="relative group">
              <button
                onClick={btn.action}
                aria-label={t(`graphScene.${btn.label}`)}
                className="flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 cursor-pointer dark:bg-black/50 bg-white/70 dark:border-white/10 border-black/10 dark:text-white text-zinc-900"
                style={{
                  touchAction: 'manipulation',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  {btn.icon.split('M').slice(1).map((path, i) => (
                    <path key={i} d={`M${path.trim()}`} />
                  ))}
                </svg>
              </button>
              {/* Tooltip on hover */}
              <div
                className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border dark:bg-black/80 bg-white/90 dark:text-white text-zinc-900 dark:border-white/10 border-black/10"
              >
                {t(`graphScene.${btn.label}`)}
              </div>
            </div>
          ))}
          {/* Zoom level indicator */}
          <div
            className="flex h-8 w-10 items-center justify-center rounded-full border text-[10px] font-mono mt-1 dark:bg-black/50 bg-white/70 dark:border-white/10 border-black/10 dark:text-white/50 text-black/50"
            title={t('graphScene.zoomLevel', { level: zoomLevel.toFixed(1) })}
          >
            {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* Step indicator */}
        <div
          className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-5 py-2.5 border text-xs dark:bg-black/40 bg-white/70 dark:border-white/5 border-black/8 dark:text-white/50 text-black/50"
        >
          {selectedNodeId
            ? `${selectedNodeId}`
            : t('graphScene.exploreHint')}
        </div>
      </div>
    )
  },
)

GraphScene.displayName = 'GraphScene'
export default GraphScene
