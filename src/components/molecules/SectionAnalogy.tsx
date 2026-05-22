import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
import { useTheme } from '../../store/ThemeContext'

/**
 * Molécula que renderiza uma analogia ou exemplo do cotidiano.
 * Destaca o conteúdo com um ícone de "lâmpada" e fundo suave.
 */
const SectionAnalogy: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { mode } = useTheme()
    return (
      <div className="space-y-2">
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: `${groupColor}20`,
            backgroundColor: `${groupColor}08`,
          }}
        >
          <div className="flex gap-3">
            <span className="mt-0.5 text-lg">💡</span>
            <div>
              {section.body && (
                <p className="text-sm leading-relaxed" style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F46' }}>{section.body}</p>
              )}
              {section.items && section.items.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: mode === 'dark' ? '#A1A1AA' : '#52525B' }}>
                      <span
                        className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: groupColor }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

SectionAnalogy.displayName = 'SectionAnalogy'
registerRenderer('analogy', SectionAnalogy)

export default SectionAnalogy
