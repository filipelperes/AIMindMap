/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import { ThemeContext } from '../store/ThemeContext'
import {
  registerRenderer,
  getRenderer,
  clearRegistry,
  getRegisteredTypes,
} from '../services/contentRegistry'
import type { SectionRendererProps } from '../services/contentRegistry'
import type { ContentSection } from '../types/mindmap'
import NodeContentRenderer from '../components/organisms/NodeContentRenderer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

/** A simple test renderer that displays its section title and props. */
function createTrackerRenderer(name: string) {
  const Tracker: React.FC<SectionRendererProps> = ({ section, groupColor }) => (
    <div data-testid={`tracker-${name}`}>
      <span data-testid="tracker-name">{name}</span>
      <span data-testid="tracker-title">{section.title}</span>
      <span data-testid="tracker-color">{groupColor}</span>
      <span data-testid="tracker-type">{section.type}</span>
    </div>
  )
  Tracker.displayName = `Tracker_${name}`
  return Tracker
}

// ---------------------------------------------------------------------------
// Per-suite cleanup
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearRegistry()
})

afterEach(() => {
  clearRegistry()
  cleanup()
})

// ===========================================================================
// Tests
// ===========================================================================

describe('contentRegistry integration', () => {
  // -------------------------------------------------------------------------
  // Register a renderer and render through NodeContentRenderer
  // -------------------------------------------------------------------------

  it('registers a renderer and renders it through NodeContentRenderer', () => {
    registerRenderer('overview', createTrackerRenderer('OverviewRenderer'))

    const section: ContentSection = {
      title: 'Integration Test',
      type: 'overview',
      body: 'Rendered via registry → NodeContentRenderer',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    expect(screen.getByTestId('tracker-name').textContent).toBe(
      'OverviewRenderer',
    )
    expect(screen.getByTestId('tracker-title').textContent).toBe(
      'Integration Test',
    )
    expect(screen.getByTestId('tracker-color').textContent).toBe('#FF006E')
  })

  // -------------------------------------------------------------------------
  // Multiple renderers work simultaneously
  // -------------------------------------------------------------------------

  it('renders different section types using different registered renderers', () => {
    registerRenderer('overview', createTrackerRenderer('OverviewRenderer'))
    registerRenderer(
      'key-concepts',
      createTrackerRenderer('KeyConceptsRenderer'),
    )

    // Render an overview section
    const overviewSection: ContentSection = {
      title: 'Overview',
      type: 'overview',
    }

    const { unmount } = renderWithTheme(
      <NodeContentRenderer
        section={overviewSection}
        groupColor="#FF006E"
      />,
    )

    expect(screen.getByTestId('tracker-name').textContent).toBe(
      'OverviewRenderer',
    )
    expect(screen.getByTestId('tracker-type').textContent).toBe('overview')

    // Clean up and render a key-concepts section
    unmount()
    cleanup()

    const conceptsSection: ContentSection = {
      title: 'Key Concepts',
      type: 'key-concepts',
    }

    renderWithTheme(
      <NodeContentRenderer
        section={conceptsSection}
        groupColor="#00E676"
      />,
    )

    expect(screen.getByTestId('tracker-name').textContent).toBe(
      'KeyConceptsRenderer',
    )
    expect(screen.getByTestId('tracker-type').textContent).toBe('key-concepts')
  })

  // -------------------------------------------------------------------------
  // Overwriting a renderer
  // -------------------------------------------------------------------------

  it('overwrites an existing renderer when a new one is registered for the same type', () => {
    registerRenderer('overview', createTrackerRenderer('Original'))
    registerRenderer('overview', createTrackerRenderer('Overwritten'))

    const section: ContentSection = {
      title: 'Overwrite Test',
      type: 'overview',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    // The overwritten renderer should be used
    expect(screen.getByTestId('tracker-name').textContent).toBe('Overwritten')
    // The original renderer elements should NOT be in the DOM
    expect(screen.queryByTestId('tracker-Original')).toBeNull()
  })

  it('getRenderer returns the last registered component for a type', () => {
    const First = createTrackerRenderer('First')
    const Second = createTrackerRenderer('Second')

    registerRenderer('code-example', First)
    registerRenderer('code-example', Second)

    const retrieved = getRenderer('code-example')
    expect(retrieved).toBe(Second)
    expect(retrieved).not.toBe(First)
  })

  // -------------------------------------------------------------------------
  // Registry is a singleton across imports
  // -------------------------------------------------------------------------

  it('registry is a singleton – registration in one module is visible in another', () => {
    // Simulate: a molecule module registers itself at import time
    const MyRenderer = createTrackerRenderer('SingletonRenderer')
    registerRenderer('analogy', MyRenderer)

    // A different "module" (still in the same test runtime) can retrieve it
    const retrieved = getRenderer('analogy')
    expect(retrieved).toBe(MyRenderer)

    // Render through NodeContentRenderer as a third module would
    const section: ContentSection = {
      title: 'Singleton Check',
      type: 'analogy',
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF1744" />,
    )

    expect(screen.getByTestId('tracker-name').textContent).toBe(
      'SingletonRenderer',
    )
  })

  // -------------------------------------------------------------------------
  // Renderer receives correct props
  // -------------------------------------------------------------------------

  it('passes the full section object and groupColor to the renderer', () => {
    const SpyRenderer: React.FC<SectionRendererProps> = ({
      section,
      groupColor,
    }) => (
      <div data-testid="spy">
        <span data-testid="spy-title">{section.title}</span>
        <span data-testid="spy-type">{section.type}</span>
        <span data-testid="spy-body">{section.body}</span>
        <span data-testid="spy-color">{groupColor}</span>
        {section.items && (
          <span data-testid="spy-items-count">{section.items.length}</span>
        )}
        {section.code && (
          <span data-testid="spy-code-lang">{section.code.language}</span>
        )}
        {section.qa && (
          <span data-testid="spy-qa-count">{section.qa.length}</span>
        )}
      </div>
    )

    registerRenderer('pros-cons', SpyRenderer)

    const section: ContentSection = {
      title: 'Spy Section',
      type: 'pros-cons',
      body: 'Spy body text',
      items: ['Item A', 'Item B'],
      code: { language: 'ts', source: 'const x = 1' },
      qa: [{ question: 'Q?', answer: 'A!' }],
    }

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#00E5FF" />,
    )

    expect(screen.getByTestId('spy-title').textContent).toBe('Spy Section')
    expect(screen.getByTestId('spy-type').textContent).toBe('pros-cons')
    expect(screen.getByTestId('spy-body').textContent).toBe('Spy body text')
    expect(screen.getByTestId('spy-color').textContent).toBe('#00E5FF')
    expect(screen.getByTestId('spy-items-count').textContent).toBe('2')
    expect(screen.getByTestId('spy-code-lang').textContent).toBe('ts')
    expect(screen.getByTestId('spy-qa-count').textContent).toBe('1')
  })

  // -------------------------------------------------------------------------
  // getRegisteredTypes
  // -------------------------------------------------------------------------

  it('getRegisteredTypes returns all registered section types', () => {
    expect(getRegisteredTypes()).toEqual([])

    registerRenderer('overview', createTrackerRenderer('O'))
    registerRenderer('key-concepts', createTrackerRenderer('K'))
    registerRenderer('code-example', createTrackerRenderer('C'))

    const types = getRegisteredTypes()
    expect(types).toContain('overview')
    expect(types).toContain('key-concepts')
    expect(types).toContain('code-example')
    expect(types).toHaveLength(3)
  })

  it('getRegisteredTypes is updated after clearRegistry', () => {
    registerRenderer('overview', createTrackerRenderer('O'))
    registerRenderer('key-concepts', createTrackerRenderer('K'))
    expect(getRegisteredTypes()).toHaveLength(2)

    clearRegistry()
    expect(getRegisteredTypes()).toEqual([])
  })

  // -------------------------------------------------------------------------
  // clearRegistry between suites
  // -------------------------------------------------------------------------

  it('clearRegistry prevents unregistered types from rendering', () => {
    registerRenderer('overview', createTrackerRenderer('WillBeCleared'))
    clearRegistry()

    const section: ContentSection = {
      title: 'After Clear',
      type: 'overview',
      body: 'Should show fallback',
    }

    const { container } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )

    // Fallback content should appear (no registered renderer)
    expect(container.textContent).toContain('After Clear')
    expect(container.textContent).toContain('Should show fallback')
    // No tracker component should be present
    expect(screen.queryByTestId(/^tracker-/)).toBeNull()
  })

  // =========================================================================
  // Same renderer for multiple types
  // =========================================================================

  it('registers the same renderer for multiple types and renders both', () => {
    const renderer = createTrackerRenderer('Multi')
    registerRenderer('type-a', renderer)
    registerRenderer('type-b', renderer)

    const { unmount } = renderWithTheme(
      <NodeContentRenderer
        section={
          { title: 'Type A', type: 'type-a' } as ContentSection
        }
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Multi')
    unmount()
    cleanup()

    renderWithTheme(
      <NodeContentRenderer
        section={
          { title: 'Type B', type: 'type-b' } as ContentSection
        }
        groupColor="#00E676"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Multi')
  })

  // =========================================================================
  // getRenderer edge cases
  // =========================================================================

  it('getRenderer returns undefined for an unregistered type', () => {
    expect(getRenderer('non-existent-type')).toBeUndefined()
  })

  it('getRenderer(null) does not crash and returns undefined', () => {
    expect(getRenderer(null as unknown as string)).toBeUndefined()
  })

  it('getRenderer(undefined) does not crash and returns undefined', () => {
    expect(getRenderer(undefined as unknown as string)).toBeUndefined()
  })

  // =========================================================================
  // getRegisteredTypes immutability
  // =========================================================================

  it('getRegisteredTypes returns a copy that cannot mutate the registry', () => {
    registerRenderer('overview', createTrackerRenderer('O'))
    registerRenderer('key-concepts', createTrackerRenderer('K'))

    const types = getRegisteredTypes()
    types.push('injected-type')

    expect(getRegisteredTypes()).toEqual(['overview', 'key-concepts'])
    expect(getRegisteredTypes()).toHaveLength(2)
  })

  // =========================================================================
  // Edge case type names
  // =========================================================================

  it('registers and renders a renderer with empty string type', () => {
    registerRenderer('', createTrackerRenderer('EmptyType'))

    const section = {
      title: 'Empty Type',
      type: '' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('EmptyType')
  })

  it('registers and renders a renderer with a very long type name', () => {
    const longType = 'x'.repeat(200)
    registerRenderer(longType, createTrackerRenderer('LongType'))

    const section = {
      title: 'Long Type',
      type: longType as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('LongType')
  })

  it('registers and renders a renderer with special characters in type name', () => {
    registerRenderer('special-!@#$%^&*()_+', createTrackerRenderer('SpecialType'))

    const section = {
      title: 'Special',
      type: 'special-!@#$%^&*()_+' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('SpecialType')
  })

  // =========================================================================
  // Re-registration behavior
  // =========================================================================

  it('re-registering the exact same component reference works', () => {
    const renderer = createTrackerRenderer('SameRef')
    registerRenderer('overview', renderer)
    registerRenderer('overview', renderer)

    const section: ContentSection = { title: 'Same Ref', type: 'overview' }
    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('SameRef')
  })

  it('registers three renderers for same type in sequence and last wins', () => {
    registerRenderer('multi', createTrackerRenderer('First'))
    registerRenderer('multi', createTrackerRenderer('Second'))
    registerRenderer('multi', createTrackerRenderer('Third'))

    const section = {
      title: 'Multi',
      type: 'multi' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Third')
    expect(screen.queryByTestId('tracker-First')).toBeNull()
    expect(screen.queryByTestId('tracker-Second')).toBeNull()
  })

  it('registers a different component for a previously registered type', () => {
    const OldRenderer = createTrackerRenderer('Old')
    const NewRenderer = createTrackerRenderer('New')

    registerRenderer('overview', OldRenderer)
    expect(getRenderer('overview')).toBe(OldRenderer)

    registerRenderer('overview', NewRenderer)
    expect(getRenderer('overview')).toBe(NewRenderer)

    const section: ContentSection = { title: 'Switched', type: 'overview' }
    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('New')
  })

  // =========================================================================
  // clearRegistry edge cases
  // =========================================================================

  it('calling clearRegistry twice is idempotent', () => {
    registerRenderer('overview', createTrackerRenderer('O'))
    clearRegistry()
    clearRegistry()
    expect(getRegisteredTypes()).toEqual([])
  })

  it('register, clear, register again works correctly', () => {
    registerRenderer('overview', createTrackerRenderer('First'))
    clearRegistry()
    registerRenderer('overview', createTrackerRenderer('Second'))

    const section: ContentSection = { title: 'Register Again', type: 'overview' }
    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Second')
    expect(getRegisteredTypes()).toEqual(['overview'])
  })

  // =========================================================================
  // Registry capacity
  // =========================================================================

  it('handles 50+ registered types without issues', () => {
    for (let i = 0; i < 55; i++) {
      registerRenderer(`type-${i}`, createTrackerRenderer(`R${i}`))
    }
    expect(getRegisteredTypes()).toHaveLength(55)

    // Verify the last one renders correctly
    const section = {
      title: 'Bulk Last',
      type: 'type-54' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('R54')
  })

  // =========================================================================
  // Null renderer
  // =========================================================================

  it('registers null as renderer and falls back gracefully', () => {
    registerRenderer(
      'null-type',
      null as unknown as React.FC<SectionRendererProps>,
    )

    const retrieved = getRenderer('null-type')
    expect(retrieved).toBeNull()

    // Null is falsy, so NodeContentRenderer should use the fallback
    const section = {
      title: 'Null Renderer',
      type: 'null-type' as ContentSection['type'],
      body: 'Fallback text',
    }
    const { container } = renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(container.textContent).toContain('Null Renderer')
    expect(container.textContent).toContain('Fallback text')
  })

  // =========================================================================
  // Renderer returning null
  // =========================================================================

  it('renders a renderer that returns null without crashing', () => {
    const NullRenderer: React.FC<SectionRendererProps> = () => null
    registerRenderer('null-renderer', NullRenderer)

    const section = {
      title: 'Null Output',
      type: 'null-renderer' as ContentSection['type'],
    }
    const { container } = renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    // Should render nothing visible; no crash
    expect(container.textContent).toBe('')
  })

  // =========================================================================
  // Renderer reads undefined fields
  // =========================================================================

  it('renderer that reads section.body when it is undefined does not crash', () => {
    const Reader: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="reader-body">{String(section.body ?? 'body-was-undefined')}</div>
    )
    registerRenderer('reader-body', Reader)

    const section: ContentSection = { title: 'Body Undefined', type: 'reader-body' as any }
    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('reader-body').textContent).toBe('body-was-undefined')
  })

  it('renderer that reads section.items when it is undefined does not crash', () => {
    const Reader: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="reader-items">{String(section.items ?? 'items-was-undefined')}</div>
    )
    registerRenderer('reader-items', Reader)

    const section: ContentSection = { title: 'Items Undefined', type: 'reader-items' as any }
    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('reader-items').textContent).toBe('items-was-undefined')
  })

  it('renderer that reads section.code when it is undefined does not crash', () => {
    const Reader: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="reader-code">{String(section.code ?? 'code-was-undefined')}</div>
    )
    registerRenderer('reader-code', Reader)

    const section: ContentSection = { title: 'Code Undefined', type: 'reader-code' as any }
    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('reader-code').textContent).toBe('code-was-undefined')
  })

  it('renderer that reads section.qa when it is undefined does not crash', () => {
    const Reader: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="reader-qa">{String(section.qa ?? 'qa-was-undefined')}</div>
    )
    registerRenderer('reader-qa', Reader)

    const section: ContentSection = { title: 'QA Undefined', type: 'reader-qa' as any }
    renderWithTheme(
      <NodeContentRenderer section={section as ContentSection} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('reader-qa').textContent).toBe('qa-was-undefined')
  })

  // =========================================================================
  // Unmount and re-mount
  // =========================================================================

  it('unmounting and re-mounting the same section type works', () => {
    registerRenderer('overview', createTrackerRenderer('Remount'))

    const section: ContentSection = { title: 'First Render', type: 'overview' }
    const { unmount } = renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Remount')
    unmount()
    cleanup()

    renderWithTheme(
      <NodeContentRenderer
        section={{ title: 'Second Render', type: 'overview' }}
        groupColor="#00E676"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Remount')
    expect(screen.getByTestId('tracker-title').textContent).toBe('Second Render')
  })

  // =========================================================================
  // Multiple simultaneous NodeContentRenderer components
  // =========================================================================

  it('renders multiple NodeContentRenderer components simultaneously with different types', () => {
    registerRenderer('overview', createTrackerRenderer('OverviewR'))
    registerRenderer('key-concepts', createTrackerRenderer('KeyConceptsR'))

    renderWithTheme(
      <div>
        <NodeContentRenderer
          section={{ title: 'First', type: 'overview' }}
          groupColor="#FF006E"
        />
        <NodeContentRenderer
          section={{ title: 'Second', type: 'key-concepts' }}
          groupColor="#00E676"
        />
      </div>,
    )

    const names = screen.getAllByTestId('tracker-name')
    expect(names).toHaveLength(2)
    expect(names[0].textContent).toBe('OverviewR')
    expect(names[1].textContent).toBe('KeyConceptsR')
  })

  // =========================================================================
  // Undefined / number type fields
  // =========================================================================

  it('handles section with undefined type field gracefully', () => {
    registerRenderer('undefined', createTrackerRenderer('Undef'))

    const section = {
      title: 'No Type',
      type: undefined as unknown as ContentSection['type'],
    }
    const { container } = renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    // getRenderer(undefined) returns undefined so fallback is shown
    expect(container.textContent).toContain('No Type')
  })

  it('handles section with type as number gracefully', () => {
    const section = {
      title: 'Number Type',
      type: 123 as unknown as ContentSection['type'],
    }
    const { container } = renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    // getRenderer('123' is not a valid key due to Map.get semantics with numbers)
    // Actually Map.get(123) won't find a string key so fallback is shown
    expect(container.textContent).toContain('Number Type')
  })

  // =========================================================================
  // Null/undefined section or groupColor
  // =========================================================================

  it('handles null section gracefully (throws expected error)', () => {
    // React will attempt to render and access section.type on null
    expect(() => {
      renderWithTheme(
        <NodeContentRenderer
          section={null as unknown as ContentSection}
          groupColor="#FF006E"
        />,
      )
    }).toThrow()
  })

  it('handles undefined groupColor gracefully', () => {
    registerRenderer('overview', createTrackerRenderer('NoColor'))

    const section: ContentSection = { title: 'No Color', type: 'overview' }
    renderWithTheme(
      <NodeContentRenderer
        section={section}
        groupColor={undefined as unknown as string}
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('NoColor')
    expect(screen.getByTestId('tracker-title').textContent).toBe('No Color')
  })

  // =========================================================================
  // Renderer that throws
  // =========================================================================

  it('catches renderer that throws during render gracefully', () => {
    const ThrowingRenderer: React.FC<SectionRendererProps> = () => {
      throw new Error('Renderer explosion')
    }
    registerRenderer('explode', ThrowingRenderer)

    const section = {
      title: 'Boom',
      type: 'explode' as ContentSection['type'],
    }
    expect(() => {
      renderWithTheme(
        <NodeContentRenderer
          section={section as ContentSection}
          groupColor="#FF006E"
        />,
      )
    }).toThrow('Renderer explosion')
  })

  // =========================================================================
  // Null entries in items / qa / code
  // =========================================================================

  it('handles section with items containing null entries gracefully', () => {
    const ItemsRenderer: React.FC<SectionRendererProps> = ({ section }) => (
      <ul data-testid="items-list">
        {section.items?.map((item, i) => (
          <li key={i} data-testid={`item-${i}`}>
            {String(item)}
          </li>
        ))}
      </ul>
    )
    registerRenderer('null-items', ItemsRenderer)

    const section = {
      title: 'Null Items',
      type: 'null-items' as ContentSection['type'],
      items: ['valid', null, 'also-valid'] as unknown as string[],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('item-0').textContent).toBe('valid')
    expect(screen.getByTestId('item-1').textContent).toBe('null')
    expect(screen.getByTestId('item-2').textContent).toBe('also-valid')
  })

  it('handles section with qa containing null entries gracefully', () => {
    const QaRenderer: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="qa-list">
        {section.qa?.map((qa, i) => (
          <div key={i} data-testid={`qa-${i}`}>
            <span data-testid={`q-${i}`}>{String(qa?.question)}</span>
            <span data-testid={`a-${i}`}>{String(qa?.answer)}</span>
          </div>
        ))}
      </div>
    )
    registerRenderer('null-qa', QaRenderer)

    const section = {
      title: 'Null QA',
      type: 'null-qa' as ContentSection['type'],
      qa: [
        { question: 'Q1', answer: 'A1' },
        null as unknown as { question: string; answer: string },
        { question: 'Q3', answer: 'A3' },
      ],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('q-0').textContent).toBe('Q1')
    // When qa entry is null, qa?.question returns undefined, String(undefined) = 'undefined'
    expect(screen.getByTestId('q-1').textContent).toBe('undefined')
    expect(screen.getByTestId('q-2').textContent).toBe('Q3')
  })

  it('handles section with code that has null language gracefully', () => {
    const CodeRenderer: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="code-block">
        <span data-testid="lang">{String(section.code?.language)}</span>
        <span data-testid="src">{String(section.code?.source)}</span>
      </div>
    )
    registerRenderer('null-lang', CodeRenderer)

    const section = {
      title: 'Null Language',
      type: 'null-lang' as ContentSection['type'],
      code: { language: null as unknown as string, source: 'code here' },
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('lang').textContent).toBe('null')
    expect(screen.getByTestId('src').textContent).toBe('code here')
  })

  it('handles section with code that has null source gracefully', () => {
    const CodeRenderer: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="code-block">
        <span data-testid="lang">{String(section.code?.language)}</span>
        <span data-testid="src">{String(section.code?.source)}</span>
      </div>
    )
    registerRenderer('null-source', CodeRenderer)

    const section = {
      title: 'Null Source',
      type: 'null-source' as ContentSection['type'],
      code: { language: 'ts', source: null as unknown as string },
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('lang').textContent).toBe('ts')
    expect(screen.getByTestId('src').textContent).toBe('null')
  })

  // =========================================================================
  // Case sensitivity
  // =========================================================================

  it('registry distinguishes between mixed case type names (case-sensitive)', () => {
    registerRenderer('Overview', createTrackerRenderer('CapitalO'))
    registerRenderer('overview', createTrackerRenderer('LowercaseO'))

    const section1 = {
      title: 'Capital',
      type: 'Overview' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section1 as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('CapitalO')
    cleanup()

    const section2 = {
      title: 'Lowercase',
      type: 'overview' as ContentSection['type'],
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section2 as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('LowercaseO')
  })

  // =========================================================================
  // Clear registry mid-render
  // =========================================================================

  it('clearing registry mid-render does not affect already rendered components', () => {
    registerRenderer('overview', createTrackerRenderer('Stable'))

    const section: ContentSection = { title: 'Stable', type: 'overview' }
    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('tracker-name').textContent).toBe('Stable')

    // Clear registry; already-mounted component should stay intact
    clearRegistry()
    expect(screen.getByTestId('tracker-name').textContent).toBe('Stable')
  })

  // =========================================================================
  // Singleton proof via dynamic import
  // =========================================================================

  it('proves contentRegistry is a singleton through dynamic import', async () => {
    registerRenderer('singleton-key', createTrackerRenderer('Singleton'))

    // Dynamic import returns the same cached module
    const registryModule = await import('../services/contentRegistry')

    expect(registryModule.getRenderer('singleton-key')).toBeDefined()
    expect(registryModule.getRenderer('singleton-key')).toBe(
      getRenderer('singleton-key'),
    )
    expect(registryModule.getRegisteredTypes()).toContain('singleton-key')
  })

  // =========================================================================
  // Insertion order
  // =========================================================================

  it('getRegisteredTypes returns types in insertion order', () => {
    registerRenderer('z-type', createTrackerRenderer('Z'))
    registerRenderer('a-type', createTrackerRenderer('A'))
    registerRenderer('m-type', createTrackerRenderer('M'))

    const types = getRegisteredTypes()
    expect(types).toEqual(['z-type', 'a-type', 'm-type'])
  })

  // =========================================================================
  // Real app renderers integration
  // =========================================================================

  it('renders with real app SectionTextBody and SectionConceptList renderers', async () => {
    // Import the real molecule components (they call registerRenderer at import time)
    // Because beforeEach() called clearRegistry(), we must re-register manually.
    // We use the imported component directly.
    const SectionTextBody = (await import('../components/molecules/SectionTextBody')).default
    const SectionConceptList = (await import('../components/molecules/SectionConceptList')).default

    clearRegistry()
    registerRenderer('overview', SectionTextBody)
    registerRenderer('how-it-works', SectionTextBody)
    registerRenderer('architecture', SectionTextBody)
    registerRenderer('key-concepts', SectionConceptList)

    // Render overview - real SectionTextBody renders a <p> for body
    renderWithTheme(
      <NodeContentRenderer
        section={{
          title: 'Real Overview',
          type: 'overview',
          body: 'Real body text',
        }}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByText('Real Overview')).toBeInTheDocument()
    expect(screen.getByText('Real body text')).toBeInTheDocument()
    cleanup()

    // Render key-concepts - real SectionConceptList renders items in a list
    renderWithTheme(
      <NodeContentRenderer
        section={{
          title: 'Real Concepts',
          type: 'key-concepts',
          items: ['Concept Item'],
        }}
        groupColor="#00E676"
      />,
    )
    expect(screen.getByText('Real Concepts')).toBeInTheDocument()
    expect(screen.getByText('Concept Item')).toBeInTheDocument()
  })

  // =========================================================================
  // ThemeContext availability in renderers
  // =========================================================================

  it('renderer can use ThemeContext via useContext hook', () => {
    // A renderer that reads from ThemeContext using the imported context
    const ThemedRenderer: React.FC<SectionRendererProps> = ({
      section,
      groupColor,
    }) => {
      const themeCtx = React.useContext(ThemeContext)
      return (
        <div data-testid="themed">
          <span data-testid="themed-title">{section.title}</span>
          <span data-testid="themed-color">{groupColor}</span>
          <span data-testid="themed-mode">{themeCtx?.mode ?? 'not-found'}</span>
        </div>
      )
    }
    registerRenderer('themed', ThemedRenderer)

    const section: ContentSection = {
      title: 'Theme Check',
      type: 'themed' as any,
    }
    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('themed-title').textContent).toBe('Theme Check')
    expect(screen.getByTestId('themed-color').textContent).toBe('#FF006E')
    // ThemeProvider should provide 'dark' as default
    expect(screen.getByTestId('themed-mode').textContent).toBe('dark')
  })

  // =========================================================================
  // JSX body
  // =========================================================================

  it('handles section body that is JSX/ReactNode content', () => {
    const JsxBodyRenderer: React.FC<SectionRendererProps> = ({ section }) => (
      <div data-testid="jsx-body">{section.body}</div>
    )
    registerRenderer('jsx-body', JsxBodyRenderer)

    const section = {
      title: 'JSX Body',
      type: 'jsx-body' as ContentSection['type'],
      body: React.createElement('em', null, 'emphasized text'),
    } as unknown as ContentSection

    renderWithTheme(
      <NodeContentRenderer section={section} groupColor="#FF006E" />,
    )
    expect(screen.getByTestId('jsx-body').innerHTML).toContain('<em>')
    expect(screen.getByTestId('jsx-body').textContent).toBe('emphasized text')
  })

  // =========================================================================
  // Multiple sequential renders
  // =========================================================================

  it('performs multiple sequential renders with the same registry state', () => {
    registerRenderer('overview', createTrackerRenderer('Sequential'))

    for (let i = 0; i < 5; i++) {
      cleanup()
      const section: ContentSection = { title: `Render ${i}`, type: 'overview' }
      renderWithTheme(
        <NodeContentRenderer section={section} groupColor="#FF006E" />,
      )
      expect(screen.getByTestId('tracker-name').textContent).toBe('Sequential')
      expect(screen.getByTestId('tracker-title').textContent).toBe(`Render ${i}`)
    }
  })

  // =========================================================================
  // Console warning spy
  // =========================================================================

  it('tracks console.warn output during renderer re-registration', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    registerRenderer('overview', createTrackerRenderer('First'))
    // Second registration with same type should trigger DEV warning
    registerRenderer('overview', createTrackerRenderer('Second'))

    expect(warnSpy).toHaveBeenCalledTimes(1)
    // The warn message is a single string containing both the prefix and the type
    const warnMsg = warnSpy.mock.calls[0][0] as string
    expect(warnMsg).toContain('contentRegistry')
    expect(warnMsg).toContain('overview')

    warnSpy.mockRestore()
  })

  // =========================================================================
  // ALL fields integration
  // =========================================================================

  it('passes section with ALL possible fields through the registry correctly', () => {
    const AllFieldsRenderer: React.FC<SectionRendererProps> = ({
      section,
      groupColor,
    }) => (
      <div data-testid="all-fields">
        <span data-testid="af-title">{section.title}</span>
        <span data-testid="af-type">{section.type}</span>
        <span data-testid="af-body">{String(section.body)}</span>
        <span data-testid="af-groupColor">{groupColor}</span>
        <span data-testid="af-items-count">
          {String(section.items?.length)}
        </span>
        <span data-testid="af-code-lang">
          {String(section.code?.language)}
        </span>
        <span data-testid="af-qa-count">
          {String(section.qa?.length)}
        </span>
      </div>
    )
    registerRenderer('all-fields', AllFieldsRenderer)

    const section = {
      title: 'Complete',
      type: 'all-fields' as ContentSection['type'],
      body: 'Body content',
      items: ['item1', 'item2'],
      code: { language: 'rust', source: 'fn main() {}' },
      qa: [{ question: 'Q?', answer: 'A!' }],
    }

    renderWithTheme(
      <NodeContentRenderer
        section={section as ContentSection}
        groupColor="#FF006E"
      />,
    )
    expect(screen.getByTestId('af-title').textContent).toBe('Complete')
    expect(screen.getByTestId('af-body').textContent).toBe('Body content')
    expect(screen.getByTestId('af-groupColor').textContent).toBe('#FF006E')
    expect(screen.getByTestId('af-items-count').textContent).toBe('2')
    expect(screen.getByTestId('af-code-lang').textContent).toBe('rust')
    expect(screen.getByTestId('af-qa-count').textContent).toBe('1')
  })
})
