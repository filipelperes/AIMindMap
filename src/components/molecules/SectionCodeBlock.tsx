import React, { useState, useCallback } from 'react'
import SectionTitle from '../atoms/SectionTitle'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

/** Renderiza seção code-example com bloco de código e botão copiar. */
const SectionCodeBlock: React.FC<SectionRendererProps> = React.memo(
  ({ section, groupColor }) => {
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
            <div className="absolute left-3 top-2 z-10 rounded bg-black/40 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
              {section.code.language}
            </div>
          )}
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 z-10 rounded px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
            aria-label={copied ? 'Copiado!' : 'Copiar código'}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <pre className="overflow-x-auto rounded-xl bg-black/60 p-4 pt-8 text-xs leading-relaxed text-cyan-200">
            <code>{section.code?.source}</code>
          </pre>
        </div>
        {section.body && (
          <p className="mt-2 text-xs text-zinc-400">{section.body}</p>
        )}
      </div>
    )
  },
)

SectionCodeBlock.displayName = 'SectionCodeBlock'

// Auto-registro
registerRenderer('code-example', SectionCodeBlock)

export default SectionCodeBlock
