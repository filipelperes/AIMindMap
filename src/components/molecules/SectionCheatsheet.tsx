import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/**
 * Molécula que renderiza uma entrada de cheatsheet.
 * Formato compacto com dicas rápidas e código.
 */
const SectionCheatsheet: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div className="space-y-2">
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed text-zinc-300">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
              >
                {item}
              </div>
            ))}
          </div>
        )}
        {section.code && (
          <pre className="overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-zinc-300">
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
