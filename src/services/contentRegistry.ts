import type { ComponentType } from 'react'
import type { ContentSection } from '../types/mindmap'

/* ============================================================
   contentRegistry — Section renderer registration system
   (Strategy Pattern / Plugin Architecture).
   
   Instead of a rigid switch-case (like the original SectionRenderer),
   each molecule self-registers for a section
   type. Adding a new type = create a component
   + a registerRenderer() call. Without modifying existing
   code — Open/Closed Principle.
   ============================================================ */

export interface SectionRendererProps {
  section: ContentSection
  groupColor: string
}

type SectionRendererComponent = ComponentType<SectionRendererProps>

const registry = new Map<string, SectionRendererComponent>()

/**
 * Registers a renderer component for a section type.
 * Must be called in the component module (import-time).
 */
export function registerRenderer(
  type: string,
  component: SectionRendererComponent,
): void {
  if (registry.has(type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[contentRegistry] Renderer for "${type}" already registered. ` +
          `The previous registration will be overwritten.`,
      )
    }
  }
  registry.set(type, component)
}

/** Returns the registered component for the type, or undefined. */
export function getRenderer(
  type: string,
): SectionRendererComponent | undefined {
  return registry.get(type)
}

/** Returns all registered section types. */
export function getRegisteredTypes(): string[] {
  return Array.from(registry.keys())
}

/** Clears all registrations (useful in tests). */
export function clearRegistry(): void {
  registry.clear()
}
