import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from './LocaleContext'
import type { SupportedLanguage } from './i18n'
import type { DateFormatPreset } from './LocaleContext'

// Language labels for the locale switcher
const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'pt-BR', label: 'Portuguese (BR)' },
]

const DATE_PRESETS: { value: DateFormatPreset; labelKey: string; example: string }[] = [
  { value: 'locale', labelKey: 'locale.localeDefault', example: 'Auto' },
  { value: 'ISO', labelKey: 'locale.isoFormat', example: '2024-12-31' },
  { value: 'US', labelKey: 'locale.usFormat', example: '12/31/2024' },
  { value: 'EU', labelKey: 'locale.euFormat', example: '31/12/2024' },
]

/**
 * LocaleSwitcher — compact dropdown for language & date format.
 * Placed in the sidebar header for quick access.
 */
const LocaleSwitcher: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const { language, setLanguage, dateFormatPreset, setDateFormatPreset } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer dark:bg-white/6 bg-cyber/6 dark:text-white/50 text-cyber/60"
        aria-label={t('locale.languageLabel')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-[200] min-w-[180px] rounded-xl border p-2 shadow-2xl dark:bg-abyss/92 bg-white/92 dark:border-white/10 border-black/8"
          style={{
            backdropFilter: 'blur(20px) saturate(1.4)',
          }}
        >
          {/* Language selector */}
          <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest dark:text-white/30 text-black/40"
          >
            {t('locale.languageLabel')}
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => { setLanguage(lang.value); setIsOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all cursor-pointer ${
                language === lang.value
                  ? 'dark:text-neural text-cyber dark:bg-neural/8 bg-cyber/8'
                  : 'dark:text-white/60 text-black/60'
              }`}
            >
              {language === lang.value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className={language === lang.value ? '' : 'ml-5'}>{lang.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1.5 border-t dark:border-white/6 border-black/6" />

          {/* Date format selector */}
          <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest dark:text-white/30 text-black/40"
          >
            {t('locale.dateFormat')}
          </p>
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => { setDateFormatPreset(preset.value); setIsOpen(false) }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all cursor-pointer ${
                dateFormatPreset === preset.value
                  ? 'dark:text-neural text-cyber dark:bg-neural/8 bg-cyber/8'
                  : 'dark:text-white/60 text-black/60'
              }`}
            >
              {dateFormatPreset === preset.value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className={dateFormatPreset === preset.value ? '' : 'ml-5'}>
                {t(preset.labelKey, { format: preset.example })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

LocaleSwitcher.displayName = 'LocaleSwitcher'
export default LocaleSwitcher
