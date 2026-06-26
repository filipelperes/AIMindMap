/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Shared storage for ForceGraph mock callbacks (accessible from both the
// mock factory and test code, since vi.mock is hoisted).
const mockCallbacks = vi.hoisted(() => ({
  onNodeClick: undefined as any,
  onNodeHover: undefined as any,
  onBackgroundClick: undefined as any,
  graphData: undefined as any,
}))

vi.mock('react-force-graph-3d', () => {
  // Use forwardRef + useImperativeHandle so that fgRef.current gets the
  // camera() / cameraPosition() / graphData() methods that GraphScene needs.
  const MockComponent = React.forwardRef(function ForceGraphMock(
    props: any,
    ref: any,
  ) {
    // Only used in a test context; suppress React 19 warnings.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onNodeClick, onNodeHover, onBackgroundClick, graphData, ...rest } =
      props

    // Provide a minimal stub API so internal callbacks (zoomToNode,
    // resetCamera, animation loop) don't crash.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useImperativeHandle(ref, () => ({
      cameraPosition: vi.fn(),
      camera: vi
        .fn()
        .mockReturnValue({
          position: { x: 0, y: 0, z: 280 },
          length: vi.fn().mockReturnValue(280),
        }),
      graphData: vi.fn().mockReturnValue({ nodes: [] }),
      renderer: vi.fn().mockReturnValue({ setClearColor: vi.fn() }),
      scene: vi.fn().mockReturnValue({ background: null }),
    }))

    // Store callbacks and props for direct access in tests
    mockCallbacks.onNodeClick = onNodeClick
    mockCallbacks.onNodeHover = onNodeHover
    mockCallbacks.onBackgroundClick = onBackgroundClick
    mockCallbacks.graphData = graphData

    return React.createElement(
      'div',
      {
        'data-testid': 'force-graph',
        onClick: () => onBackgroundClick?.(),
      },
      React.createElement(
        'button',
        {
          'data-testid': 'node-click',
          onClick: () =>
            onNodeClick?.({
              id: 'LLM',
              __threeObj: {
                scale: { set: vi.fn() },
                userData: {},
              },
            }),
        },
        'LLM',
      ),
    )
  })

  return { default: MockComponent }
})

// Mock three.js — the component uses THREE.Vector3 in the animation loop and
// various geometry / material constructors in nodeThreeObject.
vi.mock('three', () => {
  // All THREE mock constructors use regular functions (not arrow) so they
  // work with the `new` keyword used in GraphScene's animation loop etc.
  const MockVector3 = vi.fn(function () {
    this.set = vi.fn().mockReturnThis()
    this.clone = vi.fn().mockReturnThis()
  })

  const MockGroup = vi.fn(function () {
    this.add = vi.fn()
    this.remove = vi.fn()
    this.userData = {}
    this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() }
    this.scale = { x: 1, y: 1, z: 1, set: vi.fn() }
    this.children = []
    this.name = ''
  })

  const MockColor = vi.fn(function () {
    this.set = vi.fn()
  })

  const MockMeshStandardMaterial = vi.fn(function () {
    this.color = { set: vi.fn() }
    this.emissive = { set: vi.fn() }
    this.map = null
    this.emissiveMap = null
    this.needsUpdate = false
    this.transparent = true
    this.metalness = 0
    this.roughness = 0
    this.emissiveIntensity = 0
  })

  const MockMeshBasicMaterial = vi.fn(function () {
    this.color = { set: vi.fn() }
    this.transparent = true
    this.opacity = 1
  })

  const MockMesh = vi.fn(function () {
    this.rotation = { x: 0, y: 0, z: 0 }
    this.material = {}
    this.position = { x: 0, y: 0, z: 0 }
    this.userData = {}
    this.scale = { x: 1, y: 1, z: 1, set: vi.fn() }
  })

  const MockSprite = vi.fn(function () {
    this.position = { x: 0, y: 0, z: 0 }
    this.scale = { x: 1, y: 1, z: 1 }
    this.material = {}
    this.userData = {}
  })

  const MockCanvasTexture = vi.fn(function () {
    this.needsUpdate = false
  })

  const MockBufferGeometry = vi.fn(function () {
    this.setAttribute = vi.fn()
    this.attributes = { position: { array: new Float32Array(0), needsUpdate: false } }
  })

  const MockPoints = vi.fn(function () {
    this.geometry = {
      attributes: { position: { array: new Float32Array(0), needsUpdate: false } },
    }
    this.userData = {}
    this.material = {}
  })

  return {
    Vector3: MockVector3,
    Group: MockGroup,
    SphereGeometry: vi.fn(),
    MeshStandardMaterial: MockMeshStandardMaterial,
    MeshBasicMaterial: MockMeshBasicMaterial,
    Mesh: MockMesh,
    Sprite: MockSprite,
    SpriteMaterial: vi.fn(),
    CanvasTexture: MockCanvasTexture,
    Color: MockColor,
    BufferGeometry: MockBufferGeometry,
    BufferAttribute: vi.fn(),
    PointsMaterial: vi.fn(),
    Points: MockPoints,
    AdditiveBlending: 1,
    TorusGeometry: vi.fn(),
    RingGeometry: vi.fn(),
    DoubleSide: 2,
  }
})

// Mock threeHelpers — these are only used inside nodeThreeObject which is
// never called by our ForceGraph3D mock, but they must resolve at import time.
vi.mock('../utils/threeHelpers', () => ({
  getSphereGeometry: vi.fn().mockReturnValue({}),
  getLabelTexture: vi.fn().mockReturnValue({ needsUpdate: false }),
}))

// Theme context
vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useTheme } from '../store/ThemeContext'
import GraphScene from '../components/organisms/GraphScene'
import type { GraphData } from '../types/mindmap'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const defaultData: GraphData = {
  nodes: [
    {
      id: 'LLM',
      group: 1,
      description: 'Foundation: how LLMs work under the hood.',
      content: { summary: '', sections: [] },
      learningStep: 1,
      x: 10,
      y: 0,
      z: 0,
    },
    {
      id: 'RAG',
      group: 3,
      description: 'Connecting LLMs to external knowledge.',
      content: { summary: '', sections: [] },
      learningStep: 3,
      x: -10,
      y: 0,
      z: 5,
    },
  ],
  links: [{ source: 'LLM', target: 'RAG' }],
}

const emptyData: GraphData = { nodes: [], links: [] }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderScene(
  overrides: Partial<{
    data: GraphData
    selectedNodeId: string | null
    onSelect: (id: string | null) => void
  }> = {},
) {
  const onSelect = overrides.onSelect ?? vi.fn()
  const result = render(
    <GraphScene
      data={overrides.data ?? defaultData}
      selectedNodeId={overrides.selectedNodeId ?? null}
      onSelect={onSelect}
    />,
  )
  return { onSelect, ...result }
}

/** Returns the callbacks stored by the ForceGraph3D mock. */
function getMockCallbacks(): {
  onNodeClick: ((node: any) => void) | undefined
  onNodeHover: ((node: any, prevNode: any) => void) | undefined
  onBackgroundClick: (() => void) | undefined
} {
  return {
    onNodeClick: mockCallbacks.onNodeClick,
    onNodeHover: mockCallbacks.onNodeHover,
    onBackgroundClick: mockCallbacks.onBackgroundClick,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GraphScene', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default useTheme: dark mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn().mockReturnValue({
        base: '#FF006E',
        emissive: '#FF4081',
        accent: '#FF80AB',
        label: 'Foundations',
      }),
    } as any)
  })

  afterEach(() => {
    cleanup()
  })

  // -----------------------------------------------------------------------
  // Basic Rendering
  // -----------------------------------------------------------------------

  it('renders ForceGraph3D with provided data', () => {
    renderScene()

    expect(screen.getByTestId('force-graph')).toBeInTheDocument()

    // Verify graphData was passed to ForceGraph3D
    expect(mockCallbacks.graphData).toEqual(defaultData)
  })

  it('renders all three zoom control buttons (zoom in, zoom out, reset)', () => {
    renderScene()

    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('renders the zoom level indicator', () => {
    renderScene()

    // Initial zoom level is 1.0
    expect(screen.getByText(/1\.0x/)).toBeInTheDocument()
  })

  it('renders the step indicator with the explore hint when no node is selected', () => {
    renderScene({ selectedNodeId: null })

    // The hint text is from graphScene.exploreHint — contains "Explore" and "click a molecule"
    expect(screen.getByText(/click a molecule/i)).toBeInTheDocument()
  })

  it('renders the step indicator with the selected node ID', () => {
    renderScene({ selectedNodeId: 'LLM' })

    // Both the node button (data-testid="node-click") and the step indicator
    // contain "LLM"; getAllByText confirms at least one exists.
    const llmElements = screen.getAllByText(/LLM/)
    expect(llmElements.length).toBeGreaterThanOrEqual(1)

    // The hint should NOT be shown when a node is selected
    expect(screen.queryByText(/click a molecule/i)).not.toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Interaction: Node / Background click
  // -----------------------------------------------------------------------

  it('calls onSelect with node id when a node is clicked', () => {
    const onSelect = vi.fn()
    renderScene({ selectedNodeId: null, onSelect })

    const nodeBtn = screen.getByTestId('node-click')
    fireEvent.click(nodeBtn)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('LLM')
  })

  it('calls onSelect(null) when background is clicked and a node is selected', () => {
    const onSelect = vi.fn()
    renderScene({ selectedNodeId: 'LLM', onSelect })

    const bg = screen.getByTestId('force-graph')
    fireEvent.click(bg)

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('does not call onSelect when background is clicked and no node is selected', () => {
    const onSelect = vi.fn()
    renderScene({ selectedNodeId: null, onSelect })

    const bg = screen.getByTestId('force-graph')
    fireEvent.click(bg)

    expect(onSelect).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Edge cases: null / empty data
  // -----------------------------------------------------------------------

  it('renders without crashing when data has no nodes', () => {
    const onSelect = vi.fn()
    const { container } = renderScene({ data: emptyData, onSelect })

    // The ForceGraph3D should still render
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
    // Zoom controls should still render
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------

  it('handles "+" key to zoom in without error', () => {
    renderScene()
    expect(() => {
      fireEvent.keyDown(window, { key: '+' })
    }).not.toThrow()
  })

  it('handles "=" key (alternative zoom-in) without error', () => {
    renderScene()
    expect(() => {
      fireEvent.keyDown(window, { key: '=' })
    }).not.toThrow()
  })

  it('handles "-" key to zoom out without error', () => {
    renderScene()
    expect(() => {
      fireEvent.keyDown(window, { key: '-' })
    }).not.toThrow()
  })

  it('handles "r" key to reset camera without error', () => {
    renderScene()
    expect(() => {
      fireEvent.keyDown(window, { key: 'r' })
    }).not.toThrow()
  })

  it('handles "R" key (uppercase) to reset camera without error', () => {
    renderScene()
    expect(() => {
      fireEvent.keyDown(window, { key: 'R' })
    }).not.toThrow()
  })

  // -----------------------------------------------------------------------
  // Theme mode styling
  // -----------------------------------------------------------------------

  it('applies dark mode styling on zoom buttons', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn().mockReturnValue({
        base: '#FF006E',
        emissive: '#FF4081',
        accent: '#FF80AB',
        label: 'Foundations',
      }),
    } as any)

    renderScene()

    const buttons = screen.getAllByRole('button')
    // The zoom buttons should have dark-mode background
    const zoomBtn = buttons.find(
      (b) => b.getAttribute('aria-label') === 'Zoom in',
    )
    expect(zoomBtn).toBeInTheDocument()
    expect(zoomBtn).toHaveClass('dark:bg-black/50')
    expect(zoomBtn).toHaveClass('dark:text-white')
  })

  it('applies light mode styling on zoom buttons', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      isDark: false,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn().mockReturnValue({
        base: '#FF006E',
        emissive: '#FF4081',
        accent: '#FF80AB',
        label: 'Foundations',
      }),
    } as any)

    renderScene()

    const buttons = screen.getAllByRole('button')
    const zoomBtn = buttons.find(
      (b) => b.getAttribute('aria-label') === 'Zoom in',
    )
    expect(zoomBtn).toBeInTheDocument()
    expect(zoomBtn).toHaveClass('bg-white/70')
    expect(zoomBtn).toHaveClass('text-zinc-900')
  })

  it('applies correct step indicator colors based on theme', () => {
    // Dark mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn().mockReturnValue({
        base: '#FF006E',
        emissive: '#FF4081',
        accent: '#FF80AB',
        label: 'Foundations',
      }),
    } as any)

    renderScene({ selectedNodeId: null })
    // The step indicator should be present
    expect(screen.getByText(/click a molecule/i)).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // handleNodeHover — direct callback invocation
  // -----------------------------------------------------------------------

  it('handleNodeHover sets scale on hovered node and restores previous node', () => {
    renderScene({ selectedNodeId: null })
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()

    const prevNode = {
      id: 'RAG',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: true },
      },
    }
    const node = {
      id: 'LLM',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: false },
      },
    }

    onNodeHover!(node, prevNode)

    // Previous node should be restored to BASE_RADIUS / BASE_RADIUS = 1
    expect(prevNode.__threeObj.scale.set).toHaveBeenCalledWith(1, 1, 1)
    expect(prevNode.__threeObj.userData.isHovered).toBe(false)

    // Hovered node should be set to HOVER_RADIUS / BASE_RADIUS = 7/5 = 1.4
    expect(node.__threeObj.scale.set).toHaveBeenCalledWith(1.4, 1.4, 1.4)
    expect(node.__threeObj.userData.isHovered).toBe(true)
  })

  it('handleNodeHover restores selected node to SELECTED_RADIUS when previous node is selected', () => {
    renderScene({ selectedNodeId: 'LLM' })
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()

    const prevNode = {
      id: 'LLM',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: true },
      },
    }
    const node = {
      id: 'RAG',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: false },
      },
    }

    onNodeHover!(node, prevNode)

    // Previous node was selected → should restore to SELECTED_RADIUS / BASE_RADIUS = 6.5/5 = 1.3
    expect(prevNode.__threeObj.scale.set).toHaveBeenCalledWith(1.3, 1.3, 1.3)
    expect(node.__threeObj.scale.set).toHaveBeenCalledWith(1.4, 1.4, 1.4)
  })

  it('handleNodeHover sets hoveredNodeId to null when node is null', () => {
    renderScene({ selectedNodeId: null })
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()

    const prevNode = {
      id: 'RAG',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: true },
      },
    }

    onNodeHover!(null, prevNode)

    expect(prevNode.__threeObj.scale.set).toHaveBeenCalledWith(1, 1, 1)
    expect(prevNode.__threeObj.userData.isHovered).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  it('removes keyboard event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderScene()

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = renderScene()

    unmount()

    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })
})

// ===================================================================
// Extended behavior and edge cases
// ===================================================================
describe('GraphScene - extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      isDark: true,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi.fn().mockReturnValue({
        base: '#FF006E',
        emissive: '#FF4081',
        accent: '#FF80AB',
        label: 'Foundations',
      }),
    } as any)
  })

  afterEach(() => {
    cleanup()
  })

  // ── Zoom buttons ──────────────────────────────────────────────────

  it('zoom in button click does not crash', () => {
    renderScene()
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /zoom in/i })),
    ).not.toThrow()
  })

  it('zoom out button click does not crash', () => {
    renderScene()
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /zoom out/i })),
    ).not.toThrow()
  })

  it('reset camera button click does not crash', () => {
    renderScene()
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /reset/i })),
    ).not.toThrow()
  })

  it('zoom buttons have cursor-pointer class for usability', () => {
    renderScene()
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      if (btn.getAttribute('aria-label')) {
        expect(btn.className).toContain('cursor-pointer')
      }
    })
  })

  it('multiple rapid zoom in/out clicks do not crash', () => {
    renderScene()
    const zoomIn = screen.getByRole('button', { name: /zoom in/i })
    const zoomOut = screen.getByRole('button', { name: /zoom out/i })
    expect(() => {
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomIn)
        fireEvent.click(zoomOut)
      }
    }).not.toThrow()
  })

  // ── Node selection / deselection ──────────────────────────────────

  it('clicking same node twice: first selects, second deselects', () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <GraphScene
        data={defaultData}
        selectedNodeId={null}
        onSelect={onSelect}
      />,
    )

    // First click — select LLM
    fireEvent.click(screen.getByTestId('node-click'))
    expect(onSelect).toHaveBeenCalledWith('LLM')

    // Second click with LLM already selected — deselect (calls onSelect(null))
    onSelect.mockClear()
    rerender(
      <GraphScene
        data={defaultData}
        selectedNodeId="LLM"
        onSelect={onSelect}
      />,
    )
    fireEvent.click(screen.getByTestId('node-click'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('clicking a different node switches selection', () => {
    const onSelect = vi.fn()
    render(
      <GraphScene
        data={defaultData}
        selectedNodeId="RAG"
        onSelect={onSelect}
      />,
    )
    // The mock node-click fires with id='LLM', which differs from 'RAG'
    fireEvent.click(screen.getByTestId('node-click'))
    expect(onSelect).toHaveBeenCalledWith('LLM')
  })

  // ── Edge cases ────────────────────────────────────────────────────

  it('handles window resize without crashing', () => {
    renderScene()
    expect(() => fireEvent.resize(window)).not.toThrow()
  })

  it('renders without crashing with a single node', () => {
    const singleData: GraphData = {
      nodes: [
        {
          id: 'SingleNode',
          group: 1,
          description: 'Only node',
          content: { summary: '', sections: [] },
          learningStep: 1,
        },
      ],
      links: [],
    }
    renderScene({ data: singleData })
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })

  it('renders without crashing with 100+ nodes', () => {
    const manyNodes = Array.from({ length: 100 }, (_, i) => ({
      id: `Node${i}`,
      group: (i % 5) + 1,
      description: `Description ${i}`,
      content: { summary: '', sections: [] } as const,
      learningStep: Math.min(i + 1, 15),
    }))
    const largeData: GraphData = { nodes: manyNodes, links: [] }
    renderScene({ data: largeData })
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })

  it('does not crash when graphData.nodes contains null/undefined entries', () => {
    const badData: GraphData = {
      nodes: [
        {
          id: 'Valid',
          group: 1,
          description: 'Ok',
          content: { summary: '', sections: [] },
          learningStep: 1,
        },
        null,
        undefined,
      ] as any,
      links: [],
    }
    renderScene({ data: badData })
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })

  it('renders without crashing when selectedNodeId does not match any node', () => {
    renderScene({ selectedNodeId: 'NonExistentNode' })
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
  })

  // ── Data updates ──────────────────────────────────────────────────

  it('handles loading state: renders with empty data then rerenders with data', () => {
    const { rerender } = render(
      <GraphScene
        data={emptyData}
        selectedNodeId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('force-graph')).toBeInTheDocument()
    expect(mockCallbacks.graphData).toEqual(emptyData)

    rerender(
      <GraphScene
        data={defaultData}
        selectedNodeId={null}
        onSelect={vi.fn()}
      />,
    )
    expect(mockCallbacks.graphData).toEqual(defaultData)
  })

  it('updates graphData when data prop changes', () => {
    const { rerender } = render(
      <GraphScene
        data={defaultData}
        selectedNodeId={null}
        onSelect={vi.fn()}
      />,
    )
    const newData: GraphData = {
      nodes: [
        {
          id: 'NewNode',
          group: 2,
          description: 'New',
          content: { summary: '', sections: [] },
          learningStep: 2,
        },
      ],
      links: [],
    }
    rerender(
      <GraphScene data={newData} selectedNodeId={null} onSelect={vi.fn()} />,
    )
    expect(mockCallbacks.graphData).toEqual(newData)
  })

  // ── handleNodeHover edge cases ────────────────────────────────────

  it('handleNodeHover does not crash when node has no __threeObj', () => {
    renderScene()
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()
    expect(() => onNodeHover!({ id: 'GhostNode' } as any, null)).not.toThrow()
  })

  it('handleNodeHover does not crash when prevNode has no __threeObj', () => {
    renderScene()
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()
    const node = {
      id: 'LLM',
      __threeObj: { scale: { set: vi.fn() }, userData: {} },
    }
    const prevNode = { id: 'OldNode' } as any // no __threeObj
    // Should not crash: prevNode?.__threeObj is undefined, so the check is skipped
    expect(() => onNodeHover!(node, prevNode)).not.toThrow()
  })

  it('handleNodeHover does not crash with null node and null prevNode', () => {
    renderScene()
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()
    expect(() => onNodeHover!(null, null)).not.toThrow()
  })

  it('handleNodeHover resets hovered state when leaving with null node', () => {
    renderScene()
    const { onNodeHover } = getMockCallbacks()
    expect(onNodeHover).toBeDefined()

    const prevNode = {
      id: 'RAG',
      __threeObj: {
        scale: { set: vi.fn() },
        userData: { isHovered: true },
      },
    }
    onNodeHover!(null, prevNode)
    // Previous node should be restored to BASE_RADIUS / BASE_RADIUS = 1
    expect(prevNode.__threeObj.scale.set).toHaveBeenCalledWith(1, 1, 1)
    expect(prevNode.__threeObj.userData.isHovered).toBe(false)
  })

  // ── Step indicator ────────────────────────────────────────────────

  it('step indicator has correct background in dark mode', () => {
    renderScene({ selectedNodeId: null })
    const indicator = screen.getByText(/click a molecule/i)
    // The getByText returns the styled div (text is a direct child of the div)
    expect(indicator).toHaveClass('dark:bg-black/40')
  })

  it('step indicator has correct background in light mode', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      isDark: false,
      toggle: vi.fn(),
      setMode: vi.fn(),
      colors: {} as any,
      getGroupPalette: vi
        .fn()
        .mockReturnValue({
          base: '#FF006E',
          emissive: '#FF4081',
          accent: '#FF80AB',
          label: 'Foundations',
        }),
    } as any)
    renderScene({ selectedNodeId: null })
    const indicator = screen.getByText(/click a molecule/i)
    // The getByText returns the styled div (text is a direct child of the div)
    expect(indicator).toHaveClass('bg-white/70')
  })

  it('shows long node IDs in step indicator', () => {
    const longId = 'a'.repeat(50)
    const longData: GraphData = {
      nodes: [
        {
          id: longId,
          group: 1,
          description: 'Test',
          content: { summary: '', sections: [] },
          learningStep: 1,
        },
      ],
      links: [],
    }
    renderScene({ data: longData, selectedNodeId: longId })
    expect(screen.getByText(longId)).toBeInTheDocument()
  })

  // ── Zoom level display ────────────────────────────────────────────

  it('zoom level indicator shows correct decimal precision', () => {
    renderScene()
    expect(screen.getByText('1.0x')).toBeInTheDocument()
  })

  it('zoom level indicator has correct dark mode colors', () => {
    renderScene()
    const zoomDiv = screen.getByText('1.0x')
    expect(zoomDiv).toHaveClass('dark:text-white/50')
  })

  it('zoom level display has title attribute with formatted number', () => {
    renderScene()
    const zoomDiv = screen.getByText('1.0x')
    // The title shows "Zoom: 1.0x" from the translation
    expect(zoomDiv).toHaveAttribute('title', 'Zoom: 1.0x')
  })

  // ── Tooltip ───────────────────────────────────────────────────────

  it('tooltip group exists for zoom button (hover reveal)', () => {
    renderScene()
    const zoomBtn = screen.getByRole('button', { name: /zoom in/i })
    const groupDiv = zoomBtn.closest('.relative')
    expect(groupDiv).toBeInTheDocument()
  })

  // ── Context menu ──────────────────────────────────────────────────

  it('context menu on graph area does not throw', () => {
    renderScene()
    const graph = screen.getByTestId('force-graph')
    expect(() => fireEvent.contextMenu(graph)).not.toThrow()
  })

  // ── Animation ─────────────────────────────────────────────────────

  it('requests animation frame on mount', () => {
    const rAFSpy = vi.spyOn(window, 'requestAnimationFrame')
    renderScene()
    expect(rAFSpy).toHaveBeenCalled()
    rAFSpy.mockRestore()
  })

  it('does not queue new animation frames after unmount', () => {
    const rAFSpy = vi.spyOn(window, 'requestAnimationFrame')
    const { unmount } = renderScene()
    rAFSpy.mockClear()
    unmount()
    expect(rAFSpy).not.toHaveBeenCalled()
    rAFSpy.mockRestore()
  })
})
