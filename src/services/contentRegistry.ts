import type { ComponentType } from 'react'
import type { ContentSection } from '../types/mindmap'

/* ============================================================
   contentRegistry — Sistema de registro de renderizadores
   de seção (Strategy Pattern / Plugin Architecture).
   
   Em vez de um switch-case rígido (como no SectionRenderer
   original), cada molécula se auto-registra para um tipo
   de seção. Adicionar um novo tipo = criar um componente
   + uma chamada registerRenderer(). Sem modificar código
   existente — Princípio Open/Closed.
   ============================================================ */

export interface SectionRendererProps {
  section: ContentSection
  groupColor: string
}

type SectionRendererComponent = ComponentType<SectionRendererProps>

const registry = new Map<string, SectionRendererComponent>()

/**
 * Registra um componente renderizador para um tipo de seção.
 * Deve ser chamado no módulo do componente (import-time).
 */
export function registerRenderer(
  type: string,
  component: SectionRendererComponent,
): void {
  if (registry.has(type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[contentRegistry] Renderizador para "${type}" já registrado. ` +
          `O registro anterior será sobrescrito.`,
      )
    }
  }
  registry.set(type, component)
}

/** Retorna o componente registrado para o tipo, ou undefined. */
export function getRenderer(
  type: string,
): SectionRendererComponent | undefined {
  return registry.get(type)
}

/** Retorna todos os tipos de seção registrados. */
export function getRegisteredTypes(): string[] {
  return Array.from(registry.keys())
}

/** Limpa todos os registros (útil em testes). */
export function clearRegistry(): void {
  registry.clear()
}
