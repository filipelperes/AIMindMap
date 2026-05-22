/* ============================================================
   pointerUtils — Utilitários para unificar eventos de
   mouse e touch em uma interface comum.
   ============================================================ */

export interface NormalizedPointer {
  x: number
  y: number
}

/** Normaliza um evento MouseEvent ou TouchEvent para {x, y} client. */
export function normalizePointer(e: MouseEvent | TouchEvent | PointerEvent): NormalizedPointer {
  if ('touches' in e) {
    const touch = (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: (e as PointerEvent).clientX, y: (e as PointerEvent).clientY }
}

/** Detecta se o dispositivo suporta touch. */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/** Detecta se um PointerEvent veio de toque (vs mouse/pen). */
export function isTouchPointer(e: PointerEvent): boolean {
  return e.pointerType === 'touch'
}

/** Retorna true se a distância entre dois pontos for pequena (tap vs drag). */
export function isTap(
  start: NormalizedPointer,
  end: NormalizedPointer,
  threshold = 10,
): boolean {
  const dx = end.x - start.x
  const dy = end.y - start.y
  return Math.sqrt(dx * dx + dy * dy) < threshold
}

/** Retorna a distância entre dois toques (pinch). */
export function pinchDistance(e: TouchEvent): number {
  if (e.touches.length < 2) return 0
  const t1 = e.touches[0]
  const t2 = e.touches[1]
  const dx = t2.clientX - t1.clientX
  const dy = t2.clientY - t1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}
