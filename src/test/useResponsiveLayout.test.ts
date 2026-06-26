import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'

// ===========================================================================
// useResponsiveLayout — Hook that observes the viewport and returns
// responsive layout values.
// ===========================================================================

beforeEach(() => {
  // Provide a controllable window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Change window.innerWidth and dispatch a resize event.
 * The hook uses a 100 ms debounce, so callers must advance fake timers.
 */
function setWindowWidth(width: number) {
  window.innerWidth = width
  window.dispatchEvent(new Event('resize'))
}

// ---------------------------------------------------------------------------
// Initial values
// ---------------------------------------------------------------------------

describe('initial values', () => {
  it('returns the viewportWidth as window.innerWidth', () => {
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.viewportWidth).toBe(1024)
  })

  it('returns isMobile as false for desktop width', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(false)
  })

  it('returns isMobile as true for mobile width', () => {
    window.innerWidth = 375
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(true)
  })

  it('returns tier matching the viewport width', () => {
    window.innerWidth = 640
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('tablet')
  })

  it('returns sidebarWidth varying by width', () => {
    window.innerWidth = 320
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe('100%')

    window.innerWidth = 800
    const { result: result2 } = renderHook(() => useResponsiveLayout())
    expect(result2.current.sidebarWidth).toBe(380)

    window.innerWidth = 1024
    const { result: result3 } = renderHook(() => useResponsiveLayout())
    expect(result3.current.sidebarWidth).toBe(420)
  })

  it('returns graphScale as 1 for desktop', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1)
  })

  it('returns graphScale as 1.3 for mobile', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1.3)
  })
})

// ---------------------------------------------------------------------------
// isMobile behavior
// ---------------------------------------------------------------------------

describe('isMobile behavior', () => {
  it('isMobile is true when viewport < 768', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(true)
  })

  it('isMobile is false when viewport >= 768', () => {
    window.innerWidth = 768
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(false)

    window.innerWidth = 1024
    const { result: r2 } = renderHook(() => useResponsiveLayout())
    expect(r2.current.isMobile).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Resize event updates values (with debounce)
//
// IMPORTANT: Fake timers must be activated BEFORE the hook renders so that
// the setTimeout calls inside useEffect use the fake timer implementation.
// ---------------------------------------------------------------------------

describe('resize event', () => {
  it('updates viewportWidth after debounce timeout', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(false)

    // Trigger a resize to mobile width
    act(() => {
      setWindowWidth(500)
    })

    // Before debounce fires, values should still be desktop
    expect(result.current.viewportWidth).toBe(1024)

    // Advance past the 100ms debounce
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.viewportWidth).toBe(500)
    expect(result.current.isMobile).toBe(true)
    expect(result.current.tier).toBe('mobile')
    expect(result.current.graphScale).toBe(1.3)
  })

  it('debounce prevents rapid intermediate updates', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    // Rapid resizes
    act(() => { setWindowWidth(900) })
    vi.advanceTimersByTime(30)
    act(() => { setWindowWidth(800) })
    vi.advanceTimersByTime(30)
    act(() => { setWindowWidth(375) })
    vi.advanceTimersByTime(30)

    // Only 90ms total — debounce has not fired yet
    expect(result.current.viewportWidth).toBe(1024)

    // Advance past the last debounce
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // The final value should be 375
    expect(result.current.viewportWidth).toBe(375)
    expect(result.current.isMobile).toBe(true)
  })

  it('multiple resize events eventually settle on the last width', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => { setWindowWidth(800) })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.viewportWidth).toBe(800)

    act(() => { setWindowWidth(1200) })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.viewportWidth).toBe(1200)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.tier).toBe('desktop')
  })
})

// ---------------------------------------------------------------------------
// orientationchange event
// ---------------------------------------------------------------------------

describe('orientationchange event', () => {
  it('updates viewportWidth after orientationchange with 200ms delay', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    // Simulate orientation change (e.g. rotate to portrait)
    act(() => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('orientationchange'))
    })

    // Before the 200ms timeout, values should be unchanged
    expect(result.current.viewportWidth).toBe(1024)

    // Advance past the orientationchange delay
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.viewportWidth).toBe(375)
    expect(result.current.isMobile).toBe(true)
  })

  it('orientationchange followed by resize — both update values', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    // Orientation change to portrait
    act(() => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('orientationchange'))
    })

    // Resize to tablet
    act(() => { setWindowWidth(800) })

    // Advance resize debounce (100ms) first
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.viewportWidth).toBe(800)

    // Advance orientationchange delay (200ms total from start)
    act(() => { vi.advanceTimersByTime(100) })
    // The orientation callback fires and overrides with the current innerWidth (still 800)
    expect(result.current.viewportWidth).toBe(800)
  })
})

// ---------------------------------------------------------------------------
// Graph scale by viewport
// ---------------------------------------------------------------------------

describe('graphScale by viewport', () => {
  it('graphScale is 1 for desktop (>= 768)', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1)
  })

  it('graphScale is 1.3 for mobile (< 768)', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1.3)
  })
})

// ---------------------------------------------------------------------------
// Tier matches viewport width
// ---------------------------------------------------------------------------

describe('tier matches viewport width', () => {
  it('returns "mobile" for width < 640', () => {
    window.innerWidth = 320
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('mobile')
  })

  it('returns "tablet" for width between 640 and 1023', () => {
    window.innerWidth = 768
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('tablet')
  })

  it('returns "desktop" for width >= 1024', () => {
    window.innerWidth = 1440
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('desktop')
  })
})

// ---------------------------------------------------------------------------
// Event listener cleanup
// ---------------------------------------------------------------------------

describe('event listener cleanup', () => {
  it('removes resize event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useResponsiveLayout())
    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('cleanup of orientationchange listener does not throw', () => {
    const { unmount } = renderHook(() => useResponsiveLayout())
    expect(() => unmount()).not.toThrow()
  })

  it('re-render does not re-attach event listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')

    const { rerender } = renderHook(() => useResponsiveLayout())
    const initialCalls = addSpy.mock.calls.length

    rerender()

    // No new event listeners should be added on re-render
    expect(addSpy.mock.calls.length).toBe(initialCalls)
    addSpy.mockRestore()
  })

  it('cleanup clears the debounce timeout', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

    window.innerWidth = 1024
    const { unmount } = renderHook(() => useResponsiveLayout())

    act(() => { setWindowWidth(500) })
    unmount()

    // Should have cleared the timeout on cleanup
    expect(clearSpy).toHaveBeenCalled()
    vi.useRealTimers()
    clearSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// Debounce edge cases
// ---------------------------------------------------------------------------

describe('debounce edge cases', () => {
  it('resize during debounce — only last width applies', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    // First resize
    act(() => { setWindowWidth(700) })
    vi.advanceTimersByTime(50)

    // Before debounce fires, second resize resets the timer
    act(() => { setWindowWidth(500) })
    vi.advanceTimersByTime(60)
    // Total: 110ms since first resize, 60ms since second — neither debounce fired yet
    expect(result.current.viewportWidth).toBe(1024)

    // Advance to 100ms since the last resize
    act(() => { vi.advanceTimersByTime(40) })
    expect(result.current.viewportWidth).toBe(500)
  })

  it('multiple rapid orientation changes — last one wins', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => {
      window.innerWidth = 800
      window.dispatchEvent(new Event('orientationchange'))
    })
    act(() => {
      window.innerWidth = 600
      window.dispatchEvent(new Event('orientationchange'))
    })
    act(() => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('orientationchange'))
    })

    // Advance past the 200ms orientation delay
    act(() => { vi.advanceTimersByTime(200) })

    expect(result.current.viewportWidth).toBe(375)
    expect(result.current.isMobile).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Boundary widths
// ---------------------------------------------------------------------------

describe('boundary widths', () => {
  it('tier is "mobile" at exact width 639', () => {
    window.innerWidth = 639
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('mobile')
  })

  it('tier is "tablet" at exact width 640', () => {
    window.innerWidth = 640
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('tablet')
  })

  it('tier is "tablet" at exact width 1023', () => {
    window.innerWidth = 1023
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('tablet')
  })

  it('tier is "desktop" at exact width 1024', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.tier).toBe('desktop')
  })
})

// ---------------------------------------------------------------------------
// SidebarWidth specific boundaries
// ---------------------------------------------------------------------------

describe('sidebarWidth at boundaries', () => {
  it('returns "100%" for width 639 (below mobile breakpoint)', () => {
    window.innerWidth = 639
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe('100%')
  })

  it('returns "90%" for width 640 (at mobile breakpoint)', () => {
    window.innerWidth = 640
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe('90%')
  })

  it('returns 380 for width 800 (between tablet and desktop breakpoints)', () => {
    window.innerWidth = 800
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe(380)
  })

  it('returns 420 for exact width 1024 (at desktop breakpoint)', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe(420)
  })
})

// ---------------------------------------------------------------------------
// isMobile debounce transitions
// ---------------------------------------------------------------------------

describe('isMobile debounce transitions', () => {
  it('isMobile stays false until debounce resolves when resizing from desktop to mobile', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(false)

    act(() => { setWindowWidth(500) })
    // Before debounce, isMobile should still reflect old width
    expect(result.current.isMobile).toBe(false)

    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.isMobile).toBe(true)
  })

  it('isMobile becomes true after debounce resolves on resize to mobile', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => { setWindowWidth(500) })
    act(() => { vi.advanceTimersByTime(100) })

    expect(result.current.isMobile).toBe(true)
    expect(result.current.viewportWidth).toBe(500)
  })

  it('isMobile remains true when resizing within mobile range without crossing boundary', () => {
    vi.useFakeTimers()
    window.innerWidth = 500
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(true)

    act(() => { setWindowWidth(600) })
    act(() => { vi.advanceTimersByTime(100) })

    expect(result.current.isMobile).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Extreme viewport widths
// ---------------------------------------------------------------------------

describe('extreme viewport widths', () => {
  it('sidebarWidth is "100%" for ultra-small width (200px)', () => {
    window.innerWidth = 200
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.sidebarWidth).toBe('100%')
  })

  it('handles very large width (9999) as desktop', () => {
    window.innerWidth = 9999
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(false)
    expect(result.current.tier).toBe('desktop')
    expect(result.current.graphScale).toBe(1)
    expect(result.current.sidebarWidth).toBe(420)
  })

  it('handles width of 0 gracefully', () => {
    window.innerWidth = 0
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.isMobile).toBe(true)
    expect(result.current.tier).toBe('mobile')
    expect(result.current.sidebarWidth).toBe('100%')
    expect(result.current.graphScale).toBe(1.3)
  })

  it('handles orientationchange with zero width', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => {
      window.innerWidth = 0
      window.dispatchEvent(new Event('orientationchange'))
    })
    act(() => { vi.advanceTimersByTime(200) })

    expect(result.current.viewportWidth).toBe(0)
    expect(result.current.isMobile).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Multiple independent hooks
// ---------------------------------------------------------------------------

describe('multiple hooks', () => {
  it('two hooks each get correct values for their viewport', () => {
    window.innerWidth = 375
    const { result: mobileResult } = renderHook(() => useResponsiveLayout())

    window.innerWidth = 1440
    const { result: desktopResult } = renderHook(() => useResponsiveLayout())

    // First hook snapshot was taken at 375
    expect(mobileResult.current.isMobile).toBe(true)
    expect(mobileResult.current.tier).toBe('mobile')

    // Second hook snapshot at 1440
    expect(desktopResult.current.isMobile).toBe(false)
    expect(desktopResult.current.tier).toBe('desktop')
  })
})

// ---------------------------------------------------------------------------
// Stable references
// ---------------------------------------------------------------------------

describe('stable references', () => {
  it('viewportWidth value persists correctly across re-renders', () => {
    window.innerWidth = 1024
    const { result, rerender } = renderHook(() => useResponsiveLayout())
    expect(result.current.viewportWidth).toBe(1024)

    rerender()
    expect(result.current.viewportWidth).toBe(1024)
  })

  it('graphScale returns consistent values for the same viewport', () => {
    window.innerWidth = 600
    const { result, rerender } = renderHook(() => useResponsiveLayout())
    const firstScale = result.current.graphScale

    rerender()
    expect(result.current.graphScale).toBe(firstScale)
  })
})

// ---------------------------------------------------------------------------
// Tier transitions
// ---------------------------------------------------------------------------

describe('tier transitions', () => {
  it('transitions mobile → tablet → desktop as width increases', () => {
    window.innerWidth = 500
    const { result: r1 } = renderHook(() => useResponsiveLayout())
    expect(r1.current.tier).toBe('mobile')

    window.innerWidth = 800
    const { result: r2 } = renderHook(() => useResponsiveLayout())
    expect(r2.current.tier).toBe('tablet')

    window.innerWidth = 1200
    const { result: r3 } = renderHook(() => useResponsiveLayout())
    expect(r3.current.tier).toBe('desktop')
  })

  it('transitions desktop → tablet → mobile as width decreases', () => {
    window.innerWidth = 1200
    const { result: r1 } = renderHook(() => useResponsiveLayout())
    expect(r1.current.tier).toBe('desktop')

    window.innerWidth = 800
    const { result: r2 } = renderHook(() => useResponsiveLayout())
    expect(r2.current.tier).toBe('tablet')

    window.innerWidth = 500
    const { result: r3 } = renderHook(() => useResponsiveLayout())
    expect(r3.current.tier).toBe('mobile')
  })
})

// ---------------------------------------------------------------------------
// GraphScale properties
// ---------------------------------------------------------------------------

describe('graphScale properties', () => {
  it('graphScale is never negative for any viewport width', () => {
    const widths = [0, 200, 375, 500, 639, 640, 767, 768, 800, 1024, 1440, 9999]
    for (const w of widths) {
      window.innerWidth = w
      const { result } = renderHook(() => useResponsiveLayout())
      expect(result.current.graphScale).toBeGreaterThan(0)
    }
  })

  it('graphScale is 1 at exact desktop boundary (768)', () => {
    window.innerWidth = 768
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1)
  })

  it('graphScale is 1.3 just below desktop boundary (767)', () => {
    window.innerWidth = 767
    const { result } = renderHook(() => useResponsiveLayout())
    expect(result.current.graphScale).toBe(1.3)
  })
})

// ---------------------------------------------------------------------------
// Debounce timing accuracy
// ---------------------------------------------------------------------------

describe('debounce timing accuracy', () => {
  it('debounce resolves at exactly 100ms after the last resize', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => { setWindowWidth(500) })

    // Before debounce
    expect(result.current.viewportWidth).toBe(1024)

    // At exactly 99ms — still not resolved
    act(() => { vi.advanceTimersByTime(99) })
    expect(result.current.viewportWidth).toBe(1024)

    // At exactly 100ms — should resolve
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current.viewportWidth).toBe(500)
  })

  it('subsequent resize resets the debounce timer', () => {
    vi.useFakeTimers()
    window.innerWidth = 1024
    const { result } = renderHook(() => useResponsiveLayout())

    act(() => { setWindowWidth(600) })
    act(() => { vi.advanceTimersByTime(90) })
    // At 90ms, resize again
    act(() => { setWindowWidth(400) })
    // The debounce timer was reset; at 100ms from first resize it shouldn't fire
    act(() => { vi.advanceTimersByTime(15) })
    // 90+15 = 105ms from first, but only 15ms since last
    expect(result.current.viewportWidth).toBe(1024)

    // Now advance to 100ms since last resize
    act(() => { vi.advanceTimersByTime(85) })
    expect(result.current.viewportWidth).toBe(400)
  })
})
