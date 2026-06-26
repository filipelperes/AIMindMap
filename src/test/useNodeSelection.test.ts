import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNodeSelection } from '../hooks/useNodeSelection'
import type { MindMapNode } from '../types/mindmap'

// ===========================================================================
// useNodeSelection — Hook that manages node selection state
// ===========================================================================

const nodeA: MindMapNode = {
  id: 'node-a',
  group: 1,
  description: 'First test node',
  content: { summary: 'Summary A', sections: [] },
}

const nodeB: MindMapNode = {
  id: 'node-b',
  group: 2,
  description: 'Second test node',
  content: { summary: 'Summary B', sections: [] },
}

const nodeC: MindMapNode = {
  id: 'node-c',
  group: 3,
  description: 'Third test node',
  content: { summary: 'Summary C', sections: [] },
}

const nodes: MindMapNode[] = [nodeA, nodeB, nodeC]

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('initial state', () => {
  it('returns null for selectedNodeId', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    expect(result.current.selectedNodeId).toBeNull()
  })

  it('returns null for selectedNode', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    expect(result.current.selectedNode).toBeNull()
  })

  it('isSelected returns false for any id', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    expect(result.current.isSelected('node-a')).toBe(false)
    expect(result.current.isSelected('node-b')).toBe(false)
    expect(result.current.isSelected('nonexistent')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// selectNode
// ---------------------------------------------------------------------------

describe('selectNode', () => {
  it('sets selectedNodeId to the given id', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-b')
    })

    expect(result.current.selectedNodeId).toBe('node-b')
  })

  it('resolves selectedNode to the correct node from the nodes array', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })

    expect(result.current.selectedNode).toEqual(nodeA)
    expect(result.current.selectedNode?.id).toBe('node-a')
  })

  it('isSelected returns true for the selected id', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-c')
    })

    expect(result.current.isSelected('node-c')).toBe(true)
  })

  it('isSelected returns false for non-selected ids', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })

    expect(result.current.isSelected('node-b')).toBe(false)
    expect(result.current.isSelected('node-c')).toBe(false)
  })

  it('re-selecting the same node keeps it selected', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    act(() => {
      result.current.selectNode('node-a')
    })

    expect(result.current.selectedNodeId).toBe('node-a')
    expect(result.current.isSelected('node-a')).toBe(true)
  })

  it('multiple calls to selectNode override correctly', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    expect(result.current.selectedNodeId).toBe('node-a')

    act(() => {
      result.current.selectNode('node-b')
    })
    expect(result.current.selectedNodeId).toBe('node-b')

    act(() => {
      result.current.selectNode('node-c')
    })
    expect(result.current.selectedNodeId).toBe('node-c')
  })
})

// ---------------------------------------------------------------------------
// selectNode with null
// ---------------------------------------------------------------------------

describe('selectNode(null)', () => {
  it('sets selectedNodeId to null when passed null', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    expect(result.current.selectedNodeId).toBe('node-a')

    act(() => {
      result.current.selectNode(null)
    })
    expect(result.current.selectedNodeId).toBeNull()
    expect(result.current.selectedNode).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// deselectNode
// ---------------------------------------------------------------------------

describe('deselectNode', () => {
  it('resets selectedNodeId to null', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    expect(result.current.selectedNodeId).toBe('node-a')

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()
  })

  it('resets selectedNode to null', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    expect(result.current.selectedNode).toEqual(nodeA)

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNode).toBeNull()
  })

  it('isSelected returns false for previously selected id', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
    })
    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.isSelected('node-a')).toBe(false)
  })

  it('is safe to call deselectNode when nothing is selected', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Non-existent node
// ---------------------------------------------------------------------------

describe('non-existent node', () => {
  it('selectedNode returns null when id does not match any node', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('nonexistent-id')
    })

    expect(result.current.selectedNodeId).toBe('nonexistent-id')
    expect(result.current.selectedNode).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Empty nodes array
// ---------------------------------------------------------------------------

describe('empty nodes array', () => {
  it('selectedNode always stays null regardless of selection', () => {
    const { result } = renderHook(() => useNodeSelection([]))

    act(() => {
      result.current.selectNode('anything')
    })

    expect(result.current.selectedNodeId).toBe('anything')
    expect(result.current.selectedNode).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// selectNode edge cases (unusual inputs)
// ---------------------------------------------------------------------------

describe('selectNode edge cases', () => {
  it('handles empty string ID', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('')
    })

    expect(result.current.selectedNodeId).toBe('')
    expect(result.current.selectedNode).toBeNull()
    expect(result.current.isSelected('')).toBe(true)
  })

  it('handles very long ID string (1000+ chars)', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    const longId = 'x'.repeat(2000)

    act(() => {
      result.current.selectNode(longId)
    })

    expect(result.current.selectedNodeId).toBe(longId)
    expect(result.current.selectedNode).toBeNull()
  })

  it('handles special characters in ID', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    const specialId = '!@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`'

    act(() => {
      result.current.selectNode(specialId)
    })

    expect(result.current.selectedNodeId).toBe(specialId)
    expect(result.current.selectedNode).toBeNull()
  })

  it('handles undefined passed as ID (graceful JS runtime)', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      ;(result.current.selectNode as (id: unknown) => void)(undefined)
    })

    // undefined is not null, so selectedNodeId is undefined (not null)
    // but selectedNode resolves to null since no node has undefined id
    expect(result.current.selectedNode).toBeNull()
  })

  it('handles numeric ID via type coercion', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      ;(result.current.selectNode as (id: unknown) => void)(123)
    })

    // Typescript would prevent this but at runtime it works
    // The state becomes number 123, which doesn't match any string id
    expect(result.current.selectedNode).toBeNull()
  })

  it('handles object with toString as ID via type coercion', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))
    const objWithToString = { toString: () => 'node-a' }

    act(() => {
      ;(result.current.selectNode as (id: unknown) => void)(objWithToString)
    })

    // The id is the object reference, not 'node-a', so selectedNode is null
    expect(result.current.selectedNode).toBeNull()
  })

  it('multiple rapid selectNode calls — only last wins', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode('node-a')
      result.current.selectNode('node-b')
      result.current.selectNode('node-c')
    })

    expect(result.current.selectedNodeId).toBe('node-c')
    expect(result.current.selectedNode).toEqual(nodeC)
  })
})

// ---------------------------------------------------------------------------
// deselectNode edge cases
// ---------------------------------------------------------------------------

describe('deselectNode edge cases', () => {
  it('deselectNode after selectNode(null) is idempotent', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.selectNode(null)
    })
    expect(result.current.selectedNodeId).toBeNull()

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()
    expect(result.current.selectedNode).toBeNull()
  })

  it('multiple deselectNode calls in succession cause no errors', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()

    act(() => {
      result.current.deselectNode()
    })
    expect(result.current.selectedNodeId).toBeNull()
  })

  it('select, deselect, re-select same node works correctly', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNodeId).toBe('node-a')

    act(() => { result.current.deselectNode() })
    expect(result.current.selectedNodeId).toBeNull()

    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNodeId).toBe('node-a')
    expect(result.current.selectedNode).toEqual(nodeA)
    expect(result.current.isSelected('node-a')).toBe(true)
  })

  it('select node A, select node B, deselect — B is deselected', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => { result.current.selectNode('node-a') })
    act(() => { result.current.selectNode('node-b') })
    act(() => { result.current.deselectNode() })

    expect(result.current.selectedNodeId).toBeNull()
    expect(result.current.isSelected('node-a')).toBe(false)
    expect(result.current.isSelected('node-b')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isSelected advanced behavior
// ---------------------------------------------------------------------------

describe('isSelected advanced behavior', () => {
  it('returns true for the exact selected node, false for all others in a large array', () => {
    const manyNodes: MindMapNode[] = Array.from({ length: 50 }, (_, i) => ({
      id: `node-${i}`,
      group: i,
      description: `Node ${i}`,
      content: { summary: `Summary ${i}`, sections: [] },
    }))

    const { result } = renderHook(() => useNodeSelection(manyNodes))

    act(() => {
      result.current.selectNode('node-25')
    })

    expect(result.current.isSelected('node-25')).toBe(true)
    for (let i = 0; i < 50; i++) {
      if (i !== 25) {
        expect(result.current.isSelected(`node-${i}`)).toBe(false)
      }
    }
  })

  it('isSelected returns a strict boolean (not truthy/falsy)', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => { result.current.selectNode('node-a') })

    const selectedResult = result.current.isSelected('node-a')
    const notSelectedResult = result.current.isSelected('node-b')

    expect(selectedResult).toBe(true)
    expect(notSelectedResult).toBe(false)
    // Verify they are actual boolean primitives
    expect(typeof selectedResult).toBe('boolean')
    expect(typeof notSelectedResult).toBe('boolean')
  })

  it('isSelected reference is stable across re-renders', () => {
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: nodes } },
    )

    const firstIsSelected = result.current.isSelected

    rerender({ nodeList: [...nodes] })

    expect(result.current.isSelected).toBe(firstIsSelected)
  })
})

// ---------------------------------------------------------------------------
// Stable references
// ---------------------------------------------------------------------------

describe('stable references', () => {
  it('selectedNodeId is stable reference for same value', () => {
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: nodes } },
    )

    act(() => { result.current.selectNode('node-a') })
    const firstId = result.current.selectedNodeId

    rerender({ nodeList: [...nodes] })

    expect(result.current.selectedNodeId).toBe(firstId)
  })

  it('selectedNode is stable reference for same node', () => {
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: nodes } },
    )

    act(() => { result.current.selectNode('node-a') })
    const firstNode = result.current.selectedNode

    rerender({ nodeList: [...nodes] })

    expect(result.current.selectedNode).toBe(firstNode)
  })

  it('returned object has stable method references across renders', () => {
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: nodes } },
    )

    const { selectNode: firstSelect, deselectNode: firstDeselect, isSelected: firstIsSelected } = result.current

    rerender({ nodeList: [...nodes] })

    expect(result.current.selectNode).toBe(firstSelect)
    expect(result.current.deselectNode).toBe(firstDeselect)
    expect(result.current.isSelected).toBe(firstIsSelected)
  })

  it('selectedNodeId is string or null, never undefined', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    // Initially null
    expect(result.current.selectedNodeId).toBeNull()

    // After selection, it's a string
    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNodeId).toBe('node-a')
    expect(typeof result.current.selectedNodeId).toBe('string')

    // After deselection, it's null
    act(() => { result.current.deselectNode() })
    expect(result.current.selectedNodeId).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Nodes array dynamics
// ---------------------------------------------------------------------------

describe('nodes array dynamics', () => {
  it('selectedNode resolves correctly when nodes array changes', () => {
    const initialNodes = [nodeA]
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: initialNodes } },
    )

    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNode).toEqual(nodeA)

    // Replace with a new array containing a different node-a
    const updatedNodeA: MindMapNode = {
      ...nodeA,
      description: 'Updated node A',
    }
    rerender({ nodeList: [updatedNodeA] })

    expect(result.current.selectedNode?.description).toBe('Updated node A')
    expect(result.current.selectedNode).not.toBe(nodeA)
  })

  it('selectedNode becomes null when nodes array becomes empty after selection', () => {
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: nodes } },
    )

    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNode).toEqual(nodeA)

    rerender({ nodeList: [] })

    expect(result.current.selectedNode).toBeNull()
    // selectedNodeId is still 'node-a' though
    expect(result.current.selectedNodeId).toBe('node-a')
  })

  it('nodes array gains new node with same ID as selected — selectedNode updates', () => {
    const initialNodes = [nodeB, nodeC]
    const { result, rerender } = renderHook(
      (props: { nodeList: MindMapNode[] }) => useNodeSelection(props.nodeList),
      { initialProps: { nodeList: initialNodes } },
    )

    act(() => { result.current.selectNode('node-a') })
    // Node doesn't exist yet
    expect(result.current.selectedNode).toBeNull()

    // Add nodeA to the array
    rerender({ nodeList: [nodeB, nodeC, nodeA] })

    expect(result.current.selectedNode).toEqual(nodeA)
  })

  it('two nodes with same ID — first match wins', () => {
    const duplicateNodes: MindMapNode[] = [
      { ...nodeA, description: 'First duplicate' },
      { ...nodeA, description: 'Second duplicate' },
    ]

    const { result } = renderHook(() => useNodeSelection(duplicateNodes))

    act(() => { result.current.selectNode('node-a') })
    expect(result.current.selectedNode?.description).toBe('First duplicate')
  })

  it('handles 1000+ nodes in array — selection still works', () => {
    const manyNodes: MindMapNode[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `node-${i}`,
      group: i % 10,
      description: `Node ${i}`,
      content: { summary: `Summary ${i}`, sections: [] },
    }))

    const { result } = renderHook(() => useNodeSelection(manyNodes))

    act(() => { result.current.selectNode('node-777') })
    expect(result.current.selectedNodeId).toBe('node-777')
    expect(result.current.selectedNode?.description).toBe('Node 777')
    expect(result.current.isSelected('node-777')).toBe(true)
    expect(result.current.isSelected('node-0')).toBe(false)
  })

  it('handles sparse entries (null/undefined between valid nodes)', () => {
    const sparseNodes = [nodeA, null, undefined, nodeB] as unknown as MindMapNode[]

    const { result } = renderHook(() => useNodeSelection(sparseNodes))

    act(() => { result.current.selectNode('node-a') })
    // nodeA is in the array, so it should be found
    expect(result.current.selectedNode).toEqual(nodeA)
  })
})

// ---------------------------------------------------------------------------
// Node content variations
// ---------------------------------------------------------------------------

describe('node content variations', () => {
  it('selects a node with all possible fields (x, y, z, learningStep, etc.)', () => {
    const fullNode: MindMapNode = {
      id: 'full-node',
      group: 5,
      description: 'Full featured node',
      content: { summary: 'Full', sections: [] },
      x: 100,
      y: 200,
      z: 50,
      learningStep: 3,
      val: 2,
      spinSpeed: 0.5,
      cheatsheet: 'advanced',
      stat: 42,
    }

    const { result } = renderHook(() => useNodeSelection([fullNode]))

    act(() => { result.current.selectNode('full-node') })
    expect(result.current.selectedNode?.x).toBe(100)
    expect(result.current.selectedNode?.y).toBe(200)
    expect(result.current.selectedNode?.z).toBe(50)
    expect(result.current.selectedNode?.learningStep).toBe(3)
    expect(result.current.selectedNode?.val).toBe(2)
    expect(result.current.selectedNode?.spinSpeed).toBe(0.5)
    expect(result.current.selectedNode?.cheatsheet).toBe('advanced')
    expect(result.current.selectedNode?.stat).toBe(42)
  })

  it('selects a node with null content field', () => {
    const nodeNullContent: MindMapNode = {
      id: 'null-content',
      group: 1,
      description: 'Null content',
      content: null as unknown as never,
    }

    const { result } = renderHook(() => useNodeSelection([nodeNullContent]))

    act(() => { result.current.selectNode('null-content') })
    expect(result.current.selectedNode?.id).toBe('null-content')
    expect(result.current.selectedNode?.content).toBeNull()
  })

  it('selects a node with undefined content field', () => {
    const nodeUndefinedContent: MindMapNode = {
      id: 'undefined-content',
      group: 1,
      description: 'Undefined content',
      content: undefined as unknown as never,
    }

    const { result } = renderHook(() => useNodeSelection([nodeUndefinedContent]))

    act(() => { result.current.selectNode('undefined-content') })
    expect(result.current.selectedNode?.id).toBe('undefined-content')
    expect(result.current.selectedNode?.content).toBeUndefined()
  })

  it('selects a node with empty content object', () => {
    const nodeEmptyContent: MindMapNode = {
      id: 'empty-content',
      group: 1,
      description: 'Empty content',
      content: { summary: '', sections: [] },
    }

    const { result } = renderHook(() => useNodeSelection([nodeEmptyContent]))

    act(() => { result.current.selectNode('empty-content') })
    expect(result.current.selectedNode?.content.summary).toBe('')
    expect(result.current.selectedNode?.content.sections).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Cleanup and error handling
// ---------------------------------------------------------------------------

describe('cleanup and error handling', () => {
  it('selectNode called on unmounted hook does not throw', () => {
    const { result, unmount } = renderHook(() => useNodeSelection(nodes))

    unmount()

    // React 18+ should handle this gracefully without state update warnings
    expect(() => {
      act(() => {
        result.current.selectNode('node-a')
      })
    }).not.toThrow()
  })

  it('handles null nodes gracefully — renderHook does not throw', () => {
    expect(() => {
      renderHook(() => (useNodeSelection as (nodes: null) => ReturnType<typeof useNodeSelection>)(null as unknown as MindMapNode[]))
    }).not.toThrow()
  })

  it('does not mutate the original nodes array', () => {
    const originalNodes = [nodeA, nodeB, nodeC]
    const frozenNodes = [...originalNodes]

    const { result } = renderHook(() => useNodeSelection(originalNodes))

    act(() => { result.current.selectNode('node-a') })
    act(() => { result.current.deselectNode() })
    act(() => { result.current.selectNode('node-b') })

    expect(originalNodes).toEqual(frozenNodes)
    expect(originalNodes).not.toBe(frozenNodes) // sanity: content is same
  })

  it('selectNode with ID that matches multiple groups resolves to first match', () => {
    const multiGroupNodes: MindMapNode[] = [
      { id: 'multi', group: 1, description: 'First group', content: { summary: 'S1', sections: [] } },
      { id: 'multi', group: 2, description: 'Second group', content: { summary: 'S2', sections: [] } },
    ]

    const { result } = renderHook(() => useNodeSelection(multiGroupNodes))

    act(() => { result.current.selectNode('multi') })
    expect(result.current.selectedNode?.group).toBe(1)
    expect(result.current.selectedNode?.description).toBe('First group')
  })

  it('handles undefined nodes argument — renders without throwing', () => {
    expect(() => {
      renderHook(() => (useNodeSelection as (nodes: undefined) => ReturnType<typeof useNodeSelection>)(undefined as unknown as MindMapNode[]))
    }).not.toThrow()
  })

  it('selectedNode reference changes when switching between different nodes', () => {
    const { result } = renderHook(() => useNodeSelection(nodes))

    act(() => { result.current.selectNode('node-a') })
    const nodeARef = result.current.selectedNode

    act(() => { result.current.selectNode('node-b') })
    const nodeBRef = result.current.selectedNode

    expect(nodeARef).not.toBe(nodeBRef)
    expect(nodeARef?.id).toBe('node-a')
    expect(nodeBRef?.id).toBe('node-b')
  })
})
