/**
 * Content barrel — re-exports from contentRegistry for backward compatibility.
 * 
 * All content is now loaded via dynamic imports through contentRegistry.
 * Each category becomes its own chunk, keeping the main bundle leaner.
 */

export { nodeContent, contentReady, ensureNodeContent } from './contentRegistry'
