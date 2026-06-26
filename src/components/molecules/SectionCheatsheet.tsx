import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
/**
 * Molecule that renders a cheatsheet entry.
 * Compact format with quick tips and code.
 */
const SectionCheatsheet: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div className="space-y-2">
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed dark:text-zinc-300 text-zinc-700">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border px-3 py-2 text-xs dark:text-zinc-400 text-zinc-600 dark:border-white/5 border-black/8 dark:bg-white/2 bg-black/2"
              >
                {item}
              </div>
            ))}
          </div>
        )}
        {section.code && (
          <pre
            className="overflow-x-auto rounded-lg border p-3 text-xs dark:text-zinc-300 text-zinc-700 dark:border-white/5 border-black/8 dark:bg-black/40 bg-black/3"
          >
            <code>{section.code.source}</code>
          </pre>
        )}
      </div>
    )
  },
)

SectionCheatsheet.displayName = 'SectionCheatsheet'
registerRenderer('cheatsheet-entry', SectionCheatsheet)

export default SectionCheatsheet
