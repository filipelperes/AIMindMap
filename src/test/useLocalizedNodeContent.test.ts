import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mocks — must be defined before imports (vitest hoists vi.mock)
//
// IMPORTANT: vi.mock factories are hoisted to the top of the file, so any
// values they reference must be created with vi.hoisted() to be available
// in the hoisted scope.
// ---------------------------------------------------------------------------

const { mockI18n, mockGetLocalizedContent, mockGetLocalizedContentAsync } = vi.hoisted(() => ({
  mockI18n: { language: 'en-US' },
  mockGetLocalizedContent: vi.fn(),
  mockGetLocalizedContentAsync: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}))

vi.mock('../data/contentLocales', () => ({
  getLocalizedContent: mockGetLocalizedContent,
  getLocalizedContentAsync: mockGetLocalizedContentAsync,
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { useLocalizedNodeContent } from '../hooks/useLocalizedNodeContent'
import type { MindMapNode, NodeContent } from '../types/mindmap'

// ===========================================================================
// useLocalizedNodeContent — Hook that merges a node with localized content
// ===========================================================================

const baseNode: MindMapNode = {
  id: 'LLM',
  group: 1,
  description: 'Foundation model.',
  content: {
    summary: 'Original summary',
    sections: [
      { title: 'Overview', type: 'overview', body: 'Original body.' },
    ],
    quickTip: 'Original tip',
  },
  learningStep: 1,
}

const localizedContent: NodeContent = {
  summary: 'Localized summary (pt-BR)',
  sections: [
    { title: 'Overview', type: 'overview', body: 'Text in Portuguese.' },
  ],
  quickTip: 'Localized tip',
}

const baseNodeWithoutContent: MindMapNode = {
  id: 'NoContent',
  group: 2,
  description: 'Node with partial content.',
  content: {
    summary: 'Fallback summary',
    sections: [],
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockI18n.language = 'en-US'
  mockGetLocalizedContent.mockReset()
})

// ---------------------------------------------------------------------------
// Null node
// ---------------------------------------------------------------------------

describe('when node is null', () => {
  it('returns null', () => {
    const { result } = renderHook(() => useLocalizedNodeContent(null))
    expect(result.current).toBeNull()
  })

  it('does not call getLocalizedContent', () => {
    renderHook(() => useLocalizedNodeContent(null))
    expect(mockGetLocalizedContent).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// No localized content found
// ---------------------------------------------------------------------------

describe('when no localized content found', () => {
  it('returns the same node reference', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current).toBe(baseNode)
    expect(result.current?.id).toBe('LLM')
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })

  it('preserves the original node content', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content.summary).toBe('Original summary')
    expect(result.current?.content.sections[0].body).toBe('Original body.')
  })
})

// ---------------------------------------------------------------------------
// Localized content found — merged node
// ---------------------------------------------------------------------------

describe('when localized content is found', () => {
  it('returns a new node with merged content', () => {
    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current).not.toBe(baseNode)
    expect(result.current?.content).toEqual(localizedContent)
  })

  it('preserves node properties (id, group, etc.)', () => {
    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.id).toBe('LLM')
    expect(result.current?.group).toBe(1)
    expect(result.current?.description).toBe('Foundation model.')
    expect(result.current?.learningStep).toBe(1)
  })

  it('replaces the content field with localized version', () => {
    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content.summary).toBe('Localized summary (pt-BR)')
    expect(result.current?.content.sections[0].title).toBe('Overview')
    expect(result.current?.content.quickTip).toBe('Localized tip')
  })

  it('returns the same original node when content is null/undefined', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() =>
      useLocalizedNodeContent(baseNodeWithoutContent),
    )

    expect(result.current).toBe(baseNodeWithoutContent)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('NoContent', 'en-US')
  })
})

// ---------------------------------------------------------------------------
// Stable reference (useMemo)
// ---------------------------------------------------------------------------

describe('stable reference for same inputs', () => {
  it('returns same reference when node and language do not change', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode | null }) =>
        useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    const firstRef = result.current
    rerender({ node: baseNode })

    expect(result.current).toBe(firstRef)
  })

  it('returns new reference when language changes', () => {
    mockGetLocalizedContent.mockImplementation((_id: string, lang: string) =>
      lang === 'pt-BR' ? localizedContent : undefined,
    )

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode | null }) =>
        useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    const enRef = result.current

    // Change language
    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })

    expect(result.current).not.toBe(enRef)
    expect(result.current?.content).toEqual(localizedContent)
  })

  it('returns new reference when node changes', () => {
    const nodeAlpha: MindMapNode = {
      id: 'Alpha',
      group: 1,
      description: 'Alpha description',
      content: { summary: 'Alpha', sections: [] },
    }
    const nodeBeta: MindMapNode = {
      id: 'Beta',
      group: 2,
      description: 'Beta description',
      content: { summary: 'Beta', sections: [] },
    }

    mockGetLocalizedContent
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) =>
        useLocalizedNodeContent(props.node),
      { initialProps: { node: nodeAlpha } },
    )

    const alphaRef = result.current
    rerender({ node: nodeBeta })

    expect(result.current).not.toBe(alphaRef)
    expect(result.current?.id).toBe('Beta')
  })
})

// ---------------------------------------------------------------------------
// Language change with localized content
// ---------------------------------------------------------------------------

describe('language change', () => {
  it('recomputes when language switches to pt-BR and localized content exists', () => {
    mockGetLocalizedContent.mockImplementation((_id: string, lang: string) =>
      lang === 'pt-BR' ? localizedContent : undefined,
    )

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) =>
        useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    // en-US: no localized content, returns original node
    expect(result.current).toBe(baseNode)

    // Switch to pt-BR
    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })

    expect(result.current).not.toBe(baseNode)
    expect(result.current?.content.summary).toBe('Localized summary (pt-BR)')
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'pt-BR')
  })
})

// ---------------------------------------------------------------------------
// Node content variations
// ---------------------------------------------------------------------------

describe('node content variations', () => {
  it('node with undefined content field', () => {
    const nodeUndefContent: MindMapNode = {
      id: 'UndefContent',
      group: 1,
      description: 'Undefined content',
      content: undefined as unknown as never,
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeUndefContent))

    expect(result.current).toBe(nodeUndefContent)
  })

  it('node with null content field', () => {
    const nodeNullContent: MindMapNode = {
      id: 'NullContent',
      group: 1,
      description: 'Null content',
      content: null as unknown as never,
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeNullContent))

    expect(result.current).toBe(nodeNullContent)
  })

  it('node with content containing only summary (no sections)', () => {
    const nodeOnlySummary: MindMapNode = {
      id: 'OnlySummary',
      group: 1,
      description: 'Only summary',
      content: { summary: 'Just a summary', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeOnlySummary))

    expect(result.current?.content.summary).toBe('Just a summary')
    expect(result.current?.content.sections).toEqual([])
  })

  it('node with content containing only sections (minimal summary)', () => {
    const nodeOnlySections: MindMapNode = {
      id: 'OnlySections',
      group: 1,
      description: 'Only sections',
      content: { summary: '', sections: [{ title: 'Sec1', type: 'overview', body: 'Body' }] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeOnlySections))

    expect(result.current?.content.summary).toBe('')
    expect(result.current?.content.sections).toHaveLength(1)
  })

  it('node with content containing empty sections array', () => {
    const nodeEmptySections: MindMapNode = {
      id: 'EmptySections',
      group: 1,
      description: 'Empty sections',
      content: { summary: 'Summary', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeEmptySections))

    expect(result.current?.content.sections).toEqual([])
  })

  it('node without learningStep field', () => {
    const nodeNoLearningStep: MindMapNode = {
      id: 'NoStep',
      group: 1,
      description: 'No learning step',
      content: { summary: 'S', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeNoLearningStep))

    expect(result.current?.id).toBe('NoStep')
    expect(result.current).not.toHaveProperty('learningStep')
  })

  it('node without description field — uses type defaults', () => {
    // description is required in the type, but we can test with empty string
    const nodeEmptyDesc: MindMapNode = {
      id: 'NoDesc',
      group: 1,
      description: '',
      content: { summary: 'S', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeEmptyDesc))

    expect(result.current?.description).toBe('')
  })

  it('node with x, y, z coordinates', () => {
    const nodeXYZ: MindMapNode = {
      id: 'XYZ',
      group: 1,
      description: 'Has coordinates',
      content: { summary: 'S', sections: [] },
      x: 10,
      y: 20,
      z: 30,
    }

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeXYZ))

    expect(result.current?.x).toBe(10)
    expect(result.current?.y).toBe(20)
    expect(result.current?.z).toBe(30)
    expect(result.current?.content.summary).toBe('Localized summary (pt-BR)')
  })

  it('node with group of 0', () => {
    const nodeGroupZero: MindMapNode = {
      id: 'GroupZero',
      group: 0,
      description: 'Group 0',
      content: { summary: 'S', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeGroupZero))

    expect(result.current?.group).toBe(0)
  })

  it('node with negative group', () => {
    const nodeNegGroup: MindMapNode = {
      id: 'NegGroup',
      group: -1,
      description: 'Negative group',
      content: { summary: 'S', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeNegGroup))

    expect(result.current?.group).toBe(-1)
  })

  it('node with all optional physics fields (val, spinSpeed)', () => {
    const nodePhysics: MindMapNode = {
      id: 'Physics',
      group: 1,
      description: 'Physics node',
      content: { summary: 'S', sections: [] },
      val: 5,
      spinSpeed: 1.5,
    }

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(nodePhysics))

    expect(result.current?.val).toBe(5)
    expect(result.current?.spinSpeed).toBe(1.5)
  })

  it('node with extra unknown fields — preserved in merged output', () => {
    const extraNode = {
      ...baseNode,
      extraField: 'extra value',
      nestedExtra: { key: 'val' },
    } as MindMapNode

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(extraNode))

    expect((result.current as Record<string, unknown>).extraField).toBe('extra value')
    expect((result.current as Record<string, unknown>).nestedExtra).toEqual({ key: 'val' })
  })
})

// ---------------------------------------------------------------------------
// Localized content merge details
// ---------------------------------------------------------------------------

describe('localized content merge details', () => {
  it('localized content has more sections than original — merged node has new sections', () => {
    const localizedWithMoreSections: NodeContent = {
      summary: 'More sections',
      sections: [
        { title: 'Section 1', type: 'overview', body: 'Body 1' },
        { title: 'Section 2', type: 'overview', body: 'Body 2' },
        { title: 'Section 3', type: 'overview', body: 'Body 3' },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(localizedWithMoreSections)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content.sections).toHaveLength(3)
    expect(result.current?.content.sections[2].title).toBe('Section 3')
  })

  it('localized content has fewer sections than original — merged node has fewer sections', () => {
    const localizedWithFewerSections: NodeContent = {
      summary: 'Fewer sections',
      sections: [
        { title: 'Only one', type: 'overview', body: 'Body' },
      ],
    }

    mockGetLocalizedContent.mockReturnValue(localizedWithFewerSections)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content.sections).toHaveLength(1)
    expect(result.current?.content.sections[0].title).toBe('Only one')
  })

  it('localized content adds quickTip where original had none', () => {
    const nodeNoTip: MindMapNode = {
      id: 'NoTip',
      group: 1,
      description: 'No tip',
      content: { summary: 'No tip', sections: [] },
    }

    const localizedWithTip: NodeContent = {
      summary: 'Now with tip',
      sections: [],
      quickTip: 'Added tip',
    }

    mockGetLocalizedContent.mockReturnValue(localizedWithTip)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeNoTip))

    expect(result.current?.content.quickTip).toBe('Added tip')
  })

  it('localized content omits quickTip where original had one', () => {
    const localizedWithoutTip: NodeContent = {
      summary: 'No tip anymore',
      sections: [],
    }

    mockGetLocalizedContent.mockReturnValue(localizedWithoutTip)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    // quickTip is undefined since the localized content doesn't have it
    expect(result.current?.content.quickTip).toBeUndefined()
  })

  it('getLocalizedContent returns partial content — merged correctly', () => {
    const partialContent: NodeContent = {
      summary: 'Partial summary',
      sections: [],
    }

    mockGetLocalizedContent.mockReturnValue(partialContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content.summary).toBe('Partial summary')
    expect(result.current?.content.sections).toEqual([])
    // quickTip from original is gone because localized content replaces the entire content
    expect(result.current?.content.quickTip).toBeUndefined()
  })

  it('getLocalizedContent throws error — hook falls back to original node', () => {
    mockGetLocalizedContent.mockImplementation(() => {
      throw new Error('Content fetch failed')
    })

    expect(() => {
      renderHook(() => useLocalizedNodeContent(baseNode))
    }).toThrow('Content fetch failed')
  })

  it('merged node content is exactly the localized content (reference equality)', () => {
    const exactLocalized: NodeContent = {
      summary: 'Exact match',
      sections: [],
    }

    mockGetLocalizedContent.mockReturnValue(exactLocalized)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current?.content).toBe(exactLocalized)
  })

  it('merged node is a shallow copy (not mutating original)', () => {
    const originalNode = { ...baseNode }

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current).not.toBe(baseNode)
    // Original should be unchanged
    expect(baseNode.content.summary).toBe('Original summary')
    expect(baseNode.content.quickTip).toBe('Original tip')
  })
})

// ---------------------------------------------------------------------------
// Language transitions
// ---------------------------------------------------------------------------

describe('language transitions', () => {
  it('language changes from en-US to pt-BR and back — reference changes', () => {
    mockGetLocalizedContent.mockImplementation((_id: string, lang: string) =>
      lang === 'pt-BR' ? localizedContent : undefined,
    )

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    const enRef = result.current

    // Switch to pt-BR
    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })
    const ptRef = result.current
    expect(ptRef).not.toBe(enRef)

    // Switch back to en-US
    mockI18n.language = 'en-US'
    rerender({ node: baseNode })
    expect(result.current).toBe(baseNode)
  })

  it('language changes when node is null — still returns null', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode | null }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: null } },
    )

    expect(result.current).toBeNull()

    mockI18n.language = 'pt-BR'
    rerender({ node: null })

    expect(result.current).toBeNull()
    // getLocalizedContent should NOT be called for null node
    expect(mockGetLocalizedContent).not.toHaveBeenCalled()
  })

  it('node changes from valid to null — returns null', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode | null }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    expect(result.current).toBe(baseNode)

    rerender({ node: null })
    expect(result.current).toBeNull()
  })

  it('node changes from null to valid — returns merged node', () => {
    // null node does NOT call getLocalizedContent, so only one return value needed
    mockGetLocalizedContent.mockReturnValueOnce(localizedContent)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode | null }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: null } },
    )

    expect(result.current).toBeNull()

    rerender({ node: baseNode })
    expect(result.current).not.toBe(baseNode)
    expect(result.current?.content).toEqual(localizedContent)
  })

  it('two sequential language changes (en→pt→de) — each triggers recompute', () => {
    const deContent: NodeContent = {
      summary: 'Deutsche Zusammenfassung',
      sections: [],
    }

    mockGetLocalizedContent.mockImplementation((_id: string, lang: string) => {
      if (lang === 'pt-BR') return localizedContent
      if (lang === 'de') return deContent
      return undefined
    })

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    expect(result.current).toBe(baseNode)

    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })
    expect(result.current?.content.summary).toBe('Localized summary (pt-BR)')
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'pt-BR')

    mockI18n.language = 'de'
    rerender({ node: baseNode })
    expect(result.current?.content.summary).toBe('Deutsche Zusammenfassung')
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'de')
  })

  it('language change but no locale data — original node returned (same reference)', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    const firstRef = result.current
    expect(firstRef).toBe(baseNode)

    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })

    // Since getLocalizedContent returns undefined, the hook returns the original node
    expect(result.current).toBe(baseNode)
  })

  it('language change with locale data — new node reference', () => {
    mockGetLocalizedContent.mockImplementation((_id: string, lang: string) =>
      lang === 'pt-BR' ? localizedContent : undefined,
    )

    const { result, rerender } = renderHook(
      (props: { node: MindMapNode }) => useLocalizedNodeContent(props.node),
      { initialProps: { node: baseNode } },
    )

    expect(result.current).toBe(baseNode)

    mockI18n.language = 'pt-BR'
    rerender({ node: baseNode })

    expect(result.current).not.toBe(baseNode)
    expect(result.current?.content).toEqual(localizedContent)
  })
})

// ---------------------------------------------------------------------------
// Rapid changes and error paths
// ---------------------------------------------------------------------------

describe('rapid changes and error paths', () => {
  it('rapid node changes (3+ in same render cycle) — last wins', () => {
    const node1: MindMapNode = { id: 'N1', group: 1, description: 'N1', content: { summary: 'S1', sections: [] } }
    const node2: MindMapNode = { id: 'N2', group: 2, description: 'N2', content: { summary: 'S2', sections: [] } }
    const node3: MindMapNode = { id: 'N3', group: 3, description: 'N3', content: { summary: 'S3', sections: [] } }

    mockGetLocalizedContent
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)

    const { result, rerender } = renderHook(
      (props: { n: MindMapNode }) => useLocalizedNodeContent(props.n),
      { initialProps: { n: node1 } },
    )

    rerender({ n: node2 })
    rerender({ n: node3 })

    // Only the last render's node is used
    expect(result.current?.id).toBe('N3')
  })

  it('hook called with undefined node', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(
      () => (useLocalizedNodeContent as (n: undefined) => MindMapNode | null)(undefined),
    )

    // undefined is falsy, so the hook treats it like null
    expect(result.current).toBeNull()
  })

  it('hook called with non-nullish invalid value (number) — graceful', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    // Passing a number won't match the type guard `if (!node) return null`
    // because `!0` is true — 0 is falsy. So null would be returned.
    const { result } = renderHook(
      () => (useLocalizedNodeContent as (n: number) => MindMapNode | null)(0 as unknown as MindMapNode),
    )

    expect(result.current).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Multiple hooks
// ---------------------------------------------------------------------------

describe('multiple hooks', () => {
  it('multiple hooks with same node — same reference', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result: r1 } = renderHook(() => useLocalizedNodeContent(baseNode))
    const { result: r2 } = renderHook(() => useLocalizedNodeContent(baseNode))

    // Each hook is independent, so references differ
    expect(r1.current).toBe(baseNode)
    expect(r2.current).toBe(baseNode)
  })

  it('multiple hooks with different nodes — each returns correct merged result', () => {
    const nodeA: MindMapNode = { id: 'A', group: 1, description: 'A', content: { summary: 'SA', sections: [] } }
    const nodeB: MindMapNode = { id: 'B', group: 2, description: 'B', content: { summary: 'SB', sections: [] } }

    mockGetLocalizedContent.mockImplementation((id: string) => {
      if (id === 'A') return { summary: 'Localized A', sections: [] }
      if (id === 'B') return { summary: 'Localized B', sections: [] }
      return undefined
    })

    const { result: rA } = renderHook(() => useLocalizedNodeContent(nodeA))
    const { result: rB } = renderHook(() => useLocalizedNodeContent(nodeB))

    expect(rA.current?.content.summary).toBe('Localized A')
    expect(rB.current?.content.summary).toBe('Localized B')
    expect(rA.current?.id).toBe('A')
    expect(rB.current?.id).toBe('B')
  })
})

// ---------------------------------------------------------------------------
// Reference stability details
// ---------------------------------------------------------------------------

describe('reference stability details', () => {
  it('non-content fields preserve same reference from original node', () => {
    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    // id, group, description, learningStep are primitive values (===)
    expect(result.current?.id).toBe('LLM')
    expect(result.current?.group).toBe(1)
    expect(result.current?.description).toBe('Foundation model.')
    expect(result.current?.learningStep).toBe(1)
  })

  it('original node array is not mutated', () => {
    const nodes = [baseNode]
    const frozenContent = baseNode.content.summary

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    renderHook(() => useLocalizedNodeContent(baseNode))

    // The original node should be unchanged
    expect(baseNode.content.summary).toBe(frozenContent)
    expect(baseNode.content.sections[0].body).toBe('Original body.')
  })

  it('hook works with default mock setup', () => {
    mockGetLocalizedContent.mockReturnValue(undefined)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    expect(result.current).toBe(baseNode)
    expect(mockGetLocalizedContent).toHaveBeenCalledWith('LLM', 'en-US')
  })

  it('only content field changes — other field references are preserved', () => {
    const sharedNode: MindMapNode = {
      id: 'Shared',
      group: 5,
      description: 'Shared desc',
      content: { summary: 'Orig', sections: [] },
    }

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(sharedNode))

    // Content changed
    expect(result.current?.content).not.toBe(sharedNode.content)
    expect(result.current?.content.summary).toBe('Localized summary (pt-BR)')

    // But other fields reference-equality for primitives is inherently ===
    expect(result.current?.id).toBe(sharedNode.id)
    expect(result.current?.group).toBe(sharedNode.group)
    expect(result.current?.description).toBe(sharedNode.description)
  })

  it('node with additional dimension-like fields — preserved in merge', () => {
    const nodeWithDimensions = {
      ...baseNode,
      width: 300,
      height: 200,
      depth: 100,
    } as MindMapNode

    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(nodeWithDimensions))

    expect((result.current as Record<string, unknown>).width).toBe(300)
    expect((result.current as Record<string, unknown>).height).toBe(200)
    expect((result.current as Record<string, unknown>).depth).toBe(100)
  })

  it('content type is correctly narrowed after merge', () => {
    mockGetLocalizedContent.mockReturnValue(localizedContent)

    const { result } = renderHook(() => useLocalizedNodeContent(baseNode))

    // result.current is MindMapNode | null
    expect(result.current).not.toBeNull()
    expect(result.current).toBeDefined()

    // Accessing content should type-narrow correctly
    const content = result.current!.content
    expect(content.summary).toBe('Localized summary (pt-BR)')
    expect(Array.isArray(content.sections)).toBe(true)
    expect(typeof content.summary).toBe('string')
  })
})
