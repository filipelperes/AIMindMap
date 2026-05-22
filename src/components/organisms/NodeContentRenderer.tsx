import React from 'react'
import { getRenderer } from '../../services/contentRegistry'
import type { ContentSection } from '../../types/mindmap'

// Import das moléculas para registrar os renderers
import '../molecules/SectionTextBody'
import '../molecules/SectionConceptList'
import '../molecules/SectionCodeBlock'
import '../molecules/SectionProsCons'
import '../molecules/SectionLinkList'
import '../molecules/SectionQAList'
import '../molecules/SectionAnalogy'
import '../molecules/SectionCheatsheet'
import '../molecules/SectionEverydayScenario'

interface NodeContentRendererProps {
  section: ContentSection
  groupColor: string
}

/**
 * Organismo que faz o dispatch para o renderer correto
 * baseado no tipo da seção (Strategy Pattern via Registry).
 * 
 * Em vez de um switch-case rígido, usa o contentRegistry
 * que permite adicionar novos tipos sem modificar este arquivo.
 */
const NodeContentRenderer: React.FC<NodeContentRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const Component = getRenderer(section.type)

    if (!Component) {
      // Fallback para tipos não registrados
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white/90">
            {section.title}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300">
            {section.body}
          </p>
        </div>
      )
    }

    return <Component section={section} groupColor={groupColor} />
  },
)

NodeContentRenderer.displayName = 'NodeContentRenderer'
export default NodeContentRenderer
