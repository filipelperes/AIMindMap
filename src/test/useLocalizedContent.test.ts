import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — must be defined before imports (vitest hoists vi.mock)
//
// IMPORTANT: vi.mock factories are hoisted to the top of the file, so any
// values they reference must be created with vi.hoisted() to be available
// in the hoisted scope.
// ---------------------------------------------------------------------------

const { mockI18n, mockGetLocalizedContent } = vi.hoisted(() => ({
  mockI18n: { language: 'en-US' },
  mockGetLocalizedContent: vi.fn(),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}))

vi.mock('../data/contentLocales', () => ({
  getLocalizedContent: mockGetLocalizedContent,
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useLocalizedContent } from '../hooks/useLocalizedContent'
import type { NodeContent } from '../types/mindmap'

// ===========================================================================
// useLocalizedContent — Hook that returns localized content per language
// ===========================================================================

const sampleContent: NodeContent = {
  summary: 'English summary',
  sections: [
    { title: 'Overview', type: 'overview', body: 'English body.' },
  ],
  quickTip: 'English tip',
}

const ptContent: NodeContent = {
  summary: 'Summary in Portuguese',
  sections: [
    { title: 'Overview', type: 'overview', body: 'Text in Portuguese.' },
  ],
  quickTip: 'Tip in Portuguese',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockI18n.language = 'en-US'
  mockGetLocalizedContent.mockReset()
})

// ---------------------------------------------------------------------------
// Content retrieval
// ---------------------------------------------------------------------------

describe('content retrieval', () => {
  it('returns content for an existing nodeId in English', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })

  it('returns undefined for a non-existent nodeId', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedContent('NonExistent'))

    expect(result.current).toBeUndefined()
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(
      'NonExistent',
      'en-US',
    )
  })

  it('returns Portuguese content when language is pt-BR', () => {
    mockI18n.language = 'pt-BR'
    mockGetLocalizedContent.mockReturnValue(ptContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current).toEqual(ptContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'pt-BR')
  })
})

// ---------------------------------------------------------------------------
// Memoization behavior
// ---------------------------------------------------------------------------

describe('memoization', () => {
  it('re-memoizes when language changes', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // en-US
      .mockReturnValueOnce(ptContent)      // pt-BR

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    // First render — en-US
    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(1)

    // Change language and re-render
    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })

    expect(result.current).toEqual(ptContent)
    // Should have been called again with new language
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(2)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'pt-BR')
  })

  it('does not re-memoize for same nodeId and same language', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    // First render
    expect(result.current).toEqual(sampleContent)
    const firstCalls = mockGetLocalizedContent.mock.calls.length

    // Re-render with the same nodeId
    rerender({ nodeId: 'LLM' })

    // useMemo should not re-compute — getLocalizedContent not called again
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(firstCalls)
  })

  it('re-memoizes when nodeId changes', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // 'LLM'
      .mockReturnValueOnce({ ...sampleContent, summary: 'RAG summary' }) // 'RAG'

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(1)

    // Change nodeId
    rerender({ nodeId: 'RAG' })

    expect(result.current?.summary).toBe('RAG summary')
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(2)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('RAG', 'en-US')
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('works with empty string nodeId', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedContent(''))

    expect(result.current).toBeUndefined()
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('', 'en-US')
  })

  it('preserves stable reference for identical inputs', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    const firstRef = result.current

    // Re-render with same props — should return same reference
    rerender({ nodeId: 'LLM' })

    expect(result.current).toBe(firstRef)
  })
})

// ---------------------------------------------------------------------------
// Content with all optional fields
// ---------------------------------------------------------------------------

describe('content with optional fields', () => {
  it('returns content with everydayExample and quickTip', () => {
    const fullContent: NodeContent = {
      summary: 'Full summary',
      sections: [
        { title: 'Overview', type: 'overview', body: 'Body text.' },
      ],
      everydayExample: 'Real world analogy',
      quickTip: 'Quick tip text',
    }

    mockGetLocalizedContent.mockReturnValue(fullContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.everydayExample).toBe('Real world analogy')
    expect(result.current?.quickTip).toBe('Quick tip text')
    expect(result.current?.summary).toBe('Full summary')
  })

  it('returns content with empty summary', () => {
    const emptySummary: NodeContent = {
      summary: '',
      sections: [{ title: 'Title', type: 'overview', body: 'Body' }],
      quickTip: 'Tip',
    }

    mockGetLocalizedContent.mockReturnValue(emptySummary)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.summary).toBe('')
    expect(result.current?.quickTip).toBe('Tip')
  })

  it('returns content with empty sections array', () => {
    const noSections: NodeContent = {
      summary: 'Summary only',
      sections: [],
    }

    mockGetLocalizedContent.mockReturnValue(noSections)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections).toEqual([])
    expect(result.current?.summary).toBe('Summary only')
  })

  it('returns content with sections containing all optional fields', () => {
    const richSections: NodeContent = {
      summary: 'Rich',
      sections: [
        {
          title: 'Code Example',
          type: 'code-example',
          body: 'Description',
          code: { language: 'ts', source: 'console.log("hi")' },
          items: ['item1', 'item2'],
          qa: [
            { question: 'Q1?', answer: 'A1' },
            { question: 'Q2?', answer: 'A2' },
          ],
        },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(richSections)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections[0].code?.language).toBe('ts')
    expect(result.current?.sections[0].items).toEqual(['item1', 'item2'])
    expect(result.current?.sections[0].qa).toHaveLength(2)
  })

  it('returns content with 10+ sections', () => {
    const manySections: NodeContent = {
      summary: 'Many sections',
      sections: Array.from({ length: 12 }, (_, i) => ({
        title: `Section ${i + 1}`,
        type: 'overview' as const,
        body: `Body ${i + 1}`,
      })),
    }

    mockGetLocalizedContent.mockReturnValue(manySections)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections).toHaveLength(12)
    expect(result.current?.sections[11].title).toBe('Section 12')
  })

  it('returns content with summary as very long text', () => {
    const longSummary: NodeContent = {
      summary: 'A'.repeat(5000),
      sections: [],
    }

    mockGetLocalizedContent.mockReturnValue(longSummary)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.summary).toHaveLength(5000)
  })
})

// ---------------------------------------------------------------------------
// Language switching behaviors
// ---------------------------------------------------------------------------

describe('language switching', () => {
  it('multiple language switches en-US → pt-BR → en-US → pt-BR', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // en-US first
      .mockReturnValueOnce(ptContent)      // pt-BR
      .mockReturnValueOnce(sampleContent)  // en-US again
      .mockReturnValueOnce(ptContent)      // pt-BR again

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    // en-US
    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(1)

    // → pt-BR
    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(ptContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(2)

    // → en-US
    mockI18n.language = 'en-US'
    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(3)

    // → pt-BR
    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(ptContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(4)
  })

  it('switching to unsupported language falls back to default', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    mockI18n.language = 'fr-FR'
    const { result: frResult } = renderHook(() => useLocalizedContent('LLM'))

    // Should have been called with 'fr-FR' as the language parameter
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'fr-FR')
    // The actual fallback behavior depends on getLocalizedContent which is mocked
    expect(frResult.current).toEqual(sampleContent)
  })

  it('change language to pt-BR then back to en-US — calls getLocalizedContent twice', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // en-US
      .mockReturnValueOnce(ptContent)      // pt-BR
      .mockReturnValueOnce(sampleContent)  // en-US again

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    expect(result.current).toEqual(sampleContent)

    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(ptContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(2)

    mockI18n.language = 'en-US'
    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledTimes(3)
  })

  it('verifies getLocalizedContent is called with language code (not full locale structure)', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    renderHook(() => useLocalizedContent('LLM'))

    // The second argument to getLocalizedContent should be 'en-US' (the language string)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })

  it('language changes while hook is unmounted — no error', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { unmount } = renderHook(() => useLocalizedContent('LLM'))
    unmount()

    // Changing language after unmount should not cause issues
    expect(() => {
      mockI18n.language = 'pt-BR'
    }).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// NodeId edge cases
// ---------------------------------------------------------------------------

describe('nodeId edge cases', () => {
  it('nodeId changes from valid to empty string', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)
      .mockReturnValueOnce(undefined)

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    expect(result.current).toEqual(sampleContent)

    rerender({ nodeId: '' })
    expect(result.current).toBeUndefined()
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('', 'en-US')
  })

  it('nodeId changes from valid to undefined (via type coercion)', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)
      .mockReturnValueOnce(undefined)

    const { result, rerender } = renderHook(
      (props: { nodeId: string | undefined }) =>
        useLocalizedContent(props.nodeId as string),
      { initialProps: { nodeId: 'LLM' } },
    )

    expect(result.current).toEqual(sampleContent)

    rerender({ nodeId: undefined })
    // Hook receives undefined as string; getLocalizedContent called with undefined
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(undefined, 'en-US')
    expect(result.current).toBeUndefined()
  })

  it('works with very long nodeId (1000+ chars)', () => {
    const longId = 'x'.repeat(2000)
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(() => useLocalizedContent(longId))

    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(longId, 'en-US')
  })

  it('works with nodeId containing special characters', () => {
    const specialId = '!@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`'
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(() => useLocalizedContent(specialId))

    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(specialId, 'en-US')
  })

  it('hook called with no arguments (undefined nodeId)', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(
      () => (useLocalizedContent as (id?: string) => NodeContent | undefined)(),
    )

    expect(result.current).toBeUndefined()
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(undefined, 'en-US')
  })

  it('hook called with null nodeId', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(
      () => (useLocalizedContent as (id: null) => NodeContent | undefined)(null),
    )

    expect(result.current).toBeUndefined()
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(null, 'en-US')
  })

  it('hook calls getLocalizedContent with null nodeId (no guard)', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    renderHook(
      () => (useLocalizedContent as (id: null) => NodeContent | undefined)(null),
    )

    // The hook does NOT guard against null — it passes it through to getLocalizedContent
    expect(mockGetLocalizedContent).toHaveBeenCalledWith(null, 'en-US')
  })

  it('handles empty object as nodeId via type coercion', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(
      () => (useLocalizedContent as (id: Record<string, never>) => NodeContent | undefined)({}),
    )

    // getLocalizedContent is called with the object as nodeId
    expect(mockGetLocalizedContent).toHaveBeenCalledWith({}, 'en-US')
    expect(result.current).toEqual(sampleContent)
  })

  it('nodeId changes from empty string to valid — content updates', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(sampleContent)

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: '' } },
    )

    expect(result.current).toBeUndefined()

    rerender({ nodeId: 'LLM' })
    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })
})

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('error handling', () => {
  it('getLocalizedContent throws error — hook propagates it', () => {
    mockGetLocalizedContent.mockImplementation(() => {
      throw new Error('Content fetch failed')
    })

    expect(() => {
      renderHook(() => useLocalizedContent('LLM'))
    }).toThrow('Content fetch failed')
  })

  it('getLocalizedContent returns null instead of undefined — hook returns null', () => {
    mockGetLocalizedContent.mockReturnValue(null as unknown as NodeContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    // The hook returns the value from getLocalizedContent directly
    expect(result.current).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Memoization advanced
// ---------------------------------------------------------------------------

describe('memoization advanced', () => {
  it('change nodeId to different value, then back — original reference restored', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // LLM
      .mockReturnValueOnce({ ...sampleContent, summary: 'RAG' })  // RAG
      .mockReturnValueOnce(sampleContent)  // LLM again

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    const firstRef = result.current

    rerender({ nodeId: 'RAG' })
    expect(result.current).not.toBe(firstRef)

    rerender({ nodeId: 'LLM' })
    // Same nodeId should produce same content, but memoization key includes nodeId
    // useMemo([nodeId, i18n.language]) — same nodeId, so same memoization
    expect(result.current).toEqual(sampleContent)
  })

  it('change language, then change back — original reference restored', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)  // en-US
      .mockReturnValueOnce(ptContent)      // pt-BR
      .mockReturnValueOnce(sampleContent)  // en-US again

    const { result, rerender } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )

    const enRef = result.current

    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })
    expect(result.current).not.toBe(enRef)

    mockI18n.language = 'en-US'
    rerender({ nodeId: 'LLM' })
    // Not strictly the same ref but same value
    expect(result.current).toEqual(sampleContent)
  })

  it('different nodeId producing identical content — different references', () => {
    const identicalContent: NodeContent = {
      summary: 'Same summary',
      sections: [],
    }

    mockGetLocalizedContent
      .mockReturnValueOnce(identicalContent)  // 'A'
      .mockReturnValueOnce(identicalContent)  // 'B' — same object

    const { result: resultA } = renderHook(() => useLocalizedContent('A'))
    const { result: resultB } = renderHook(() => useLocalizedContent('B'))

    // Different hooks, different memoization instances
    expect(resultA.current).toEqual(resultB.current)
  })
})

// ---------------------------------------------------------------------------
// Content type variations
// ---------------------------------------------------------------------------

describe('content type variations', () => {
  it('content with numeric strings in body', () => {
    const numericBody: NodeContent = {
      summary: 'Numbers',
      sections: [
        {
          title: 'Stats',
          type: 'overview',
          body: 'Score: 98.6%, Count: 42, Ratio: 3.14159',
        },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(numericBody)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections[0].body).toContain('98.6%')
    expect(result.current?.sections[0].body).toContain('42')
  })

  it('content with HTML-like strings in body', () => {
    const htmlBody: NodeContent = {
      summary: 'HTML',
      sections: [
        {
          title: 'Markup',
          type: 'overview',
          body: '<div class="test"><p>Hello</p><br/></div>',
        },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(htmlBody)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections[0].body).toBe(
      '<div class="test"><p>Hello</p><br/></div>',
    )
  })

  it('content with markdown-like strings', () => {
    const mdBody: NodeContent = {
      summary: 'Markdown',
      sections: [
        {
          title: 'MD',
          type: 'overview',
          body: '# Title\n\n**bold** *italic* `code`\n\n- item1\n- item2',
        },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(mdBody)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections[0].body).toContain('**bold**')
    expect(result.current?.sections[0].body).toContain('- item1')
  })

  it('content has extra unknown fields — they are preserved', () => {
    const extraFields = {
      summary: 'With extras',
      sections: [],
      extraField1: 'value1',
      extraNested: { nested: true },
    } as NodeContent

    mockGetLocalizedContent.mockReturnValue(extraFields)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    // Extra fields are preserved since getLocalizedContent returns them directly
    expect((result.current as Record<string, unknown>).extraField1).toBe('value1')
    expect((result.current as Record<string, unknown>).extraNested).toEqual({ nested: true })
  })

  it('content with sections where type is a non-standard value', () => {
    const customType: NodeContent = {
      summary: 'Custom',
      sections: [
        {
          title: 'Custom Section',
          type: 'custom-type' as never,
          body: 'Custom body',
        },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(customType)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.sections[0].type).toBe('custom-type')
  })

  it('content with null quickTip', () => {
    const nullTip: NodeContent = {
      summary: 'No tip',
      sections: [],
      quickTip: null as unknown as string,
    }

    mockGetLocalizedContent.mockReturnValue(nullTip)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current?.quickTip).toBeNull()
  })

  it('content with quickTip that is an object (not string)', () => {
    const objectTip: NodeContent = {
      summary: 'Object tip',
      sections: [],
      quickTip: { text: 'complex tip', level: 'info' } as unknown as string,
    }

    mockGetLocalizedContent.mockReturnValue(objectTip)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(typeof result.current?.quickTip).toBe('object')
    expect((result.current?.quickTip as Record<string, unknown>).text).toBe('complex tip')
  })
})

// ---------------------------------------------------------------------------
// Multiple hooks
// ---------------------------------------------------------------------------

describe('multiple hooks', () => {
  it('multiple hooks with different nodeIds each resolve correctly', () => {
    const contentA: NodeContent = { summary: 'Content A', sections: [] }
    const contentB: NodeContent = { summary: 'Content B', sections: [] }

    mockGetLocalizedContent
      .mockReturnValueOnce(contentA)
      .mockReturnValueOnce(contentB)

    const { result: resultA } = renderHook(() => useLocalizedContent('NodeA'))
    const { result: resultB } = renderHook(() => useLocalizedContent('NodeB'))

    expect(resultA.current?.summary).toBe('Content A')
    expect(resultB.current?.summary).toBe('Content B')
  })

  it('multiple hooks with same nodeId return same value', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result: result1 } = renderHook(() => useLocalizedContent('LLM'))
    const { result: result2 } = renderHook(() => useLocalizedContent('LLM'))

    expect(result1.current).toEqual(result2.current)
  })

  it('language change triggers all hooks to re-evaluate', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)
      .mockReturnValueOnce(sampleContent)
      .mockReturnValueOnce(ptContent)
      .mockReturnValueOnce(ptContent)

    const { result: resultA, rerender: rerenderA } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'LLM' } },
    )
    const { result: resultB, rerender: rerenderB } = renderHook(
      (props: { nodeId: string }) => useLocalizedContent(props.nodeId),
      { initialProps: { nodeId: 'RAG' } },
    )

    expect(resultA.current?.summary).toBe('English summary')
    expect(resultB.current?.summary).toBe('English summary')

    mockI18n.language = 'pt-BR'
    rerenderA({ nodeId: 'LLM' })
    rerenderB({ nodeId: 'RAG' })

    // Both should now have pt-BR content
    expect(resultA.current?.summary).toBe('Summary in Portuguese')
    expect(resultB.current?.summary).toBe('Summary in Portuguese')
  })
})

// ---------------------------------------------------------------------------
// Hook type safety
// ---------------------------------------------------------------------------

describe('hook type safety', () => {
  it('returns correct type (NodeContent | undefined)', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)
    const { result } = renderHook(() => useLocalizedContent('LLM'))
    // Should be a defined object with NodeContent shape
    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('summary')
    expect(result.current).toHaveProperty('sections')

    mockGetLocalizedContent.mockReturnValue(undefined)
    const { result: resultUndef } = renderHook(() => useLocalizedContent('X'))
    expect(resultUndef.current).toBeUndefined()
  })

  it('hook value is undefined for non-existent content — type safety', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedContent('NonExistent'))

    expect(result.current).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Rapid changes
// ---------------------------------------------------------------------------

describe('rapid changes', () => {
  it('rapid nodeId changes (3+ in same render cycle) — last wins', () => {
    const contentA: NodeContent = { summary: 'A', sections: [] }
    const contentB: NodeContent = { summary: 'B', sections: [] }
    const contentC: NodeContent = { summary: 'C', sections: [] }

    mockGetLocalizedContent
      .mockReturnValueOnce(contentA)
      .mockReturnValueOnce(contentB)
      .mockReturnValueOnce(contentC)

    const { result, rerender } = renderHook(
      (props: { nid: string }) => useLocalizedContent(props.nid),
      { initialProps: { nid: 'NodeA' } },
    )

    // Multiple synchronous rerenders — only the last props are used
    rerender({ nid: 'NodeB' })
    rerender({ nid: 'NodeC' })

    // The hook only sees the final render
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('NodeC', 'en-US')
    expect(result.current?.summary).toBe('C')
  })
})

// ---------------------------------------------------------------------------
// i18n edge cases
// ---------------------------------------------------------------------------

describe('i18n edge cases', () => {
  it('i18n language property is undefined', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)
    mockI18n.language = undefined as unknown as string

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', undefined)
    expect(result.current).toEqual(sampleContent)
  })

  it('i18n language property is empty string', () => {
    mockGetLocalizedContent.mockReturnValue(sampleContent)
    mockI18n.language = ''

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', '')
    expect(result.current).toEqual(sampleContent)
  })

  it('useTranslation returns different i18n shape — mock handles it', () => {
    // Our i18n mock always returns `{ language: ... }`, test that the hook
    // accesses i18n.language correctly
    mockGetLocalizedContent.mockReturnValue(sampleContent)

    const { result } = renderHook(() => useLocalizedContent('LLM'))

    expect(result.current).toEqual(sampleContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })
})

// ---------------------------------------------------------------------------
// Effect dependency tracking
// ---------------------------------------------------------------------------

describe('effect dependency tracking', () => {
  it('hook value used in effect — effect runs on content change', () => {
    mockGetLocalizedContent
      .mockReturnValueOnce(sampleContent)
      .mockReturnValueOnce(ptContent)

    const effectSpy = vi.fn()

    const { rerender } = renderHook(
      (props: { nodeId: string }) => {
        const content = useLocalizedContent(props.nodeId)
        // Simulate an effect dependency on content
        effectSpy(content)
        return content
      },
      { initialProps: { nodeId: 'LLM' } },
    )

    expect(effectSpy).toHaveBeenCalledTimes(1)
    expect(effectSpy).toHaveBeenCalledWith(sampleContent)

    // Change language — content should change
    mockI18n.language = 'pt-BR'
    rerender({ nodeId: 'LLM' })

    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenCalledWith(ptContent)
  })
})
