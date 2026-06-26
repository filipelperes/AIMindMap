import { describe, it, expect } from 'vitest'
import {
  getDeviceTier,
  isMobileWidth,
  getSidebarWidth,
  getGraphScale,
  BREAKPOINTS,
  MIN_TOUCH_TARGET,
} from '../utils/responsiveUtils'
import type { DeviceTier } from '../utils/responsiveUtils'

// ===========================================================================
// responsiveUtils — Pure utility function tests
// ===========================================================================

describe('BREAKPOINTS constants', () => {
  it('defines mobile breakpoint as 640', () => {
    expect(BREAKPOINTS.mobile).toBe(640)
  })

  it('defines tablet breakpoint as 768', () => {
    expect(BREAKPOINTS.tablet).toBe(768)
  })

  it('defines desktop breakpoint as 1024', () => {
    expect(BREAKPOINTS.desktop).toBe(1024)
  })

  it('ensures mobile < tablet < desktop ordering', () => {
    expect(BREAKPOINTS.mobile).toBeLessThan(BREAKPOINTS.tablet)
    expect(BREAKPOINTS.tablet).toBeLessThan(BREAKPOINTS.desktop)
  })
})

describe('MIN_TOUCH_TARGET constant', () => {
  it('is defined as 44px (a11y minimum)', () => {
    expect(MIN_TOUCH_TARGET).toBe(44)
  })
})

// ===========================================================================
// getDeviceTier
// ===========================================================================

describe('getDeviceTier', () => {
  it('returns "mobile" for width < 640', () => {
    expect(getDeviceTier(0)).toBe('mobile')
    expect(getDeviceTier(320)).toBe('mobile')
    expect(getDeviceTier(639)).toBe('mobile')
  })

  it('returns "mobile" at exact mobile boundary 0', () => {
    expect(getDeviceTier(0)).toBe('mobile')
  })

  it('returns "tablet" for width 640–1023', () => {
    // At the mobile→tablet boundary
    expect(getDeviceTier(640)).toBe('tablet')
    expect(getDeviceTier(768)).toBe('tablet')
    expect(getDeviceTier(800)).toBe('tablet')
    expect(getDeviceTier(1023)).toBe('tablet')
  })

  it('returns "desktop" for width >= 1024', () => {
    expect(getDeviceTier(1024)).toBe('desktop')
    expect(getDeviceTier(1440)).toBe('desktop')
    expect(getDeviceTier(1920)).toBe('desktop')
  })

  it('returns "desktop" for very large values', () => {
    expect(getDeviceTier(9999)).toBe('desktop')
    expect(getDeviceTier(Number.MAX_SAFE_INTEGER)).toBe('desktop')
  })

  it('returns "mobile" for negative width', () => {
    expect(getDeviceTier(-1)).toBe('mobile')
    expect(getDeviceTier(-100)).toBe('mobile')
  })

  it('handles exact boundary at 640, 768, 1024', () => {
    // Exhaustive boundary tests
    expect(getDeviceTier(640)).toBe('tablet')
    expect(getDeviceTier(768)).toBe('tablet')
    expect(getDeviceTier(1024)).toBe('desktop')
  })
})

// ===========================================================================
// isMobileWidth
// ===========================================================================

describe('isMobileWidth', () => {
  it('returns true for width < 768', () => {
    expect(isMobileWidth(0)).toBe(true)
    expect(isMobileWidth(320)).toBe(true)
    expect(isMobileWidth(767)).toBe(true)
  })

  it('returns false for width >= 768', () => {
    expect(isMobileWidth(768)).toBe(false)
    expect(isMobileWidth(1024)).toBe(false)
    expect(isMobileWidth(1920)).toBe(false)
  })

  it('returns true for negative width', () => {
    expect(isMobileWidth(-1)).toBe(true)
  })

  it('returns false for very large width', () => {
    expect(isMobileWidth(9999)).toBe(false)
  })

  it('treats exact tablet boundary 768 as non-mobile', () => {
    expect(isMobileWidth(768)).toBe(false)
  })
})

// ===========================================================================
// getSidebarWidth
// ===========================================================================

describe('getSidebarWidth', () => {
  it('returns "100%" for width < 640 (mobile)', () => {
    expect(getSidebarWidth(0)).toBe('100%')
    expect(getSidebarWidth(320)).toBe('100%')
    expect(getSidebarWidth(639)).toBe('100%')
  })

  it('returns "90%" for width 640–767 (small tablet)', () => {
    expect(getSidebarWidth(640)).toBe('90%')
    expect(getSidebarWidth(700)).toBe('90%')
    expect(getSidebarWidth(767)).toBe('90%')
  })

  it('returns 380 for width 768–1023 (tablet→desktop)', () => {
    expect(getSidebarWidth(768)).toBe(380)
    expect(getSidebarWidth(800)).toBe(380)
    expect(getSidebarWidth(1023)).toBe(380)
  })

  it('returns 420 for width >= 1024 (desktop)', () => {
    expect(getSidebarWidth(1024)).toBe(420)
    expect(getSidebarWidth(1440)).toBe(420)
    expect(getSidebarWidth(1920)).toBe(420)
  })

  it('returns "100%" for negative width', () => {
    expect(getSidebarWidth(-1)).toBe('100%')
  })

  it('returns 420 for very large width', () => {
    expect(getSidebarWidth(9999)).toBe(420)
  })

  it('transitions at each boundary correctly', () => {
    expect(getSidebarWidth(639)).toBe('100%')
    expect(getSidebarWidth(640)).toBe('90%')
    expect(getSidebarWidth(767)).toBe('90%')
    expect(getSidebarWidth(768)).toBe(380)
    expect(getSidebarWidth(1023)).toBe(380)
    expect(getSidebarWidth(1024)).toBe(420)
  })
})

// ===========================================================================
// getGraphScale
// ===========================================================================

describe('getGraphScale', () => {
  it('returns 1.3 for width < 768 (mobile/tablet)', () => {
    expect(getGraphScale(0)).toBe(1.3)
    expect(getGraphScale(320)).toBe(1.3)
    expect(getGraphScale(640)).toBe(1.3)
    expect(getGraphScale(767)).toBe(1.3)
  })

  it('returns 1 for width >= 768 (desktop)', () => {
    expect(getGraphScale(768)).toBe(1)
    expect(getGraphScale(1024)).toBe(1)
    expect(getGraphScale(1920)).toBe(1)
  })

  it('returns 1.3 for negative width', () => {
    expect(getGraphScale(-1)).toBe(1.3)
  })

  it('returns 1 for very large width', () => {
    expect(getGraphScale(9999)).toBe(1)
  })

  it('treats exact tablet boundary 768 as desktop scale', () => {
    expect(getGraphScale(768)).toBe(1)
  })
})

// ===========================================================================
// BREAKPOINTS — immutability
// ===========================================================================

describe('BREAKPOINTS — immutability', () => {
  it('BREAKPOINTS is not frozen at runtime (as const is compile-time only)', () => {
    // `as const` provides type-level readonly but does NOT Object.freeze()
    expect(Object.isFrozen(BREAKPOINTS)).toBe(false)
  })

  it('BREAKPOINTS values are not modified by callers', () => {
    // All utility functions read BREAKPOINTS; verify they don't mutate it
    getDeviceTier(500)
    isMobileWidth(500)
    getSidebarWidth(500)
    getGraphScale(500)
    expect(BREAKPOINTS.mobile).toBe(640)
    expect(BREAKPOINTS.tablet).toBe(768)
    expect(BREAKPOINTS.desktop).toBe(1024)
  })
})

// ===========================================================================
// Edge cases — special values (NaN, undefined, string coercion)
// ===========================================================================

describe('getDeviceTier — edge cases', () => {
  it('handles NaN width without throwing', () => {
    // NaN comparisons always return false, so NaN falls through to 'desktop'
    const result = getDeviceTier(NaN)
    expect(result).toBe('desktop')
  })

  it('handles undefined width without throwing', () => {
    const result = getDeviceTier(undefined as any)
    expect(result).toBe('desktop')
  })

  it('handles string width passed at runtime', () => {
    // JS coerces '500' to 500 for comparison: 500 < 640 → true → 'mobile'
    const result = getDeviceTier('500' as any)
    expect(result).toBe('mobile')
  })
})

describe('isMobileWidth — edge cases', () => {
  it('handles NaN width without throwing', () => {
    // NaN < 768 → false
    const result = isMobileWidth(NaN)
    expect(result).toBe(false)
  })

  it('handles undefined width without throwing', () => {
    const result = isMobileWidth(undefined as any)
    expect(result).toBe(false)
  })

  it('handles string width passed at runtime', () => {
    // JS coerces '600' to 600: 600 < 768 → true
    const result = isMobileWidth('600' as any)
    expect(result).toBe(true)
  })
})

describe('getSidebarWidth — edge cases', () => {
  it('handles NaN width without throwing', () => {
    // All comparisons with NaN are false → falls through to 420
    const result = getSidebarWidth(NaN)
    expect(result).toBe(420)
  })

  it('handles undefined width without throwing', () => {
    const result = getSidebarWidth(undefined as any)
    expect(result).toBe(420)
  })

  it('handles string width passed at runtime', () => {
    // JS coerces '800' to 800: 800 < 640 → false, 800 < 768 → false, 800 < 1024 → true → 380
    const result = getSidebarWidth('800' as any)
    expect(result).toBe(380)
  })

  it('returns number type for desktop widths, string for mobile widths', () => {
    expect(typeof getSidebarWidth(320)).toBe('string')
    expect(typeof getSidebarWidth(640)).toBe('string')
    expect(typeof getSidebarWidth(768)).toBe('number')
    expect(typeof getSidebarWidth(1024)).toBe('number')
  })
})

describe('getGraphScale — edge cases', () => {
  it('handles NaN width without throwing', () => {
    // NaN < 768 → false → returns 1
    const result = getGraphScale(NaN)
    expect(result).toBe(1)
  })

  it('handles undefined width without throwing', () => {
    const result = getGraphScale(undefined as any)
    expect(result).toBe(1)
  })

  it('handles string width passed at runtime', () => {
    // JS coerces '500' to 500: 500 < 768 → true → 1.3
    const result = getGraphScale('500' as any)
    expect(result).toBe(1.3)
  })

  it('returns 1.3 at exactly 767 (just below desktop boundary)', () => {
    expect(getGraphScale(767)).toBe(1.3)
  })

  it('returns 1 at exactly 768 (desktop boundary)', () => {
    expect(getGraphScale(768)).toBe(1)
  })
})

// ===========================================================================
// Floating point width handling
// ===========================================================================

describe('floating point width handling', () => {
  it('all functions handle floating point widths (640.5 is tablet)', () => {
    expect(getDeviceTier(640.5)).toBe('tablet')
    expect(isMobileWidth(640.5)).toBe(true)
    expect(getSidebarWidth(640.5)).toBe('90%')
    expect(getGraphScale(640.5)).toBe(1.3)
  })

  it('getSidebarWidth: width 640.5 returns "90%" (float boundary)', () => {
    expect(getSidebarWidth(640.5)).toBe('90%')
  })

  it('getDeviceTier: width 640.5 returns "tablet" (float boundary)', () => {
    expect(getDeviceTier(640.5)).toBe('tablet')
  })
})

// ===========================================================================
// Runtime type validation
// ===========================================================================

describe('export types', () => {
  it('all exported utilities are functions', () => {
    expect(typeof getDeviceTier).toBe('function')
    expect(typeof isMobileWidth).toBe('function')
    expect(typeof getSidebarWidth).toBe('function')
    expect(typeof getGraphScale).toBe('function')
  })
})
