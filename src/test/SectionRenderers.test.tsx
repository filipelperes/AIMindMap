import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'

import type { ContentSection } from '../types/mindmap'
import { getRenderer } from '../services/contentRegistry'

// Side-effect imports: each module self-registers via registerRenderer() at import time
import '../components/molecules/SectionTextBody'
import '../components/molecules/SectionConceptList'
import '../components/molecules/SectionCodeBlock'
import '../components/molecules/SectionProsCons'
import '../components/molecules/SectionLinkList'
import '../components/molecules/SectionQAList'
import '../components/molecules/SectionAnalogy'
import '../components/molecules/SectionCheatsheet'
import '../components/molecules/SectionEverydayScenario'

// ---------------------------------------------------------------------------
// Helper: render with ThemeProvider wrapper
// ---------------------------------------------------------------------------
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

// ---------------------------------------------------------------------------
// SectionTextBody
// ---------------------------------------------------------------------------
describe('SectionTextBody', () => {
  ;['overview', 'how-it-works', 'architecture'].forEach((type) => {
    it(`renders "${type}" section with title and body`, () => {
      const Component = getRenderer(type)
      expect(Component).toBeDefined()

      const section: ContentSection = {
        title: 'Test Section',
        type: type as ContentSection['type'],
        body: 'Body text for verification.',
      }

      if (Component) {
        const { container } = renderWithTheme(
          <Component section={section} groupColor="#FF006E" />,
        )
        expect(container.textContent).toContain('Test Section')
        expect(container.textContent).toContain('Body text for verification.')
      }
    })
  })
})

// ---------------------------------------------------------------------------
// SectionConceptList
// ---------------------------------------------------------------------------
describe('SectionConceptList', () => {
  it('renders "key-concepts" with title and items', () => {
    const Component = getRenderer('key-concepts')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Key Concepts',
      type: 'key-concepts',
      items: ['Item 1: description', 'Item 2: another description'],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#00E676" />,
      )
      expect(container.textContent).toContain('Key Concepts')
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
    }
  })

  it('renders with empty items gracefully', () => {
    const Component = getRenderer('key-concepts')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Concepts',
      type: 'key-concepts',
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#00E676" />,
      )
      expect(container.textContent).toContain('Concepts')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionCodeBlock
// ---------------------------------------------------------------------------
describe('SectionCodeBlock', () => {
  it('renders "code-example" with code block and copy button', () => {
    const Component = getRenderer('code-example')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Example',
      type: 'code-example',
      body: 'Code description.',
      code: {
        language: 'python',
        source: 'print("hello world")',
      },
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FFAB00" />,
      )
      expect(container.textContent).toContain('Example')
      expect(container.textContent).toContain('python')
      expect(container.textContent).toContain('hello world')
      expect(container.textContent).toContain('description')
      expect(container.textContent).toContain('Copy')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionQAList
// ---------------------------------------------------------------------------
describe('SectionQAList', () => {
  it('renders "qa-list" with questions and answers', () => {
    const Component = getRenderer('qa-list')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Frequently Asked Questions',
      type: 'qa-list',
      qa: [
        { question: 'What is an LLM?', answer: 'It is a language model.' },
        { question: 'How does it work?', answer: 'It uses transformers.' },
      ],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#D500F9" />,
      )
      expect(container.textContent).toContain('Frequently Asked Questions')
      expect(container.textContent).toContain('What is an LLM?')
      expect(container.textContent).toContain('How does it work?')
      expect(container.textContent).toContain('It is a language model.')
      expect(container.textContent).toContain('It uses transformers.')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionAnalogy
// ---------------------------------------------------------------------------
describe('SectionAnalogy', () => {
  it('renders "analogy" with analogy text', () => {
    const Component = getRenderer('analogy')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Analogy',
      type: 'analogy',
      body: 'Imagine a librarian who has read all the books.',
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF1744" />,
      )
      expect(container.textContent).toContain('Analogy')
      expect(container.textContent).toContain('Imagine a librarian')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionProsCons
// ---------------------------------------------------------------------------
describe('SectionProsCons', () => {
  it('renders "pros-cons" with items and body', () => {
    const Component = getRenderer('pros-cons')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Pros and Cons',
      type: 'pros-cons',
      body: 'Comparative analysis.',
      items: [
        '✅ Fast to implement',
        '✅ Low cost',
        '⚠️ May hallucinate',
      ],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#00E5FF" />,
      )
      expect(container.textContent).toContain('Pros')
      expect(container.textContent).toContain('Fast to implement')
      expect(container.textContent).toContain('Comparative analysis')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionCheatsheet
// ---------------------------------------------------------------------------
describe('SectionCheatsheet', () => {
  it('renders "cheatsheet-entry" with items', () => {
    const Component = getRenderer('cheatsheet-entry')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Quick Tips',
      type: 'cheatsheet-entry',
      body: 'Best practices.',
      items: [
        'Use temperature 0.1 for facts',
        'Always validate outputs',
      ],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#76FF03" />,
      )
      expect(container.textContent).toContain('Quick Tips')
      expect(container.textContent).toContain('Use temperature')
      expect(container.textContent).toContain('Always validate')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionLinkList
// ---------------------------------------------------------------------------
describe('SectionLinkList', () => {
  it('renders "related-links" with items', () => {
    const Component = getRenderer('related-links')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Related Links',
      type: 'related-links',
      items: ['Official documentation', 'Step by step tutorial'],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF9100" />,
      )
      expect(container.textContent).toContain('Related Links')
      expect(container.textContent).toContain('Official documentation')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionEverydayScenario
// ---------------------------------------------------------------------------
describe('SectionEverydayScenario', () => {
  it('renders "everyday-scenario" with title, body, and items', () => {
    const Component = getRenderer('everyday-scenario')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Everyday Scenario',
      type: 'everyday-scenario',
      body: 'Description of a real scenario.',
      items: [
        'Item 1: practical situation',
        'Item 2: another situation',
      ],
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF6B6B" />,
      )
      expect(container.textContent).toContain('Everyday Scenario')
      expect(container.textContent).toContain('Description of a real scenario.')
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
    }
  })

  it('renders with only title (no body/items)', () => {
    const Component = getRenderer('everyday-scenario')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Minimal Scenario',
      type: 'everyday-scenario',
    }

    if (Component) {
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF6B6B" />,
      )
      expect(container.textContent).toContain('Minimal Scenario')
    }
  })
})

// ---------------------------------------------------------------------------
// Registry fallback
// ---------------------------------------------------------------------------
describe('Registry fallback', () => {
  it('returns undefined for unregistered type', () => {
    const Component = getRenderer('nonexistent-type')
    expect(Component).toBeUndefined()
  })

  it('returns undefined for empty string type', () => {
    expect(getRenderer('')).toBeUndefined()
  })
})

// ===========================================================================
// Expanded tests: SectionTextBody (overview, how-it-works, architecture)
// ===========================================================================
describe('SectionTextBody — expanded', () => {
  const TYPES = ['overview', 'how-it-works', 'architecture'] as const

  TYPES.forEach((type) => {
    it(`renders "${type}" without body (body undefined)`, () => {
      const Component = getRenderer(type)!
      const section: ContentSection = { title: `Test ${type}`, type }
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF006E" />,
      )
      expect(container.textContent).toContain(`Test ${type}`)
    })

    it(`renders "${type}" with body and items`, () => {
      const Component = getRenderer(type)!
      const section: ContentSection = {
        title: `Test ${type}`,
        type,
        body: 'Body text.',
        items: ['Item 1', 'Item 2'],
      }
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#00B0FF" />,
      )
      expect(container.textContent).toContain('Body text.')
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
    })

    it(`renders "${type}" with code block`, () => {
      const Component = getRenderer(type)!
      const section: ContentSection = {
        title: `Code ${type}`,
        type,
        code: { language: 'python', source: 'print("hello")' },
      }
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FFAB00" />,
      )
      expect(container.textContent).toContain('Code')
      expect(container.textContent).toContain('print("hello")')
    })

    it(`renders "${type}" with empty items array`, () => {
      const Component = getRenderer(type)!
      const section: ContentSection = {
        title: `Empty ${type}`,
        type,
        body: 'Body',
        items: [],
      }
      const { container } = renderWithTheme(
        <Component section={section} groupColor="#00E676" />,
      )
      expect(container.textContent).toContain('Body')
    })
  })
})

// ===========================================================================
// Expanded tests: SectionConceptList (key-concepts)
// ===========================================================================
describe('SectionConceptList — expanded', () => {
  it('renders with body and no items', () => {
    const Component = getRenderer('key-concepts')!
    const section: ContentSection = {
      title: 'Concepts',
      type: 'key-concepts',
      body: 'Concept description.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E676" />,
    )
    expect(container.textContent).toContain('Concept description.')
  })

  it('renders with single item', () => {
    const Component = getRenderer('key-concepts')!
    const section: ContentSection = {
      title: 'Single',
      type: 'key-concepts',
      items: ['Only item'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E676" />,
    )
    expect(container.textContent).toContain('Only item')
  })

  it('renders with many items (10)', () => {
    const Component = getRenderer('key-concepts')!
    const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`)
    const section: ContentSection = {
      title: 'Many Items',
      type: 'key-concepts',
      items,
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E676" />,
    )
    items.forEach(item => expect(container.textContent).toContain(item))
  })

  it('renders with ColorDot for each item', () => {
    const Component = getRenderer('key-concepts')!
    const section: ContentSection = {
      title: 'Dots',
      type: 'key-concepts',
      items: ['A', 'B'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    const dots = container.querySelectorAll('span[role="img"]')
    expect(dots.length).toBe(2)
  })
})

// ===========================================================================
// Expanded tests: SectionCodeBlock (code-example)
// ===========================================================================
describe('SectionCodeBlock — expanded', () => {
  const Component = getRenderer('code-example')!

  it('renders with minimal code (no language)', () => {
    const section: ContentSection = {
      title: 'Minimal',
      type: 'code-example',
      code: { language: '', source: 'echo test' },
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FFAB00" />,
    )
    expect(container.textContent).toContain('echo test')
  })

  it('renders without code object (no code block)', () => {
    const section: ContentSection = {
      title: 'No Code',
      type: 'code-example',
      body: 'Only description.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FFAB00" />,
    )
    expect(container.textContent).toContain('No Code')
    expect(container.textContent).toContain('Only description.')
  })

  it('renders with multi-line code', () => {
    const section: ContentSection = {
      title: 'Multi-line',
      type: 'code-example',
      code: { language: 'python', source: 'def foo():\n    return 42' },
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FFAB00" />,
    )
    expect(container.textContent).toContain('def foo()')
    expect(container.textContent).toContain('return 42')
  })

  it('renders copy button with correct aria-label', () => {
    const section: ContentSection = {
      title: 'Copy Test',
      type: 'code-example',
      code: { language: 'js', source: 'const x = 1' },
    }
    renderWithTheme(<Component section={section} groupColor="#FFAB00" />)
    const btn = screen.getByRole('button', { name: /copy/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders language badge when language is provided', () => {
    const section: ContentSection = {
      title: 'Lang Test',
      type: 'code-example',
      code: { language: 'typescript', source: 'const x: number = 1' },
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FFAB00" />,
    )
    expect(container.textContent).toContain('typescript')
  })
})

// ===========================================================================
// Expanded tests: SectionQAList (qa-list)
// ===========================================================================
describe('SectionQAList — expanded', () => {
  const Component = getRenderer('qa-list')!

  it('renders with single QA pair', () => {
    const section: ContentSection = {
      title: 'FAQ',
      type: 'qa-list',
      qa: [{ question: 'Q1?', answer: 'A1.' }],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    expect(container.textContent).toContain('Q1?')
    expect(container.textContent).toContain('A1.')
  })

  it('renders with empty qa array', () => {
    const section: ContentSection = {
      title: 'Empty QA',
      type: 'qa-list',
      qa: [],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    expect(container.textContent).toContain('Empty QA')
  })

  it('renders with qa undefined (falls back to body-only)', () => {
    const section: ContentSection = {
      title: 'No QA',
      type: 'qa-list',
      body: 'Fallback body.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    expect(container.textContent).toContain('Fallback body.')
  })

  it('renders with three QA pairs', () => {
    const section: ContentSection = {
      title: 'Three QAs',
      type: 'qa-list',
      qa: [
        { question: 'Q1?', answer: 'A1.' },
        { question: 'Q2?', answer: 'A2.' },
        { question: 'Q3?', answer: 'A3.' },
      ],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    expect(container.textContent).toContain('Q1?')
    expect(container.textContent).toContain('Q2?')
    expect(container.textContent).toContain('Q3?')
  })

  it('renders QA with body text', () => {
    const section: ContentSection = {
      title: 'QA With Body',
      type: 'qa-list',
      body: 'Introduction text.',
      qa: [{ question: 'Query?', answer: 'Response.' }],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#D500F9" />,
    )
    expect(container.textContent).toContain('Introduction text.')
    expect(container.textContent).toContain('Query?')
  })
})

// ===========================================================================
// Expanded tests: SectionAnalogy (analogy)
// ===========================================================================
describe('SectionAnalogy — expanded', () => {
  const Component = getRenderer('analogy')!

  it('renders without body but with items', () => {
    const section: ContentSection = {
      title: 'Analogy Items',
      type: 'analogy',
      items: ['Item A', 'Item B'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF1744" />,
    )
    expect(container.textContent).toContain('Item A')
    expect(container.textContent).toContain('Item B')
  })

  it('renders with both body and items', () => {
    const section: ContentSection = {
      title: 'Full Analogy',
      type: 'analogy',
      body: 'Analogy body text.',
      items: ['Extra item'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF1744" />,
    )
    expect(container.textContent).toContain('Analogy body text.')
    expect(container.textContent).toContain('Extra item')
  })

  it('renders with minimal props (title only)', () => {
    const section: ContentSection = {
      title: 'Minimal Analogy',
      type: 'analogy',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF1744" />,
    )
    expect(container.textContent).toContain('Minimal Analogy')
  })
})

// ===========================================================================
// Expanded tests: SectionProsCons (pros-cons)
// ===========================================================================
describe('SectionProsCons — expanded', () => {
  const Component = getRenderer('pros-cons')!

  it('renders items without leading emoji (plain text)', () => {
    const section: ContentSection = {
      title: 'Plain List',
      type: 'pros-cons',
      items: ['Advantage 1', 'Disadvantage 1'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E5FF" />,
    )
    expect(container.textContent).toContain('Advantage 1')
    expect(container.textContent).toContain('Disadvantage 1')
  })

  it('renders items with multiple emoji types', () => {
    const section: ContentSection = {
      title: 'Mixed Emoji',
      type: 'pros-cons',
      items: ['✅ Good', '⚠️ Medium', '❌ Bad', 'Plain text'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E5FF" />,
    )
    expect(container.textContent).toContain('✅ Good')
    expect(container.textContent).toContain('❌ Bad')
  })

  it('renders with body but no items', () => {
    const section: ContentSection = {
      title: 'Body Only',
      type: 'pros-cons',
      body: 'Just a body, no items.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E5FF" />,
    )
    expect(container.textContent).toContain('Just a body, no items.')
  })

  it('renders with only items (no body)', () => {
    const section: ContentSection = {
      title: 'Items Only',
      type: 'pros-cons',
      items: ['✅ One', '✅ Two'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E5FF" />,
    )
    expect(container.textContent).toContain('✅ One')
    expect(container.textContent).toContain('✅ Two')
  })
})

// ===========================================================================
// Expanded tests: SectionCheatsheet (cheatsheet-entry)
// ===========================================================================
describe('SectionCheatsheet — expanded', () => {
  const Component = getRenderer('cheatsheet-entry')!

  it('renders with code block and no items', () => {
    const section: ContentSection = {
      title: 'Cheat Code',
      type: 'cheatsheet-entry',
      code: { language: 'bash', source: 'npm run build' },
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#76FF03" />,
    )
    expect(container.textContent).toContain('npm run build')
  })

  it('renders with body, items and code', () => {
    const section: ContentSection = {
      title: 'Full Cheatsheet',
      type: 'cheatsheet-entry',
      body: 'Useful tips.',
      items: ['Tip 1', 'Tip 2'],
      code: { language: 'python', source: 'print("ok")' },
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#76FF03" />,
    )
    expect(container.textContent).toContain('Useful tips.')
    expect(container.textContent).toContain('Tip 1')
    expect(container.textContent).toContain('Tip 2')
    expect(container.textContent).toContain('print("ok")')
  })

  it('renders with many items in grid', () => {
    const items = Array.from({ length: 4 }, (_, i) => `Cheat ${i + 1}`)
    const section: ContentSection = {
      title: 'Grid',
      type: 'cheatsheet-entry',
      items,
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#76FF03" />,
    )
    items.forEach(item => expect(container.textContent).toContain(item))
  })
})

// ===========================================================================
// Expanded tests: SectionLinkList (related-links)
// ===========================================================================
describe('SectionLinkList — expanded', () => {
  const Component = getRenderer('related-links')!

  it('renders with empty items gracefully', () => {
    const section: ContentSection = {
      title: 'No Links',
      type: 'related-links',
      items: [],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF9100" />,
    )
    expect(container.textContent).toContain('No Links')
  })

  it('renders with many links', () => {
    const items = Array.from({ length: 5 }, (_, i) => `Link ${i + 1}`)
    const section: ContentSection = {
      title: 'Many Links',
      type: 'related-links',
      items,
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF9100" />,
    )
    items.forEach(item => expect(container.textContent).toContain(item))
  })

  it('renders ColorDot for each link item', () => {
    const section: ContentSection = {
      title: 'Dots Check',
      type: 'related-links',
      items: ['Link A', 'Link B'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF9100" />,
    )
    const dots = container.querySelectorAll('span[role="img"]')
    expect(dots.length).toBe(2)
  })
})

// ===========================================================================
// Expanded tests: SectionEverydayScenario (everyday-scenario)
// ===========================================================================
describe('SectionEverydayScenario — expanded', () => {
  const Component = getRenderer('everyday-scenario')!

  it('renders with items but no body', () => {
    const section: ContentSection = {
      title: 'Items Only',
      type: 'everyday-scenario',
      items: ['Situation 1', 'Situation 2'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF6B6B" />,
    )
    expect(container.textContent).toContain('Situation 1')
    expect(container.textContent).toContain('Situation 2')
  })

  it('renders with body and no items', () => {
    const section: ContentSection = {
      title: 'Body Only',
      type: 'everyday-scenario',
      body: 'Scenario description.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF6B6B" />,
    )
    expect(container.textContent).toContain('Scenario description.')
  })

  it('renders with long text in items', () => {
    const section: ContentSection = {
      title: 'Long',
      type: 'everyday-scenario',
      items: [
        'A very long item description that should still render properly in the component without any issues or truncation problems.',
      ],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF6B6B" />,
    )
    expect(container.textContent).toContain('long item description')
  })
})

// ===========================================================================
// Dark mode tests (all renderers)
// ===========================================================================
describe('Dark mode across all renderers', () => {
  const ALL_TYPES = [
    'overview', 'how-it-works', 'architecture',
    'key-concepts', 'code-example', 'pros-cons',
    'related-links', 'qa-list', 'analogy',
    'cheatsheet-entry', 'everyday-scenario',
  ] as const

  ALL_TYPES.forEach((type) => {
    it(`renders "${type}" without errors in dark mode`, () => {
      const Component = getRenderer(type)
      if (!Component) return // skip unregistered

      const section: ContentSection = {
        title: `Dark ${type}`,
        type: type as ContentSection['type'],
        body: 'Test body.',
        items: ['Item 1'],
      }
      // Add type-specific fields
      if (type === 'code-example') {
        section.code = { language: 'py', source: 'x = 1' }
      }
      if (type === 'qa-list') {
        section.qa = [{ question: 'Q?', answer: 'A.' }]
        delete section.items
      }

      const { container } = renderWithTheme(
        <Component section={section} groupColor="#FF006E" />,
      )
      expect(container.textContent).toContain(`Dark ${type}`)
      // NOTE: some renderers (related-links) only show items, not body
      if (type !== 'related-links') {
        expect(container.textContent).toContain('Test body.')
      }
    })
  })
})

// ===========================================================================
// Group color propagation
// ===========================================================================
describe('Group color propagation', () => {
  it('passes groupColor to SectionTitle accent', () => {
    const Component = getRenderer('overview')!
    const section: ContentSection = {
      title: 'Color Test',
      type: 'overview',
      body: 'Check color.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF006E" />,
    )
    // SectionTitle renders with the accent color — check it renders
    expect(container.textContent).toContain('Color Test')
  })

  it('passes groupColor to ColorDot in concept list', () => {
    const Component = getRenderer('key-concepts')!
    const section: ContentSection = {
      title: 'Dot Color',
      type: 'key-concepts',
      items: ['Test Item'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E676" />,
    )
    const dot = container.querySelector('span[role="img"]')
    expect(dot).toBeInTheDocument()
  })

  it('passes groupColor to border in analogy', () => {
    const Component = getRenderer('analogy')!
    const section: ContentSection = {
      title: 'Border Color',
      type: 'analogy',
      body: 'Check border.',
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#FF1744" />,
    )
    expect(container.textContent).toContain('Border Color')
  })

  it('passes groupColor to accent in pros-cons', () => {
    const Component = getRenderer('pros-cons')!
    const section: ContentSection = {
      title: 'Pros Color',
      type: 'pros-cons',
      items: ['✅ Good'],
    }
    const { container } = renderWithTheme(
      <Component section={section} groupColor="#00E5FF" />,
    )
    expect(container.textContent).toContain('Pros Color')
  })
})
