import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/** Renderiza seção do tipo texto simples (overview, how-it-works, architecture). */
const SectionTextBody: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed text-zinc-300">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span
                  className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: groupColor }}
                />
                {item}
              </li>
            ))}
          </ul>
        )}
        {section.code && (
          <pre className="mt-3 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-3 text-xs text-zinc-300">
            <code>{section.code.source}</code>
          </pre>
        )}
      </div>
    )
  },
)

SectionTextBody.displayName = 'SectionTextBody'

// Auto-registro
registerRenderer('overview', SectionTextBody)
registerRenderer('how-it-works', SectionTextBody)
registerRenderer('architecture', SectionTextBody)

export default SectionTextBody
