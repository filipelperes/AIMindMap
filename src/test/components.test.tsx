/* eslint-disable @typescript-eslint/no-explicit-any */
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

  it('renders both sun and moon icons (CSS-controlled visibility via dark: variant)', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    // Both SVGs are always rendered — Tailwind dark: variant controls visibility
    const allSvgs = document.querySelectorAll('button svg')
    expect(allSvgs).toHaveLength(2)

    // First SVG = Sun icon (has <circle>)
    const sunCircle = document.querySelector('svg circle')
    expect(sunCircle).toBeInTheDocument()
    // Sun has rotation animation classes
    expect(allSvgs[0].getAttribute('class')).toContain('dark:-rotate-90')
    expect(allSvgs[0].getAttribute('class')).toContain('dark:scale-0')

    // Second SVG = Moon icon (has <path>, no <circle>)
    const moonPath = document.querySelector('svg path')
    expect(moonPath).toBeInTheDocument()
    // Moon has rotation animation classes
    expect(allSvgs[1].getAttribute('class')).toContain('dark:rotate-0')
    expect(allSvgs[1].getAttribute('class')).toContain('dark:scale-100')
  })

  it('both SVGs have aria-hidden="true" for accessibility', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle } as any)

    render(<ThemeToggle />)

    const svgs = document.querySelectorAll('button svg')
    expect(svgs).toHaveLength(2)
    svgs.forEach(svg => {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('calls toggle function on click', () => {
    const toggle = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle } as any)

    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledTimes(1)
  })

  it('shows correct aria-label in dark mode ("Switch to light mode")', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /Switch to light mode/i }),
    ).toBeInTheDocument()
  })

  it('shows correct aria-label in light mode ("Switch to dark mode")', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /Switch to dark mode/i }),
    ).toBeInTheDocument()
  })

  it('applies correct background colour based on mode (dark)', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('dark:bg-white/8')
    expect(button).toHaveClass('text-text-primary')
  })

  it('applies correct background colour based on mode (light)', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggle: vi.fn(),
    } as any)

    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-black/6')
    expect(button).toHaveClass('text-text-primary')
  })
})

// ===========================================================================
// Badge
// ===========================================================================

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Foundations" baseColor="#FF006E" />)

    expect(screen.getByText('Foundations')).toBeInTheDocument()
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

    // ColorDot is rendered as a span inside the badge
    const dot = container.querySelector('span[role="img"]')
    expect(dot).toBeInTheDocument()
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
  it('renders with default aria-label "Close"', () => {
    render(<CloseButton onClick={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Close' }),
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
      title: 'Fallback Title',
      type: 'overview' as const,
      body: 'Body content when no renderer is registered.',
    }

    const { container } = render(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(container.textContent).toContain('Fallback Title')
    expect(container.textContent).toContain(
      'Body content when no renderer is registered.',
    )
  })

  it('renders fallback even when section.body is undefined', () => {
    clearRegistry()

    const section = {
      title: 'Title Only',
      type: 'overview' as const,
      // body is intentionally undefined
    }

    const { container } = render(
      <NodeContentRenderer section={section} groupColor="#00E676" />,
    )

    expect(container.textContent).toContain('Title Only')
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

// ===========================================================================
// Additional edge-case tests
// ===========================================================================

describe('ThemeToggle — additional', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('has correct title attribute in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    // translation: theme.titleDark → "Light Mode" (describes the mode to switch TO)
    expect(button).toHaveAttribute('title', 'Light Mode')
  })

  it('has correct title attribute in light mode', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'light', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    // translation: theme.titleLight → "Dark Mode" (describes the mode to switch TO)
    expect(button).toHaveAttribute('title', 'Dark Mode')
  })

  it('applies hover and active CSS classes', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('hover:scale-110')
    expect(button.className).toContain('active:scale-95')
  })

  it('renders sun icon with correct SVG attributes in dark mode', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '18')
    expect(svg).toHaveAttribute('height', '18')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('applies shrink-0 to prevent flex shrinking', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('shrink-0')
  })

  it('applies hover background variant classes', () => {
    vi.mocked(useTheme).mockReturnValue({ mode: 'dark', toggle: vi.fn() } as any)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('hover:dark:bg-white/15')
    expect(button.className).toContain('hover:bg-black/15')
  })
})

describe('Badge — additional', () => {
  it('renders without glowColor prop', () => {
    render(<Badge label="NoGlow" baseColor="#FF006E" />)
    expect(screen.getByText('NoGlow')).toBeInTheDocument()
  })

  it('renders with empty label', () => {
    const { container } = render(<Badge label="" baseColor="#00B0FF" />)
    // The outermost span is the badge container
    const badges = container.querySelectorAll('.inline-flex')
    expect(badges.length).toBeGreaterThanOrEqual(1)
    // Verify the badge contains a ColorDot with role="img"
    const dot = container.querySelector('span[role="img"]')
    expect(dot).toBeInTheDocument()
  })

  it('renders multiple badges independently', () => {
    render(
      <div>
        <Badge label="First" baseColor="#FF006E" />
        <Badge label="Second" baseColor="#00E676" />
      </div>,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})

describe('CloseButton — additional', () => {
  it('renders with default size 32 when no size prop provided', () => {
    render(<CloseButton onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ width: '32px', height: '32px' })
  })

  it('can be clicked multiple times', () => {
    const onClick = vi.fn()
    render(<CloseButton onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(3)
  })
})

describe('IconButton — additional', () => {
  it('renders complex children (nested elements)', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="Complex">
        <span data-testid="inner">
          <strong>X</strong>
        </span>
      </IconButton>,
    )
    expect(screen.getByTestId('inner')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
  })

  it('renders without className prop', () => {
    render(
      <IconButton onClick={vi.fn()} ariaLabel="No class">
        <span>X</span>
      </IconButton>,
    )
    const button = screen.getByRole('button')
    // Should still have base classes
    expect(button.className).toContain('rounded-full')
  })
})

describe('contentRegistry — additional', () => {
  afterEach(() => {
    clearRegistry()
  })

  it('supports multiple register-clear cycles', () => {
    const C1: React.FC<SectionRendererProps> = () => React.createElement('div', null, 'c1')
    registerRenderer('test', C1)
    expect(getRenderer('test')).toBe(C1)

    clearRegistry()
    expect(getRenderer('test')).toBeUndefined()

    const C2: React.FC<SectionRendererProps> = () => React.createElement('div', null, 'c2')
    registerRenderer('test', C2)
    expect(getRenderer('test')).toBe(C2)
  })

  it('registerRenderer with multiple types simultaneously', () => {
    const Comp: React.FC<SectionRendererProps> = () => React.createElement('div', null, 'x')
    registerRenderer('a', Comp)
    registerRenderer('b', Comp)
    registerRenderer('c', Comp)
    expect(getRegisteredTypes()).toHaveLength(3)
    expect(getRegisteredTypes()).toEqual(expect.arrayContaining(['a', 'b', 'c']))
  })

  it('getRenderer returns different components for different types', () => {
    const CA: React.FC<SectionRendererProps> = () => React.createElement('div', null, 'A')
    const CB: React.FC<SectionRendererProps> = () => React.createElement('div', null, 'B')
    registerRenderer('type-a', CA)
    registerRenderer('type-b', CB)
    expect(getRenderer('type-a')).toBe(CA)
    expect(getRenderer('type-b')).toBe(CB)
    expect(getRenderer('type-a')).not.toBe(getRenderer('type-b'))
  })
})

describe('map utilities — additional', () => {
  it('getCurrentStep returns correct values for various known nodes', () => {
    const knownSteps: [string, number][] = [
      ['PromptEngineering', 2],
      ['RAG', 3],
      ['FineTuning', 4],
      ['Agent', 5],
      ['AISystemDesign', 6],
      ['VectorDB', 7],
      ['LLMOps', 8],
      ['EvalTesting', 9],
      ['AISafety', 10],
      ['Multimodal', 11],
      ['Infrastructure', 12],
      ['Coding', 13],
      ['Behavioral', 14],
    ]
    knownSteps.forEach(([id, step]) => {
      expect(getCurrentStep(id)).toBe(step)
    })
  })

  it('getCurrentStep returns fractional steps correctly', () => {
    expect(getCurrentStep('MCP')).toBe(5.5)
    expect(getCurrentStep('StructuredOutputs')).toBe(2.5)
    expect(getCurrentStep('ContextEngineering')).toBe(3.5)
    expect(getCurrentStep('KnowledgeGraphs')).toBe(3.3)
    expect(getCurrentStep('Workflows')).toBe(4.5)
    expect(getCurrentStep('FunctionCalling')).toBe(5.6)
  })

  it('getLearningPath returns nodes in correct order', () => {
    const path = getLearningPath()
    // First 4 should be: LLM(1), PromptEngineering(2), StructuredOutputs(2.5), RAG(3)
    expect(path[0].id).toBe('LLM')
    expect(path[0].learningStep).toBe(1)
    expect(path[1].id).toBe('PromptEngineering')
    expect(path[1].learningStep).toBe(2)
    expect(path[2].id).toBe('StructuredOutputs')
    expect(path[2].learningStep).toBe(2.5)
    expect(path[3].id).toBe('RAG')
    expect(path[3].learningStep).toBe(3)
  })
})
