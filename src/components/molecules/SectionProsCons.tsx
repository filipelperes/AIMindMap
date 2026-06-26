import React, { useMemo } from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
// Pre-process items: extract leading emoji from data instead of checking at runtime
const EMOJI_PREFIXES = ['✅', '⚠️', '❌'] as const
const hasLeadingEmoji = (text: string) => EMOJI_PREFIXES.some(p => text.startsWith(p))

interface ProcessedItem {
  text: string
  hasEmoji: boolean
}

/** Renders pros-cons section as body + list of items. */
const SectionProsCons: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {

    // Pre-process items to determine emoji prefix — avoids runtime startsWith checks per render
    const processedItems = useMemo<ProcessedItem[]>(() => {
      if (!section.items) return []
      return section.items.map(item => ({
        text: item,
        hasEmoji: hasLeadingEmoji(item),
      }))
    }, [section.items])

    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="mb-3 text-sm leading-relaxed dark:text-zinc-300 text-zinc-700">{section.body}</p>
        )}
        {processedItems.length > 0 && (
          <ul className="space-y-2">
            {processedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm dark:text-zinc-400 text-zinc-600">
                <span className="mt-1 text-xs">{item.hasEmoji ? '' : '•'}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

SectionProsCons.displayName = 'SectionProsCons'

registerRenderer('pros-cons', SectionProsCons)

export default SectionProsCons
