import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
/** Renders a simple text section (overview, how-it-works, architecture). */
const SectionTextBody: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed dark:text-zinc-300 text-zinc-700">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm dark:text-zinc-400 text-zinc-600">
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
          <pre
            className="mt-3 overflow-x-auto rounded-lg border p-3 text-xs dark:text-zinc-300 text-zinc-700 dark:border-white/5 border-black/8 dark:bg-black/40 bg-black/3"
          >
            <code>{section.code.source}</code>
          </pre>
        )}
      </div>
    )
  },
)

SectionTextBody.displayName = 'SectionTextBody'

// Auto-registration
registerRenderer('overview', SectionTextBody)
registerRenderer('how-it-works', SectionTextBody)
registerRenderer('architecture', SectionTextBody)

export default SectionTextBody
