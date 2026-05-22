import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

import type { ContentSection } from '../types/mindmap'
import { getRenderer } from '../services/contentRegistry'

// Side-effect imports: each module self-registers via registerRenderer() at import time
import '../components/molecules/SectionTextBody'
import '../components/molecules/SectionConceptList'
import '../components/molecules/SectionCodeBlock'
import '../components/molecules/SectionProsCons'
import '../components/molecules/SectionLinkList'
import '../components/molecules/SectionQAList'
import '../components/molecules/SectionAnalogy'
import '../components/molecules/SectionCheatsheet'
import '../components/molecules/SectionEverydayScenario'

// ---------------------------------------------------------------------------
// SectionTextBody
// ---------------------------------------------------------------------------
describe('SectionTextBody', () => {
  ;['overview', 'how-it-works', 'architecture'].forEach((type) => {
    it(`renders "${type}" section with title and body`, () => {
      const Component = getRenderer(type)
      expect(Component).toBeDefined()

      const section: ContentSection = {
        title: 'Seção Teste',
        type: type as ContentSection['type'],
        body: 'Texto de corpo para verificação.',
      }

      if (Component) {
        const { container } = render(
          <Component section={section} groupColor="#FF006E" />,
        )
        expect(container.textContent).toContain('Seção Teste')
        expect(container.textContent).toContain('Texto de corpo para verificação.')
      }
    })
  })
})

// ---------------------------------------------------------------------------
// SectionConceptList
// ---------------------------------------------------------------------------
describe('SectionConceptList', () => {
  it('renders "key-concepts" with title and items', () => {
    const Component = getRenderer('key-concepts')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Conceitos-Chave',
      type: 'key-concepts',
      items: ['Item 1: descrição', 'Item 2: outra descrição'],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#00E676" />,
      )
      expect(container.textContent).toContain('Conceitos-Chave')
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
    }
  })

  it('renders with empty items gracefully', () => {
    const Component = getRenderer('key-concepts')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Conceitos',
      type: 'key-concepts',
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#00E676" />,
      )
      expect(container.textContent).toContain('Conceitos')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionCodeBlock
// ---------------------------------------------------------------------------
describe('SectionCodeBlock', () => {
  it('renders "code-example" with code block and copy button', () => {
    const Component = getRenderer('code-example')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Exemplo',
      type: 'code-example',
      body: 'Descrição do código.',
      code: {
        language: 'python',
        source: 'print("hello world")',
      },
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#FFAB00" />,
      )
      expect(container.textContent).toContain('Exemplo')
      expect(container.textContent).toContain('python')
      expect(container.textContent).toContain('hello world')
      expect(container.textContent).toContain('Descrição')
      expect(container.textContent).toContain('Copiar')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionQAList
// ---------------------------------------------------------------------------
describe('SectionQAList', () => {
  it('renders "qa-list" with questions and answers', () => {
    const Component = getRenderer('qa-list')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Perguntas Frequentes',
      type: 'qa-list',
      qa: [
        { question: 'O que é um LLM?', answer: 'É um modelo de linguagem.' },
        { question: 'Como funciona?', answer: 'Usa transformers.' },
      ],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#D500F9" />,
      )
      expect(container.textContent).toContain('Perguntas Frequentes')
      expect(container.textContent).toContain('O que é um LLM?')
      expect(container.textContent).toContain('Como funciona?')
      expect(container.textContent).toContain('É um modelo de linguagem.')
      expect(container.textContent).toContain('Usa transformers.')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionAnalogy
// ---------------------------------------------------------------------------
describe('SectionAnalogy', () => {
  it('renders "analogy" with analogy text', () => {
    const Component = getRenderer('analogy')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Analogia',
      type: 'analogy',
      body: 'Imagine um bibliotecário que leu todos os livros.',
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#FF1744" />,
      )
      expect(container.textContent).toContain('Analogia')
      expect(container.textContent).toContain('Imagine um bibliotecário')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionProsCons
// ---------------------------------------------------------------------------
describe('SectionProsCons', () => {
  it('renders "pros-cons" with items and body', () => {
    const Component = getRenderer('pros-cons')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Vantagens e Desvantagens',
      type: 'pros-cons',
      body: 'Análise comparativa.',
      items: [
        '✅ Rápido de implementar',
        '✅ Baixo custo',
        '⚠️ Pode alucinar',
      ],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#00E5FF" />,
      )
      expect(container.textContent).toContain('Vantagens')
      expect(container.textContent).toContain('Rápido de implementar')
      expect(container.textContent).toContain('Análise comparativa')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionCheatsheet
// ---------------------------------------------------------------------------
describe('SectionCheatsheet', () => {
  it('renders "cheatsheet-entry" with items', () => {
    const Component = getRenderer('cheatsheet-entry')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Dicas Rápidas',
      type: 'cheatsheet-entry',
      body: 'Melhores práticas.',
      items: [
        'Use temperature 0.1 para fatos',
        'Sempre valide outputs',
      ],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#76FF03" />,
      )
      expect(container.textContent).toContain('Dicas Rápidas')
      expect(container.textContent).toContain('Use temperature')
      expect(container.textContent).toContain('Sempre valide')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionLinkList
// ---------------------------------------------------------------------------
describe('SectionLinkList', () => {
  it('renders "related-links" with items', () => {
    const Component = getRenderer('related-links')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Links Relacionados',
      type: 'related-links',
      items: ['Documentação oficial', 'Tutorial passo a passo'],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#FF9100" />,
      )
      expect(container.textContent).toContain('Links Relacionados')
      expect(container.textContent).toContain('Documentação oficial')
    }
  })
})

// ---------------------------------------------------------------------------
// SectionEverydayScenario
// ---------------------------------------------------------------------------
describe('SectionEverydayScenario', () => {
  it('renders "everyday-scenario" with title, body, and items', () => {
    const Component = getRenderer('everyday-scenario')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Cenário do Dia a Dia',
      type: 'everyday-scenario',
      body: 'Descrição do cenário real.',
      items: [
        'Item 1: situação prática',
        'Item 2: outra situação',
      ],
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#FF6B6B" />,
      )
      expect(container.textContent).toContain('Cenário do Dia a Dia')
      expect(container.textContent).toContain('Descrição do cenário real.')
      expect(container.textContent).toContain('Item 1')
      expect(container.textContent).toContain('Item 2')
    }
  })

  it('renders with only title (no body/items)', () => {
    const Component = getRenderer('everyday-scenario')
    expect(Component).toBeDefined()

    const section: ContentSection = {
      title: 'Cenário Mínimo',
      type: 'everyday-scenario',
    }

    if (Component) {
      const { container } = render(
        <Component section={section} groupColor="#FF6B6B" />,
      )
      expect(container.textContent).toContain('Cenário Mínimo')
    }
  })
})

// ---------------------------------------------------------------------------
// Registry fallback
// ---------------------------------------------------------------------------
describe('Registry fallback', () => {
  it('returns undefined for unregistered type', () => {
    const Component = getRenderer('nonexistent-type')
    expect(Component).toBeUndefined()
  })
})
