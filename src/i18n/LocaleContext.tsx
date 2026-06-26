import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import type { Locale } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import type { SupportedLanguage } from './i18n'

/* ============================================================
   LocaleContext — User-level locale & date/time format preference.

   Allows the user to:
   1. Switch UI language (en-US / pt-BR)
   2. Choose their preferred date/time format pattern
   3. Persist both preferences in localStorage

   The format pattern follows date-fns format strings.
   ============================================================ */

const FORMAT_STORAGE_KEY = 'aimindmap-date-format'
const LANG_STORAGE_KEY = 'aimindmap-language'

export type DateFormatPreset = 'locale' | 'ISO' | 'US' | 'EU' | 'custom'

interface LocaleContextType {
  /** Current UI language */
  language: SupportedLanguage
  /** Switch UI language */
  setLanguage: (lang: SupportedLanguage) => void
  /** Current date format preset */
  dateFormatPreset: DateFormatPreset
  /** Custom date format string (date-fns syntax) */
  customDateFormat: string
  /** Set date format preset */
  setDateFormatPreset: (preset: DateFormatPreset) => void
  /** Set custom date format string */
  setCustomDateFormat: (format: string) => void
  /** Format a date using current settings */
  formatDate: (date: Date | number) => string
  /** Get the date-fns locale for current language */
  dateFnsLocale: Locale
}

const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'

const PRESET_FORMATS: Record<DateFormatPreset, string | null> = {
  locale: null, // Uses locale-based default
  ISO: 'yyyy-MM-dd',
  US: 'MM/dd/yyyy',
  EU: 'dd/MM/yyyy',
  custom: null, // Uses customDateFormat
}

const LocaleContext = createContext<LocaleContextType | null>(null)

function getDateFnsLocale(language: string): Locale {
  if (language.startsWith('pt')) return ptBR
  return enUS
}

function getDefaultDateFormat(language: string): string {
  if (language.startsWith('pt')) return 'dd/MM/yyyy'
  return 'MM/dd/yyyy'
}

function getSavedDateFormat(): string | null {
  try {
    return localStorage.getItem(FORMAT_STORAGE_KEY)
  } catch {
    return null
  }
}

function saveDateFormat(format: string): void {
  try {
    localStorage.setItem(FORMAT_STORAGE_KEY, format)
  } catch { /* noop */ }
}

function parsePresetOrCustom(stored: string | null): {
  preset: DateFormatPreset
  custom: string
} {
  if (!stored) return { preset: 'locale', custom: DEFAULT_DATE_FORMAT }

  // Check if it matches a known preset
  for (const [preset, fmt] of Object.entries(PRESET_FORMATS)) {
    if (fmt === stored) return { preset: preset as DateFormatPreset, custom: DEFAULT_DATE_FORMAT }
  }

  return { preset: 'custom', custom: stored }
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation()
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage | null
      if (stored && (stored === 'en-US' || stored === 'pt-BR')) return stored
    } catch { /* noop */ }
    return navigator.language?.startsWith('pt') ? 'pt-BR' : 'en-US'
  })

  const storedFormat = getSavedDateFormat()
  const initialPresetInfo = parsePresetOrCustom(storedFormat)
  const [dateFormatPreset, setDateFormatPresetState] = useState<DateFormatPreset>(initialPresetInfo.preset)
  const [customDateFormat, setCustomDateFormatState] = useState<string>(
    initialPresetInfo.custom,
  )

  // Sync language change to i18next and localStorage
  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang)
    i18n.changeLanguage(lang)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch { /* noop */ }
  }, [i18n])

  const setDateFormatPreset = useCallback((preset: DateFormatPreset) => {
    setDateFormatPresetState(preset)
    const fmt = PRESET_FORMATS[preset]
    if (fmt) {
      saveDateFormat(fmt)
    }
  }, [])

  const setCustomDateFormat = useCallback((formatStr: string) => {
    setCustomDateFormatState(formatStr)
    setDateFormatPresetState('custom')
    saveDateFormat(formatStr)
  }, [])

  const dateFnsLocale = useMemo(() => getDateFnsLocale(language), [language])

  const formatDate = useCallback((date: Date | number): string => {
    const preset = dateFormatPreset
    let formatStr: string

    if (preset === 'locale') {
      formatStr = getDefaultDateFormat(language)
    } else if (preset === 'custom') {
      formatStr = customDateFormat
    } else {
      formatStr = PRESET_FORMATS[preset] ?? DEFAULT_DATE_FORMAT
    }

    try {
      return format(date, formatStr, { locale: dateFnsLocale })
    } catch {
      return format(date, DEFAULT_DATE_FORMAT, { locale: dateFnsLocale })
    }
  }, [dateFormatPreset, customDateFormat, language, dateFnsLocale])

  // Initialize i18next language and sync <html lang> attribute
  useEffect(() => {
    i18n.changeLanguage(language)
    document.documentElement.setAttribute('lang', language)
  }, [language, i18n])

  const ctx = useMemo(() => ({
    language,
    setLanguage,
    dateFormatPreset,
    customDateFormat,
    setDateFormatPreset,
    setCustomDateFormat,
    formatDate,
    dateFnsLocale,
  }), [language, dateFormatPreset, customDateFormat, setLanguage,
      setDateFormatPreset, setCustomDateFormat, formatDate, dateFnsLocale])

  return (
    <LocaleContext.Provider value={ctx}>
      {children}
    </LocaleContext.Provider>
  )
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export default LocaleContext
