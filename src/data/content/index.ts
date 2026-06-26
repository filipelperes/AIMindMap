/**
 * Content category index — re-exports from contentRegistry.
 * 
 * Categories are now loaded via dynamic import (each becomes its own chunk).
 * This file maintains the barrel re-export for backward compatibility.
 * 
 * For direct category access (e.g., in tests), import from the specific
 * category file directly: `import { categoryNodes } from './foundations'`
 */

export { nodeContent, contentReady, ensureNodeContent } from '../contentRegistry'
export type { NodeContent } from '../../types/mindmap'
