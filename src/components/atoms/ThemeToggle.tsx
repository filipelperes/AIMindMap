import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../store/ThemeContext'

/**
 * Dark/light theme toggle button.
 * Uses Tailwind dark: variant for CSS-only icon switching with smooth rotation.
 * Both icons are always rendered; visibility is controlled via dark: variant.
 * Pattern: Sun rotates out → Moon rotates in, driven entirely by CSS transitions.
 */
const ThemeToggle: React.FC = React.memo(() => {
  const { mode, toggle } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      onClick={toggle}
      aria-label={mode === 'dark' ? t('theme.toggleDark') : t('theme.toggleLight')}
      title={mode === 'dark' ? t('theme.titleDark') : t('theme.titleLight')}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer bg-black/6 dark:bg-white/8 hover:bg-black/15 hover:dark:bg-white/15 text-text-primary"
    >
      {/* Sun icon — visible in light mode, rotates out in dark mode */}
      <svg
        className="absolute rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Moon icon — hidden in light mode (rotated+scaled out), rotates in in dark mode */}
      <svg
        className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
})

ThemeToggle.displayName = 'ThemeToggle'
export default ThemeToggle
