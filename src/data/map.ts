import type { GraphData } from '../types/mindmap'

/**
 * Graph data with step-by-step organization (learning path).
 * 
 * Recommended learning order (learningStep):
 * 1. LLM — Foundations
 * 2. PromptEngineering — How to communicate with LLMs
 * 3. RAG — Connecting LLMs to external knowledge
 * 4. FineTuning — Specializing models
 * 5. Agent — Autonomous agents
 * 5.5 MCP — Context Protocol for Tools
 * 6. AISystemDesign — Systems architecture
 * 7. VectorDB — Long-term memory
 * 8. LLMOps — Production and operations
 * 9. EvalTesting — Evaluation and quality
 * 10. AISafety — Safety and ethics
 * 11. Multimodal — Beyond text
 * 12. Infrastructure — Infrastructure and scale
 * 13. Coding — Practical implementation
 * 14. Behavioral — Scenarios and behavioral
 * 
 * Each node has its own spinSpeed (rad/s) for individual rotation effect.
 */
export const graphData: GraphData = {
  nodes: [
    // ═══ LEVEL 1: FOUNDATIONS ═══
    {
      id: 'LLM',
      group: 1,
      description: 'Foundation: how LLMs work under the hood.',
      learningStep: 1,
      spinSpeed: 0.12,
      val: 12
    },
    {
      id: 'PromptEngineering',
      group: 2,
      description: 'The art of extracting the best from LLMs with precise prompts.',
      learningStep: 2,
      spinSpeed: 0.15,
      val: 10
    },

    // ═══ LEVEL 2: CORE TECHNIQUES ═══
    {
      id: 'RAG',
      group: 3,
      description: 'Connecting LLMs to external knowledge bases.',
      learningStep: 3,
      spinSpeed: 0.08,
      val: 15
    },
    {
      id: 'FineTuning',
      group: 4,
      description: 'Specializing models for specific domains and tasks.',
      learningStep: 4,
      spinSpeed: 0.10,
      val: 11
    },
    {
      id: 'Agent',
      group: 5,
      description: 'Autonomous systems that plan, act, and learn.',
      learningStep: 5,
      spinSpeed: 0.14,
      val: 13
    },

    // ═══ LEVEL 2.5: PROTOCOLS & STANDARDS ═══
    {
      id: 'MCP',
      group: 15,
      description: 'Open protocol for connecting LLMs to external tools and data sources.',
      learningStep: 5.5,
      spinSpeed: 0.17,
      val: 10
    },

    // ═══ LEVEL 3: ARCHITECTURE & DATA ═══
    {
      id: 'AISystemDesign',
      group: 6,
      description: 'Architecting complete AI systems in production.',
      learningStep: 6,
      spinSpeed: 0.09,
      val: 11
    },
    {
      id: 'VectorDB',
      group: 8,
      description: 'Vector databases and embeddings for semantic search.',
      learningStep: 7,
      spinSpeed: 0.11,
      val: 9
    },
    {
      id: 'LLMOps',
      group: 7,
      description: 'Operationalizing LLMs with monitoring and scalability.',
      learningStep: 8,
      spinSpeed: 0.13,
      val: 11
    },

    // ═══ LEVEL 4: QUALITY & SAFETY ═══
    {
      id: 'EvalTesting',
      group: 9,
      description: 'Systematic evaluation of quality, accuracy, and safety.',
      learningStep: 9,
      spinSpeed: 0.16,
      val: 9
    },
    {
      id: 'AISafety',
      group: 10,
      description: 'Responsible AI: ethics, privacy, bias, and regulation.',
      learningStep: 10,
      spinSpeed: 0.07,
      val: 10
    },

    // ═══ LEVEL 5: ADVANCED ═══
    {
      id: 'Multimodal',
      group: 11,
      description: 'Models that process text, image, audio, and video.',
      learningStep: 11,
      spinSpeed: 0.18,
      val: 8
    },
    {
      id: 'Infrastructure',
      group: 12,
      description: 'GPUs, scalability, optimization, and serving models.',
      learningStep: 12,
      spinSpeed: 0.06,
      val: 9
    },
    {
      id: 'Coding',
      group: 13,
      description: 'Practical implementations: RAG, agents, search, evaluation.',
      learningStep: 13,
      spinSpeed: 0.20,
      val: 8
    },
    {
      id: 'Behavioral',
      group: 14,
      description: 'Scenarios, trade-offs, and real-world decisions.',
      learningStep: 14,
      spinSpeed: 0.05,
      val: 7
    },

    // ═══ NEW NODES — EXPANSION ═══
    {
      id: 'StructuredOutputs',
      group: 20,
      description: 'Output format guarantee with Pydantic schemas, JSON mode, and libraries like instructor and Outlines.',
      learningStep: 2.5,
      spinSpeed: 0.09,
      val: 8
    },
    {
      id: 'ContextEngineering',
      group: 18,
      description: 'Optimization of context sent to the LLM: compression, sliding window, token budget and distillation using LLMLingua.',
      learningStep: 3.5,
      spinSpeed: 0.10,
      val: 11
    },
    {
      id: 'KnowledgeGraphs',
      group: 26,
      description: 'Construction and querying of knowledge graphs with entities and relations for structured multi-hop search.',
      learningStep: 3.3,
      spinSpeed: 0.09,
      val: 8
    },
    {
      id: 'Workflows',
      group: 16,
      description: 'Orchestration of AI pipelines with DAGs, loops, human-in-the-loop, and parallelism using LangGraph and Prefect.',
      learningStep: 4.5,
      spinSpeed: 0.12,
      val: 11
    },
    {
      id: 'MultiAgentSystems',
      group: 17,
      description: 'Coordination between multiple specialized agents with orchestration, handoff, and debate using CrewAI and AutoGen.',
      learningStep: 5.2,
      spinSpeed: 0.15,
      val: 10
    },
    {
      id: 'FunctionCalling',
      group: 21,
      description: 'Native capability of LLMs to declare and invoke external tools via APIs like OpenAI tool use and Anthropic tool use.',
      learningStep: 5.6,
      spinSpeed: 0.11,
      val: 8
    },
    {
      id: 'HybridSearch',
      group: 22,
      description: 'Combination of vector semantic search with BM25 lexical search using RRF for more accurate results.',
      learningStep: 7.5,
      spinSpeed: 0.08,
      val: 8
    },
    {
      id: 'ObservabilityAI',
      group: 19,
      description: 'Monitoring, tracing, and observability of AI systems with LangSmith, Langfuse, and Phoenix for debugging and optimization.',
      learningStep: 8.5,
      spinSpeed: 0.07,
      val: 10
    }
  ],

  // Links form a progressive knowledge graph
  links: [
    // Foundations → Techniques
    { source: 'LLM', target: 'PromptEngineering' },
    { source: 'PromptEngineering', target: 'RAG' },
    { source: 'LLM', target: 'RAG' },

    // Core Techniques
    { source: 'RAG', target: 'FineTuning' },
    { source: 'RAG', target: 'Agent' },
    { source: 'LLM', target: 'FineTuning' },
    { source: 'FineTuning', target: 'Agent' },

    // MCP — Tool Standardization
    { source: 'Agent', target: 'MCP' },
    { source: 'MCP', target: 'AISystemDesign' },
    { source: 'MCP', target: 'Coding' },

    // Architecture & Data
    { source: 'RAG', target: 'VectorDB' },
    { source: 'Agent', target: 'AISystemDesign' },
    { source: 'RAG', target: 'AISystemDesign' },
    { source: 'LLMOps', target: 'AISystemDesign' },
    { source: 'VectorDB', target: 'AISystemDesign' },

    // Quality & Safety
    { source: 'AISystemDesign', target: 'LLMOps' },
    { source: 'LLMOps', target: 'EvalTesting' },
    { source: 'EvalTesting', target: 'AISafety' },
    { source: 'Agent', target: 'AISafety' },

    // Advanced
    { source: 'LLM', target: 'Multimodal' },
    { source: 'LLMOps', target: 'Infrastructure' },
    { source: 'AISystemDesign', target: 'Infrastructure' },
    { source: 'EvalTesting', target: 'Coding' },
    { source: 'AISystemDesign', target: 'Coding' },
    { source: 'Coding', target: 'Behavioral' },
    { source: 'AISafety', target: 'Behavioral' },

    // Cross connections
    { source: 'LLM', target: 'EvalTesting' },
    { source: 'FineTuning', target: 'EvalTesting' },
    { source: 'Multimodal', target: 'VectorDB' },
    { source: 'Multimodal', target: 'Agent' },

    // ═══ NEW LINKS — StructuredOutputs ═══
    { source: 'StructuredOutputs', target: 'LLM' },
    { source: 'StructuredOutputs', target: 'PromptEngineering' },
    { source: 'StructuredOutputs', target: 'RAG' },
    { source: 'StructuredOutputs', target: 'AISystemDesign' },

    // ═══ NEW LINKS — ContextEngineering ═══
    { source: 'ContextEngineering', target: 'LLM' },
    { source: 'ContextEngineering', target: 'RAG' },
    { source: 'ContextEngineering', target: 'PromptEngineering' },
    { source: 'ContextEngineering', target: 'LLMOps' },
    { source: 'ContextEngineering', target: 'AISystemDesign' },

    // ═══ NEW LINKS — KnowledgeGraphs ═══
    { source: 'KnowledgeGraphs', target: 'RAG' },
    { source: 'KnowledgeGraphs', target: 'VectorDB' },
    { source: 'KnowledgeGraphs', target: 'AISystemDesign' },
    { source: 'KnowledgeGraphs', target: 'LLM' },
    { source: 'KnowledgeGraphs', target: 'Workflows' },

    // ═══ NEW LINKS — Workflows ═══
    { source: 'Workflows', target: 'LLM' },
    { source: 'Workflows', target: 'RAG' },
    { source: 'Workflows', target: 'Agent' },
    { source: 'Workflows', target: 'MCP' },
    { source: 'Workflows', target: 'AISystemDesign' },

    // ═══ NEW LINKS — MultiAgentSystems ═══
    { source: 'MultiAgentSystems', target: 'Agent' },
    { source: 'MultiAgentSystems', target: 'MCP' },
    { source: 'MultiAgentSystems', target: 'AISystemDesign' },
    { source: 'MultiAgentSystems', target: 'Workflows' },
    { source: 'MultiAgentSystems', target: 'LLMOps' },

    // ═══ NEW LINKS — FunctionCalling ═══
    { source: 'FunctionCalling', target: 'LLM' },
    { source: 'FunctionCalling', target: 'Agent' },
    { source: 'FunctionCalling', target: 'MCP' },
    { source: 'FunctionCalling', target: 'StructuredOutputs' },
    { source: 'FunctionCalling', target: 'AISystemDesign' },

    // ═══ NEW LINKS — HybridSearch ═══
    { source: 'HybridSearch', target: 'VectorDB' },
    { source: 'HybridSearch', target: 'RAG' },
    { source: 'HybridSearch', target: 'AISystemDesign' },
    { source: 'HybridSearch', target: 'LLMOps' },

    // ═══ NEW LINKS — ObservabilityAI ═══
    { source: 'ObservabilityAI', target: 'LLMOps' },
    { source: 'ObservabilityAI', target: 'EvalTesting' },
    { source: 'ObservabilityAI', target: 'AISystemDesign' },
    { source: 'ObservabilityAI', target: 'RAG' },
    { source: 'ObservabilityAI', target: 'Agent' }
  ]
}

/**
 * Returns the list of nodes sorted by learningStep.
 */
export function getLearningPath() {
  return [...graphData.nodes]
    .filter(n => n.learningStep != null)
    .sort((a, b) => (a.learningStep ?? 99) - (b.learningStep ?? 99))
}

/**
 * Returns the current step based on the selected node.
 */
export function getCurrentStep(nodeId: string | null): number {
  if (!nodeId) return 0
  const node = graphData.nodes.find(n => n.id === nodeId)
  return node?.learningStep ?? 0
}
