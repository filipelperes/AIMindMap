import React, { useState, useCallback } from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'
import { useTheme } from '../../store/ThemeContext'

/** Renderiza seção code-example com bloco de código e botão copiar. */
const SectionCodeBlock: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const { mode } = useTheme()
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(() => {
      if (section.code?.source) {
        navigator.clipboard.writeText(section.code.source).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }
    }, [section.code?.source])

    return (
      <div>
        <SectionTitle accentColor={groupColor}>{section.title}</SectionTitle>
        <div className="relative">
          {section.code?.language && (
            <div
              className="absolute left-3 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-medium"
              style={{
                color: mode === 'dark' ? '#71717A' : '#A1A1AA',
                backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)',
              }}
            >
              {section.code.language}
            </div>
          )}
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 z-10 rounded px-2 py-1 text-[10px] transition-colors"
            style={{
              color: mode === 'dark' ? '#71717A' : '#A1A1AA',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = mode === 'dark' ? '#D4D4D8' : '#52525B' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = mode === 'dark' ? '#71717A' : '#A1A1AA' }}
            aria-label={copied ? 'Copiado!' : 'Copiar código'}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <pre
            className="overflow-x-auto rounded-xl p-4 pt-8 text-xs leading-relaxed"
            style={{
              color: mode === 'dark' ? '#A5F3FC' : '#0E7490',
              backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.03)',
            }}
          >
            <code>{section.code?.source}</code>
          </pre>
        </div>
        {section.body && (
          <p className="mt-2 text-xs" style={{ color: mode === 'dark' ? '#A1A1AA' : '#52525B' }}>{section.body}</p>
        )}
      </div>
    )
  },
)

SectionCodeBlock.displayName = 'SectionCodeBlock'

// Auto-registro
registerRenderer('code-example', SectionCodeBlock)

export default SectionCodeBlock
