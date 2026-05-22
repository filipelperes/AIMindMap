import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'

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
import ThemeToggle from '../components/atoms/ThemeToggle'
import Badge from '../components/atoms/Badge'
import CloseButton from '../components/atoms/CloseButton'
import IconButton from '../components/atoms/IconButton'

import {
  registerRenderer,
  getRenderer,
  clearRegistry,
  getRegisteredTypes,
} from '../services/contentRegistry'
import type { SectionRendererProps } from '../services/contentRegistry'

import { getLearningPath, getCurrentStep, graphData } from '../data/map'

// Side-effect import: registers all known section renderers at module load
import NodeContentRenderer from '../components/organisms/NodeContentRenderer'

// ===========================================================================
// ThemeToggle
// ===========================================================================

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sun icon when mode is dark', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Sun icon contains a <circle> element
    const circle = document.querySelector('svg circle')
    expect(circle).toBeInTheDocument()
  })

  it('renders moon icon when mode is light', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'light', toggle } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Moon icon has a <path> but no <circle>
    const path = document.querySelector('svg path')
    expect(path).toBeInTheDocument()

    const circle = document.querySelector('svg circle')
    expect(circle).not.toBeInTheDocument()
  })

  it('calls toggle function on click', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle } as any)

    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('shows correct aria-label in dark mode ("Mudar para tema claro")', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /Mudar para tema claro/i }),
    ).toBeInTheDocument()
  })

  it('shows correct aria-label in light mode ("Mudar para tema escuro")', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /Mudar para tema escuro/i }),
    ).toBeInTheDocument()
  })

  it('applies correct background colour based on mode (dark)', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: '#F0F4FF',
    })
  })

  it('applies correct background colour based on mode (light)', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      backgroundColor: 'rgba(0,0,0,0.06)',
      color: '#1A1A2E',
    })
  })
})

// ===========================================================================
// Badge
// ===========================================================================

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Fundamentos" baseColor="#FF006E" />)

    expect(screen.getByText('Fundamentos')).toBeInTheDocument()
  })

  it('renders with a given base colour', () => {
    render(<Badge label="RAG" baseColor="#00B0FF" />)

    const badge = screen.getByText('RAG').closest('span')
    expect(badge).toBeInTheDocument()

    // Background uses baseColor with 0x20 alpha suffix
    expect(badge).toHaveStyle({
      backgroundColor: '#00B0FF20',
      color: '#00B0FF',
      border: '1px solid #00B0FF40',
    })
  })

  it('renders with custom text color when provided', () => {
    render(
      <Badge
        label="Custom"
        baseColor="#FF006E"
        textColor="#FFFFFF"
      />,
    )

    const badge = screen.getByText('Custom').closest('span')
    expect(badge).toHaveStyle({ color: '#FFFFFF' })
  })

  it('renders with a glow colour (passed to ColorDot)', () => {
    const { container } = render(
      <Badge
        label="Glow"
        baseColor="#00E676"
        glowColor="#69F0AE"
      />,
    )

    // ColorDot is rendered inside the badge and has a boxShadow when glowColor is set
    // size=8 → boxShadow blur = 8 * 0.8 = 6.4px
    const dot = container.querySelector('span[role="img"]')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveStyle({
      boxShadow: '0 0 6.4px #69F0AE',
    })
  })

  it('renders with different base colours', () => {
    const { container: c1 } = render(
      <Badge label="A" baseColor="#FF006E" />,
    )
    expect(c1.textContent).toContain('A')

    const { container: c2 } = render(
      <Badge label="B" baseColor="#00E676" />,
    )
    expect(c2.textContent).toContain('B')
  })
})

// ===========================================================================
// CloseButton
// ===========================================================================

describe('CloseButton', () => {
  it('renders with default aria-label "Fechar"', () => {
    render(<CloseButton onClick={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Fechar' }),
    ).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn()
    render(<CloseButton onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders with custom aria-label', () => {
    render(
      <CloseButton onClick={vi.fn()} ariaLabel="Close panel" />,
    )

    expect(
      screen.getByRole('button', { name: 'Close panel' }),
    ).toBeInTheDocument()
  })

  it('renders with a custom size and applies it to the button', () => {
    const { container } = render(
      <CloseButton onClick={vi.fn()} size={48} />,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ width: '48px', height: '48px' })

    // The SVG inside has a proportional iconSize = Math.round(48 * 0.44) = 21
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    // width and height are inline attributes on the SVG
    expect(svg).toHaveAttribute('width', '21')
    expect(svg).toHaveAttribute('height', '21')
  })

  it('renders SVG icon with aria-hidden', () => {
    const { container } = render(
      <CloseButton onClick={vi.fn()} />,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies min-width equal to size to prevent shrinking', () => {
    render(<CloseButton onClick={vi.fn()} size={40} />)

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ minWidth: '40px' })
  })
})

// ===========================================================================
// IconButton
// ===========================================================================

describe('IconButton', () => {
  it('renders children and aria-label', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="Settings">
        <span data-testid="icon">⚙️</span>
      </IconButton>,
    )

    expect(
      screen.getByRole('button', { name: 'Settings' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <IconButton onClick={onClick} ariaLabel="Click me">
        <span>X</span>
      </IconButton>,
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders in disabled state', () => {
    const onClick = vi.fn()
    render(
      <IconButton
        onClick={onClick}
        ariaLabel="Disabled"
        disabled
      >
        <span>X</span>
      </IconButton>,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders with custom size', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="Resized" size={48}>
        <span>X</span>
      </IconButton>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('renders with additional class names', () => {
    render(
      <IconButton
        onClick={vi.fn()}
        ariaLabel="Styled"
        className="extra-class"
      >
        <span>X</span>
      </IconButton>,
    )

    const button = screen.getByRole('button')
    expect(button.className).toContain('extra-class')
  })

  it('applies default size of 36px when size is not provided', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="Default size">
        <span>X</span>
      </IconButton>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ width: '36px', height: '36px' })
  })

  it('applies min-width equal to size to prevent shrinking', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="Fixed width" size={44}>
        <span>X</span>
      </IconButton>,
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ minWidth: '44px' })
  })
})

// ===========================================================================
// contentRegistry
// ===========================================================================

describe('contentRegistry', () => {
  const DummyComponent: React.FC<SectionRendererProps> = () =>
    React.createElement('div', null, 'dummy')

  afterEach(() => {
    clearRegistry()
  })

  it('registerRenderer and getRenderer: can register and retrieve a renderer', () => {
    registerRenderer('test-type', DummyComponent)

    const retrieved = getRenderer('test-type')
    expect(retrieved).toBe(DummyComponent)
  })

  it('getRenderer: returns undefined for an unregistered type', () => {
    const retrieved = getRenderer('never-registered')
    expect(retrieved).toBeUndefined()
  })

  it('registerRenderer: overwrites an existing registration for the same type', () => {
    const First: React.FC<SectionRendererProps> = () =>
      React.createElement('div', null, 'first')
    const Second: React.FC<SectionRendererProps> = () =>
      React.createElement('div', null, 'second')

    registerRenderer('overwrite', First)
    registerRenderer('overwrite', Second)

    const retrieved = getRenderer('overwrite')
    expect(retrieved).toBe(Second)
    expect(retrieved).not.toBe(First)
  })

  it('clearRegistry: removes all registered renderers', () => {
    registerRenderer('a', DummyComponent)
    registerRenderer('b', DummyComponent)
    expect(getRegisteredTypes().length).toBeGreaterThanOrEqual(2)

    clearRegistry()

    expect(getRenderer('a')).toBeUndefined()
    expect(getRenderer('b')).toBeUndefined()
    expect(getRegisteredTypes()).toHaveLength(0)
  })

  it('getRegisteredTypes: returns all registered type names', () => {
    registerRenderer('alpha', DummyComponent)
    registerRenderer('beta', DummyComponent)

    const types = getRegisteredTypes()
    expect(types).toContain('alpha')
    expect(types).toContain('beta')
    expect(types).toHaveLength(2)
  })
})

// ===========================================================================
// map utilities
// ===========================================================================

describe('map utilities', () => {
  describe('getLearningPath', () => {
    it('returns nodes sorted by learningStep in ascending order', () => {
      const path = getLearningPath()

      // All returned nodes should have a learningStep
      path.forEach((node) => {
        expect(node.learningStep).toBeDefined()
      })

      // Verify the sort order (ascending)
      for (let i = 1; i < path.length; i++) {
        expect(path[i - 1].learningStep! <= path[i].learningStep!).toBe(true)
      }
    })

    it('returns the first node as LLM (step 1)', () => {
      const path = getLearningPath()
      expect(path[0].id).toBe('LLM')
      expect(path[0].learningStep).toBe(1)
    })

    it('returns the last node as Behavioral (step 14)', () => {
      const path = getLearningPath()
      const last = path[path.length - 1]
      expect(last.id).toBe('Behavioral')
      expect(last.learningStep).toBe(14)
    })

    it('includes the fractional step MCP (5.5) correctly positioned between steps 5 and 6', () => {
      const path = getLearningPath()
      const steps = path.map((n) => n.learningStep)

      const idx5 = steps.indexOf(5)
      const idx55 = steps.indexOf(5.5)
      const idx6 = steps.indexOf(6)

      expect(idx5).toBeGreaterThanOrEqual(0)
      expect(idx55).toBeGreaterThanOrEqual(0)
      expect(idx6).toBeGreaterThanOrEqual(0)

      // 5.5 should be between 5 and 6
      expect(idx55).toBeGreaterThan(idx5!)
      expect(idx55).toBeLessThan(idx6!)
    })

    it('returns a copy of the nodes array (not the original reference)', () => {
      const path = getLearningPath()
      expect(path).not.toBe(graphData.nodes)
    })

    it('returns all nodes from the graph', () => {
      const path = getLearningPath()
      expect(path).toHaveLength(graphData.nodes.length)
    })
  })

  describe('getCurrentStep', () => {
    it('returns the learningStep for an existing node', () => {
      expect(getCurrentStep('LLM')).toBe(1)
      expect(getCurrentStep('RAG')).toBe(3)
      expect(getCurrentStep('Agent')).toBe(5)
      expect(getCurrentStep('MCP')).toBe(5.5)
      expect(getCurrentStep('Behavioral')).toBe(14)
    })

    it('returns 0 when nodeId is null', () => {
      expect(getCurrentStep(null)).toBe(0)
    })

    it('returns 0 for a non-existent node id', () => {
      expect(getCurrentStep('NonExistentNode')).toBe(0)
    })

    it('returns 0 for an empty string', () => {
      expect(getCurrentStep('')).toBe(0)
    })
  })
})

// ===========================================================================
// EarlyReturnPattern — NodeContentRenderer fallback
//
// NOTE: NodeContentRenderer is imported at the top level which triggers
// side-effect imports that register all known section renderers.
// The contentRegistry tests above use clearRegistry() in their afterEach,
// so by the time this block runs the registry is empty — which is exactly
// the state we need to validate the early-return / fallback branch.
// ===========================================================================

describe('EarlyReturnPattern', () => {
  it('renders fallback div with title and body when no renderer is registered', () => {
    // Registry is already empty from previous test teardown; ensure it
    clearRegistry()

    const section = {
      title: 'Título Fallback',
      type: 'overview' as const,
      body: 'Conteúdo do corpo quando não há renderizador registrado.',
    }

    const { container } = render(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(container.textContent).toContain('Título Fallback')
    expect(container.textContent).toContain(
      'Conteúdo do corpo quando não há renderizador registrado.',
    )
  })

  it('renders fallback even when section.body is undefined', () => {
    clearRegistry()

    const section = {
      title: 'Apenas Título',
      type: 'overview' as const,
      // body is intentionally undefined
    }

    const { container } = render(
      <NodeContentRenderer section={section} groupColor="#00E676" />,
    )

    expect(container.textContent).toContain('Apenas Título')
    // body is undefined → the <p> should be empty / not contain extra text
  })

  it('renders the registered component when a renderer exists for the type', () => {
    // Re-register a minimal renderer after the clears above
    const TestRenderer: React.FC<SectionRendererProps> = ({ section }) =>
      React.createElement(
        'div',
        { 'data-testid': 'custom-renderer' },
        `Custom: ${section.title}`,
      )

    registerRenderer('test-custom-type', TestRenderer)

    const section = {
      title: 'My Custom Section',
      type: 'test-custom-type' as const,
    }

    const { container } = render(
      <NodeContentRenderer section={section} groupColor="#FFAB00" />,
    )

    expect(container.textContent).toContain('Custom: My Custom Section')
  })
})
