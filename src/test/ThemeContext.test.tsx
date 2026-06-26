/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../store/ThemeContext'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A tiny component that consumes useTheme and renders its state so we can
 *  assert on it via testing-library queries. */
function ThemeConsumer() {
  const theme = useTheme()
  return (
    <div>
      <span data-testid="mode">{theme.mode}</span>
      <span data-testid="isDark">{String(theme.isDark)}</span>
      <span data-testid="palette-label">{theme.getGroupPalette(1).label}</span>
      <span data-testid="palette-base">{theme.getGroupPalette(1).base}</span>
      <button data-testid="btn-toggle" onClick={theme.toggle}>
        Toggle
      </button>
      <button data-testid="btn-light" onClick={() => theme.setMode('light')}>
        Set Light
      </button>
      <button data-testid="btn-dark" onClick={() => theme.setMode('dark')}>
        Set Dark
      </button>
    </div>
  )
}

function renderWithTheme() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  )
}

// ---------------------------------------------------------------------------
// Set up a controllable matchMedia mock for tests that need it.
// The global mock in setup.ts always returns matches: false with no-op
// addEventListener, so we override window.matchMedia when we need to
// control the system preference or listen to changes.
// ---------------------------------------------------------------------------

interface MatchMediaMock {
  matches: boolean
  media: string
  addEventListener: (event: string, handler: (e: { matches: boolean }) => void) => void
  removeEventListener: (event: string, handler: (e: { matches: boolean }) => void) => void
  /** Test helper: simulate a prefers-color-scheme change. */
  _simulateChange: (matches: boolean) => void
}

function createMatchMediaMock(initialMatches = false): MatchMediaMock {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  const mq: MatchMediaMock = {
    matches: initialMatches,
    media: '(prefers-color-scheme: light)',
    addEventListener(_event: string, handler: (e: { matches: boolean }) => void) {
      listeners.push(handler)
    },
    removeEventListener(_event: string, handler: (e: { matches: boolean }) => void) {
      const idx = listeners.indexOf(handler)
      if (idx !== -1) listeners.splice(idx, 1)
    },
    _simulateChange(matches: boolean) {
      mq.matches = matches
      listeners.forEach((h) => h({ matches }))
    },
  }
  return mq
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ThemeContext', () => {
  let initialMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage to clean state
    window.localStorage.clear()
    // Restore the global matchMedia mock from setup.ts for tests that don't
    // explicitly override it.
    window.matchMedia = initialMatchMedia
  })

  beforeAll(() => {
    // Snapshot the global mock so we can restore it in beforeEach
    initialMatchMedia = window.matchMedia
  })

  // -----------------------------------------------------------------------
  // Provider basics
  // -----------------------------------------------------------------------

  it('renders children inside ThemeProvider', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('useTheme returns default dark mode when no localStorage or system preference is set', () => {
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('isDark').textContent).toBe('true')
  })

  it('useTheme throws an error when called outside ThemeProvider', () => {
    // Silence the expected error output from React
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeConsumer />)).toThrow(
      'useTheme must be used within ThemeProvider',
    )
    consoleSpy.mockRestore()
  })

  // -----------------------------------------------------------------------
  // Mode switching
  // -----------------------------------------------------------------------

  it('toggle switches from dark to light mode', () => {
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))

    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
  })

  it('toggle switches back to dark mode on second call', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('light')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('isDark').textContent).toBe('true')
  })

  it('setMode sets light mode explicitly', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('setMode sets dark mode explicitly', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('mode').textContent).toBe('light')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // Group palette
  // -----------------------------------------------------------------------

  it('getGroupPalette returns correct palette for a group in dark mode', () => {
    renderWithTheme()
    // Group 1 in dark mode
    expect(screen.getByTestId('palette-label').textContent).toBe('Foundations')
    expect(screen.getByTestId('palette-base').textContent).toBe('#FF006E')
  })

  it('getGroupPalette returns light palette when mode is light', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('palette-label').textContent).toBe('Foundations')
    expect(screen.getByTestId('palette-base').textContent).toBe('#D0005A')
  })

  // -----------------------------------------------------------------------
  // localStorage persistence
  // -----------------------------------------------------------------------

  it('persists preference to localStorage after toggle', () => {
    renderWithTheme()
    expect(window.localStorage.getItem('aimindmap-theme')).toBeNull()

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('light')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('dark')
  })

  it('persists preference to localStorage after setMode', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('light')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('dark')
  })

  it('initializes from localStorage when a preference is stored', () => {
    window.localStorage.setItem('aimindmap-theme', 'light')
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
  })

  // -----------------------------------------------------------------------
  // System preference (prefers-color-scheme)
  // -----------------------------------------------------------------------

  it('falls back to light mode when system prefers light and no localStorage is set', () => {
    const mq = createMatchMediaMock(true /* matches = prefers light */)
    window.matchMedia = () => mq as any

    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('light')
  })

  it('localStorage takes priority over system preference', () => {
    window.localStorage.setItem('aimindmap-theme', 'dark')
    const mq = createMatchMediaMock(true /* prefers light */)
    window.matchMedia = () => mq as any

    renderWithTheme()
    // Should be dark because localStorage says dark, even though system
    // prefers light.
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // data-theme attribute on <html>
  // -----------------------------------------------------------------------

  it('sets data-theme attribute on <html> element', () => {
    renderWithTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('updates data-theme attribute when mode changes', () => {
    renderWithTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  // -----------------------------------------------------------------------
  // prefers-color-scheme change listener
  // -----------------------------------------------------------------------

  it('listens to prefers-color-scheme changes and updates mode when no localStorage is set', () => {
    const mq = createMatchMediaMock(false)
    window.matchMedia = () => mq as any

    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    // Simulate the OS switching to light mode
    act(() => {
      mq._simulateChange(true)
    })

    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
  })

  it('does not change mode on media query change when localStorage is set', () => {
    window.localStorage.setItem('aimindmap-theme', 'dark')
    const mq = createMatchMediaMock(false)
    window.matchMedia = () => mq as any

    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    // System switches to light, but localStorage preference should win
    act(() => {
      mq._simulateChange(true)
    })

    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // Additional state switching tests
  // -----------------------------------------------------------------------

  it('toggles from light to dark to light (3 states verified)', () => {
    renderWithTheme()
    // Start dark
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('isDark').textContent).toBe('true')

    // Toggle to light
    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')

    // Toggle back to dark
    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('isDark').textContent).toBe('true')

    // Toggle to light again (3rd toggle = light)
    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
  })

  it('setMode("dark") when already dark is idempotent', () => {
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(screen.getByTestId('mode').textContent).toBe('dark')
    expect(screen.getByTestId('isDark').textContent).toBe('true')
  })

  it('setMode("light") when already light is idempotent', () => {
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('mode').textContent).toBe('light')

    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('mode').textContent).toBe('light')
    expect(screen.getByTestId('isDark').textContent).toBe('false')
  })

  // -----------------------------------------------------------------------
  // localStorage edge cases
  // -----------------------------------------------------------------------

  it('falls back to default when localStorage contains invalid theme "blue"', () => {
    window.localStorage.setItem('aimindmap-theme', 'blue')
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('falls back to default when localStorage contains an empty string', () => {
    window.localStorage.setItem('aimindmap-theme', '')
    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  // -----------------------------------------------------------------------
  // getGroupPalette edge cases
  // -----------------------------------------------------------------------

  it('getGroupPalette for group 0 falls back to group 1', () => {
    function Group0Consumer() {
      const { getGroupPalette } = useTheme()
      return <span data-testid="g0-palette">{getGroupPalette(0).label}</span>
    }
    render(
      <ThemeProvider>
        <Group0Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('g0-palette').textContent).toBe('Foundations')
  })

  it('getGroupPalette for negative group number falls back to group 1', () => {
    function NegGroupConsumer() {
      const { getGroupPalette } = useTheme()
      return <span data-testid="neg-palette">{getGroupPalette(-5).label}</span>
    }
    render(
      <ThemeProvider>
        <NegGroupConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('neg-palette').textContent).toBe('Foundations')
  })

  it('getGroupPalette for very large group (999) falls back to group 1', () => {
    function LargeGroupConsumer() {
      const { getGroupPalette } = useTheme()
      return <span data-testid="lg-palette">{getGroupPalette(999).label}</span>
    }
    render(
      <ThemeProvider>
        <LargeGroupConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('lg-palette').textContent).toBe('Foundations')
  })

  it('getGroupPalette returns distinct palettes for groups 1, 2, and 3', () => {
    function MultiGroupConsumer() {
      const { getGroupPalette } = useTheme()
      return (
        <div>
          <span data-testid="g1-label">{getGroupPalette(1).label}</span>
          <span data-testid="g1-base">{getGroupPalette(1).base}</span>
          <span data-testid="g2-label">{getGroupPalette(2).label}</span>
          <span data-testid="g2-base">{getGroupPalette(2).base}</span>
          <span data-testid="g3-label">{getGroupPalette(3).label}</span>
          <span data-testid="g3-base">{getGroupPalette(3).base}</span>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <MultiGroupConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('g1-label').textContent).toBe('Foundations')
    expect(screen.getByTestId('g1-base').textContent).toBe('#FF006E')
    expect(screen.getByTestId('g2-label').textContent).toBe('Prompt Engineering')
    expect(screen.getByTestId('g2-base').textContent).toBe('#00E676')
    expect(screen.getByTestId('g3-label').textContent).toBe('RAG & Search')
    expect(screen.getByTestId('g3-base').textContent).toBe('#00B0FF')
  })

  // -----------------------------------------------------------------------
  // Multiple consumers
  // -----------------------------------------------------------------------

  it('multiple ThemeConsumers show the same theme values', () => {
    function DualConsumer() {
      return (
        <div>
          <ThemeConsumer />
          <ThemeConsumer />
        </div>
      )
    }
    render(
      <ThemeProvider>
        <DualConsumer />
      </ThemeProvider>,
    )
    const modes = screen.getAllByTestId('mode')
    expect(modes).toHaveLength(2)
    expect(modes[0].textContent).toBe('dark')
    expect(modes[1].textContent).toBe('dark')

    const isDarks = screen.getAllByTestId('isDark')
    expect(isDarks[0].textContent).toBe('true')
    expect(isDarks[1].textContent).toBe('true')
  })

  it('theme toggle re-renders all consumers and they reflect the new mode', () => {
    function DualConsumer() {
      return (
        <div>
          <ThemeConsumer />
          <ThemeConsumer />
        </div>
      )
    }
    render(
      <ThemeProvider>
        <DualConsumer />
      </ThemeProvider>,
    )

    const toggleBtns = screen.getAllByTestId('btn-toggle')
    fireEvent.click(toggleBtns[0])

    const modes = screen.getAllByTestId('mode')
    expect(modes[0].textContent).toBe('light')
    expect(modes[1].textContent).toBe('light')

    const isDarks = screen.getAllByTestId('isDark')
    expect(isDarks[0].textContent).toBe('false')
    expect(isDarks[1].textContent).toBe('false')
  })

  // -----------------------------------------------------------------------
  // meta[name="theme-color"] synchronization
  // -----------------------------------------------------------------------

  it('sets meta[name="theme-color"] to dark color initially', () => {
    // Ensure meta tag exists
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    renderWithTheme()
    expect(meta.getAttribute('content')).toBe('#080B1A')
  })

  it('updates meta[name="theme-color"] when switching to light mode', () => {
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(meta.getAttribute('content')).toBe('#F0F4FF')
  })

  it('updates meta[name="theme-color"] when switching back to dark mode', () => {
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    renderWithTheme()
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(meta.getAttribute('content')).toBe('#F0F4FF')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(meta.getAttribute('content')).toBe('#080B1A')
  })

  // -----------------------------------------------------------------------
  // data-theme attribute edge cases
  // -----------------------------------------------------------------------

  it('data-theme attribute is not present before mount, is present after mount', () => {
    document.documentElement.removeAttribute('data-theme')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()

    renderWithTheme()

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('data-theme attribute updates correctly after multiple toggles and setMode', () => {
    renderWithTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('data-theme persists after ThemeProvider unmounts (does not get removed)', () => {
    document.documentElement.removeAttribute('data-theme')
    const { unmount } = renderWithTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    unmount()

    // useEffect for data-theme has no cleanup, so the attribute stays on <html>
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  // -----------------------------------------------------------------------
  // System preference multiple changes
  // -----------------------------------------------------------------------

  it('responds to system preference dark -> light -> dark (two changes)', () => {
    const mq = createMatchMediaMock(false) // matches=false means no light preference => dark
    window.matchMedia = () => mq as any

    renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    // System switches to light
    act(() => {
      mq._simulateChange(true)
    })
    expect(screen.getByTestId('mode').textContent).toBe('light')

    // System switches back to dark
    act(() => {
      mq._simulateChange(false)
    })
    expect(screen.getByTestId('mode').textContent).toBe('dark')
  })

  it('system preference listener is cleaned up on unmount', () => {
    const mq = createMatchMediaMock(false)
    const removeSpy = vi.fn()
    const origRemoveEventListener = mq.removeEventListener
    mq.removeEventListener = removeSpy
    window.matchMedia = () => mq as any

    const { unmount } = renderWithTheme()
    expect(screen.getByTestId('mode').textContent).toBe('dark')

    // Before unmount, the listener should NOT have been removed yet
    expect(removeSpy).not.toHaveBeenCalled()

    unmount()

    // After unmount the cleanup effect should have removed the listener
    expect(removeSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })

  // -----------------------------------------------------------------------
  // Children rendering edge cases
  // -----------------------------------------------------------------------

  it('renders with React.Fragment as child', () => {
    render(
      <ThemeProvider>
        <React.Fragment>
          <div data-testid="fragment-child">Fragment child</div>
        </React.Fragment>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('fragment-child')).toBeInTheDocument()
    expect(screen.getByText('Fragment child')).toBeInTheDocument()
  })

  it('renders with multiple children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child-a">A</div>
        <div data-testid="child-b">B</div>
      </ThemeProvider>,
    )
    expect(screen.getByTestId('child-a')).toBeInTheDocument()
    expect(screen.getByTestId('child-b')).toBeInTheDocument()
  })

  it('renders with null and undefined child gracefully', () => {
    expect(() => {
      render(
        <ThemeProvider>
          {null}
        </ThemeProvider>,
      )
    }).not.toThrow()

    expect(() => {
      render(
        <ThemeProvider>
          {undefined}
        </ThemeProvider>,
      )
    }).not.toThrow()
  })

  // -----------------------------------------------------------------------
  // Function identity stability
  // -----------------------------------------------------------------------

  it('toggle function has stable identity across re-renders', () => {
    function IdentityConsumer() {
      const theme = useTheme()
      const firstToggleRef = React.useRef(theme.toggle)
      const isStable = theme.toggle === firstToggleRef.current
      return (
        <div>
          <span data-testid="toggle-stable">{String(isStable)}</span>
          <button data-testid="btn-toggle-stable" onClick={theme.toggle}>Toggle</button>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <IdentityConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('toggle-stable').textContent).toBe('true')

    // Trigger re-render via toggle — toggle ref should remain stable (useCallback [])
    fireEvent.click(screen.getByTestId('btn-toggle-stable'))
    expect(screen.getByTestId('toggle-stable').textContent).toBe('true')
  })

  it('setMode function has stable identity across re-renders', () => {
    function SetModeIdentityConsumer() {
      const theme = useTheme()
      const firstSetModeRef = React.useRef(theme.setMode)
      const isStable = theme.setMode === firstSetModeRef.current
      return (
        <div>
          <span data-testid="setmode-stable">{String(isStable)}</span>
          <button data-testid="btn-setmode-stable" onClick={() => theme.setMode('light')}>Set Light</button>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <SetModeIdentityConsumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('setmode-stable').textContent).toBe('true')

    // Trigger re-render via setMode — setMode ref should remain stable
    fireEvent.click(screen.getByTestId('btn-setmode-stable'))
    expect(screen.getByTestId('setmode-stable').textContent).toBe('true')
  })

  // -----------------------------------------------------------------------
  // localStorage key/value verification
  // -----------------------------------------------------------------------

  it('localStorage key used for persistence is "aimindmap-theme"', () => {
    renderWithTheme()
    expect(window.localStorage.getItem('aimindmap-theme')).toBeNull()
    expect(window.localStorage.length).toBe(0)

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('light')
    expect(window.localStorage.length).toBe(1)
  })

  it('localStorage stores values exactly "dark" or "light"', () => {
    renderWithTheme()

    fireEvent.click(screen.getByTestId('btn-light'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('light')

    fireEvent.click(screen.getByTestId('btn-dark'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('dark')

    fireEvent.click(screen.getByTestId('btn-toggle'))
    expect(window.localStorage.getItem('aimindmap-theme')).toBe('light')
  })

  // -----------------------------------------------------------------------
  // Combined dark / light mode verification
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // Additional group palette verification (groups beyond 1)
  // -----------------------------------------------------------------------

  it('getGroupPalette returns correct dark palette values for group 2', () => {
    function Group2Consumer() {
      const { getGroupPalette } = useTheme()
      return (
        <div>
          <span data-testid="g2-label">{getGroupPalette(2).label}</span>
          <span data-testid="g2-base">{getGroupPalette(2).base}</span>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <Group2Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('g2-label').textContent).toBe('Prompt Engineering')
    expect(screen.getByTestId('g2-base').textContent).toBe('#00E676')
  })

  it('getGroupPalette returns correct light palette values for group 2', () => {
    function Group2LightConsumer() {
      const { getGroupPalette } = useTheme()
      return (
        <div>
          <span data-testid="g2l-label">{getGroupPalette(2).label}</span>
          <span data-testid="g2l-base">{getGroupPalette(2).base}</span>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <Group2LightConsumer />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('g2l-label').textContent).toBe('Prompt Engineering')
    expect(screen.getByTestId('g2l-base').textContent).toBe('#00A857')
  })

  it('getGroupPalette returns correct dark palette values for group 15', () => {
    function Group15Consumer() {
      const { getGroupPalette } = useTheme()
      return (
        <div>
          <span data-testid="g15-label">{getGroupPalette(15).label}</span>
          <span data-testid="g15-base">{getGroupPalette(15).base}</span>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <Group15Consumer />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('g15-label').textContent).toBe('Protocols & Standards')
    expect(screen.getByTestId('g15-base').textContent).toBe('#FF6B6B')
  })

  it('getGroupPalette returns correct light palette values for group 15', () => {
    function Group15LightConsumer() {
      const { getGroupPalette } = useTheme()
      return (
        <div>
          <span data-testid="g15l-label">{getGroupPalette(15).label}</span>
          <span data-testid="g15l-base">{getGroupPalette(15).base}</span>
        </div>
      )
    }
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <Group15LightConsumer />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByTestId('btn-light'))
    expect(screen.getByTestId('g15l-label').textContent).toBe('Protocols & Standards')
    expect(screen.getByTestId('g15l-base').textContent).toBe('#CC4444')
  })
})
