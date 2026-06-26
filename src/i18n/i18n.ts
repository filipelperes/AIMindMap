import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const SUPPORTED_LANGUAGES = ['en-US', 'pt-BR'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Language display names for the locale switcher
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'en-US': 'English (US)',
  'pt-BR': 'Portuguese (Brazil)',
}

export const DEFAULT_NAMESPACE = 'translation'

// ── Dynamic locale imports ──
// Each locale JSON becomes its own chunk via dynamic import.
// Only the detected/selected language bundle is loaded at startup.
// The other locale(s) are loaded on first language switch.
// Translation JSON has nested objects (e.g. { app: { loading: '...' } }),
// not flat string values. Use Record<string, unknown> to match i18next's
// resource bundle structure.
const localeLoaders: Record<string, () => Promise<Record<string, unknown>>> = {
  'en-US': () => import('./locales/en-US/translation.json').then(m => m.default ?? m),
  'pt-BR': () => import('./locales/pt-BR/translation.json').then(m => m.default ?? m),
}

async function initI18n(): Promise<typeof i18n> {
  // Detect language before initialisation
  let detectedLang = 'en-US'
  try {
    const stored = localStorage.getItem('aimindmap-language')
    if (stored && stored in localeLoaders) detectedLang = stored
    else if (navigator.language?.startsWith('pt')) detectedLang = 'pt-BR'
  } catch { /* noop */ }

  // Load only the detected language's resources
  const loader = localeLoaders[detectedLang] ?? localeLoaders['en-US']
  const resources = await loader()

  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources: {
        [detectedLang]: { translation: resources },
      },
      fallbackLng: 'en-US',
      lng: detectedLang,
      debug: import.meta.env.DEV,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'aimindmap-language',
      },
    })

  // Lazy-load other locales on demand when language changes
  i18n.on('languageChanged', async (lng: string) => {
    if (!i18n.hasResourceBundle(lng, DEFAULT_NAMESPACE)) {
      const loader = localeLoaders[lng]
      if (loader) {
        const res = await loader()
        i18n.addResourceBundle(lng, DEFAULT_NAMESPACE, res)
      }
    }
  })

  return i18n
}

// Eagerly initialise so translations are available by first render
const initPromise = initI18n()

export { initPromise }
export default i18n
