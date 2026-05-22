import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import { useTheme } from '../../store/ThemeContext'
import { getGroupColor, THEME } from '../../constants/colors'
import { getSphereGeometry, getLabelTexture } from '../../utils/threeHelpers'
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

// ─────────────────────────────────────────────
// Per-node wobble parameters for organic floating motion
// Like stars in space — subtle drift with unique personality
// ─────────────────────────────────────────────
const wobbleData = new Map<string, {
  phaseX: number; phaseY: number; phaseZ: number
  freqX: number; freqY: number; freqZ: number
  amp: number
}>()

function getWobbleData(id: string) {
  if (!wobbleData.has(id)) {
    wobbleData.set(id, {
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      freqX: 0.05 + Math.random() * 0.12,
      freqY: 0.04 + Math.random() * 0.15,
      freqZ: 0.06 + Math.random() * 0.10,
      amp: 0.5 + Math.random() * 1.5,
    })
  }
  return wobbleData.get(id)!
}

// ─────────────────────────────────────────────
// Sparkle particle data structure
// ─────────────────────────────────────────────
interface SparkleParticle {
  angle: number
  speed: number
  radius: number
  yOffset: number
}

function createSparkleParticles(group: THREE.Group, radius: number, palette: GroupPalette): THREE.Points {
  const count = 20
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const particleData: SparkleParticle[] = []

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    particleData.push({
      angle,
      speed: 0.5 + Math.random() * 0.5,
      radius: radius * (1.5 + Math.random() * 1.0),
      yOffset: (Math.random() - 0.5) * radius * 1.5,
    })
    positions[i * 3] = Math.cos(angle) * particleData[i].radius
    positions[i * 3 + 1] = particleData[i].yOffset
    positions[i * 3 + 2] = Math.sin(angle) * particleData[i].radius
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: palette.emissive,
    size: 0.4,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.userData.particles = particleData
  points.userData.radius = radius
  group.add(points)
  return points
}

// ─────────────────────────────────────────────
// Pulsing outer ring for selected/hovered nodes
// ─────────────────────────────────────────────
function createPulsingRing(radius: number, palette: GroupPalette): THREE.Mesh {
  const ringGeo = new THREE.TorusGeometry(radius * 1.8, 0.08, 8, 48)
  const ringMat = new THREE.MeshBasicMaterial({
    color: palette.emissive,
    transparent: true,
    opacity: 0.4,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 3
  return ring
}

/**
 * Organismo: cena 3D principal com física estelar.
 * 
 * Características:
 * - Moléculas flutuam como estrelas (órbita sutil senoidal)
 * - Inércia ao arrastar (velocityDecay baixíssimo)
 * - Cada molécula tem rotação 3D individual
 * - Rótulo DENTRO (textura na esfera) + FORA (sprite flutuante)
 * - Sem gravidade, flutuação livre
 */
const GraphScene: React.FC<GraphSceneProps> = React.memo(
  ({ data, selectedNodeId, onSelect }) => {
    const fgRef = useRef<any>(null!)
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
    const { mode } = useTheme()
    const nodeObjectsRef = useRef<Map<string, THREE.Group>>(new Map())
    const orbitTimeRef = useRef(0)
    const [zoomLevel, setZoomLevel] = useState(1)
    const zoomLevelRef = useRef(1)

    // ─── ANIMAÇÃO: ROTAÇÃO + WOBBLE + RINGS + SPRITE BOB + SPARKLES ───
    useEffect(() => {
      let animId: number
      let lastTime = performance.now()

      const animate = (time: number) => {
        const delta = Math.min((time - lastTime) / 1000, 0.05)
        lastTime = time
        orbitTimeRef.current += delta
        const t = orbitTimeRef.current

        if (fgRef.current) {
          const gData = fgRef.current.graphData()
          if (gData?.nodes) {
            for (const node of gData.nodes) {
              const obj = node.__threeObj as THREE.Group | undefined
              if (!obj) continue

              const id = node.id as string
              const isSelected = id === selectedNodeId

              // ── 1. Individual rotation ──
              if (!isSelected) {
                const speed = (node as any).spinSpeed ?? 0.1
                obj.rotation.y += speed * delta
                obj.rotation.x += speed * 0.3 * delta
              }

              // ── 2. Organic wobble (noise-like sine with per-axis frequencies) ──
              if (!isSelected) {
                const wobble = getWobbleData(id)
                const ox = Math.sin(t * wobble.freqX + wobble.phaseX) * wobble.amp
                const oy = Math.cos(t * wobble.freqY + wobble.phaseY) * wobble.amp
                const oz = Math.sin(t * wobble.freqZ + wobble.phaseZ) * wobble.amp
                obj.userData.orbitOffset = new THREE.Vector3(ox, oy, oz)
              } else {
                obj.userData.orbitOffset = new THREE.Vector3(0, 0, 0)
              }

              // ── 3. Electron orbit ring rotation (independent of sphere) ──
              if (obj.userData.ringGroup) {
                obj.userData.ringGroup.rotation.y += delta * 0.5
                obj.userData.ringGroup.rotation.z += delta * 0.3
              }

              // ── 4. Pulsing outer ring ──
              if (obj.userData.pulseRing) {
                const pulseMat = obj.userData.pulseRing.material as THREE.MeshBasicMaterial
                pulseMat.opacity = 0.3 + Math.sin(t * 1.5 + id.length) * 0.3
                const s = 1 + Math.sin(t * 1.2 + id.length) * 0.05
                obj.userData.pulseRing.scale.set(s, s, s)
              }

              // ── 5. Breathing scale oscillation (very subtle ±2%) ──
              if (!isSelected && !obj.userData.isHovered) {
                const wobble = getWobbleData(id)
                const breathe = 1 + Math.sin(t * 0.5 + wobble.phaseX) * 0.02
                obj.scale.set(breathe, breathe, breathe)
              }

              // ── 6. Sprite vertical bobbing ──
              if (obj.userData.spriteBaseY !== undefined && obj.userData.spriteRef) {
                const sprite = obj.userData.spriteRef as THREE.Sprite
                const wobble = getWobbleData(id)
                sprite.position.y = obj.userData.spriteBaseY + Math.sin(t * 0.8 + wobble.phaseX) * 1.5
              }

              // ── 7. Sparkle particles orbit animation ──
              if (obj.userData.sparklePoints) {
                const points = obj.userData.sparklePoints as THREE.Points
                const particles = points.userData.particles as SparkleParticle[]
                const positions = points.geometry.attributes.position.array as Float32Array
                for (let i = 0; i < particles.length; i++) {
                  const p = particles[i]
                  p.angle += p.speed * delta
                  positions[i * 3] = Math.cos(p.angle) * p.radius
                  positions[i * 3 + 1] = p.yOffset + Math.sin(t * 0.7 + i) * 0.5
                  positions[i * 3 + 2] = Math.sin(p.angle) * p.radius
                }
                points.geometry.attributes.position.needsUpdate = true
              }
            }
          }

          // ── Update zoom level display ──
          const cam = fgRef.current.camera()
          if (cam) {
            const dist = cam.position.length()
            const newZoom = Math.round(280 / Math.max(dist, 1) * 10) / 10
            if (Math.abs(newZoom - zoomLevelRef.current) > 0.01) {
              zoomLevelRef.current = newZoom
              setZoomLevel(newZoom)
            }
          }
        }

        animId = requestAnimationFrame(animate)
      }

      animId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animId)
    }, [selectedNodeId])

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
      const dir = new THREE.Vector3()
      cam.getWorldDirection(dir)
      const targetPos = cam.position.clone().add(dir.multiplyScalar(-15))
      fgRef.current.cameraPosition(
        { x: targetPos.x, y: targetPos.y, z: targetPos.z },
        undefined,
        400,
      )
    }, [])

    const handleZoomOut = useCallback(() => {
      const cam = fgRef.current?.camera()
      if (!cam) return
      const dir = new THREE.Vector3()
      cam.getWorldDirection(dir)
      const targetPos = cam.position.clone().add(dir.multiplyScalar(15))
      fgRef.current.cameraPosition(
        { x: targetPos.x, y: targetPos.y, z: targetPos.z },
        undefined,
        400,
      )
    }, [])

    // ─── NODE CLICK ───
    const handleNodeClick = useCallback(
      (node: any) => {
        const mindmapNode = node as MindMapNode
        if (mindmapNode.id === selectedNodeId) {
          resetCamera()
          onSelect(null)
        } else {
          zoomToNode(mindmapNode)
          onSelect(mindmapNode.id)
        }
      },
      [selectedNodeId, onSelect, zoomToNode, resetCamera],
    )

    // ─── NODE HOVER ───
    const handleNodeHover = useCallback(
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

    // ─── CUSTOM NODE: ESFERA 3D + LABEL + ORBIT RINGS + SPARKLES ───
    const nodeThreeObject = useCallback(
      (node: any) => {
        const mNode = node as MindMapNode
        const palette: GroupPalette = getGroupColor(mNode.group)
        const isSelected = mNode.id === selectedNodeId
        const isHovered = mNode.id === hoveredNodeId

        const radius = isSelected
          ? SELECTED_RADIUS
          : isHovered
            ? HOVER_RADIUS
            : BASE_RADIUS

        const group = new THREE.Group()

        // ── 1. ESFERA COM TEXTURA (TÍTULO EMBEDDED 3D) ──
        const geometry = getSphereGeometry(radius)
        const labelCanvas = document.createElement('canvas')
        const lctx = labelCanvas.getContext('2d')!
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const canvasSize = 512 * dpr
        labelCanvas.width = canvasSize
        labelCanvas.height = canvasSize
        lctx.scale(dpr, dpr)

        // Fundo gradiente
        const gradient = lctx.createRadialGradient(256, 256, 0, 256, 256, 256)
        gradient.addColorStop(0, 'rgba(255,255,255,0.05)')
        gradient.addColorStop(0.6, 'rgba(255,255,255,0.02)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        lctx.fillStyle = gradient
        lctx.fillRect(0, 0, 512, 512)

        const fontSize = mNode.id.length > 10 ? 48 : 64
        lctx.textAlign = 'center'
        lctx.textBaseline = 'middle'

        const titleX = 256
        const titleY = 180

        // Layered shadows for 3D depth on the title text
        // 1. Deep shadow layer (offset for 3D emboss effect)
        lctx.shadowColor = 'rgba(0,0,0,0.8)'
        lctx.shadowBlur = 30
        lctx.shadowOffsetX = 3
        lctx.shadowOffsetY = 3
        lctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`
        lctx.fillStyle = palette.base
        lctx.fillText(mNode.id, titleX, titleY)

        // 2. Glow layer
        lctx.shadowColor = palette.emissive
        lctx.shadowBlur = 25
        lctx.shadowOffsetX = 0
        lctx.shadowOffsetY = 0
        lctx.fillStyle = palette.accent
        lctx.fillText(mNode.id, titleX, titleY)

        // 3. Main white text (clean on top)
        lctx.shadowBlur = 0
        lctx.fillStyle = '#FFFFFF'
        lctx.fillText(mNode.id, titleX, titleY)

        // 4. Subtle accent offset for extra depth
        lctx.globalAlpha = 0.25
        lctx.fillStyle = palette.accent
        lctx.fillText(mNode.id, titleX + 1.5, titleY + 1.5)
        lctx.globalAlpha = 1.0

        // Subtítulo
        lctx.font = `${Math.floor(fontSize * 0.35)}px Inter, sans-serif`
        lctx.fillStyle = 'rgba(255,255,255,0.5)'
        lctx.fillText(palette.label, 256, 250)

        // Descrição
        if (mNode.description) {
          lctx.font = `${Math.floor(fontSize * 0.22)}px Inter, sans-serif`
          lctx.fillStyle = 'rgba(255,255,255,0.3)'
          const desc = mNode.description.length > 40
            ? mNode.description.slice(0, 40) + '…'
            : mNode.description
          lctx.fillText(desc, 256, 300)
        }

        // Step badge
        if ((mNode as any).learningStep) {
          const step = (mNode as any).learningStep
          lctx.beginPath()
          lctx.arc(256, 380, 22, 0, Math.PI * 2)
          lctx.fillStyle = palette.base
          lctx.fill()
          lctx.font = `bold 22px Inter, sans-serif`
          lctx.fillStyle = '#FFFFFF'
          lctx.textAlign = 'center'
          lctx.textBaseline = 'middle'
          lctx.fillText(`${step}`, 256, 382)
        }

        const texture = new THREE.CanvasTexture(labelCanvas)
        texture.needsUpdate = true

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          color: new THREE.Color(palette.base),
          emissive: new THREE.Color(palette.emissive),
          emissiveIntensity: isSelected ? 3.5 : 2,
          emissiveMap: texture,
          metalness: 0.15,
          roughness: 0.25,
          transparent: true,
        })

        const mesh = new THREE.Mesh(geometry, material)
        group.add(mesh)

        // ── 2. SPRITE FLUTUANTE (TÍTULO FORA DA ESFERA — sempre facing camera) ──
        const spriteTexture = getLabelTexture({
          text: mNode.id,
          color: palette.accent,
          fontSize: 42,
          glowColor: palette.emissive,
          glowSize: 10,
        })

        const spriteMat = new THREE.SpriteMaterial({
          map: spriteTexture,
          transparent: true,
          depthWrite: false,
          sizeAttenuation: true,
        })
        const sprite = new THREE.Sprite(spriteMat)
        const spriteBaseY = radius + 5
        sprite.position.y = spriteBaseY
        const spriteScale = radius * 3.5
        sprite.scale.set(spriteScale, spriteScale * 0.35, 1)
        group.add(sprite)

        // Store sprite ref and base Y for vertical bobbing animation
        group.userData.spriteRef = sprite
        group.userData.spriteBaseY = spriteBaseY

        // ── 3. GLOW RING (selected) ──
        if (isSelected) {
          const glowGeo = new THREE.SphereGeometry(radius * 1.1, 32, 32)
          const glowMat = new THREE.MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.15,
            wireframe: true,
          })
          const glowMesh = new THREE.Mesh(glowGeo, glowMat)
          group.add(glowMesh)

          // Anel pulsante adicional
          const ringGeo = new THREE.RingGeometry(radius * 1.2, radius * 1.5, 48)
          const ringMat = new THREE.MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
          })
          const ring = new THREE.Mesh(ringGeo, ringMat)
          ring.position.z = -radius * 0.5
          group.add(ring)
        }

        // ── 4. ELECTRON ORBIT RINGS (selected — rotate independently) ──
        if (isSelected) {
          const ringGroup = new THREE.Group()

          const ringGeo = new THREE.TorusGeometry(radius * 1.8, 0.15, 8, 32)
          const ringMat = new THREE.MeshBasicMaterial({
            color: palette.emissive,
            transparent: true,
            opacity: 0.6,
          })
          const ring = new THREE.Mesh(ringGeo, ringMat)
          ring.rotation.x = Math.PI / 3
          ringGroup.add(ring)

          const ring2 = ring.clone()
          ring2.rotation.x = -Math.PI / 4
          ring2.rotation.z = Math.PI / 5
          ringGroup.add(ring2)

          group.add(ringGroup)
          group.userData.ringGroup = ringGroup
        }

        // ── 5. PULSING OUTER RING (selected/hovered) ──
        if (isSelected || isHovered) {
          const pulseRing = createPulsingRing(radius, palette)
          group.add(pulseRing)
          group.userData.pulseRing = pulseRing
        }

        // ── 6. SPARKLE PARTICLES (selected — tiny orbiting glow dots) ──
        if (isSelected) {
          const sparklePoints = createSparkleParticles(group, radius, palette)
          group.userData.sparklePoints = sparklePoints
        }

        // Metadata
        group.userData.spinSpeed = mNode.spinSpeed ?? 0.1
        group.userData.nodeId = mNode.id
        nodeObjectsRef.current.set(mNode.id, group)

        return group
      },
      [selectedNodeId, hoveredNodeId],
    )

    // ─── LINK RENDERING ───
    const linkColorFn = useCallback(
      (link: any) => {
        const src = typeof link.source === 'object' ? link.source : null
        const tgt = typeof link.target === 'object' ? link.target : null
        const hl =
          src?.id === selectedNodeId ||
          tgt?.id === selectedNodeId ||
          src?.id === hoveredNodeId ||
          tgt?.id === hoveredNodeId
        return hl
          ? (mode === 'dark' ? '#ffffff' : '#333333')
          : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')
      },
      [selectedNodeId, hoveredNodeId, mode],
    )

    const linkWidthFn = useCallback(
      (link: any) => {
        const src = typeof link.source === 'object' ? link.source : null
        const tgt = typeof link.target === 'object' ? link.target : null
        const hl =
          src?.id === selectedNodeId ||
          tgt?.id === selectedNodeId ||
          src?.id === hoveredNodeId ||
          tgt?.id === hoveredNodeId
        return hl ? LINK_HOVER_WIDTH : LINK_WIDTH
      },
      [selectedNodeId, hoveredNodeId],
    )

    // ─── PHYSICS: espaço sideral (inércia máxima → "solta") ───
    // As moléculas flutuam como estrelas: continuam se movendo após
    // arrasto (inércia), sem gravidade, com drift orgânico.
    const physicsConfig = useMemo(() => ({
      d3Gravity: 0,              // Gravidade zero → espaço sideral
      d3AlphaDecay: 0.0008,      // Decaimento ultra-lento → momentum prolongado
      d3VelocityDecay: 0.001,    // Quase sem atrito → arrasto contínuo
      d3AlphaMin: 0.0001,        // Mínimo extremamente baixo → movimento perpétuo
      warmupTicks: 500,          // Mais ticks para dispersão inicial
      cooldownTicks: 0,          // Sem cooldown → nunca para
      d3ReheatSimulation: false, // Mantém o alpha baixo para não reaquecer
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

    const bgColor = mode === 'dark' ? THEME.background : '#F0F4FF'

    return (
      <div className="absolute inset-0">
        <ForceGraph3D
          ref={fgRef}
          graphData={data}
          backgroundColor={bgColor}
          linkOpacity={0.5}
          linkWidth={linkWidthFn}
          linkColor={linkColorFn}
          linkDirectionalParticles={0}
          nodeLabel=""
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          nodeThreeObject={nodeThreeObject}
          {...physicsConfig}
        />

        {/* Zoom Controls (smooth transition + tooltips + zoom level) */}
        <div
          className="absolute bottom-6 z-30 flex flex-col gap-2"
          style={{ right: '1.5rem' }}
        >
          {[ 
            { label: 'Zoom in', icon: 'M10 4v12M4 10h12', action: handleZoomIn },
            { label: 'Zoom out', icon: 'M4 10h12', action: handleZoomOut },
            { label: 'Reset', icon: 'M10 3a7 7 0 017 7M10 3l3 3M10 3L7 6M10 17a7 7 0 01-7-7M10 17l-3-3M10 17l3-3', action: resetCamera },
          ].map((btn) => (
            <div key={btn.label} className="relative group">
              <button
                onClick={btn.action}
                aria-label={btn.label}
                className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: mode === 'dark' ? '#ffffff' : '#1A1A2E',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  {btn.icon.split('M').slice(1).map((path, i) => (
                    <path key={i} d={`M${path.trim()}`} />
                  ))}
                </svg>
              </button>
              {/* Tooltip on hover */}
              <div
                className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                  color: mode === 'dark' ? '#ffffff' : '#1A1A2E',
                  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                {btn.label}
              </div>
            </div>
          ))}
          {/* Zoom level indicator */}
          <div
            className="flex h-8 w-10 items-center justify-center rounded-full backdrop-blur-md border text-[10px] font-mono mt-1"
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            }}
            title={`Zoom level: ${zoomLevel.toFixed(1)}x`}
          >
            {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* Step indicator */}
        <div
          className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full backdrop-blur-md px-5 py-2.5 border text-xs"
          style={{
            backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
            color: mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          }}
        >
          {selectedNodeId
            ? `🔍 ${selectedNodeId}`
            : '🌌 Explore — clique em uma molécula ou use ← → no menu'}
        </div>
      </div>
    )
  },
)

GraphScene.displayName = 'GraphScene'
export default GraphScene
