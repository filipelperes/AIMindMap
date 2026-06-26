/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { format } from 'date-fns'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock react-i18next so LocaleProvider's useTranslation() injection works
// deterministically without depending on the real i18n initialization.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en-US',
    },
  }),
}))

// Mock date-fns/format so we can test error fallback and assert on which
// format string is passed without relying on real date formatting.
vi.mock('date-fns', () => ({
  format: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock)
// ---------------------------------------------------------------------------

import { LocaleProvider, useLocale } from '../i18n/LocaleContext'
import type { SupportedLanguage } from '../i18n/i18n'
import { enUS, ptBR } from 'date-fns/locale'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A tiny component that consumes useLocale and exposes its API via
 *  data-testid attributes for easy assertions. */
function LocaleConsumer() {
  const locale = useLocale()
  return (
    <div>
      <span data-testid="language">{locale.language}</span>
      <span data-testid="preset">{locale.dateFormatPreset}</span>
      <span data-testid="custom-format">{locale.customDateFormat}</span>
      <span data-testid="locale-name">
        {locale.dateFnsLocale.code}
      </span>
      <span data-testid="formatted-date">
        {locale.formatDate(new Date(2025, 0, 15))}
      </span>
      <span data-testid="formatted-now">
        {locale.formatDate(Date.now())}
      </span>
      <button
        data-testid="btn-pt"
        onClick={() => locale.setLanguage('pt-BR')}
      >
        Set PT-BR
      </button>
      <button
        data-testid="btn-en"
        onClick={() => locale.setLanguage('en-US')}
      >
        Set EN-US
      </button>
      <button
        data-testid="btn-iso"
        onClick={() => locale.setDateFormatPreset('ISO')}
      >
        ISO
      </button>
      <button
        data-testid="btn-us"
        onClick={() => locale.setDateFormatPreset('US')}
      >
        US
      </button>
      <button
        data-testid="btn-eu"
        onClick={() => locale.setDateFormatPreset('EU')}
      >
        EU
      </button>
      <button
        data-testid="btn-custom"
        onClick={() => locale.setCustomDateFormat('yyyy/MM/dd')}
      >
        Custom
      </button>
    </div>
  )
}

/** Render the consumer inside both providers (LocaleProvider alone is
 *  sufficient here, but the app often nests LocaleProvider inside
 *  ThemeProvider – we keep it minimal for isolation). */
function renderLocaleConsumer() {
  return render(
    <LocaleProvider>
      <LocaleConsumer />
    </LocaleProvider>,
  )
}

/** Render useLocale outside a provider to test the error-throwing path. */
function renderConsumerWithoutProvider() {
  return render(<LocaleConsumer />)
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  // Reset localStorage so tests start clean
  window.localStorage.clear()
  // Reset document lang attribute
  document.documentElement.removeAttribute('lang')
  // Reset format mock to a sensible default
  vi.mocked(format).mockReset()
  vi.mocked(format).mockImplementation(
    (_date: Date, fmt: string, _opts?: any) => `FMT:${fmt}`,
  )
})

// ===========================================================================
// Tests
// ===========================================================================

describe('LocaleContext', () => {
  // -------------------------------------------------------------------------
  // Provider basics
  // -------------------------------------------------------------------------

  it('renders children inside LocaleProvider', () => {
    render(
      <LocaleProvider>
        <div data-testid="child">Hello</div>
      </LocaleProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('useLocale returns the default language (en-US)', () => {
    renderLocaleConsumer()
    expect(screen.getByTestId('language').textContent).toBe('en-US')
  })

  it('useLocale throws an error when called outside LocaleProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderConsumerWithoutProvider()).toThrow(
      'useLocale must be used within LocaleProvider',
    )
    consoleSpy.mockRestore()
  })

  // -------------------------------------------------------------------------
  // Language switching
  // -------------------------------------------------------------------------

  it('setLanguage changes the language to pt-BR', () => {
    renderLocaleConsumer()
    expect(screen.getByTestId('language').textContent).toBe('en-US')

    fireEvent.click(screen.getByTestId('btn-pt'))
    expect(screen.getByTestId('language').textContent).toBe('pt-BR')
  })

  it('setLanguage persists the language choice to localStorage', () => {
    renderLocaleConsumer()
    expect(window.localStorage.getItem('aimindmap-language')).toBeNull()

    fireEvent.click(screen.getByTestId('btn-pt'))
    expect(window.localStorage.getItem('aimindmap-language')).toBe('pt-BR')

    fireEvent.click(screen.getByTestId('btn-en'))
    expect(window.localStorage.getItem('aimindmap-language')).toBe('en-US')
  })

  it('initializes language from localStorage when a saved preference exists', () => {
    window.localStorage.setItem('aimindmap-language', 'pt-BR')
    renderLocaleConsumer()
    expect(screen.getByTestId('language').textContent).toBe('pt-BR')
  })

  // -------------------------------------------------------------------------
  // Date format preset switching
  // -------------------------------------------------------------------------

  it('setDateFormatPreset changes the preset to ISO', () => {
    renderLocaleConsumer()
    expect(screen.getByTestId('preset').textContent).toBe('locale')

    fireEvent.click(screen.getByTestId('btn-iso'))
    expect(screen.getByTestId('preset').textContent).toBe('ISO')
  })

  it('setDateFormatPreset changes the preset to US', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-us'))
    expect(screen.getByTestId('preset').textContent).toBe('US')
  })

  it('setDateFormatPreset changes the preset to EU', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-eu'))
    expect(screen.getByTestId('preset').textContent).toBe('EU')
  })

  // -------------------------------------------------------------------------
  // Custom date format
  // -------------------------------------------------------------------------

  it('setCustomDateFormat saves the custom format string and switches preset to custom', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-custom'))
    expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
    expect(screen.getByTestId('preset').textContent).toBe('custom')
  })

  it('setCustomDateFormat persists the custom format to localStorage', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-custom'))
    expect(window.localStorage.getItem('aimindmap-date-format')).toBe(
      'yyyy/MM/dd',
    )
  })

  // -------------------------------------------------------------------------
  // formatDate
  // -------------------------------------------------------------------------

  it('formatDate uses the locale-aware default format (en-US → MM/dd/yyyy)', () => {
    renderLocaleConsumer()
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:MM/dd/yyyy',
    )
  })

  it('formatDate switches to locale-aware format when language changes (pt-BR → dd/MM/yyyy)', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-pt'))
    // For pt-BR the default format is dd/MM/yyyy
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:dd/MM/yyyy',
    )
  })

  it('formatDate uses ISO format when ISO preset is selected', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-iso'))
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:yyyy-MM-dd',
    )
  })

  it('formatDate uses US format when US preset is selected', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-us'))
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:MM/dd/yyyy',
    )
  })

  it('formatDate uses EU format when EU preset is selected', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-eu'))
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:dd/MM/yyyy',
    )
  })

  it('formatDate uses custom format when custom preset is active', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-custom'))
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:yyyy/MM/dd',
    )
  })

  it('formatDate falls back to the default format when the first format call throws', () => {
    // Simulate a transient failure on the first format call (e.g. due to an
    // invalid format string or date): the first call throws, and formatDate
    // should catch and retry with DEFAULT_DATE_FORMAT.
    vi.mocked(format)
      // First call throws
      .mockImplementationOnce(() => {
        throw new RangeError('Invalid time value')
      })
      // Subsequent calls succeed
      .mockImplementation(
        (_date: Date, fmt: string, _opts?: any) => `FALLBACK:${fmt}`,
      )

    renderLocaleConsumer()
    // The first render triggers formatDate.  The first format call (inside
    // try) throws; the catch retries with 'yyyy-MM-dd'.
    const formatted = screen.getByTestId('formatted-date')
    expect(formatted.textContent).toBe('FALLBACK:yyyy-MM-dd')
  })

  // -------------------------------------------------------------------------
  // dateFnsLocale
  // -------------------------------------------------------------------------

  it('dateFnsLocale returns enUS for en-US language', () => {
    renderLocaleConsumer()
    expect(screen.getByTestId('locale-name').textContent).toBe(enUS.code)
  })

  it('dateFnsLocale returns ptBR for pt-BR language', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-pt'))
    expect(screen.getByTestId('locale-name').textContent).toBe(ptBR.code)
  })

  // -------------------------------------------------------------------------
  // Initialization from localStorage
  // -------------------------------------------------------------------------

  it('initializes date format preset from localStorage', () => {
    window.localStorage.setItem('aimindmap-date-format', 'dd/MM/yyyy')
    renderLocaleConsumer()
    // The stored format 'dd/MM/yyyy' matches the EU preset, so the preset
    // should be 'EU'.
    expect(screen.getByTestId('preset').textContent).toBe('EU')
    expect(screen.getByTestId('formatted-date').textContent).toBe(
      'FMT:dd/MM/yyyy',
    )
  })

  it('initializes custom date format from localStorage when stored format is not a known preset', () => {
    window.localStorage.setItem('aimindmap-date-format', 'yyyy/MM/dd')
    renderLocaleConsumer()
    expect(screen.getByTestId('preset').textContent).toBe('custom')
    expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
  })

  // -------------------------------------------------------------------------
  // <html lang> attribute synchronisation
  // -------------------------------------------------------------------------

  it('sets the <html lang> attribute to the current language', () => {
    renderLocaleConsumer()
    expect(document.documentElement.getAttribute('lang')).toBe('en-US')
  })

  it('updates the <html lang> attribute when language changes', () => {
    renderLocaleConsumer()
    fireEvent.click(screen.getByTestId('btn-pt'))
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR')
  })

  // =========================================================================
  // New tests (26 additional)
  // =========================================================================

  // -------------------------------------------------------------------------
  // Helpers for new tests
  // -------------------------------------------------------------------------

  /** Extended consumer with more actions for granular testing. */
  function ExtendedConsumer() {
    const ctx = useLocale()
    return (
      <div>
        <span data-testid="ext-language">{ctx.language}</span>
        <span data-testid="ext-preset">{ctx.dateFormatPreset}</span>
        <span data-testid="ext-custom-format">{ctx.customDateFormat}</span>
        <span data-testid="ext-formatted-date">
          {ctx.formatDate(new Date(2025, 0, 15))}
        </span>
        <button data-testid="ext-btn-pt" onClick={() => ctx.setLanguage('pt-BR')}>
          PT
        </button>
        <button data-testid="ext-btn-en" onClick={() => ctx.setLanguage('en-US')}>
          EN
        </button>
        <button data-testid="ext-btn-eu" onClick={() => ctx.setDateFormatPreset('EU')}>
          EU
        </button>
        <button data-testid="ext-btn-iso" onClick={() => ctx.setDateFormatPreset('ISO')}>
          ISO
        </button>
        <button data-testid="ext-btn-us" onClick={() => ctx.setDateFormatPreset('US')}>
          US
        </button>
        <button
          data-testid="ext-btn-locale"
          onClick={() => ctx.setDateFormatPreset('locale')}
        >
          LOCALE
        </button>
        <button
          data-testid="ext-btn-custom-empty"
          onClick={() => ctx.setCustomDateFormat('')}
        >
          EMPTY
        </button>
        <button
          data-testid="ext-btn-custom-long"
          onClick={() => ctx.setCustomDateFormat('yyyy-MM-dd HH:mm:ss')}
        >
          LONG
        </button>
      </div>
    )
  }

  function renderExtendedConsumer() {
    return render(
      <LocaleProvider>
        <ExtendedConsumer />
      </LocaleProvider>,
    )
  }

  /** Component that captures initial function references to check stability. */
  function IdentityCapture() {
    const ctx = useLocale()
    const [firstPresetFn] = React.useState(() => ctx.setDateFormatPreset)
    return (
      <div>
        <span data-testid="identity-preset-stable">
          {String(firstPresetFn === ctx.setDateFormatPreset)}
        </span>
        <button
          data-testid="identity-btn-pt"
          onClick={() => ctx.setLanguage('pt-BR')}
        >
          PT
        </button>
      </div>
    )
  }

  function renderIdentityCapture() {
    return render(
      <LocaleProvider>
        <IdentityCapture />
      </LocaleProvider>,
    )
  }

  // -------------------------------------------------------------------------
  // Language edge cases
  // -------------------------------------------------------------------------

  describe('language edge cases', () => {
    it('setLanguage(en-US) when already en-US is idempotent', () => {
      renderLocaleConsumer()
      expect(screen.getByTestId('language').textContent).toBe('en-US')
      fireEvent.click(screen.getByTestId('btn-en'))
      expect(screen.getByTestId('language').textContent).toBe('en-US')
    })

    it('localStorage stores invalid language — uses default (en-US)', () => {
      window.localStorage.setItem('aimindmap-language', 'invalid')
      renderLocaleConsumer()
      // Falls back to navigator.language which is 'en-US' in jsdom
      expect(screen.getByTestId('language').textContent).toBe('en-US')
    })

    it('multiple language switches en→pt→en→pt (4 transitions)', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('language').textContent).toBe('pt-BR')
      fireEvent.click(screen.getByTestId('btn-en'))
      expect(screen.getByTestId('language').textContent).toBe('en-US')
      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('language').textContent).toBe('pt-BR')
    })
  })

  // -------------------------------------------------------------------------
  // Date format edge cases
  // -------------------------------------------------------------------------

  describe('date format edge cases', () => {
    it('setDateFormatPreset(ISO) twice is idempotent', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-iso'))
      expect(screen.getByTestId('preset').textContent).toBe('ISO')
      fireEvent.click(screen.getByTestId('btn-iso'))
      expect(screen.getByTestId('preset').textContent).toBe('ISO')
    })

    it('setCustomDateFormat with empty string', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-custom-empty'))
      expect(screen.getByTestId('ext-custom-format').textContent).toBe('')
      expect(screen.getByTestId('ext-preset').textContent).toBe('custom')
    })

    it('setCustomDateFormat with very long format string', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-custom-long'))
      expect(screen.getByTestId('ext-custom-format').textContent).toBe(
        'yyyy-MM-dd HH:mm:ss',
      )
      expect(screen.getByTestId('ext-preset').textContent).toBe('custom')
    })

    it('setDateFormatPreset(ISO) persists format string to localStorage', () => {
      renderLocaleConsumer()
      // Clear any previous format storage
      window.localStorage.removeItem('aimindmap-date-format')
      fireEvent.click(screen.getByTestId('btn-iso'))
      expect(window.localStorage.getItem('aimindmap-date-format')).toBe(
        'yyyy-MM-dd',
      )
    })

    it('formatDate cycles correctly through EU→ISO→US presets', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-eu'))
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:dd/MM/yyyy',
      )
      fireEvent.click(screen.getByTestId('ext-btn-iso'))
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:yyyy-MM-dd',
      )
      fireEvent.click(screen.getByTestId('ext-btn-us'))
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:MM/dd/yyyy',
      )
    })
  })

  // -------------------------------------------------------------------------
  // Re-render stability
  // -------------------------------------------------------------------------

  describe('re-render stability', () => {
    it('custom format persists across re-render (rerender with same props)', () => {
      const { rerender } = render(
        <LocaleProvider>
          <LocaleConsumer />
        </LocaleProvider>,
      )
      fireEvent.click(screen.getByTestId('btn-custom'))
      expect(screen.getByTestId('preset').textContent).toBe('custom')
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')

      rerender(
        <LocaleProvider>
          <LocaleConsumer />
        </LocaleProvider>,
      )
      expect(screen.getByTestId('preset').textContent).toBe('custom')
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
    })

    it('custom format string preserved when switching to ISO preset', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-custom'))
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
      expect(screen.getByTestId('preset').textContent).toBe('custom')

      fireEvent.click(screen.getByTestId('btn-iso'))
      // Custom format string should still be in state
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
      // Preset should now be ISO
      expect(screen.getByTestId('preset').textContent).toBe('ISO')
    })
  })

  // -------------------------------------------------------------------------
  // formatDate locale passthrough
  // -------------------------------------------------------------------------

  describe('formatDate locale passthrough', () => {
    it('formatDate passes en-US locale to underlying format()', () => {
      renderLocaleConsumer()
      expect(vi.mocked(format)).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(String),
        expect.objectContaining({ locale: enUS }),
      )
    })

    it('formatDate passes pt-BR locale to underlying format() after language change', () => {
      renderLocaleConsumer()
      vi.mocked(format).mockClear()
      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(vi.mocked(format)).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(String),
        expect.objectContaining({ locale: ptBR }),
      )
    })
  })

  // -------------------------------------------------------------------------
  // Multiple consumers
  // -------------------------------------------------------------------------

  describe('multiple consumers', () => {
    it('multiple LocaleConsumers show same values', () => {
      render(
        <LocaleProvider>
          <LocaleConsumer />
          <LocaleConsumer />
        </LocaleProvider>,
      )
      const languages = screen.getAllByTestId('language')
      expect(languages).toHaveLength(2)
      expect(languages[0].textContent).toBe('en-US')
      expect(languages[1].textContent).toBe('en-US')
    })

    it('multiple consumers stay in sync after language change', () => {
      render(
        <LocaleProvider>
          <LocaleConsumer />
          <LocaleConsumer />
        </LocaleProvider>,
      )
      // Click the first btn-pt — both consumers should update
      fireEvent.click(screen.getAllByTestId('btn-pt')[0])
      const languages = screen.getAllByTestId('language')
      expect(languages[0].textContent).toBe('pt-BR')
      expect(languages[1].textContent).toBe('pt-BR')
    })
  })

  // -------------------------------------------------------------------------
  // Combined state changes
  // -------------------------------------------------------------------------

  describe('combined state changes', () => {
    it('language change + format preset change simultaneously', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('language').textContent).toBe('pt-BR')
      fireEvent.click(screen.getByTestId('btn-iso'))
      expect(screen.getByTestId('preset').textContent).toBe('ISO')
    })

    it('change language after setting custom format — format preset stays', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-custom'))
      expect(screen.getByTestId('preset').textContent).toBe('custom')

      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('language').textContent).toBe('pt-BR')
      // Preset must remain 'custom'
      expect(screen.getByTestId('preset').textContent).toBe('custom')
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
    })

    it('switching language en→pt→en — format follows locale', () => {
      renderLocaleConsumer()
      // Default: en-US → locale default format is MM/dd/yyyy
      expect(screen.getByTestId('formatted-date').textContent).toBe(
        'FMT:MM/dd/yyyy',
      )

      fireEvent.click(screen.getByTestId('btn-pt'))
      // pt-BR → locale default format is dd/MM/yyyy
      expect(screen.getByTestId('formatted-date').textContent).toBe(
        'FMT:dd/MM/yyyy',
      )

      fireEvent.click(screen.getByTestId('btn-en'))
      // Back to en-US → locale default format is MM/dd/yyyy
      expect(screen.getByTestId('formatted-date').textContent).toBe(
        'FMT:MM/dd/yyyy',
      )
    })

    it('setLanguage to pt-BR then setDateFormatPreset(ISO)', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('language').textContent).toBe('pt-BR')
      fireEvent.click(screen.getByTestId('btn-iso'))
      expect(screen.getByTestId('preset').textContent).toBe('ISO')
      expect(screen.getByTestId('formatted-date').textContent).toBe(
        'FMT:yyyy-MM-dd',
      )
    })

    it('setCustomDateFormat preserves across language switch pt→en', () => {
      renderLocaleConsumer()
      fireEvent.click(screen.getByTestId('btn-custom'))
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
      expect(screen.getByTestId('preset').textContent).toBe('custom')

      fireEvent.click(screen.getByTestId('btn-pt'))
      fireEvent.click(screen.getByTestId('btn-en'))
      // Custom format and preset must survive the language round-trip
      expect(screen.getByTestId('custom-format').textContent).toBe('yyyy/MM/dd')
      expect(screen.getByTestId('preset').textContent).toBe('custom')
    })
  })

  // -------------------------------------------------------------------------
  // dateFnsLocale transitions
  // -------------------------------------------------------------------------

  describe('dateFnsLocale transitions', () => {
    it('dateFnsLocale changes when language changes', () => {
      renderLocaleConsumer()
      expect(screen.getByTestId('locale-name').textContent).toBe(enUS.code)

      fireEvent.click(screen.getByTestId('btn-pt'))
      expect(screen.getByTestId('locale-name').textContent).toBe(ptBR.code)
    })
  })

  // -------------------------------------------------------------------------
  // html lang attribute
  // -------------------------------------------------------------------------

  describe('html lang attribute', () => {
    it('html lang is NOT set before mount, IS set after mount', () => {
      expect(document.documentElement.hasAttribute('lang')).toBe(false)
      renderLocaleConsumer()
      expect(document.documentElement.getAttribute('lang')).toBe('en-US')
    })

    it('html lang persists after LocaleProvider unmounts', () => {
      renderLocaleConsumer()
      expect(document.documentElement.getAttribute('lang')).toBe('en-US')
      cleanup()
      expect(document.documentElement.getAttribute('lang')).toBe('en-US')
    })
  })

  // -------------------------------------------------------------------------
  // Rendering patterns
  // -------------------------------------------------------------------------

  describe('rendering patterns', () => {
    it('LocaleProvider renders with Fragment child', () => {
      render(
        <LocaleProvider>
          <>text content</>
        </LocaleProvider>,
      )
      expect(screen.getByText('text content')).toBeInTheDocument()
    })

    it('LocaleProvider renders with multiple children', () => {
      render(
        <LocaleProvider>
          <div data-testid="child-a">A</div>
          <div data-testid="child-b">B</div>
        </LocaleProvider>,
      )
      expect(screen.getByTestId('child-a')).toBeInTheDocument()
      expect(screen.getByTestId('child-b')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Stable function identities
  // -------------------------------------------------------------------------

  describe('stable function identities', () => {
    it('setDateFormatPreset function has stable identity across renders', () => {
      renderIdentityCapture()
      expect(screen.getByTestId('identity-preset-stable').textContent).toBe(
        'true',
      )

      // Trigger a re-render by changing language
      fireEvent.click(screen.getByTestId('identity-btn-pt'))
      expect(screen.getByTestId('identity-preset-stable').textContent).toBe(
        'true',
      )
    })
  })

  // -------------------------------------------------------------------------
  // formatDate additional scenarios
  // -------------------------------------------------------------------------

  describe('formatDate additional scenarios', () => {
    it('formatDate with timestamp number works', () => {
      renderLocaleConsumer()
      // The consumer already formats Date.now() via the formatted-now testid
      expect(screen.getByTestId('formatted-now').textContent).toBe(
        'FMT:MM/dd/yyyy',
      )
    })

    it('formatDate with custom format containing time components', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-custom-long'))
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:yyyy-MM-dd HH:mm:ss',
      )
    })

    it('setDateFormatPreset(locale) after ISO returns to locale-aware default', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-iso'))
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:yyyy-MM-dd',
      )

      fireEvent.click(screen.getByTestId('ext-btn-locale'))
      expect(screen.getByTestId('ext-preset').textContent).toBe('locale')
      // For en-US the locale-aware default is MM/dd/yyyy
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:MM/dd/yyyy',
      )
    })

    it('formatDate with locale preset after language change to pt-BR uses pt format', () => {
      renderExtendedConsumer()
      fireEvent.click(screen.getByTestId('ext-btn-pt'))
      // With locale preset and pt-BR language, format should be dd/MM/yyyy
      expect(screen.getByTestId('ext-formatted-date').textContent).toBe(
        'FMT:dd/MM/yyyy',
      )
    })
  })
})
