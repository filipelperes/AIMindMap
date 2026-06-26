import React from 'react'
import { getRenderer } from '../../services/contentRegistry'
import type { ContentSection } from '../../types/mindmap'

// Import molecules to register renderers
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
 * Organism that dispatches to the correct renderer
 * based on section type (Strategy Pattern via Registry).
 * 
 * Instead of a rigid switch-case, it uses contentRegistry
 * which allows adding new types without modifying this file.
 */
const NodeContentRenderer: React.FC<NodeContentRendererProps> = React.memo(
  ({ section, groupColor }) => {
    const Component = getRenderer(section.type)

    if (!Component) {
      // Fallback for unregistered types
      return (
        <div>
          <h3 className="mb-3 text-lg font-semibold dark:text-white/90 text-black/85">
            {section.title}
          </h3>
          <p className="text-sm leading-relaxed dark:text-zinc-300 text-zinc-700">
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
