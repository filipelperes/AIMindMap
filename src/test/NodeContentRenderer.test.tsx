/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import {
  registerRenderer,
  getRenderer,
  clearRegistry,
} from '../services/contentRegistry'
import type { SectionRendererProps } from '../services/contentRegistry'
import type { ContentSection } from '../types/mindmap'
import NodeContentRenderer from '../components/organisms/NodeContentRenderer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wraps the component in ThemeProvider (required by child renderers). */
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

// ---------------------------------------------------------------------------
// Registry setup helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal test renderer that outputs known text for each section
 * type so we can assert which renderer was dispatched.
 */
function createTestRenderer(sectionType: string) {
  const TestRenderer: React.FC<SectionRendererProps> = ({
    section,
    groupColor,
  }) => (
    <div data-testid={`renderer-${sectionType}`}>
      <span data-testid="renderer-type">{sectionType}</span>
      <span data-testid="received-title">{section.title}</span>
      <span data-testid="received-groupColor">{groupColor}</span>
      {section.body && (
        <span data-testid="received-body">{section.body}</span>
      )}
      {section.items && section.items.length > 0 && (
        <ul data-testid="received-items">
          {section.items.map((item, i) => (
            <li key={i} data-testid={`item-${i}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.code && (
        <div data-testid="received-code">
          <span data-testid="code-language">{section.code.language}</span>
          <pre data-testid="code-source">{section.code.source}</pre>
        </div>
      )}
      {section.qa && section.qa.length > 0 && (
        <div data-testid="received-qa">
          {section.qa.map((qa, i) => (
            <div key={i} data-testid={`qa-${i}`}>
              <span data-testid={`qa-q-${i}`}>{qa.question}</span>
              <span data-testid={`qa-a-${i}`}>{qa.answer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
  TestRenderer.displayName = `TestRenderer_${sectionType}`
  return TestRenderer
}

// ---------------------------------------------------------------------------
// Section types that the real app registers (mirrored here for testing)
// ---------------------------------------------------------------------------

const SECTION_TYPES = [
  'overview',
  'key-concepts',
  'code-example',
  'pros-cons',
  'related-links',
  'qa-list',
  'analogy',
  'cheatsheet-entry',
  'everyday-scenario',
] as const

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NodeContentRenderer', () => {
  beforeEach(() => {
    clearRegistry()
    // Register a test renderer for every known section type
    for (const type of SECTION_TYPES) {
      registerRenderer(type, createTestRenderer(type))
    }
  })

  afterEach(() => {
    clearRegistry()
    cleanup()
  })

  // -------------------------------------------------------------------------
  // Each registered section type dispatches to the correct renderer
  // -------------------------------------------------------------------------

  for (const sectionType of SECTION_TYPES) {
    it(`renders "${sectionType}" section type using the registered renderer`, () => {
      const section: ContentSection = {
        title: `Test ${sectionType}`,
        type: sectionType as ContentSection['type'],
        body: 'Body content',
      }

      renderWithTheme(
        <NodeContentRenderer section={section} groupColor="#FF006E" />,
      )

      // The test renderer stamps its type into a data-testid element
      expect(screen.getByTestId('renderer-type').textContent).toBe(sectionType)
      expect(screen.getByTestId('received-title').textContent).toBe(
        `Test ${sectionType}`,
      )
    })
  }

  // -------------------------------------------------------------------------
  // Fallback for unregistered type
  // -------------------------------------------------------------------------

  it('shows fallback content for an unregistered section type', () => {
    const section: ContentSection = {
      title: 'Unknown Type',
      type: 'how-it-works' as ContentSection['type'], // Not registered in this test
      body: 'Fallback body',
    }

    // Clear all registered renderers
    clearRegistry()

    const { container } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    // The fallback renders title and body in a plain div
    expect(container.textContent).toContain('Unknown Type')
    expect(container.textContent).toContain('Fallback body')
  })

  it('displays section title in the fallback when no renderer is registered', () => {
    clearRegistry()
    const section: ContentSection = {
      title: 'Only Title',
      type: 'overview' as ContentSection['type'],
      body: 'Some body',
    }

    const { container } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(container.textContent).toContain('Only Title')
    expect(container.textContent).toContain('Some body')
  })

  // -------------------------------------------------------------------------
  // Section body
  // -------------------------------------------------------------------------

  it('renders section body when present', () => {
    const section: ContentSection = {
      title: 'With Body',
      type: 'overview',
      body: 'This is the section body.',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00E676" />,
    )
    expect(screen.getByTestId('received-body').textContent).toBe(
      'This is the section body.',
    )
  })

  it('handles missing body gracefully', () => {
    const section: ContentSection = {
      title: 'No Body',
      type: 'overview',
      // no body
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00E676" />,
    )
    // Should still render the title
    expect(screen.getByTestId('received-title').textContent).toBe('No Body')
    expect(screen.queryByTestId('received-body')).toBeNull()
  })

  // -------------------------------------------------------------------------
  // Items
  // -------------------------------------------------------------------------

  it('renders items when section has items', () => {
    const section: ContentSection = {
      title: 'Items Section',
      type: 'key-concepts',
      items: ['First item', 'Second item', 'Third item'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00B0FF" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('First item')
    expect(items[1].textContent).toBe('Second item')
    expect(items[2].textContent).toBe('Third item')
  })

  it('handles empty items array gracefully', () => {
    const section: ContentSection = {
      title: 'Empty Items',
      type: 'key-concepts',
      items: [],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00B0FF" />,
    )
    expect(screen.getByTestId('received-title').textContent).toBe('Empty Items')
    expect(screen.queryByTestId('received-items')).toBeNull()
  })

  // -------------------------------------------------------------------------
  // Code block
  // -------------------------------------------------------------------------

  it('renders code block with language and source when section has code', () => {
    const section: ContentSection = {
      title: 'Code Example',
      type: 'code-example',
      body: 'Example description.',
      code: {
        language: 'python',
        source: 'print("hello world")',
      },
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FFAB00" />,
    )

    expect(screen.getByTestId('code-language').textContent).toBe('python')
    expect(screen.getByTestId('code-source').textContent).toBe(
      'print("hello world")',
    )
  })

  it('renders code block without language badge when language is empty', () => {
    const section: ContentSection = {
      title: 'Code No Lang',
      type: 'code-example',
      code: {
        language: '',
        source: 'console.log("test")',
      },
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FFAB00" />,
    )

    expect(screen.getByTestId('received-code')).toBeInTheDocument()
    expect(screen.getByTestId('code-source').textContent).toBe(
      'console.log("test")',
    )
  })

  // -------------------------------------------------------------------------
  // QA list
  // -------------------------------------------------------------------------

  it('renders QA list with questions and answers', () => {
    const section: ContentSection = {
      title: 'FAQ',
      type: 'qa-list',
      qa: [
        { question: 'What is this?', answer: 'A test.' },
        { question: 'How does it work?', answer: 'By testing.' },
      ],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#D500F9" />,
    )

    expect(screen.getByTestId('qa-0')).toBeInTheDocument()
    expect(screen.getByTestId('qa-q-0').textContent).toBe('What is this?')
    expect(screen.getByTestId('qa-a-0').textContent).toBe('A test.')
    expect(screen.getByTestId('qa-q-1').textContent).toBe('How does it work?')
    expect(screen.getByTestId('qa-a-1').textContent).toBe('By testing.')
  })

  it('handles QA list with empty qa array gracefully', () => {
    const section: ContentSection = {
      title: 'Empty QA',
      type: 'qa-list',
      qa: [],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#D500F9" />,
    )
    expect(screen.getByTestId('received-title').textContent).toBe('Empty QA')
    expect(screen.queryByTestId('received-qa')).toBeNull()
  })

  // -------------------------------------------------------------------------
  // Props passed to child components
  // -------------------------------------------------------------------------

  it('passes groupColor prop to the rendered child component', () => {
    const section: ContentSection = {
      title: 'Color Test',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-groupColor').textContent).toBe(
      '#FF006E',
    )
  })

  it('passes groupColor when it is a different color', () => {
    const section: ContentSection = {
      title: 'Color Test 2',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00E676" />,
    )

    expect(screen.getByTestId('received-groupColor').textContent).toBe(
      '#00E676',
    )
  })

  // -------------------------------------------------------------------------
  // Empty / minimal sections
  // -------------------------------------------------------------------------

  it('renders a minimal section with only title gracefully', () => {
    const section: ContentSection = {
      title: 'Minimal',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-title').textContent).toBe('Minimal')
    // No body, no items, no code, no qa → none of these should be in the DOM
    expect(screen.queryByTestId('received-body')).toBeNull()
    expect(screen.queryByTestId('received-items')).toBeNull()
    expect(screen.queryByTestId('received-code')).toBeNull()
    expect(screen.queryByTestId('received-qa')).toBeNull()
  })

  // =========================================================================
  // Detailed structure checks for specific section types
  // =========================================================================

  it('renders "analogy" section type with body text', () => {
    const section: ContentSection = {
      title: 'Analogy Title',
      type: 'analogy',
      body: 'This is like a garden hose — data flows through it.',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('renderer-type').textContent).toBe('analogy')
    expect(screen.getByTestId('received-title').textContent).toBe('Analogy Title')
    expect(screen.getByTestId('received-body').textContent).toBe(
      'This is like a garden hose — data flows through it.',
    )
  })

  it('renders "cheatsheet-entry" with code and items', () => {
    const section: ContentSection = {
      title: 'Cheatsheet',
      type: 'cheatsheet-entry',
      body: 'Quick reference',
      code: { language: 'bash', source: 'npm run build' },
      items: ['Install deps', 'Run build', 'Deploy'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('renderer-type').textContent).toBe('cheatsheet-entry')
    expect(screen.getByTestId('code-language').textContent).toBe('bash')
    expect(screen.getByTestId('code-source').textContent).toBe('npm run build')
    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('Install deps')
  })

  it('renders "everyday-scenario" with scenario body', () => {
    const section: ContentSection = {
      title: 'Real World',
      type: 'everyday-scenario',
      body: 'When you stream a video, AI optimizes the bitrate in real time.',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('renderer-type').textContent).toBe('everyday-scenario')
    expect(screen.getByTestId('received-body').textContent).toContain(
      'stream a video',
    )
  })

  it('renders "related-links" with items list', () => {
    const section: ContentSection = {
      title: 'Links',
      type: 'related-links',
      items: ['https://example.com', 'https://docs.example.org', '/local/path'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('renderer-type').textContent).toBe('related-links')
    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
    expect(items[2].textContent).toBe('/local/path')
  })

  it('renders "pros-cons" with items list', () => {
    const section: ContentSection = {
      title: 'Pros & Cons',
      type: 'pros-cons',
      items: ['Fast performance', 'Easy to learn', 'Limited ecosystem'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('renderer-type').textContent).toBe('pros-cons')
    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('Fast performance')
  })

  // =========================================================================
  // All fields populated
  // =========================================================================

  it('renders section with ALL fields populated simultaneously', () => {
    const section: ContentSection = {
      title: 'Complete Section',
      type: 'overview',
      body: 'Main body text.',
      items: ['Item A', 'Item B'],
      code: { language: 'ts', source: 'const x = 1;' },
      qa: [
        { question: 'Q1?', answer: 'A1' },
        { question: 'Q2?', answer: 'A2' },
      ],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-title').textContent).toBe('Complete Section')
    expect(screen.getByTestId('received-body').textContent).toBe('Main body text.')
    expect(screen.getAllByTestId(/^item-/)).toHaveLength(2)
    expect(screen.getByTestId('code-language').textContent).toBe('ts')
    expect(screen.getByTestId('code-source').textContent).toBe('const x = 1;')
    // QA entries - check specific QA divs (data-testid="qa-0", "qa-1")
    // Note: /^qa-/ also matches qa-q-*, qa-a-* so we check individual entries
    expect(screen.getByTestId('qa-0')).toBeInTheDocument()
    expect(screen.getByTestId('qa-1')).toBeInTheDocument()
    expect(screen.getByTestId('qa-q-0').textContent).toBe('Q1?')
    expect(screen.getByTestId('qa-a-0').textContent).toBe('A1')
  })

  // =========================================================================
  // Long content
  // =========================================================================

  it('handles very long title text without breaking', () => {
    const longTitle = 'A'.repeat(500)
    const section: ContentSection = {
      title: longTitle,
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const titleEl = screen.getByTestId('received-title')
    expect(titleEl.textContent).toBe(longTitle)
    expect(titleEl.textContent!.length).toBe(500)
  })

  it('handles very long body text without breaking', () => {
    const longBody = 'Lorem ipsum dolor sit amet, '.repeat(100)
    const section: ContentSection = {
      title: 'Long Body',
      type: 'overview',
      body: longBody,
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-body').textContent).toBe(longBody)
  })

  // =========================================================================
  // Special characters
  // =========================================================================

  it('renders special characters in title (&, <, >, quotes)', () => {
    const section: ContentSection = {
      title: 'AT&T <Test> "Quoted" \'Single\' & More',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const titleEl = screen.getByTestId('received-title')
    expect(titleEl.textContent).toContain('AT&T')
    expect(titleEl.textContent).toContain('<Test>')
    expect(titleEl.textContent).toContain('"Quoted"')
  })

  it('renders special characters in body (HTML entities, unicode)', () => {
    const section: ContentSection = {
      title: 'Special Body',
      type: 'overview',
      body: 'HTML entities: &amp; &lt; &gt; Unicode: → ∑ ∞ ✓ Emoji: 🚀',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const bodyEl = screen.getByTestId('received-body')
    expect(bodyEl.textContent).toContain('HTML entities:')
    expect(bodyEl.textContent).toContain('amp')
    expect(bodyEl.textContent).toContain('🚀')
  })

  // =========================================================================
  // GroupColor edge cases
  // =========================================================================

  it('renders correctly when groupColor is an empty string', () => {
    const section: ContentSection = {
      title: 'Empty Color',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="" />,
    )

    expect(screen.getByTestId('received-groupColor').textContent).toBe('')
    expect(screen.getByTestId('received-title').textContent).toBe('Empty Color')
  })

  it('renders correctly when groupColor is undefined', () => {
    const section: ContentSection = {
      title: 'Undefined Color',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer
        section={section}
        groupColor={undefined as unknown as string}
      />,
    )

    expect(screen.getByTestId('received-title').textContent).toBe('Undefined Color')
  })

  // =========================================================================
  // Section type edge cases
  // =========================================================================

  it('renders fallback when section type is a long unregistered string', () => {
    const longType = 'a-very-long-section-type-name-that-is-not-registered'
    const section: ContentSection = {
      title: 'Long Type',
      type: longType as ContentSection['type'],
      body: 'Fallback body text',
    }

    const { container } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(container.textContent).toContain('Long Type')
    expect(container.textContent).toContain('Fallback body text')
  })

  it('renders multiple sections sequentially via array map', () => {
    const sections: ContentSection[] = [
      { title: 'First Section', type: 'overview', body: 'First body' },
      { title: 'Second Section', type: 'key-concepts', items: ['Item'] },
    ]

    renderWithTheme(
      <div>
        {sections.map((s, i) => (
          <NodeContentRenderer key={i} section={s} groupColor="#FF006E" />
        ))}
      </div>,
    )

    const titles = screen.getAllByTestId('received-title')
    expect(titles).toHaveLength(2)
    expect(titles[0].textContent).toBe('First Section')
    expect(titles[1].textContent).toBe('Second Section')
    expect(screen.getByTestId('received-body').textContent).toBe('First body')
    expect(screen.getByTestId('item-0').textContent).toBe('Item')
  })

  it('renders items containing non-string values gracefully', () => {
    const section = {
      title: 'Mixed Items',
      type: 'overview' as ContentSection['type'],
      items: [123, true, null] as unknown as string[],
    }

    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(3)
    // Numbers render as strings; booleans and null are not rendered by React
    expect(items[0].textContent).toBe('123')
    expect(items[1].textContent).toBe('')
    expect(items[2].textContent).toBe('')
  })

  // =========================================================================
  // Code block edge cases
  // =========================================================================

  it('renders code block with empty source gracefully', () => {
    const section: ContentSection = {
      title: 'Empty Code',
      type: 'code-example',
      code: { language: 'text', source: '' },
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-code')).toBeInTheDocument()
    expect(screen.getByTestId('code-language').textContent).toBe('text')
    expect(screen.getByTestId('code-source').textContent).toBe('')
  })

  it('renders code with multi-line source', () => {
    const multiLineCode = `function hello() {
  console.log("world")
  return 42
}`
    const section: ContentSection = {
      title: 'Multi-line Code',
      type: 'code-example',
      code: { language: 'javascript', source: multiLineCode },
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('code-source').textContent).toBe(multiLineCode)
    expect(screen.getByTestId('code-source').textContent).toContain('\n')
    expect(screen.getByTestId('code-language').textContent).toBe('javascript')
  })

  it('renders code block where language includes a version number', () => {
    const section: ContentSection = {
      title: 'Versioned Language',
      type: 'code-example',
      code: { language: 'python3.11', source: 'print("hello")' },
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('code-language').textContent).toBe('python3.11')
    expect(screen.getByTestId('code-source').textContent).toBe('print("hello")')
  })

  // =========================================================================
  // QA edge cases
  // =========================================================================

  it('renders QA with very long question and answer text', () => {
    const longQ = 'What? '.repeat(50)
    const longA = 'Because. '.repeat(50)
    const section: ContentSection = {
      title: 'Long QA',
      type: 'qa-list',
      qa: [{ question: longQ, answer: longA }],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('qa-0')).toBeInTheDocument()
    expect(screen.getByTestId('qa-q-0').textContent).toBe(longQ)
    expect(screen.getByTestId('qa-a-0').textContent).toBe(longA)
  })

  it('handles QA with missing question field gracefully', () => {
    const section = {
      title: 'QA Missing Q',
      type: 'qa-list' as ContentSection['type'],
      qa: [{ answer: 'Answer without a question' }] as unknown as {
        question: string
        answer: string
      }[],
    }

    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('qa-0')).toBeInTheDocument()
    expect(screen.getByTestId('qa-a-0').textContent).toBe('Answer without a question')
  })

  it('handles QA with missing answer field gracefully', () => {
    const section = {
      title: 'QA Missing A',
      type: 'qa-list' as ContentSection['type'],
      qa: [{ question: 'Question without answer' }] as unknown as {
        question: string
        answer: string
      }[],
    }

    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('qa-0')).toBeInTheDocument()
    expect(screen.getByTestId('qa-q-0').textContent).toBe('Question without answer')
  })

  it('renders QA with special characters in questions', () => {
    const section: ContentSection = {
      title: 'Special QA',
      type: 'qa-list',
      qa: [
        { question: 'What is "AI" & <ML>?', answer: "It's a field." },
        { question: 'A → B?', answer: 'Yes: ✓' },
      ],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('qa-q-0').textContent).toContain('"AI"')
    expect(screen.getByTestId('qa-q-0').textContent).toContain('<ML>')
    expect(screen.getByTestId('qa-q-1').textContent).toContain('→')
    expect(screen.getByTestId('qa-a-1').textContent).toContain('✓')
  })

  it('renders multiple QA items (10+ entries)', () => {
    const qa = Array.from({ length: 12 }, (_, i) => ({
      question: `Question ${i + 1}?`,
      answer: `Answer ${i + 1}.`,
    }))
    const section: ContentSection = {
      title: 'Many QA',
      type: 'qa-list',
      qa,
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    for (let i = 0; i < 12; i++) {
      expect(screen.getByTestId(`qa-q-${i}`).textContent).toBe(`Question ${i + 1}?`)
      expect(screen.getByTestId(`qa-a-${i}`).textContent).toBe(`Answer ${i + 1}.`)
    }
  })

  // =========================================================================
  // Items edge cases
  // =========================================================================

  it('renders key-concepts with multi-line items', () => {
    const section: ContentSection = {
      title: 'Multi-line Items',
      type: 'key-concepts',
      items: [
        'First line\nSecond line\nThird line',
        'Single line item',
      ],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toContain('First line')
    expect(items[0].textContent).toContain('\n')
    expect(items[0].textContent).toContain('Third line')
  })

  it('renders items with duplicate values', () => {
    const section: ContentSection = {
      title: 'Duplicate Items',
      type: 'key-concepts',
      items: ['Same', 'Same', 'Different', 'Same'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(4)
    expect(items[0].textContent).toBe('Same')
    expect(items[1].textContent).toBe('Same')
    expect(items[2].textContent).toBe('Different')
    expect(items[3].textContent).toBe('Same')
  })

  it('renders items with empty strings gracefully', () => {
    const section: ContentSection = {
      title: 'Empty Items',
      type: 'key-concepts',
      items: ['Valid', '', 'Also valid', ''],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(4)
    expect(items[0].textContent).toBe('Valid')
    expect(items[1].textContent).toBe('')
    expect(items[3].textContent).toBe('')
  })

  it('handles items with a single item (edge case of 1-item array)', () => {
    const section: ContentSection = {
      title: 'Single Item',
      type: 'key-concepts',
      items: ['Only one'],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const items = screen.getAllByTestId(/^item-/)
    expect(items).toHaveLength(1)
    expect(items[0].textContent).toBe('Only one')
  })

  // =========================================================================
  // Missing / edge case field values
  // =========================================================================

  it('renders overview section with all optional fields missing (title + type only)', () => {
    const section: ContentSection = {
      title: 'Bare Minimum',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-title').textContent).toBe('Bare Minimum')
    expect(screen.queryByTestId('received-body')).toBeNull()
    expect(screen.queryByTestId('received-items')).toBeNull()
    expect(screen.queryByTestId('received-code')).toBeNull()
    expect(screen.queryByTestId('received-qa')).toBeNull()
  })

  it('handles section with no title (only body) gracefully', () => {
    const section = {
      type: 'overview' as ContentSection['type'],
      body: 'Body without a title.',
    } as ContentSection

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-body').textContent).toBe('Body without a title.')
  })

  it('renders code-example section without code object (just title + body)', () => {
    const section: ContentSection = {
      title: 'Code Section',
      type: 'code-example',
      body: 'This section describes code without showing it.',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-body').textContent).toBe(
      'This section describes code without showing it.',
    )
    expect(screen.queryByTestId('received-code')).toBeNull()
  })

  it('renders body containing markdown-like text', () => {
    const markdownBody =
      '# Heading\n\n**bold** and *italic* and `code`\n\n- list item\n\n[link](url)'
    const section: ContentSection = {
      title: 'Markdown Body',
      type: 'overview',
      body: markdownBody,
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const bodyEl = screen.getByTestId('received-body')
    expect(bodyEl.textContent).toContain('# Heading')
    expect(bodyEl.textContent).toContain('**bold**')
    expect(bodyEl.textContent).toContain('[link](url)')
  })

  it('handles section body as empty string', () => {
    const section: ContentSection = {
      title: 'Empty Body',
      type: 'overview',
      body: '',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('received-title').textContent).toBe('Empty Body')
    expect(screen.queryByTestId('received-body')).toBeNull()
  })

  it('handles body with only whitespace characters', () => {
    const section: ContentSection = {
      title: 'Whitespace Body',
      type: 'overview',
      body: '   \t  \n  ',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    const bodyEl = screen.getByTestId('received-body')
    expect(bodyEl).toBeInTheDocument()
    expect(bodyEl.textContent).toBe('   \t  \n  ')
  })

  it('explicitly verifies renderer behavior with body as undefined vs empty string', () => {
    // Test 1: body is undefined (no body field at all)
    const sectionUndefined: ContentSection = {
      title: 'Undefined Body',
      type: 'overview',
    }

    const { unmount } = renderWithTheme(
      <NodeContentRenderer section={sectionUndefined} groupColor="#FF006E" />,
    )

    expect(screen.queryByTestId('received-body')).toBeNull()
    unmount()
    cleanup()

    // Test 2: body is empty string
    const sectionEmpty: ContentSection = {
      title: 'Empty String Body',
      type: 'overview',
      body: '',
    }

    renderWithTheme(
      <NodeContentRenderer section={sectionEmpty} groupColor="#FF006E" />,
    )

    expect(screen.queryByTestId('received-body')).toBeNull()
    expect(screen.getByTestId('received-title').textContent).toBe(
      'Empty String Body',
    )
  })

  // =========================================================================
  // Container / wrapper
  // =========================================================================

  it('renders within a container with custom className', () => {
    const section: ContentSection = {
      title: 'Custom Container',
      type: 'overview',
    }

    const { container } = renderWithTheme(
      <div className="custom-content-wrapper" data-testid="outer-wrapper">
        <NodeContentRenderer section={section} groupColor="#FF006E" />
      </div>,
    )

    expect(
      container.querySelector('.custom-content-wrapper'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('received-title').textContent).toBe(
      'Custom Container',
    )
  })

  // =========================================================================
  // Invalid type fallback
  // =========================================================================

  it('renders fallback for an invalid section type not in the type union', () => {
    const section: ContentSection = {
      title: 'Invalid Type',
      type: 'totally-invalid-type' as ContentSection['type'],
      body: 'Fallback content for invalid type',
    }

    const { container } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(container.textContent).toContain('Invalid Type')
    expect(container.textContent).toContain('Fallback content for invalid type')
  })
})
