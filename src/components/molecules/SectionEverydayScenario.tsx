import React from 'react'
import { registerRenderer } from '../../services/contentRegistry'
import type { SectionRendererProps } from '../../services/contentRegistry'

const SectionEverydayScenario: React.FC<SectionRendererProps> = ({ section, groupColor }) => {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: `${groupColor}20`, backgroundColor: `${groupColor}08` }}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">💡</span>
        <div>
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: groupColor }}>
            {section.title}
          </h4>
          {section.body && (
            <p className="mb-3 text-sm leading-relaxed text-zinc-300">{section.body}</p>
          )}
          {section.items && (
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-400">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: groupColor }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

SectionEverydayScenario.displayName = 'SectionEverydayScenario'
registerRenderer('everyday-scenario', SectionEverydayScenario)
export default SectionEverydayScenario
