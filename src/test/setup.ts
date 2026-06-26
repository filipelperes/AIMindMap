import '@testing-library/jest-dom'
import React from 'react'

// ═══════════════════════════════════════════════════════════════════
// i18n — import the app's real i18n setup so tests use actual
// translation files (src/i18n/locales/*/translation.json) instead of
// duplicating keys in the test setup. This keeps tests in sync with
// production translations.
// ═══════════════════════════════════════════════════════════════════
import i18n, { initPromise } from '../i18n/i18n'

// Pin to 'en-US' so tests produce deterministic results regardless of
// the host environment language.
// NOTE: initI18n() is async (dynamic JSON import), so we must await
// the initPromise before calling changeLanguage.
await initPromise
i18n.changeLanguage('en-US')
// ═══════════════════════════════════════════════════════════════════

// Mock framer-motion for test environment — use a Proxy so any
// motion.* component (div, aside, h2, p, button, span, etc.) returns a plain <div>.
const motionProxy = new Proxy(
  {},
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (_target, prop: string) => {
      // Return a React forwardRef component for any motion.<tag>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.forwardRef(({ children, ...props }: any, _ref: any) =>
        React.createElement(prop, props, children),
      )
    },
  },
)

vi.mock('framer-motion', () => ({
  motion: motionProxy,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}))

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
