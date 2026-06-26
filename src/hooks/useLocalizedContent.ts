import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getLocalizedContent } from '../data/contentLocales'
import type { NodeContent } from '../types/mindmap'

/**
 * Hook that returns localized content for the current language.
 * Falls back to English for any untranslated content.
 */
export function useLocalizedContent(nodeId: string): NodeContent | undefined {
  const { i18n } = useTranslation()

  return useMemo(
    () => getLocalizedContent(nodeId, i18n.language),
    [nodeId, i18n.language],
  )
}
