import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/** Renderiza seção pros-cons como body + lista de itens. */
const SectionProsCons: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="mb-3 text-sm leading-relaxed text-zinc-300">{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1 text-xs">{item.startsWith('✅') || item.startsWith('⚠️') || item.startsWith('❌') ? '' : '•'}</span>
                <span>{item}</span>
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
