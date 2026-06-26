import type { NodeContent } from '../../types/mindmap'

export const categoryNodes: Record<string, NodeContent> = {

  // ═══════════════════════════════════════════════
  // 6. AI SYSTEM DESIGN
  // ═══════════════════════════════════════════════
  AISystemDesign: {
    summary:
      'AI System Design is the art of architecting complete systems that use AI reliably, scalably, and cost-effectively. It involves decisions like: using LLM API vs self-hosted, RAG vs fine-tuning, caching, rate limiting, fallbacks, and how to integrate AI into existing systems.',
    everydayExample:
      'Designing an AI system is like designing a restaurant: you can\'t just hire an amazing chef (LLM) and call it done. You need: (1) Menu (prompts), (2) Pantry (vector DB), (3) Waiters (API gateway), (4) Backup kitchen (fallbacks), (5) Quality control (eval), (6) Cleanup (guardrails). A brilliant chef in a messy kitchen serves bad food. In an engineer\'s practice, designing an AI system means thinking about: what happens when the LLM provider goes down? (fallback to another model). How to ensure costs don\'t explode? (semantic cache + rate limiting per user). How to measure if the system is good? (quality metrics + feedback loop). How to scale from 100 to 100,000 users? (multi-tier architecture with caching). Good AI system design anticipates failures and plans for graceful degradation.',
    quickTip: 'Start with the simplest approach possible. Use LLM API (not self-host) until proven otherwise. Implement semantic cache on day one. Have a fallback for when the LLM is down. Monitor: latency, error rate, cost per request, and user feedback. To scale: use an LLM Gateway (Portkey, Helicone) as a single proxy. Separate simple queries (cheap model) from complex ones (expensive model) with a router. Implement circuit breaker: if the provider has errors, automatically switch to the fallback. Have feature flags to enable/disable AI features without deploy.',
    sections: [
      {
        title: 'AI System Design Challenges',
        type: 'key-concepts',
        items: [
          'Semantic Cache: cache responses for similar (not identical) queries — reduces cost by 30-50%',
          'Rate Limiting and Budget: cost control per user/day, prevents abuse',
          'Fallback Chain: expensive model → cheap model → generic response (graceful degradation)',
          'Multi-LLM Routing: route simple queries to cheap models, complex ones to expensive models',
          'Observability: trace every request: prompt, response, latency, cost, feedback',
          'A/B Testing: compare prompts, models, and parameters in production with statistical significance',
          'Human-in-the-Loop: for high-risk decisions, request human confirmation',
          'Circuit Breaker: if a provider has instability, automatically switch to fallback',
          'Feature Flags: enable/disable AI features without deploy (useful for quick rollback)'
        ]
      },
      {
        title: 'Classic System Design Problems',
        type: 'how-it-works',
        items: [
          'Design an AI Coding Agent: architecture with editor, terminal, sandbox, and code review',
          'Design a Customer Support Chatbot: RAG + agent + escalation + human handoff',
          'Design a Document Q&A System: ingestion pipeline, chunking, multi-modal search',
          'Design a Content Moderation System: multiple classifiers + LLM judge + human review',
          'Design a Meeting Summarizer: real-time transcription + diarization + summarization',
          'Design a Multi-Tenant Chatbot Platform: data isolation, per-tenant customization, billing',
          'Design a Resume Screening System: parsing + embedding + matching + fairness audit'
        ]
      },
      {
        title: 'Daily Example: Designing Like a Head Chef',
        type: 'analogy',
        body: 'Designing an AI system for production is like designing the kitchen of a starred restaurant. You can\'t just hire a brilliant chef (LLM) and expect miracles — the entire kitchen needs to work in harmony. The pantry needs to be organized (vector DB with good chunking and efficient indexing). The stoves need controlled temperature (temperature, top-p, and other model parameters tuned per task). The utensils need to be standardized (tool schemas and consistent output formats). The maître d\' needs to manage the order flow (API gateway, rate limiting, priority queue). And crucially, you need a contingency plan for when the fire goes out (fallbacks, circuit breaker, graceful degradation). An amazing chef in a messy kitchen serves inconsistent dishes. An average chef in a well-designed kitchen serves excellence every time. The lesson for AI engineers: invest more in system architecture than in model choice — the model changes every quarter, but a well-designed architecture lasts for years and adapts to any LLM.'
      },
      {
        title: 'Production Problems',
        type: 'qa-list',
        qa: [
          { question: 'How to design for latency vs quality?', answer: 'Separate into tiers: (1) simple queries → fast model + cache, (2) complex queries → powerful model + RAG, (3) critical queries → model ensemble + human review. Monitor P50/P95/P99 latency.' },
          { question: 'How to handle traffic spikes?', answer: 'Auto-scaling based on queue (SQS/RabbitMQ). Aggressive caching. Degrade models (from GPT-4 to GPT-4o-mini). Prioritize paying users. Have a "circuit breaker" for external providers.' },
          { question: 'LLM provider went down. How to survive?', answer: 'Have multiple providers configured (OpenAI + Anthropic + local). Implement automatic fallback. Cache common responses. "Offline" mode with reduced functionality.' },
          { question: 'Your AI system does not scale vertically. Now what?', answer: 'Distribute the load: sharding by tenant, model replicas, round-robin balancing. Consider request batching to increase throughput. Use async inference for non-critical tasks.' },
          { question: 'How to ensure consistency across multiple LLM calls in a flow?', answer: 'Use output schemas (JSON mode + Pydantic). Implement post-generation validation at each step. If a step fails validation, retry up to N times. Use a "state machine" to control the flow.' },
          { question: 'What is the ideal caching strategy for AI systems?', answer: '3-layer cache: (1) Semantic cache (embeddings + similarity) for identical/similar queries, (2) RAG chunk cache (search results cached by TTL), (3) LLM response cache for exact prompts. Invalidation: TTL based on data change frequency.' }
        ]
      },
      {
        title: 'Real Scenario: Multi-Tenant AI Platform',
        type: 'everyday-scenario',
        body: 'Your company decided to offer an AI chatbot as a product for multiple enterprise clients. Each client (tenant) has its own documents, users, and business rules. The challenge: isolate data between tenants, correctly allocate costs, rate limit per tenant, and ensure one noisy tenant does not degrade the experience for others. You need a well-designed multi-tenant architecture from day one.',
        items: [
          'Data isolation per tenant: each tenant has its own collection in the vector DB, prefixed by tenant_id — no query from one tenant can return documents from another',
          'Rate limiting at 3 levels: global (total system limit), per tenant (contracted RPM), and per user (prevents individual abuse) — all with 2x burst allowed for 10 seconds',
          'Cost allocation: each request is accounted to the tenant (input/output tokens, embedding calls, vector storage) and billed at the end of the month',
          'Model routing by tier: Basic tenant uses GPT-4o-mini, Premium tenant uses GPT-4o, Enterprise tenant can choose — queue isolation per tier',
          'Tenant-isolated semantic cache: Tenant A queries never return Tenant B responses — even if semantically identical',
          'Multi-tenant observability: dashboard shows metrics (latency, cost, error rate) aggregated and per tenant — alerts when a tenant exceeds thresholds'
        ]
      },
      {
        title: 'Multi-Tenant Architecture Considerations',
        type: 'key-concepts',
        items: [
          'Database per tenant: more secure, higher operational cost — for very sensitive data',
          'Collection per tenant (shared database): good balance between security and cost — most common',
          'Metadata filtering (shared collection): uses vector DB filters to isolate — cheapest, risk of leakage if filter fails',
          'Tenant-aware caching: separate cache per tenant prevents information leakage between tenants',
          'Granular billing: track input tokens, output tokens, embedding storage, and GPU time per tenant',
          'SLA tiers: different tenants can have different SLAs (P95 latency <2s for Premium, <5s for Basic)',
          'Tenant isolation testing: automated tests that verify Tenant A data is inaccessible to Tenant B',
          'Noisy neighbor mitigation: isolate high-throughput tenants on dedicated resources (sharding)'
        ]
      },
      {
        title: 'Real Scenario: Architecture Redesign After Cost Meltdown',
        type: 'everyday-scenario',
        body: 'Your AI platform launched successfully — users love it, but the CFO is in a panic. LLM API costs skyrocketed from $5K to $45K/month in 3 months. Every request uses GPT-4, no cache, no distinction between simple and complex queries. You need to redesign the architecture to cut costs without sacrificing user experience. The solution combines aggressive caching, intelligent model routing, and prompt optimization.',
        items: [
          'Diagnosis: 80% of requests are simple queries (summarization, extraction, classification) that a smaller model could handle — but 100% go to GPT-4. 40% are semantically identical to previous requests — no cache, each one pays full price',
          'Implement a classifier router: a lightweight model (embedding-based classifier) categorizes each query as "simple" or "complex" in <5ms. Simple → GPT-4o-mini ($0.15/M tokens), Complex → GPT-4o ($2.50/M tokens). Immediate savings: 65%',
          'Add semantic cache with Redis + embeddings: queries with similarity >0.93 return cached response. TTL of 24h for stable data, 1h for volatile data. 40% of queries served by cache — additional 40% savings on remaining cost',
          'Compress conversation history: instead of sending the full history (growing without limits), send only the last 3 interactions + summary of the rest. Reduces input tokens by 50-70%',
          'Implement fine-tuning of a smaller model (Llama 3.2 8B) for the 5 most common tasks — queries that previously went to GPT-4 now go to the local model, cost near zero',
          'Final result: cost drops from $45K to $6K/month (87% reduction) with P95 latency <2s. The CFO now asks "can we spend more on AI?" instead of "why is it so expensive?"'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 7. LLMOps & PRODUCTION AI
  // ═══════════════════════════════════════════════
  LLMOps: {
    summary:
      'LLMOps is the discipline of operationalizing language models in production: serving, monitoring, versioning, scaling, and costing. While MLOps deals with traditional models (classification, regression), LLMOps adds complexities like: text generation, hallucinations, cost per token, and non-deterministic behavior.',
    everydayExample:
      'Running an LLM in production is like managing a power plant: you need to generate energy (inference) 24/7, monitor voltage (quality), have contingency plans (fallbacks), measure consumption (cost per token), and do preventive maintenance (model updates). If the plant stops, the entire city goes dark (system goes down). In the day-to-day life of an ML engineer, LLMOps means: configuring alerts when P95 latency rises above 5s, investigating why costs suddenly doubled (someone accidentally changed model_name from gpt-4o-mini to gpt-4o), rolling back a prompt that broke quality, or scaling vLLM replicas when a marketing campaign hits. It is the "boring" but essential work that separates demos from real production.',
    quickTip: 'Monitor 5 essential metrics: (1) TTFT (Time to First Token), (2) TPS (Tokens per Second), (3) P95 Latency, (4) Error Rate (timeout, rate limit, filtered content), (5) Cost per request. Use guardrails for inputs and outputs (Nvidia NeMo Guardrails, Guardrails AI). For self-hosting: use vLLM with PagedAttention for maximum throughput. Implement continuous batching — increases throughput by 10-20x. For cost: semantic cache + model router (simple queries go to cheap model). Versioning: prompt + model + parameters = 1 "deploy unit" — everything versioned together.',
    sections: [
      {
        title: 'LLMOps vs MLOps',
        type: 'overview',
        body: 'LLMOps differs from MLOps in several aspects: (1) Metrics: beyond accuracy, we monitor hallucinations, relevance, faithfulness, (2) Cost: token-aware (each request costs money), (3) Versioning: prompt + model + parameters = one "version", (4) Testing: non-deterministic — needs statistical eval, (5) CI/CD: eval-driven development pipeline, (6) Observability: tracing of thought chains, tool calls, and multi-step flows.'
      },
      {
        title: 'Tools and Techniques',
        type: 'key-concepts',
        items: [
          'Quantization: INT8 (4x compression), INT4 (8x) via GPTQ/AWQ/GGUF — essential for self-hosting',
          'Continuous Batching: groups requests in real time, increases throughput by 10-20x',
          'PagedAttention: manages KV cache like virtual memory pages (vLLM), prevents fragmentation',
          'Speculative Decoding: draft model (fast) + target model (verifies), speeds up 2-3x',
          'LLM Gateway: unified proxy (Portkey, Helicone, Anthropic Console) for routing, cache, and monitoring',
          'Prompt Versioning: git for prompts — every change is versioned and tested',
          'Feature Flags: enable/disable models, prompts, or features per user/group',
          'Drift Monitoring: detect changes in input distribution, outputs, and quality metrics'
        ]
      },
      {
        title: 'Production Problems',
        type: 'qa-list',
        qa: [
          { question: 'Peak hour latency. How to stabilize?', answer: 'Use semantic cache for frequent queries. Pre-warm connections (keep-alive). Implement batching. Scale horizontally with replicas. Consider a smaller model for spikes.' },
          { question: 'LLM costs too high. How to reduce?', answer: 'Semantic cache (30-50% reduction). Smaller model for simple queries. Token limit per request. Compress conversation history. Use batching for async tasks.' },
          { question: 'Provider rate limits. How to work around?', answer: 'Implement retry with exponential backoff. Distribute across multiple providers. Prioritize critical requests. Have an API key pool with rotation.' },
          { question: 'Quantized model lost quality. How to minimize?', answer: 'Test different quantization levels on your dataset. Consider mixed quantization (critical layers in FP16). Use AWQ/GPTQ instead of naive quantization. Eval before and after.' },
          { question: 'How to detect data drift in generative AI systems?', answer: 'Monitor the embedding distribution of queries (PCA/t-SNE). Compare distributions weekly with KS-test. Alert when it changes >5%. Also monitor confidence score distribution and user feedback.' },
          { question: 'Your LLM is getting slower over time. How to investigate?', answer: 'Check if the KV cache is growing (long conversations). Monitor VRAM usage — there might be a memory leak. Verify if continuous batching is working. Consider periodic inference server restart.' }
        ]
      },
      {
        title: 'Example: Guardrails',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from guardrails import Guard
from guardrails.hub import ToxicLanguage, SensitiveData

# Guardrails validates LLM input and output
guard = Guard().use_many(
    ToxicLanguage(threshold=0.5, validation_method="sentence"),
    SensitiveData(id="credit_card", mode="mask"),
    SensitiveData(id="email", mode="mask")
)

# The guard wraps the LLM call
raw_llm_output = openai_call(user_input)
validated_output = guard.validate(raw_llm_output)
# If it fails: correct, mask, or block

# Safe output: no toxicity, masked data
print(validated_output.validated_output)`
        },
        body: 'Guardrails prevent toxic content or sensitive data from reaching the end user.'
      },
      {
        title: 'Real Scenario: LLM Cost Monitoring',
        type: 'everyday-scenario',
        body: 'Your team received the monthly OpenAI bill: $12,000 — double the planned budget. No one could explain what caused the increase. Granular cost monitoring was missing. You implemented a tracking system that captures every LLM call: model used, input/output tokens, user, department, and purpose. Within a week, you discovered that 40% of the cost came from a test script that used GPT-4 instead of GPT-4o-mini — and no one knew.',
        items: [
          'Implement cost logging per request: capture model_name, prompt_tokens, completion_tokens, user_id, and a "purpose" field that classifies the call reason',
          'Create cost dashboards by dimension: by model (GPT-4o vs GPT-4o-mini), by service (chatbot vs analytics), by user, by department, by hour of day',
          'Configure anomaly alerts: daily cost >2x the 7-day average triggers a Slack notification — detect budget leaks in hours, not weeks',
          'Implement budget per service: each service has a monthly token budget — at 80%, alert; at 100%, block non-critical calls',
          'Use automatic model router: queries classified as "simple" (lightweight classifier) go to GPT-4o-mini ($0.15/M tokens) instead of GPT-4o ($2.50/M tokens) — 60-80% savings',
          'Do weekly cost review: 30 min meeting to review top spenders, identify anomalies, and adjust routing — reduced cost from $12K to $4.5K/month'
        ]
      },
      {
        title: 'Metrics and Alerts for LLMOps',
        type: 'key-concepts',
        items: [
          'Cost per request: $/req — most important metric for financial control',
          'Cost per active user: $/MAU — helps price the product',
          'Tokens saved by cache: % of queries served by semantic cache',
          'Fallback rate: % of requests that hit the secondary model — if >10%, something is wrong',
          'Mean time between failures (MTBF) per provider: frequency of LLM provider outages',
          'Retry cost: $ wasted on requests that failed and were retried',
          'Efficiency ratio: output tokens / input tokens — ideal between 0.3-0.5 for chatbots',
          'Cost drift: week-over-week comparison of total cost with alert for deviations >20%'
        ]
      },
      {
        title: 'Real Scenario: Implementing Guardrails in Production from Scratch',
        type: 'everyday-scenario',
        body: 'Your customer support chatbot launched 3 months ago and is doing well — until a user discovers they can make the chatbot generate a convincing phishing email using prompt injection. The CEO demands an immediate solution. You need to implement input and output guardrails that block attacks without harming legitimate users. The challenge: finding the balance between security and usability.',
        items: [
          'Layer 1 — Input Guard: implement a prompt injection detector (using LLM-as-a-judge or a specialized model like ProtectAI) that classifies each user input as "safe" or "attack" before processing. If "attack", return a generic response: "I cannot process this request"',
          'Layer 2 — Output Guard: after the LLM generates the response, pass it through a toxicity filter (Detoxify) and PII detection (presidio). If toxic content is detected, block the response and return a fallback. If PII is detected, automatically mask it',
          'Layer 3 — Policy Guard: implement a set of business rules: "never generate executable code", "never impersonate a real person", "never reveal the system prompt". Use a second LLM as a "policy enforcer" that checks the response against these rules',
          'Problem: false positives — 8% of legitimate users had questions blocked by the input guard. Solution: calibrate the detector threshold with 500 real attack examples and 2000 legitimate questions, adjust until FPR <2%',
          'Problem: performance — 3 guardrail layers add 600ms of latency. Solution: run all 3 layers in parallel (not serial) and use smaller models (MiniLM, BGE) for layers 1 and 2, reserving the LLM only for layer 3',
          'Result: 99.2% of attacks blocked, 1.8% false positive rate (and of those, 70% are recovered by a second prompt asking "did you mean X?"), additional latency of only 180ms with parallel execution'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 8. VECTOR DATABASES & EMBEDDINGS
  // ═══════════════════════════════════════════════
  VectorDB: {
    summary:
      'Vector Databases are specialized systems for efficiently storing and searching high-dimensional vectors (embeddings). They are the long-term memory of AI systems — enabling semantic search, similarity, and retrieval at the scale of billions of vectors.',
    everydayExample:
      'A Vector DB is like a library where each book (document) is represented by a "meaning map" (embedding). When you ask a question, it also becomes a map. The librarian finds books whose maps are most similar to yours — even if they use different words! It is search by meaning, not by keyword. In engineering practice: you have a repository with 10,000 technical documents. An employee asks "how do I deploy using Docker?". Traditional keyword search fails if the document says "containerization" instead of "Docker". But vector search understands that "Docker" and "containerization" are semantically close. Another example: a recommendation system that finds "movies similar to Interstellar" — not by genre (keyword), but by synopsis embedding. The Vector DB scales from thousands to billions of vectors with millisecond search using algorithms like HNSW.',
    quickTip: 'Choose the embedding model based on your domain: text-embedding-3-small (general), BGE (multilingual), E5 (specific tasks). Dimensionality: 768-1536 for production. Use Matryoshka embeddings for flexibility (one embedding works at multiple dimensions). For production search: use HNSW index (fastest) or IVF (less memory). Always quantize embeddings in production (FP32→INT8 reduces 4x). Consider "hybrid search" (vector + BM25) for queries mixing semantics with exact technical terms.',
    sections: [
      {
        title: 'Embeddings',
        type: 'overview',
        body: 'Embeddings are dense vector representations that capture semantic meaning. Models like text-embedding-3-small (OpenAI), BGE (BAAI), and E5 (Microsoft) convert text into vectors of 384 to 3072 dimensions. Similarity between texts is measured by: cosine similarity (angle), dot product (magnitude + angle), or Euclidean distance (geometric distance). Similar embeddings = similar meanings.'
      },
      {
        title: 'Similarity Metrics',
        type: 'key-concepts',
        items: [
          'Cosine Similarity: cos(θ) = A·B/(||A||×||B||). Range [-1,1]. 1 = same meaning. Most common.',
          'Dot Product: A·B = ||A||×||B||×cos(θ). Accounts for magnitude. Use with normalized embeddings.',
          'Euclidean Distance (L2): √(Σ(Ai-Bi)²). Simple geometric distance.',
          'Inner Product: similar to dot product, without normalization.',
          'HNSW (Hierarchical Navigable Small World): most popular ANN search algorithm — milliseconds on billions of vectors',
          'Product Quantization (PQ): compresses vectors by dividing into subspaces and quantizing each one'
        ]
      },
      {
        title: 'Common Problems',
        type: 'qa-list',
        qa: [
          { question: 'Vector DB consuming too much memory. How to reduce?', answer: 'Quantize embeddings: FP32→INT8 reduces 4x. Use Product Quantization (PQ). Reduce dimensionality (1536→256 with Matryoshka). Archive unused vectors.' },
          { question: 'Search returns irrelevant results even with high score. How to fix?', answer: 'Your embedding model may be poor for the domain. Fine-tune the embedding model. Add re-ranking with cross-encoder. Increase K and reorder. Use hybrid search (BM25 + vector).' },
          { question: 'Embedding drift after updating model. How to handle?', answer: 'Keep the embedding model version in metadata. Re-embed batches gradually. Have validity dates per embedding. Monitor changes in similarity distributions.' },
          { question: 'Semantic search fails for short queries. How to improve?', answer: 'Expand the query with HyDE (generates a hypothetical response and uses it as a query). Use query decomposition. Add synonyms and variations. Contextualize with history.' },
          { question: 'Need to scale to billions of vectors. What architecture?', answer: 'Use horizontal sharding by tenant/region. HNSW with PQ (Product Quantization) to reduce memory per vector. Consider SpANN (Google) or DiskANN (Microsoft) for datasets that do not fit in RAM.' },
          { question: 'How to choose between cosine similarity and dot product?', answer: 'If your embeddings are normalized (norm=1), cosine and dot product are equivalent. If not normalized, dot product favors higher-norm vectors (more "specific"). Cosine is safer for most cases.' }
        ]
      },
      {
        title: 'Example: HNSW Index with Product Quantization in Qdrant',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, HnswConfigDiff, QuantizationConfig, ScalarQuantization

client = QdrantClient("localhost", port=6333)

# Creates collection with HNSW + Scalar Quantization
client.create_collection(
    collection_name="my_documents",
    vectors_config=VectorParams(
        size=1536,
        distance="Cosine",
        hnsw_config=HnswConfigDiff(
            m=32,
            ef_construct=200,
            full_scan_threshold=10000
        ),
        quantization_config=QuantizationConfig(
            scalar=ScalarQuantization(
                type="int8",
                always_ram=True
            )
        )
    )
)

# Search with HNSW (automatic, no need to configure on query)
results = client.search(
    collection_name="my_documents",
    query_vector=embedding_model.encode("semantic search"),
    limit=10,
    with_payload=["text", "source"],
    search_params={ "exact": False }
)`
        },
        body: 'HNSW + Product Quantization reduces memory usage by 75% with <1% precision loss. The combination enables searching 10M vectors in ~10ms on a single GPU.'
      },
      {
        title: 'Real Scenario: Migrating from Pinecone to Qdrant',
        type: 'everyday-scenario',
        body: 'Your startup started with Pinecone (SaaS) for vector DB — easy to set up, but expensive to scale. With 50 million vectors and growing, the $3,000 monthly cost no longer fit the budget. You decided to migrate to Qdrant (self-hosted). The migration involved: exporting embeddings and metadata, configuring Qdrant with HNSW + product quantization (PQ), validating that search precision did not drop, and updating the indexing pipeline. Lessons learned changed how the team thinks about vector DBs.',
        items: [
          'Export embeddings + payload from Pinecone via API (limit of 10K vectors per call, with pagination — estimated 2 days for 50M vectors)',
          'Configure Qdrant with HNSW index (ef_construct=200, M=32) and Product Quantization (m=8, bits=8) — reduced RAM usage from 300GB to 40GB without significant precision loss',
          'Validate search parity before cutting over: run 10,000 test queries on Pinecone and Qdrant, compare Top-10 results — acceptable if >95% of Top-3 match',
          'Implement dual-write during migration: new documents go to both DBs, queries still use Pinecone until full validation',
          'Monitor P95 latency and precision during migration: Qdrant self-hosted (2x L40) had average latency of 8ms vs 12ms for Pinecone — 33% faster',
          'Final cost: $400/month (2x GPU L40 spot) vs $3,000/month Pinecone — 87% savings with equivalent or better latency'
        ]
      },
      {
        title: 'Pinecone vs Qdrant vs Weaviate',
        type: 'pros-cons',
        body: 'The choice of vector DB depends on your use case, scale, and budget. Pinecone: best developer experience (serverless, 5 min to start), expensive to scale (>$1K/month for 10M vectors), limited customization. Qdrant: self-hosted or cloud, excellent performance (HNSW + PQ), intuitive API, native support for filters and payload indexing. Weaviate: schema-based (GraphQL), multi-modal support (text + image), good for prototyping, but can be more complex. Milvus/Zilliz: best-in-class for billions of vectors, but high operational complexity. Chroma: lightweight, embedded, ideal for local development and prototyping.',
        items: [
          '🔹 Pinecone: best onboarding, more expensive, less control — choose for MVP or small teams',
          '🔹 Qdrant: best value, viable self-hosted, clean API — choose for production with budget awareness',
          '🔹 Weaviate: native GraphQL, integrated multi-modal — choose when you need multimodal search',
          '🔹 Milvus: maximum scale (billions of vectors), but complex — choose when nothing else scales',
          '🔹 Chroma: zero-config, embedded — choose for development and testing'
        ]
      },
      {
        title: 'Real Scenario: Choosing the Embedding Model for a Recommendation System',
        type: 'everyday-scenario',
        body: 'Your startup wants to build a technical article recommendation system: given an article the user is reading, recommend 5 similar articles. You test 3 embedding models: text-embedding-3-small (OpenAI), BGE-large (BAAI), and E5-mistral (Microsoft). Each model has different trade-offs in quality, cost, and latency. The choice of embedding model determines whether recommendations will be accurate or irrelevant.',
        items: [
          'Test setup: take 10,000 articles from your corpus, embed with each model (1536d, 1024d, 4096d respectively), and for 100 test articles, calculate the Top-5 similar. Evaluate with 3 human annotators: "is the recommendation relevant?" (1-5 Likert)',
          'Results: text-embedding-3-small → average score 3.8/5, cost $0.02/1000 articles, latency 50ms. BGE-large → 4.1/5, cost $0 (self-host), latency 120ms (GPU). E5-mistral → 4.3/5, cost $0 (self-host), latency 200ms',
          'Qualitative analysis: text-embedding-3-small recommends articles from the same topic but misses nuances (e.g., "React tutorial" vs "React vs Vue comparison" — both are "React" but different intent). BGE-large captures intent better. E5-mistral is better but 2x slower',
          'Decision: choose BGE-large as the main model (best cost-benefit) with Matryoshka embedding for flexibility — the same embedding can be used at 256d (fast, 90% quality) or 1024d (full, 100%) depending on system load',
          'Implement "embedding versioning": each embedding model version has a prefix (bge-v1, bge-v2). When updating the model, re-embed in the background and swap the reference — no downtime with fallback to the previous version if the new one is worse',
          'Monitor quality continuously: each week, compute the average similarity of Top-5 — if it drops >5%, investigate (could be data drift). Each month, re-evaluate with human annotators to ensure quality is maintained'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 12. AI INFRASTRUCTURE & SCALABILITY
  // ═══════════════════════════════════════════════
  Infrastructure: {
    summary:
      'AI Infrastructure involves serving models at scale with low latency, high throughput and controlled cost. Includes hardware selection (GPUs), optimization techniques (quantization, batching, parallelism), and deployment architectures (self-hosted vs API, edge vs cloud).',
    everydayExample:
      'AI infrastructure is like setting up a data center for a company that grows 10x per month. You don\'t buy servers for the peak maximum (too expensive), nor for the minimum (collapses). Instead: auto-scaling in the cloud, cache on edge servers, load balancing across regions, and a queue for spikes. Everything needs to be elastic and monitored. In the daily work of an infrastructure engineer: you need to serve a Llama 3.1 70B model for 1000 concurrent users with <2s latency. This means: (1) choosing the right GPU (2x A100 80GB or 4x L40), (2) quantizing the model (FP16→INT4 reduces memory 4x), (3) configuring vLLM with continuous batching + PagedAttention, (4) scaling horizontally with multiple replicas behind a load balancer, (5) implementing a cache for frequent queries, (6) monitoring VRAM, throughput, and latency. All of this with CI/CD for model deployment.',
    quickTip: 'Start with the API (OpenAI, Anthropic) — it\'s cheaper than self-host up to ~1M requests/day. When moving to self-host, use vLLM (PagedAttention) + TensorRT-LLM (NVIDIA) for maximum performance. For GPUs: A100 (training), L4/L40 (inference), H100 (state of the art). Always quantize for production (INT8/FP8). Configure continuous batching (increases throughput 10-20x). Use speculative decoding if latency is critical. Monitor: VRAM, GPU utilization, TTFT, TPS, P95 latency.',
    sections: [
      {
        title: 'Optimization Techniques',
        type: 'key-concepts',
        items: [
          'Continuous Batching: increases throughput 10-30x vs static batching',
          'PagedAttention (vLLM): manages KV cache like memory pages, eliminates fragmentation',
          'Tensor Parallelism: distributes a layer across multiple GPUs',
          'Pipeline Parallelism: distributes layers across GPUs (each GPU processes some layers)',
          'FP8 Inference: new frontier — 2x faster than FP16 with similar quality',
          'KV Cache Quantization: compresses attention cache to INT8, reduces memory by 50%',
          'Speculative Decoding: fast draft model + main model verifies in parallel',
          'FlashAttention: optimized CUDA kernel for attention — up to 2x faster, less memory',
          'S-LoRA: serve multiple LoRA adapters simultaneously without swapping weights'
        ]
      },
      {
        title: 'Infrastructure Problems',
        type: 'qa-list',
        qa: [
          { question: 'How to choose a GPU for inference?', answer: 'Depends on the model and throughput: Llama 3.2 3B: L4 or T4. Llama 3.1 70B: A100 80GB or 2x L40. GPT-4 scale: H100. Consider: VRAM (weights + KV cache), memory bandwidth (HBM), and cost per token.' },
          { question: 'Self-host vs API: when to use each?', answer: 'API: <1M req/day, small team, needs model variety, doesn\'t want to manage infrastructure. Self-host: >1M req/day, sensitive data (can\'t leave), critical latency, predictable cost. Break-even point: ~$10K/month on API.' },
          { question: 'Cold start in serverless AI. How to solve it?', answer: 'Pre-warm instances (keep-warm). Use "always-on" for base load + serverless for spikes. Cache model on NVMe disk. Consider GPU spot instances with checkpointing.' },
          { question: 'How to implement model routing based on complexity?', answer: 'Use a "router model" (lightweight classifier) that estimates query complexity. Simple queries → small model (fast, cheap). Complex queries → large model (powerful, expensive). Saves 40-60% on total cost.' },
          { question: 'How to calculate how many GPUs I need to serve a model?', answer: 'Formula: VRAM = (model_weights × bytes_per_param) + (KV_cache × batch_size × seq_len × layers × heads). Ex: Llama 3.1 70B in FP16 = 140GB of weights + ~10GB KV cache. Needs 2x A100 80GB or quantize to INT4 (70GB).' },
          { question: 'Continuous batching vs static batching: what\'s the practical difference?', answer: 'Static batching: waits to accumulate N requests to process together — increases latency. Continuous batching: processes requests individually but manages the batch dynamically — requests enter and leave the batch at each generation step. Result: 10-20x more throughput with the same latency.' }
        ]
      },
      {
        title: 'Daily Example: AI Infrastructure as a Power Plant',
        type: 'analogy',
        body: 'Maintaining AI infrastructure in production is like running a power plant that serves an entire city. You need to generate energy (inference) 24/7, monitor voltage (response quality), have contingency plans for when a generator goes down (fallback to another provider), measure consumption by neighborhood (cost per department/user), and perform preventive maintenance (model updates and optimizations). If the plant stops, the entire city is in the dark — the system going down means dissatisfied users and lost revenue. In the daily life of an infrastructure engineer: configuring alerts for when P95 latency rises above 5s, investigating why the API cost doubled out of nowhere (someone accidentally changed model_name from gpt-4o-mini to gpt-4o), rolling back a model deployment that broke quality, or scaling vLLM replicas when a marketing campaign brings a traffic spike. It\'s the "boring" but essential work that separates demos from real production — anyone can serve a model, few keep it running reliably for months.'
      },

      {
        title: 'Real Scenario: Scaling from 100 to 10,000 Requests/Minute',
        type: 'everyday-scenario',
        body: 'Your AI application went viral: in one week, traffic jumped from 100 requests/minute to 10,000 req/min. Your vLLM server with a single A100 GPU couldn\'t handle it — latency went from 500ms to 12s. You needed to scale quickly without rewriting the architecture. The solution combined inference server optimization, aggressive caching, and horizontal scaling with multiple GPUs.',
        items: [
          'First, optimize the existing server: enable continuous batching on vLLM (increases throughput 10-20x without additional hardware), configure PagedAttention (reduces memory fragmentation) and quantize the model to FP8 (2x faster, imperceptible quality loss)',
          'Implement 2-level caching: semantic cache (Redis + embeddings) for frequent queries (~40% of requests), and prefix cache (KV cache of common prompts) to reduce latency by 60%',
          'Scale horizontally: place 4 vLLM replicas behind a round-robin load balancer, each on an L40 GPU (lower cost than A100), with auto-scaling based on queue size',
          'Configure a "model router": simple queries (classification, short extraction) go to a small model (Llama 3.2 3B) that serves 5000 req/min on 1 GPU, complex queries (reasoning, analysis) go to the large model',
          'Implement a priority queue: paying users\' requests go straight to GPUs, free users enter a queue — prevents free traffic spikes from taking down the paid service',
          'Monitor GPU utilization, queue size, and P95 latency in real time — configure auto-scaling to add replicas when the queue exceeds 1000 requests or P95 latency >3s'
        ]
      },
      {
        title: 'Inference Scaling Strategies',
        type: 'how-it-works',
        body: 'Scaling LLM inference is not like scaling a common web server — GPUs are finite and expensive resources. The main strategies: (1) Vertical: optimize the existing GPU via continuous batching, quantization, FlashAttention — 10-30x gain without new hardware. (2) Horizontal: add more GPU replicas behind a load balancer — scales linearly up to the database/API limit. (3) Model sharding: distribute the model across GPUs (tensor parallelism for models >80GB) — allows serving models that don\'t fit on 1 GPU. (4) Caching: semantic cache + prefix caching reduce effective load by 40-60%. (5) Model routing: route queries to the smallest model that solves the task — reduces cost and increases effective capacity. In practice, a combination of these strategies allows scaling from hundreds to tens of thousands of requests per minute with the same hardware.'
      },
      {
        title: 'Real Scenario: Cost Optimization with Spot Instances and Model Router',
        type: 'everyday-scenario',
        body: 'Your startup has grown and now spends $28K/month on on-demand GPUs on AWS to serve Llama 3.1 70B and 8B. You need to cut costs without affecting latency (P95 <3s). The solution combines spot instances (70% cheaper) with an intelligent model router and checkpointing for resilience to interruptions — which can occur with only 2 minutes notice.',
        items: [
          'Architecture: 70% spot (2x L40 = $0.80/h vs $2.50/h on-demand), 30% on-demand as baseline. Load balancer prioritizes spot, migrates active requests to on-demand when spot is about to be reclaimed',
          'Frequent checkpointing: vLLM saves inference state (KV cache) every 30s on local NVMe. If spot is reclaimed, requests from the last 30s are resumed on on-demand — only 1-2s additional latency',
          'Multi-layer model router: classifies query in 10ms → 70% simple go to Llama 8B on spot, 30% complex go to Llama 70B on spot. If no spot, fallback to on-demand. If everything is full, priority queue',
          'Predictive auto-scaling: based on 4-week history, pre-scales spot 15 min before peaks (10am-12pm, 2pm-4pm) and scales down outside business hours — reduced idle capacity from 40% to 12%',
          'Monitor spot interruption rate by zone: if >5% interruptions, avoid that zone. Use 3 zones with weighted distribution — if one becomes unstable, it redistributes automatically',
          'Result: cost from $28K to $9.5K/month (66% savings). P95 latency: 2.1s (vs 1.8s before). Interruption rate: 2.3% with zero lost requests. Payback: 1.5 months'
        ]
      }
    ]
  },

}

