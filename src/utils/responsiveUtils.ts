/* ============================================================
   responsiveUtils — Breakpoints e utilitários de layout
   responsivo para desktop e mobile.
   ============================================================ */

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const

export type DeviceTier = 'mobile' | 'tablet' | 'desktop'

/** Retorna o tier do dispositivo baseado na largura da viewport. */
export function getDeviceTier(width: number): DeviceTier {
  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.desktop) return 'tablet'
  return 'desktop'
}

/** Retorna true se a viewport for mobile. */
export function isMobileWidth(width: number): boolean {
  return width < BREAKPOINTS.tablet
}

/** Largura do painel de detalhes por tier. */
export function getSidebarWidth(width: number): number | string {
  if (width < BREAKPOINTS.mobile) return '100%'
  if (width < BREAKPOINTS.tablet) return '90%'
  if (width < BREAKPOINTS.desktop) return 380
  return 420
}

/** Escala do grafo 3D por tier. */
export function getGraphScale(width: number): number {
  if (width < BREAKPOINTS.tablet) return 1.3
  return 1
}

/** Tamanho mínimo de toque em px (a11y). */
export const MIN_TOUCH_TARGET = 44
