import React from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
import { useTheme } from '../../store/ThemeContext'

/**
 * Molécula que renderiza uma entrada de cheatsheet.
 * Formato compacto com dicas rápidas e código.
 */
const SectionCheatsheet: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { mode } = useTheme()
    return (
      <div className="space-y-2">
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        {section.body && (
          <p className="text-sm leading-relaxed" style={{ color: mode === 'dark' ? '#D4D4D8' : '#3F3F46' }}>{section.body}</p>
        )}
        {section.items && section.items.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border px-3 py-2 text-xs"
                style={{
                  color: mode === 'dark' ? '#A1A1AA' : '#52525B',
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
        {section.code && (
          <pre
            className="overflow-x-auto rounded-lg border p-3 text-xs"
            style={{
              color: mode === 'dark' ? '#D4D4D8' : '#3F3F46',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
              backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.03)',
            }}
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
