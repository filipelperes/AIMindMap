/* ============================================================
   responsiveUtils — Breakpoints and responsive layout
   utilities for desktop and mobile.
   ============================================================ */

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const

export type DeviceTier = 'mobile' | 'tablet' | 'desktop'

/** Returns the device tier based on viewport width. */
export function getDeviceTier(width: number): DeviceTier {
  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.desktop) return 'tablet'
  return 'desktop'
}

/** Returns true if the viewport is mobile. */
export function isMobileWidth(width: number): boolean {
  return width < BREAKPOINTS.tablet
}

/** Detail panel width by tier. */
export function getSidebarWidth(width: number): number | string {
  if (width < BREAKPOINTS.mobile) return '100%'
  if (width < BREAKPOINTS.tablet) return '90%'
  if (width < BREAKPOINTS.desktop) return 380
  return 420
}

/** 3D graph scale by tier. */
export function getGraphScale(width: number): number {
  if (width < BREAKPOINTS.tablet) return 1.3
  return 1
}

/** Minimum touch target size in px (a11y). */
export const MIN_TOUCH_TARGET = 44
