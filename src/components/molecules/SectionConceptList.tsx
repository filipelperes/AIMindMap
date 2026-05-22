import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import ColorDot from '../atoms/ColorDot'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/** Renderiza seção key-concepts como lista com bullet points. */
const SectionConceptList: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="mb-2 text-sm text-zinc-400">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <ColorDot color={groupColor} size={8} />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

SectionConceptList.displayName = 'SectionConceptList'

// Auto-registro
registerRenderer('key-concepts', SectionConceptList)

export default SectionConceptList
