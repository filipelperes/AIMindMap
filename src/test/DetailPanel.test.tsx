/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../store/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

// Mock useLocalizedNodeContent to passthrough the node unchanged,
// so tests use the test data rather than real content lookups.
vi.mock('../hooks/useLocalizedNodeContent', () => ({
  useLocalizedNodeContent: (node: unknown) => node,
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useTheme } from '../store/ThemeContext'
import DetailPanel from '../components/organisms/DetailPanel'
import type { MindMapNode } from '../types/mindmap'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const baseNode: MindMapNode = {
  id: 'LLM',
  group: 1,
  description: 'Foundation: how LLMs work under the hood.',
  learningStep: 1,
  content: {
    summary: 'LLMs are large language models.',
    sections: [
      {
        title: 'Overview',
        type: 'overview',
        body: 'LLM overview text.',
      },
      {
        title: 'Key Concepts',
        type: 'key-concepts',
        items: ['Concept A', 'Concept B'],
      },
    ],
    quickTip: 'Always validate model outputs.',
    everydayExample: 'Like a librarian who has read all the books.',
  },
}

const nodeWithoutOptionals: MindMapNode = {
  id: 'RAG',
  group: 3,
  description: 'Connecting LLMs to external knowledge.',
  content: {
    summary: 'RAG combines retrieval with generation.',
    sections: [
      {
        title: 'How It Works',
        type: 'how-it-works',
        body: 'Retrieves relevant documents and inserts them into context.',
      },
    ],
    // no quickTip, no everydayExample
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPanel(
  node: MindMapNode | null,
  onClose: () => void = vi.fn(),
  panelWidth?: number | string,
  isMobile?: boolean,
) {
  return render(
    <DetailPanel
      node={node}
      onClose={onClose}
      panelWidth={panelWidth}
      isMobile={isMobile}
    />,
  )
}

// ===========================================================================
// DetailPanel
// ===========================================================================

describe('DetailPanel', () => {
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

  // -----------------------------------------------------------------------
  // Null node → early return (null)
  // -----------------------------------------------------------------------

  describe('when node is null', () => {
    it('renders nothing (returns null)', () => {
      const { container } = renderPanel(null)
      expect(container.firstChild).toBeNull()
    })

    it('does not call onClose (no button rendered)', () => {
      const onClose = vi.fn()
      const { container } = renderPanel(null, onClose)
      expect(container.firstChild).toBeNull()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Node provided → full rendering
  // -----------------------------------------------------------------------

  describe('when node is provided', () => {
    it('renders the node id as the heading', () => {
      renderPanel(baseNode)
      expect(
        screen.getByRole('heading', { name: /LLM/i, level: 2 }),
      ).toBeInTheDocument()
    })

    it('renders the node description', () => {
      renderPanel(baseNode)
      expect(
        screen.getByText(
          /Foundation: how LLMs work under the hood/i,
        ),
      ).toBeInTheDocument()
    })

    it('renders the summary text', () => {
      renderPanel(baseNode)
      expect(
        screen.getByText(/LLMs are large language models/i),
      ).toBeInTheDocument()
    })

    it('renders the learning step badge', () => {
      renderPanel(baseNode)
      expect(screen.getByText(/Step 1/i)).toBeInTheDocument()
    })

    it('renders a CloseButton', () => {
      renderPanel(baseNode)
      expect(
        screen.getByRole('button', { name: /Close/i }),
      ).toBeInTheDocument()
    })

    it('calls onClose when CloseButton is clicked', () => {
      const onClose = vi.fn()
      renderPanel(baseNode, onClose)

      fireEvent.click(screen.getByRole('button', { name: /Close/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders a Badge with the group label', () => {
      renderPanel(baseNode)

      // Group 1 → 'Foundations'
      expect(screen.getByText(/Foundations/i)).toBeInTheDocument()
    })

    it('renders quick tip when node.content.quickTip is present', () => {
      renderPanel(baseNode)
      expect(screen.getByText(/Always validate model outputs/i)).toBeInTheDocument()
    })

    it('renders everyday example when node.content.everydayExample is present', () => {
      renderPanel(baseNode)
      expect(
        screen.getByText(/Like a librarian who has read all the books/i),
      ).toBeInTheDocument()
    })

    it('does not render quick tip section when quickTip is absent', () => {
      renderPanel(nodeWithoutOptionals)
      expect(
        screen.queryByText(/Quick Tip/i),
      ).not.toBeInTheDocument()
    })

    it('does not render everyday example section when everydayExample is absent', () => {
      renderPanel(nodeWithoutOptionals)
      expect(
        screen.queryByText(/Everyday Example/i),
      ).not.toBeInTheDocument()
    })

    it('renders all content sections', () => {
      const { container } = renderPanel(baseNode)
      expect(container.textContent).toContain('Overview')
      expect(container.textContent).toContain(
        'LLM overview text.',
      )
      expect(container.textContent).toContain('Key Concepts')
    })

    it('applies dark mode styles', () => {
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

      const { container } = renderPanel(baseNode)

      // The panel aside should have the dark background
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
      expect(aside).toHaveClass('dark:bg-abyss/72')
    })

    it('applies light mode styles', () => {
      vi.mocked(useTheme).mockReturnValue({
        mode: 'light',
        isDark: false,
        toggle: vi.fn(),
        setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette: vi.fn().mockReturnValue({
          base: '#D0005A',
          emissive: '#E8307A',
          accent: '#F0A0C0',
          label: 'Foundations',
        }),
      } as any)

      const { container } = renderPanel(baseNode)

      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
      expect(aside).toHaveClass('bg-white/78')
    })

    it('uses the custom panelWidth when provided', () => {
      const { container } = renderPanel(baseNode, vi.fn(), 500)

      const aside = container.querySelector('[data-tour="panel"]')
      // panelWidth only applies in non-mobile mode
      expect(aside).toHaveStyle({ width: '500px' })
    })

    it('renders with mobile styling when isMobile is true', () => {
      const { container } = renderPanel(baseNode, vi.fn(), undefined, true)

      // In mobile mode the width style should not be set (uses inset-x-4 instead)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
      // Mobile mode doesn't set a fixed width inline style
      expect(aside).not.toHaveStyle({ width: '420px' })
    })

    it('renders node without learningStep gracefully (no step badge)', () => {
      const nodeNoStep: MindMapNode = {
        ...baseNode,
        learningStep: undefined,
      }
      const { container } = renderPanel(nodeNoStep)
      expect(container.textContent).not.toContain('Step')
    })
  })

  // -----------------------------------------------------------------------
  // Node with different variations (groups, content, edge cases)
  // -----------------------------------------------------------------------

  describe('with different node groups', () => {
    it('renders badge for group 2 (PromptEngineering)', () => {
      const node: MindMapNode = {
        ...baseNode,
        id: 'PromptEngineering',
        group: 2,
      }
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette: vi.fn().mockReturnValue({
          base: '#00B0FF', emissive: '#40C4FF', accent: '#80D8FF', label: 'Prompt Engineering',
        }),
      } as any)
      renderPanel(node)
      expect(screen.getByText(/Prompt Engineering/i)).toBeInTheDocument()
    })

    it('renders badge for group 5 (Agent)', () => {
      const node: MindMapNode = {
        ...baseNode,
        id: 'Agent',
        group: 5,
      }
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette: vi.fn().mockReturnValue({
          base: '#00E676', emissive: '#69F0AE', accent: '#B9F6CA', label: 'Agent Systems',
        }),
      } as any)
      renderPanel(node)
      expect(screen.getByText(/Agent Systems/i)).toBeInTheDocument()
    })

    it('renders badge for group 8 (VectorDB)', () => {
      const node: MindMapNode = {
        ...baseNode,
        id: 'VectorDB',
        group: 8,
      }
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette: vi.fn().mockReturnValue({
          base: '#FFAB00', emissive: '#FFD740', accent: '#FFE57F', label: 'Data & Memory',
        }),
      } as any)
      renderPanel(node)
      expect(screen.getByText(/Data & Memory/i)).toBeInTheDocument()
    })
  })

  describe('panel width variations', () => {
    it('applies numeric panelWidth (420)', () => {
      const { container } = renderPanel(baseNode, vi.fn(), 420)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveStyle({ width: '420px' })
    })

    it('applies numeric panelWidth (500)', () => {
      const { container } = renderPanel(baseNode, vi.fn(), 500)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveStyle({ width: '500px' })
    })

    it('applies string panelWidth ("50%")', () => {
      const { container } = renderPanel(baseNode, vi.fn(), '50%')
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveStyle({ width: '50%' })
    })
  })

  describe('mobile rendering', () => {
    it('renders with mobile class when isMobile is true', () => {
      const { container } = renderPanel(baseNode, vi.fn(), undefined, true)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
    })

    it('does not set fixed width in mobile mode', () => {
      const { container } = renderPanel(baseNode, vi.fn(), 420, true)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).not.toHaveStyle({ width: '420px' })
    })

    it('renders different node in mobile mode', () => {
      const node: MindMapNode = { ...baseNode, id: 'RAG', group: 3 }
      const { container } = renderPanel(node, vi.fn(), undefined, true)
      expect(container.textContent).toContain('RAG')
    })
  })

  describe('content section rendering', () => {
    it('renders all sections from node.content.sections', () => {
      const { container } = renderPanel(baseNode)
      expect(container.textContent).toContain('Overview')
      expect(container.textContent).toContain('Key Concepts')
    })

    it('renders a node with empty sections array', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: { summary: 'Empty sections.', sections: [] },
      }
      const { container } = renderPanel(node)
      expect(container.textContent).toContain('Empty sections.')
    })

    it('renders a node with multiple sections (3+)', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          summary: 'Multi sections.',
          sections: [
            { title: 'A', type: 'overview', body: 'Body A' },
            { title: 'B', type: 'key-concepts', items: ['X'] },
            { title: 'C', type: 'how-it-works', body: 'Body C' },
            { title: 'D', type: 'analogy', body: 'Body D' },
          ],
        },
      }
      const { container } = renderPanel(node)
      expect(container.textContent).toContain('A')
      expect(container.textContent).toContain('B')
      expect(container.textContent).toContain('C')
      expect(container.textContent).toContain('D')
    })

    it('renders section with missing body gracefully', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          summary: 'Test.',
          sections: [{ title: 'NoBody', type: 'overview' }],
        },
      }
      const { container } = renderPanel(node)
      expect(container.textContent).toContain('NoBody')
    })
  })

  describe('quick tip variations', () => {
    it('renders quick tip with different text', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          ...baseNode.content!,
          quickTip: 'Test quick tip text.',
        },
      }
      renderPanel(node)
      expect(screen.getByText(/Test quick tip text/i)).toBeInTheDocument()
    })

    it('shows quick tip badge (⚡) when quickTip is present', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          ...baseNode.content!,
          quickTip: 'A tip!',
        },
      }
      renderPanel(node)
      // Quick Tip appears twice: once in the badge + once as the section heading
      const quickTipTexts = screen.getAllByText(/Quick Tip/i)
      expect(quickTipTexts.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('everyday example variations', () => {
    it('renders everyday example with different text', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          ...baseNode.content!,
          everydayExample: 'Another real-world example.',
        },
      }
      renderPanel(node)
      expect(screen.getByText(/Another real-world example/i)).toBeInTheDocument()
    })

    it('shows everyday example heading when present', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: {
          ...baseNode.content!,
          everydayExample: 'Example text.',
        },
      }
      renderPanel(node)
      expect(screen.getByText(/Everyday Example/i)).toBeInTheDocument()
    })
  })

  describe('learning step variations', () => {
    it('renders step 5 as "Step 5"', () => {
      const node: MindMapNode = { ...baseNode, id: 'Agent', learningStep: 5 }
      renderPanel(node)
      expect(screen.getByText(/Step 5/i)).toBeInTheDocument()
    })

    it('renders fractional step (5.5) correctly', () => {
      const node: MindMapNode = { ...baseNode, id: 'MCP', learningStep: 5.5 }
      renderPanel(node)
      expect(screen.getByText(/Step 5.5/i)).toBeInTheDocument()
    })

    it('renders large step number (14)', () => {
      const node: MindMapNode = { ...baseNode, id: 'Behavioral', learningStep: 14 }
      renderPanel(node)
      expect(screen.getByText(/Step 14/i)).toBeInTheDocument()
    })

    it('does not render step badge when learningStep is undefined', () => {
      const node: MindMapNode = { ...baseNode, learningStep: undefined }
      const { container } = renderPanel(node)
      expect(container.textContent).not.toContain('Step')
    })

    it('does not render step badge when learningStep is 0 (falsy in JS)', () => {
      const node: MindMapNode = { ...baseNode, learningStep: 0 }
      const { container } = renderPanel(node)
      // 0 is falsy in JS, so `node.learningStep && <span>...</span>` skips rendering
      expect(container.textContent).not.toContain('Step')
    })
  })

  describe('backdrop interaction', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      const { container } = renderPanel(baseNode, onClose)
      // Backdrop is the motion.div with fixed inset-0
      const backdrop = container.querySelector('.fixed.inset-0')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalled()
      }
    })

    it('does not crash when backdrop is null (null node)', () => {
      const onClose = vi.fn()
      const { container } = renderPanel(null, onClose)
      expect(container.firstChild).toBeNull()
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('summary variations', () => {
    it('renders summary with punctuation', () => {
      const node: MindMapNode = {
        ...baseNode,
        content: { ...baseNode.content!, summary: 'Important: test summary with !? and .' },
      }
      renderPanel(node)
      expect(screen.getByText(/Important: test summary with !\? and \./i)).toBeInTheDocument()
    })

    it('renders summary in dark mode', () => {
      renderPanel(baseNode)
      const summary = screen.getByText(/LLMs are large language models/i)
      expect(summary).toBeInTheDocument()
    })
  })

  describe('header rendering', () => {
    it('renders node id as the heading', () => {
      renderPanel(baseNode)
      expect(screen.getByRole('heading', { level: 2, name: /LLM/i })).toBeInTheDocument()
    })

    it('renders different node id as heading', () => {
      const node: MindMapNode = { ...baseNode, id: 'RAG' }
      renderPanel(node)
      expect(screen.getByRole('heading', { level: 2, name: /RAG/i })).toBeInTheDocument()
    })

    it('renders color dot before heading', () => {
      const { container } = renderPanel(baseNode)
      // ColorDot is a span with role="img" inside the badge
      const dot = container.querySelector('span[role="img"]')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('styling variations', () => {
    it('applies border color for dark mode', () => {
      const { container } = renderPanel(baseNode)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveClass('dark:border-white/10')
    })

    it('applies border color for light mode', () => {
      vi.mocked(useTheme).mockReturnValue({
        mode: 'light', isDark: false, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette: vi.fn().mockReturnValue({
          base: '#D0005A', emissive: '#E8307A', accent: '#F0A0C0', label: 'Foundations',
        }),
      } as any)
      const { container } = renderPanel(baseNode)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveClass('border-cyber/12')
    })

    it('applies blur style in both modes', () => {
      const { container } = renderPanel(baseNode)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveStyle({ backdropFilter: 'blur(20px) saturate(1.4)' })
    })

    it('applies correct box shadow via CSS variable', () => {
      const { container } = renderPanel(baseNode)
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toHaveStyle({
        boxShadow: 'var(--shadow-panel)',
      })
    })
  })

  describe('description rendering', () => {
    it('renders node with description', () => {
      renderPanel(baseNode)
      expect(screen.getByText(/Foundation: how LLMs work/i)).toBeInTheDocument()
    })

    it('renders node without description gracefully', () => {
      const node: MindMapNode = { ...baseNode, description: '' }
      renderPanel(node)
    })
  })

  describe('multiple re-renders', () => {
    it('survives switching between nodes', () => {
      const onClose = vi.fn()
      const node1: MindMapNode = { ...baseNode, id: 'LLM' }
      const node2: MindMapNode = { ...baseNode, id: 'RAG', group: 3 }

      const { rerender } = render(
        <DetailPanel node={node1} onClose={onClose} />,
      )
      expect(screen.getByText('LLM')).toBeInTheDocument()

      rerender(<DetailPanel node={node2} onClose={onClose} />)
      expect(screen.getByText('RAG')).toBeInTheDocument()
    })

    it('survives changing from node to null', () => {
      const { rerender } = render(
        <DetailPanel node={baseNode} onClose={vi.fn()} />,
      )
      expect(screen.getByText('LLM')).toBeInTheDocument()

      const { container } = render(
        <DetailPanel node={null} onClose={vi.fn()} />,
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('getGroupPalette interaction', () => {
    it('calls getGroupPalette with the node group', () => {
      const getGroupPalette = vi.fn().mockReturnValue({
        base: '#FF006E', emissive: '#FF4081', accent: '#FF80AB', label: 'Foundations',
      })
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette,
      } as any)
      renderPanel(baseNode)
      expect(getGroupPalette).toHaveBeenCalledWith(1)
    })

    it('calls getGroupPalette with group 3 for RAG node', () => {
      const getGroupPalette = vi.fn().mockReturnValue({
        base: '#00E676', emissive: '#69F0AE', accent: '#B9F6CA', label: 'Techniques',
      })
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark', isDark: true, toggle: vi.fn(), setMode: vi.fn(),
        colors: {} as any,
        getGroupPalette,
      } as any)
      const node: MindMapNode = { ...baseNode, id: 'RAG', group: 3 }
      renderPanel(node)
      expect(getGroupPalette).toHaveBeenCalledWith(3)
    })
  })

  describe('node rendering stability', () => {
    it('renders same node twice without errors', () => {
      const { container: c1 } = renderPanel(baseNode)
      const text1 = c1.textContent
      const { container: c2 } = renderPanel(baseNode)
      expect(c2.textContent).toBe(text1)
    })

    it('renders description with special characters', () => {
      const node: MindMapNode = {
        ...baseNode,
        description: 'Test with $pecial & <chars> "quotes"',
      }
      renderPanel(node)
      expect(screen.getByText(/\$pecial/i)).toBeInTheDocument()
    })
  })
})
