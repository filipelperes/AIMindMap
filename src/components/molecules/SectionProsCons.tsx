import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
import { useTheme } from '../../store/ThemeContext'

/** Renderiza seção pros-cons como body + lista de itens. */
const SectionProsCons: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { mode } = useTheme()
    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="mb-3 text-sm leading-relaxed" style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F46' }}>{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: mode === 'dark' ? '#A1A1AA' : '#52525B' }}>
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
