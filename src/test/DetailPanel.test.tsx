import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

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
import DetailPanel from '../components/organisms/DetailPanel'
import type { MindMapNode } from '../types/mindmap'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const baseNode: MindMapNode = {
  id: 'LLM',
  group: 1,
  description: 'Fundação: como LLMs funcionam por baixo dos panos.',
  learningStep: 1,
  content: {
    summary: 'LLMs são modelos de linguagem de grande escala.',
    sections: [
      {
        title: 'Overview',
        type: 'overview',
        body: 'Texto de visão geral do LLM.',
      },
      {
        title: 'Key Concepts',
        type: 'key-concepts',
        items: ['Concept A', 'Concept B'],
      },
    ],
    quickTip: 'Sempre valide os outputs do modelo.',
    everydayExample: 'Como um bibliotecário que leu todos os livros.',
  },
}

const nodeWithoutOptionals: MindMapNode = {
  id: 'RAG',
  group: 3,
  description: 'Conectando LLMs a conhecimento externo.',
  content: {
    summary: 'RAG combina recuperação com geração.',
    sections: [
      {
        title: 'How It Works',
        type: 'how-it-works',
        body: 'Recupera documentos relevantes e os insere no contexto.',
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
      getGroupColor: vi.fn(),
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
          /Fundação: como LLMs funcionam por baixo dos panos/i,
        ),
      ).toBeInTheDocument()
    })

    it('renders the summary text', () => {
      renderPanel(baseNode)
      expect(
        screen.getByText(/LLMs são modelos de linguagem de grande escala/i),
      ).toBeInTheDocument()
    })

    it('renders the learning step badge', () => {
      renderPanel(baseNode)
      expect(screen.getByText(/Step 1/i)).toBeInTheDocument()
    })

    it('renders a CloseButton', () => {
      renderPanel(baseNode)
      expect(
        screen.getByRole('button', { name: /Fechar/i }),
      ).toBeInTheDocument()
    })

    it('calls onClose when CloseButton is clicked', () => {
      const onClose = vi.fn()
      renderPanel(baseNode, onClose)

      fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders a Badge with the group label', () => {
      renderPanel(baseNode)

      // Group 1 → 'Fundamentos'
      expect(screen.getByText(/Fundamentos/i)).toBeInTheDocument()
    })

    it('renders quick tip when node.content.quickTip is present', () => {
      renderPanel(baseNode)
      expect(screen.getByText(/Sempre valide os outputs/i)).toBeInTheDocument()
    })

    it('renders everyday example when node.content.everydayExample is present', () => {
      renderPanel(baseNode)
      expect(
        screen.getByText(/Como um bibliotecário que leu todos os livros/i),
      ).toBeInTheDocument()
    })

    it('does not render quick tip section when quickTip is absent', () => {
      renderPanel(nodeWithoutOptionals)
      expect(
        screen.queryByText(/Dica Rápida/i),
      ).not.toBeInTheDocument()
    })

    it('does not render everyday example section when everydayExample is absent', () => {
      renderPanel(nodeWithoutOptionals)
      expect(
        screen.queryByText(/Exemplo do Cotidiano/i),
      ).not.toBeInTheDocument()
    })

    it('renders all content sections', () => {
      const { container } = renderPanel(baseNode)
      expect(container.textContent).toContain('Overview')
      expect(container.textContent).toContain(
        'Texto de visão geral do LLM.',
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
        getGroupColor: vi.fn(),
      } as any)

      const { container } = renderPanel(baseNode)

      // The panel aside should have the dark background
      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
      expect(aside).toHaveStyle({
        backgroundColor: 'rgba(8,11,26,0.65)',
      })
    })

    it('applies light mode styles', () => {
      vi.mocked(useTheme).mockReturnValue({
        mode: 'light',
        isDark: false,
        toggle: vi.fn(),
        setMode: vi.fn(),
        colors: {} as any,
        getGroupColor: vi.fn(),
      } as any)

      const { container } = renderPanel(baseNode)

      const aside = container.querySelector('[data-tour="panel"]')
      expect(aside).toBeInTheDocument()
      expect(aside).toHaveStyle({
        backgroundColor: 'rgba(255,255,255,0.82)',
      })
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
})
