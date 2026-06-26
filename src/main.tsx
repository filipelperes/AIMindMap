import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// i18n initialization (side-effect import)
import './i18n/i18n'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
