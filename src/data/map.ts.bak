import { nodeContent } from './content'
import type { GraphData } from '../types/mindmap'

/**
 * Dados do grafo com organização step-by-step (learning path).
 * 
 * Ordem de aprendizado recomendada (learningStep):
 * 1. LLM — Fundamentos
 * 2. PromptEngineering — Como se comunicar com LLMs
 * 3. RAG — Conectando LLMs a conhecimento externo
 * 4. FineTuning — Especializando modelos
 * 5. Agent — Agentes autônomos
 * 5.5 MCP — Protocolo de Contexto para Ferramentas
 * 6. AISystemDesign — Arquitetura de sistemas
 * 7. VectorDB — Memória de longo prazo
 * 8. LLMOps — Produção e operação
 * 9. EvalTesting — Avaliação e qualidade
 * 10. AISafety — Segurança e ética
 * 11. Multimodal — Além do texto
 * 12. Infrastructure — Infraestrutura e escala
 * 13. Coding — Implementação prática
 * 14. Behavioral — Cenários e comportamental
 * 
 * Cada nó tem spinSpeed próprio (rad/s) para efeito de rotação individual.
 */
export const graphData: GraphData = {
  nodes: [
    // ═══ LEVEL 1: FUNDAMENTOS ═══
    {
      id: 'LLM',
      group: 1,
      description: 'Fundação: como LLMs funcionam por baixo dos panos.',
      content: nodeContent.LLM,
      learningStep: 1,
      spinSpeed: 0.12,
      val: 12
    },
    {
      id: 'PromptEngineering',
      group: 2,
      description: 'A arte de extrair o melhor dos LLMs com prompts precisos.',
      content: nodeContent.PromptEngineering,
      learningStep: 2,
      spinSpeed: 0.15,
      val: 10
    },

    // ═══ LEVEL 2: TÉCNICAS CENTRAIS ═══
    {
      id: 'RAG',
      group: 3,
      description: 'Conectando LLMs a bases de conhecimento externas.',
      content: nodeContent.RAG,
      learningStep: 3,
      spinSpeed: 0.08,
      val: 15
    },
    {
      id: 'FineTuning',
      group: 4,
      description: 'Especializando modelos para domínios e tarefas específicas.',
      content: nodeContent.FineTuning,
      learningStep: 4,
      spinSpeed: 0.10,
      val: 11
    },
    {
      id: 'Agent',
      group: 5,
      description: 'Sistemas autônomos que planejam, agem e aprendem.',
      content: nodeContent.Agent,
      learningStep: 5,
      spinSpeed: 0.14,
      val: 13
    },

    // ═══ LEVEL 2.5: PROTOCOLOS & PADRÕES ═══
    {
      id: 'MCP',
      group: 15,
      description: 'Protocolo aberto para conectar LLMs a ferramentas e fontes de dados externas.',
      content: nodeContent.MCP,
      learningStep: 5.5,
      spinSpeed: 0.17,
      val: 10
    },

    // ═══ LEVEL 3: ARQUITETURA & DADOS ═══
    {
      id: 'AISystemDesign',
      group: 6,
      description: 'Arquitetando sistemas completos de IA em produção.',
      content: nodeContent.AISystemDesign,
      learningStep: 6,
      spinSpeed: 0.09,
      val: 11
    },
    {
      id: 'VectorDB',
      group: 8,
      description: 'Bancos vetoriais e embeddings para busca semântica.',
      content: nodeContent.VectorDB,
      learningStep: 7,
      spinSpeed: 0.11,
      val: 9
    },
    {
      id: 'LLMOps',
      group: 7,
      description: 'Operacionalizando LLMs com monitoramento e escalabilidade.',
      content: nodeContent.LLMOps,
      learningStep: 8,
      spinSpeed: 0.13,
      val: 11
    },

    // ═══ LEVEL 4: QUALIDADE & SEGURANÇA ═══
    {
      id: 'EvalTesting',
      group: 9,
      description: 'Avaliação sistemática de qualidade, precisão e segurança.',
      content: nodeContent.EvalTesting,
      learningStep: 9,
      spinSpeed: 0.16,
      val: 9
    },
    {
      id: 'AISafety',
      group: 10,
      description: 'IA responsável: ética, privacidade, viés e regulação.',
      content: nodeContent.AISafety,
      learningStep: 10,
      spinSpeed: 0.07,
      val: 10
    },

    // ═══ LEVEL 5: AVANÇADO ═══
    {
      id: 'Multimodal',
      group: 11,
      description: 'Modelos que processam texto, imagem, áudio e vídeo.',
      content: nodeContent.Multimodal,
      learningStep: 11,
      spinSpeed: 0.18,
      val: 8
    },
    {
      id: 'Infrastructure',
      group: 12,
      description: 'GPUs, escalabilidade, otimização e servindo modelos.',
      content: nodeContent.Infrastructure,
      learningStep: 12,
      spinSpeed: 0.06,
      val: 9
    },
    {
      id: 'Coding',
      group: 13,
      description: 'Implementações práticas: RAG, agentes, busca, avaliação.',
      content: nodeContent.Coding,
      learningStep: 13,
      spinSpeed: 0.20,
      val: 8
    },
    {
      id: 'Behavioral',
      group: 14,
      description: 'Cenários, trade-offs e decisões do mundo real.',
      content: nodeContent.Behavioral,
      learningStep: 14,
      spinSpeed: 0.05,
      val: 7
    }
  ],

  // Links formam um grafo de conhecimento progressivo
  links: [
    // Fundamentos → Técnicas
    { source: 'LLM', target: 'PromptEngineering' },
    { source: 'PromptEngineering', target: 'RAG' },
    { source: 'LLM', target: 'RAG' },

    // Técnicas Centrais
    { source: 'RAG', target: 'FineTuning' },
    { source: 'RAG', target: 'Agent' },
    { source: 'LLM', target: 'FineTuning' },
    { source: 'FineTuning', target: 'Agent' },

    // MCP — Padronização de Ferramentas
    { source: 'Agent', target: 'MCP' },
    { source: 'MCP', target: 'AISystemDesign' },
    { source: 'MCP', target: 'Coding' },

    // Arquitetura & Dados
    { source: 'RAG', target: 'VectorDB' },
    { source: 'Agent', target: 'AISystemDesign' },
    { source: 'RAG', target: 'AISystemDesign' },
    { source: 'LLMOps', target: 'AISystemDesign' },
    { source: 'VectorDB', target: 'AISystemDesign' },

    // Qualidade & Segurança
    { source: 'AISystemDesign', target: 'LLMOps' },
    { source: 'LLMOps', target: 'EvalTesting' },
    { source: 'EvalTesting', target: 'AISafety' },
    { source: 'Agent', target: 'AISafety' },

    // Avançado
    { source: 'LLM', target: 'Multimodal' },
    { source: 'LLMOps', target: 'Infrastructure' },
    { source: 'AISystemDesign', target: 'Infrastructure' },
    { source: 'EvalTesting', target: 'Coding' },
    { source: 'AISystemDesign', target: 'Coding' },
    { source: 'Coding', target: 'Behavioral' },
    { source: 'AISafety', target: 'Behavioral' },

    // Conexões cross
    { source: 'LLM', target: 'EvalTesting' },
    { source: 'FineTuning', target: 'EvalTesting' },
    { source: 'Multimodal', target: 'VectorDB' },
    { source: 'Multimodal', target: 'Agent' }
  ]
}

/**
 * Retorna a lista de nós ordenada por learningStep.
 */
export function getLearningPath() {
  return [...graphData.nodes]
    .filter(n => n.learningStep != null)
    .sort((a, b) => (a.learningStep ?? 99) - (b.learningStep ?? 99))
}

/**
 * Retorna o step atual baseado no nó selecionado.
 */
export function getCurrentStep(nodeId: string | null): number {
  if (!nodeId) return 0
  const node = graphData.nodes.find(n => n.id === nodeId)
  return node?.learningStep ?? 0
}
