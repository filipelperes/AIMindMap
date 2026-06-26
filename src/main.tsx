import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { initPromise } from './i18n/i18n'

import App from './App.tsx'

// Wait for i18n to be fully initialized before rendering React.
// LocaleContext/useTranslation() need initReactI18next to be wired up,
// otherwise the page crashes with "t.changeLanguage is not a function".
// If init fails, we render anyway — the app will use fallback strings.
initPromise.catch((err) => {
  console.warn('[i18n] initialization failed, rendering with fallback:', err)
}).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
