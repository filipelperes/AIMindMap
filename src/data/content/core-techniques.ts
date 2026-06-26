import type { NodeContent } from '../../types/mindmap'

export const categoryNodes: Record<string, NodeContent> = {

  // ═══════════════════════════════════════════════
  // 3. RETRIEVAL-AUGMENTED GENERATION (RAG)
  // ═══════════════════════════════════════════════
  RAG: {
    summary:
      'Retrieval-Augmented Generation (RAG) is the technique that connects LLMs to external knowledge sources. Instead of relying only on what the model learned during training, RAG retrieves relevant documents, inserts them into the context, and generates grounded responses. It is the foundation for enterprise chatbots, documentation assistants, and Q&A systems.',
    everydayExample:
      'Imagine a doctor (LLM) who went to medical school (training). To diagnose, they need to consult the patient\'s chart (RAG). Without the chart, they guess based on experience. With the chart, they give an accurate diagnosis based on the patient\'s real data. RAG is the LLM\'s chart. In a software engineer\'s practice, RAG appears when you build a chatbot that answers questions about internal company documentation. Without RAG, the LLM may invent APIs that don\'t exist or give outdated answers. With RAG, you chunked the internal manuals, embedded them in a vector DB, and with each employee question ("how do I deploy microservice X?"), the system retrieves relevant chunks and feeds the LLM with the correct context. Another example: a customer support system that queries the knowledge base before answering. If the refund policy changes, you just re-index the documents — without retraining the model. That\'s why RAG is the most adopted architecture in production today: it separates factual knowledge (database) from reasoning (LLM).',
    quickTip: 'Always start with recursive chunking (512 tokens, 10% overlap). Use hybrid search (vector + keyword) instead of just vector search. Add re-ranking with cross-encoder to improve precision. Monitor faithfulness (is the LLM faithful to the context?) vs relevance (is the context relevant?). For production: implement semantic cache for frequent queries, retrieval logging for debugging, and periodic pipeline evaluation. Experiment with parent-child chunking: small chunks for retrieval (256 tokens) + full parent chunk (2048 tokens) for context. Consider query transformation: HyDE (generates hypothetical answer for retrieval) and complex query decomposition.',
    sections: [
      {
        title: 'RAG Architecture',
        type: 'architecture',
        body: 'The classic pipeline: (1) Indexing — documents go through chunking, embedding and storage in a vector DB, (2) Retrieval — the query is embedded and searches for the K most similar chunks, (3) Augmentation — chunks + query + instruction become the final prompt, (4) Generation — LLM generates response based on context. Variations include fusion RAG (multi-query), iterative RAG (multi-hop retrieval) and agentic RAG (agent decides when to retrieve).'
      },
      {
        title: 'Key Concepts',
        type: 'key-concepts',
        items: [
          'Chunking: fixed-size (512 chars), recursive (natural boundaries), semantic (topic change)',
          'Embedding Model: text-embedding-3-small, BGE, E5 — converts text to vectors',
          'Vector Database: Pinecone, Weaviate, Qdrant, Chroma — ANN search across millions of vectors',
          'Hybrid Search: vector similarity + BM25 (keyword), combined with RRF (Reciprocal Rank Fusion)',
          'Re-ranking: cross-encoder (slower, more accurate) reorders Top-K results',
          'Parent-Child Chunking: small chunks for retrieval, full parent chunk for context',
          'Query Transformation: HyDE (generates hypothetical answer for retrieval), decomposition (splits complex query), step-back (more general question)',
          'Multi-Modal RAG: searches images, tables, and text simultaneously using CLIP or VLMs',
          'GraphRAG: builds a knowledge graph with entities and relationships, enabling multi-hop search and global summarization'
        ]
      },
      {
        title: 'Advanced Chunking Strategies',
        type: 'how-it-works',
        body: 'The right chunking can take your RAG from 40% to 90% accuracy. (1) Fixed-size: simple, 512 tokens with 10% overlap — works for homogeneous texts. (2) Recursive: splits into paragraphs, sentences, words — respects natural boundaries. (3) Semantic: detects topic changes via embeddings — each chunk is a cohesive "subject". (4) Agentic: uses an LLM to decide where to split — more expensive, better quality. (5) LLM-based: "summarize each paragraph and use the summary as chunk" — useful for very long documents. General rule: small chunks (256-512 tokens) for retrieval precision; larger chunks (1024-2048) for sufficient context. The choice depends on your content: technical documentation favors smaller chunks; long articles, larger chunks.'
      },
      {
        title: 'Hybrid Search with BM25',
        type: 'how-it-works',
        body: 'Hybrid Search combines semantic search (embeddings) with lexical search (BM25). Semantic search understands meaning: "old car" finds "used automobile". Lexical search (BM25) finds exact matches: "XPTO-123" (product code). Alone, semantic search fails on precise technical terms; lexical fails on synonyms. The combination uses RRF (Reciprocal Rank Fusion): for each document, the final score = 1/(k + rank_vector) + 1/(k + rank_bm25). Where k=60 is the default. In practice, this gives much more robust results — especially for queries that mix natural language with technical terms, IDs, codes, or proper nouns. Implementation: use Qdrant or Elasticsearch with native hybrid search support.'
      },
      {
        title: 'Re-ranking with Cross-Encoders',
        type: 'architecture',
        body: 'Re-ranking is a post-retrieval step that dramatically improves precision. The flow: (1) Fast search with embeddings (returns Top-50), (2) Re-ranking with cross-encoder (reorders the 50). Cross-encoders are models that process query + document TOGETHER (unlike bi-encoders that embed separately), resulting in better relevance understanding. Examples: BGE-reranker-v2, Cohere Rerank, BAAI/bge-reranker-large. Cost: ~50ms per pair (GPU) vs ~2ms for embedding. That\'s why we only re-rank the Top-50, not millions. Typical gain: +10-20% in precision (NDCG@10). Essential for production: without re-ranking, your RAG may return superficially similar but semantically irrelevant chunks.'
      },
      {
        title: 'Multi-Modal RAG',
        type: 'architecture',
        body: 'Multi-Modal RAG extends traditional RAG to search across multiple modalities: text, images, tables, diagrams. Example: a user asks "What is the system architecture?" and the system returns both the textual description and the architecture diagram. How it works: (1) PDF documents with images are parsed extracting text + images separately, (2) Text is embedded with a text model, images with a vision model (CLIP, SigLIP), (3) Search can be cross-modal (text query finds image) or intra-modal (image finds image), (4) In generation, the LLM receives both text chunks and images (if multimodal). Tools: Unstructured.io for parsing, CLIP for visual embeddings, GPT-4V/Claude Vision for multimodal generation. Use cases: technical documentation with diagrams, manuals with illustrations, product catalogs.'
      },
      {
        title: 'GraphRAG in Detail',
        type: 'architecture',
        body: 'GraphRAG (Microsoft, 2024) goes beyond traditional RAG by building a complete knowledge graph. Pipeline: (1) Entity extraction (people, companies, concepts) and relationships from each chunk using LLM, (2) Graph construction where nodes are entities and edges are relationships, (3) Community detection via clustering algorithms (Leiden), (4) Global summarization per community, (5) On query: local search (specific entities) + global search (communities) combined. Advantages over traditional RAG: answers multi-hop questions ("What is the impact of policy X on department Y employees?"), groups knowledge by topic, better for global summarization. Disadvantages: more expensive (2-5x more LLM calls during indexing), more complex to maintain. Use when your knowledge has many interconnected entities: corporate documentation, knowledge bases, research papers.'
      },
      {
        title: 'Daily Example: HR Chatbot',
        type: 'analogy',
        body: 'Your company has 5000 pages of HR policies in PDFs. You want a chatbot that answers "How many vacation days do I have?". With RAG: (1) The PDFs are chunked and embedded, (2) The employee\'s question retrieves the most relevant chunks, (3) The LLM receives: "Context: [vacation policy excerpt] Question: How many vacation days do I have?", (4) The LLM answers based on the excerpt. If the policy changes, you just re-index the PDFs — no fine-tuning!'
      },
      {
        title: 'GraphRAG vs Traditional RAG',
        type: 'pros-cons',
        body: 'Traditional RAG searches isolated chunks by similarity. GraphRAG (Microsoft) builds a knowledge graph: entities are nodes, relationships are edges. Advantages: answers multi-hop questions ("What is the impact of policy X on department Y?"), groups topics by community, better for global summarization. Disadvantages: more complex, more expensive to index, overkill for simple Q&A. Use GraphRAG when your knowledge has many interconnected entities.'
      },
      {
        title: 'Common Problems',
        type: 'qa-list',
        qa: [
          { question: 'Your RAG hallucinates even with the right context. How to solve?', answer: 'Check if the chunk actually contains the answer. Increase K. Use a "conditional generation" where the LLM first checks if the context answers the question.' },
          { question: 'Your search is slow with millions of documents. How to speed up?', answer: 'Use HNSW index (hierarchical navigable small world). Reduce embedding dimensionality (e.g., 1536→256 with Matryoshka embeddings). Add semantic cache for similar queries.' },
          { question: 'Your RAG returns duplicate results. How to dedup?', answer: 'Use MinHash for deduplication of similar chunks. Add source metadata and group results from the same document.' },
          { question: 'Need per-user access control. How to implement?', answer: 'Filter by metadata: each chunk has permission tags. In search, add filter: "user_role IN (admin, viewer)" or "department = engineering". Use vector DBs with metadata filtering support.' },
          { question: 'PDFs with tables are poorly parsed. How to improve?', answer: 'Use specific parsers (PyMuPDF, Unstructured, LlamaParse). Extract tables separately. Consider "markdown conversion" before chunking.' },
          { question: 'Hybrid search is giving wrong weight between vector and BM25. How to calibrate?', answer: 'Test different k values in RRF (10-100). For technical queries, increase BM25 weight. For natural language queries, increase vector weight. Do A/B testing with a golden dataset.' },
          { question: 'Multi-modal RAG doesn\'t find relevant images. How to improve?', answer: 'Use descriptive captions on images. Embed both the image and its caption. Consider using a VLM to generate detailed image descriptions before embedding.' },
          { question: 'GraphRAG is too slow during indexing. How to optimize?', answer: 'Reduce graph resolution (extract only main entities). Use batch processing for entity extraction. Consider a smaller model for extraction (GPT-4o-mini instead of GPT-4). Increase chunk size to reduce the number of calls.' }
        ]
      },
      {
        title: 'Example: RAG Pipeline',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# 1. Indexing
text = open("document.pdf", encoding="utf-8").read()
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
chunks = splitter.split_text(text)

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(chunks, embeddings)

# 2. Retrieval + Generation
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

prompt = ChatPromptTemplate.from_template(
    "Context:\\n{context}\\n\\nQuestion: {input}\\n\\n"
    "Answer based only on the context. If you don't know, say 'I don't know'."
)
chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, chain)

result = rag_chain.invoke({"input": "What is the vacation policy?"})
print(result["answer"])`
        },
        body: 'LangChain and LlamaIndex simplify building complete RAG pipelines.'
      },
      {
        title: 'Example: Hybrid Search with RRF',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from qdrant_client import QdrantClient
from qdrant_client.http.models import Filter, FieldCondition, MatchValue

client = QdrantClient("localhost", port=6333)

# Hybrid search combines vector + BM25 via RRF
search_result = client.search_best(
    collection_name="docs",
    query_vector=embedding_model.encode("vacation policy"),
    query_filter=Filter(
        must=[FieldCondition(key="department", match=MatchValue(value="engineering"))]
    ),
    limit=10,  # Top-10 after RRF
    with_payload=True,
    search_params={
        "hybrid": True,  # Enables hybrid search
        "alpha": 0.75,   # 0.75 vector + 0.25 BM25
    }
)
# Result already reordered by RRF
for hit in search_result:
    print(f"Score: {hit.score:.3f} | {hit.payload['text'][:80]}...")`
        },
        body: 'Hybrid search combines the best of both worlds: embedding semantics + BM25 lexical precision.'
      },
      {
        title: 'Real Scenario: RAG for Customer Support Chatbot',
        type: 'everyday-scenario',
        body: 'You are building a support chatbot for an e-commerce company with 50,000 articles in the knowledge base. The challenge: users ask questions like "my order is late, what do I do?" and the RAG needs to find the correct article among thousands. The choice of chunking strategy and search type determines whether the chatbot will be useful or frustrating. At first, fixed 512-token chunks seemed ok, but articles about return policies were broken in the middle, losing crucial context.',
        items: [
          'Use recursive chunking with natural boundaries: split by section (## Title), then by paragraph, then by sentence — each chunk preserves a complete unit of meaning',
          'Implement hybrid search (vector + BM25) with RRF: semantic search understands synonyms ("return" ≈ "refund"), BM25 finds exact technical terms ("policy #123"), RRF combines the rankings',
          'Adjust hybrid search alpha by query type: queries with IDs/codes favor BM25 (alpha=0.3), natural language queries favor vector (alpha=0.8)',
          'Add re-ranking with cross-encoder: after retrieving Top-50 with embeddings, re-rank with cross-encoder to Top-5 — improves precision by 15-20%',
          'Configure semantic cache: similar queries (>92% similarity) return cached response — reduces cost by 40% for frequent questions',
          'Implement "query transformation": expand "late" → "delivery delay refund policy" (HyDE) and decompose "how to cancel and request refund?" into two sub-queries'
        ]
      },
      {
        title: 'Chunking Strategies in Production',
        type: 'pros-cons',
        body: 'Each chunking strategy has specific trade-offs. Fixed-size (512 tokens, 10% overlap): simple and fast, but breaks sentences in the middle and loses semantic context. Recursive (paragraph → sentence → word): respects natural boundaries, better quality, but variable chunk sizes. Semantic (detects topic change via embeddings): cohesive chunks by subject, but slower and more expensive. Agentic (LLM decides where to split): best possible quality, but ~100x more expensive than fixed-size. Parent-child (small chunks for retrieval, full parent chunk for context): best precision vs context ratio, but implementation complexity. Recommendation: start with recursive (separators=["\\n\\n", "\\n", ".", "!?", " "], chunk_size=1024, overlap=100) and evolve to parent-child when you need more precision.',
        items: [
          '✅ Recursive: consistent quality, works for most documents',
          '✅ Parent-child: best retrieval precision + full context in generation',
          '❌ Fixed-size: simple but loses semantic context — avoid for production',
          '⚠️ Semantic: excellent quality, high indexing cost',
          '⚠️ Agentic: best quality, but expensive and slow — use only for critical documents'
        ]
      },
      {
        title: 'Real Scenario: RAG for Technical Documentation with Source Code',
        type: 'everyday-scenario',
        body: 'Your platform team maintains 15 microservices with documentation spread across READMEs, internal wikis, and code comments. Developers spend hours searching for "how to use library X" or "what is the pattern for implementing Y". A RAG over all technical documentation and source code would solve this — but code documentation has unique challenges: code snippets need to be chunked without breaking syntax, and search needs to understand both natural language and technical terms.',
        items: [
          'Challenge 1 — code chunking: fixed chunk size breaks functions in the middle. Solution: use semantic chunking that detects function/class boundaries (regex for "def ", "class ", "function ", "---") and never breaks inside a code block',
          'Challenge 2 — hybrid search for code: "how to authenticate in service X" (semantic) vs "auth_service.login()" (lexical). Solution: hybrid search with dynamic alpha — increases BM25 weight when the query contains camelCase, snake_case or dots (code indicators)',
          'Challenge 3 — insufficient context: a 512-token chunk of a function doesn\'t show imports, dependencies, and class documentation. Solution: parent-child chunking — search on function chunks (256 tokens), pass the full file (up to 4K tokens) as context to the LLM',
          'Challenge 4 — outdated code: RAG documentation returns code from the old version. Solution: add git version/sha metadata to each chunk, and filter by branch/version in search',
          'Implement "explain this code" as a killer feature: developer selects a code snippet and the RAG explains what it does, cites related documentation and suggests improvements — uses the selected code + related chunks as context',
          'Result: 40% reduction in onboarding time for new devs, 60% fewer Slack questions about "how does X work?", and documentation is always up-to-date because RAG indexes the real code, not stagnant documentation'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 4. FINE-TUNING & MODEL ADAPTATION
  // ═══════════════════════════════════════════════
  FineTuning: {
    summary:
      'Fine-tuning is the process of specializing a pre-trained model for a specific task or domain. While RAG adds external knowledge at query time, fine-tuning incorporates knowledge into the model\'s own weights. It\'s the right choice when you need consistent format, specialized domain, or low latency.',
    everydayExample:
      'Think of fine-tuning as sending a general practitioner to specialize in cardiology. The doctor already knows general medicine (pre-training), but the residency (fine-tuning) specializes them in the heart. They don\'t need to consult books every time (RAG) — the knowledge is internalized. The cost? It took months to specialize (training), but now they work faster. In software engineering practice, fine-tuning appears when you need an LLM to generate code in your company\'s specific style. For example, your company uses a proprietary framework with specific conventions. With fine-tuning on 2000 code examples in the company\'s style, the model internalizes: (1) naming conventions (camelCase vs snake_case), (2) comment and docstring format, (3) error and logging patterns, (4) most used internal libraries. Without fine-tuning, the model suggests "generic" code that doesn\'t follow your conventions. With fine-tuning, suggestions are much closer to what the team expects. Another common case: fine-tuning for medical report summarization, where precise terminology and specific format are critical.',
    quickTip: 'Start with LoRA (rank r=16, alpha=32) instead of full fine-tuning — 100x fewer parameters, 90% of the quality. Use QLoRA if you have limited GPU (4-bit). Minimum dataset: 500-1000 high-quality examples. Always evaluate vs baseline before/after. For LoRA: aim for r=8-64, target modules=["q_proj", "v_proj", "k_proj", "o_proj"]. Learning rate: 1e-4 to 5e-4 for LoRA, 1e-5 to 5e-5 for full fine-tuning. Include 10-30% general data to avoid catastrophic forgetting. Validate on general tasks during training. Consider DPO instead of RLHF for alignment — simpler, equally effective.',
    sections: [
      {
        title: 'Fine-tuning Techniques',
        type: 'key-concepts',
        items: [
          'Full Fine-tuning: updates all parameters — best quality, most expensive (needs multiple GPUs)',
          'LoRA (Low-Rank Adaptation): low-rank matrices (r=8-64) inserted into attention layers',
          'QLoRA: LoRA + 4-bit NormalFloat quantization — fine-tuning on consumer GPUs (RTX 3090)',
          'Prefix Tuning: learns prefix vectors inserted into the input — does not modify the model',
          'Prompt Tuning: soft prompts — virtual tokens optimized for the task',
          'RLHF: Reinforcement Learning from Human Feedback — aligns model with human preferences',
          'DPO: Direct Preference Optimization — simpler than RLHF, no reward model',
          'GRPO: Group Relative Policy Optimization — used by DeepSeek-R1, no value function'
        ]
      },
      {
        title: 'LoRA vs QLoRA vs Full Fine-tuning',
        type: 'pros-cons',
        body: 'Full Fine-tuning: updates ALL parameters (e.g., 7B for Llama 3.1 8B). Requires multiple GPUs (4-8 A100 for 8B). Best quality, but high cost and risk of catastrophic forgetting. LoRA: inserts low-rank matrices (r=16) into attention layers. Trains ~0.1-1% of parameters. Quality: ~95% of full fine-tuning. Fits on 1 GPU (24GB for 8B). Allows multiple adapters (swap without reload). QLoRA: LoRA + 4-bit quantization. Trains 70B models on 1 GPU (48GB). Quality: ~93% of full fine-tuning. Ideal for rapid experimentation. Choice: Full when quality is critical and GPU budget is high. LoRA for 95% of practical cases. QLoRA when GPU is limited or for prototyping.'
      },
      {
        title: 'RLHF, DPO and GRPO Explained',
        type: 'how-it-works',
        body: 'RLHF (Reinforcement Learning from Human Feedback): 3-step process. (1) Collect human preferences: for each prompt, generate 2 responses, human chooses the best. (2) Train a Reward Model that learns to score responses. (3) Use PPO to optimize the LLM using the Reward Model as signal. Expensive and unstable. DPO (Direct Preference Optimization): eliminates the Reward Model. Directly optimizes the LLM with pairs (preferred_response, rejected_response). Simpler, more stable, similar quality to RLHF. GRPO (Group Relative Policy Optimization): used by DeepSeek-R1. Doesn\'t use a value function (critic) — estimates relative advantage within a group of sampled responses. More efficient than PPO. Ideal for reasoning fine-tuning (math, coding). DeepSeek-R1 showed that GRPO + reinforcement learning on reasoning data produces notable improvements in math and code tasks.'
      },
      {
        title: 'Daily Example: Medical Chatbot',
        type: 'analogy',
        body: 'You build an assistant for doctors that needs to use precise terminology and follow a specific format: "Diagnosis: ... | Treatment: ... | Prognosis: ...". With RAG, the model can still deviate from the format. With fine-tuning on 2000 medical diagnosis examples, the model internalizes: (1) the exact format, (2) technical terminology, (3) the professional tone. Now, even without context, it generates in the correct format. The cost? Fine-tuning with LoRA on Llama 3.2 8B costs ~$5-10 in GPU and takes 1 hour.'
      },
      {
        title: 'Q&A for Interviews',
        type: 'qa-list',
        qa: [
          { question: 'Fine-tuning vs RAG: when to use each?', answer: 'RAG: data changes frequently, needs citable sources, broad knowledge. Fine-tuning: consistent format, specialized domain (medical/legal), low latency, no external dependency. Often the best answer is to use both.' },
          { question: 'How to prepare a dataset for fine-tuning?', answer: 'Minimum of 500 high-quality examples. Each example: instruction + input + expected output. Diversify cases: easy, medium, hard, edge. Remove duplicates. Validate with human annotators. Consider data augmentation with LLM.' },
          { question: 'What is catastrophic forgetting and how to avoid it?', answer: 'It\'s when the model forgets general capabilities after being fine-tuned. Prevent: (1) mix general with specific data (10-30% general), (2) use LoRA (less destructive), (3) fine-tune with low learning rate (1e-5 to 5e-5), (4) eval on general tasks during training, (5) use learning rate warmup and cosine scheduling, (6) avoid overfitting — stop when validation loss stagnates.' },
          { question: 'Your fine-tuned model memorized data verbatim. How to solve?', answer: 'Overfitting. Solutions: (1) more training data, (2) increase dropout (LoRA dropout=0.1-0.3), (3) larger weight decay, (4) data with variation in phrasing, (5) memorization validation with extraction test.' },
          { question: 'How to choose between LoRA and full fine-tuning?', answer: 'LoRA: limited data (<10K), limited GPU, wants to maintain general capabilities, needs multiple adapters. Full: abundant data, critical quality needed, has GPU budget, domain is very different from pre-training.' },
          { question: 'DPO vs RLHF: which to choose?', answer: 'DPO is simpler, more stable, and as effective as RLHF for most cases. RLHF can be better when you have a very good reward model or need finer control over alignment. GRPO is ideal for reasoning tasks (math, coding) as demonstrated by DeepSeek-R1.' },
          { question: 'How to prevent fine-tuning from degrading instruction-following ability?', answer: 'Include 10-20% general instruction data in the fine-tuning dataset. Use LoRA instead of full fine-tuning. Validate on general benchmarks (MMLU, HellaSwag) during training. Stop if general metrics fall below a threshold.' }
        ]
      },
      {
        title: 'Example: LoRA Fine-tuning',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from transformers import AutoModelForCausalLM, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B-Instruct")

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

peft_model = get_peft_model(model, lora_config)
print(f"Trainable parameters: {peft_model.num_parameters(only_trainable=True):,}")
# ~8M parameters vs 3B (0.27% of total!)

dataset = load_dataset("json", data_files="training.json")
training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    num_train_epochs=3,
    logging_steps=10,
    save_strategy="epoch"
)

trainer = Trainer(
    model=peft_model,
    args=training_args,
    train_dataset=dataset["train"]
)
trainer.train()
peft_model.save_pretrained("./lora-adapter")`
        },
        body: 'With PEFT/LoRA, you fine-tune billion-parameter models on consumer-grade GPUs.'
      },
      {
        title: 'Example: DPO Alignment',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig
from trl import DPOTrainer, DPOConfig

model = AutoModelForCausalLM.from_pretrained("base-model")
tokenizer = AutoTokenizer.from_pretrained("base-model")

# Dataset with preferred/rejected pairs
dataset = [
    {
        "prompt": "Explain OOP for beginners",
        "chosen": "OOP organizes code into objects... (good response)",
        "rejected": "Object-oriented programming is... (bad response)"
    },
    # ... 1000+ examples
]

training_args = DPOConfig(
    output_dir="./dpo-output",
    beta=0.1,  # Preference strength (lower = more flexible)
    learning_rate=5e-6,
    per_device_train_batch_size=4,
    max_length=1024
)

dpo_trainer = DPOTrainer(
    model=model,
    ref_model=None,  # Reference model (if None, uses itself)
    args=training_args,
    tokenizer=tokenizer,
    train_dataset=dataset
)
dpo_trainer.train()`
        },
        body: 'DPO aligns the model with human preferences without needing a separate Reward Model — simpler than RLHF.'
      },
      {
        title: 'Real Scenario: Fine-tuning Saved the Project',
        type: 'everyday-scenario',
        body: 'Your team was building an assistant for lawyers that needed to generate contracts in the Brazilian legal format. RAG alone didn\'t work: the format was too specific ("FIRST CLAUSE — PURPOSE..."), the legal terminology was inconsistent, and the model always "escaped" to colloquial language. With fine-tuning on 2000 examples of real contracts (anonymized), the model internalized the format, formal tone, and standard clauses. The result: 94% acceptance vs 52% with pure RAG.',
        items: [
          'Prepare 2000 pairs (instruction, ideal contract) covering different types: service agreements, leases, purchase and sale, NDA, etc.',
          'Use LoRA with rank r=32, target modules=["q_proj","v_proj","k_proj","o_proj"] — trains only 0.5% of parameters, 95% of full fine-tuning quality',
          'Include 15% general instruction data in the dataset to avoid catastrophic forgetting — the model needs to continue following instructions in general language',
          'Validate with a holdout set of 200 contracts: compare format (regex validating clauses), terminology (list of legal terms), and completeness (all required sections)',
          'Implement eval-driven fine-tuning: each epoch, run the golden dataset and only stop if metrics improve — avoids overfitting',
          'Do A/B testing in production: 10% of traffic on the fine-tuned model vs 90% on the base model with RAG, compare user acceptance rate'
        ]
      },
      {
        title: 'Considerations for Legal Fine-tuning',
        type: 'key-concepts',
        items: [
          'Legal tokenization: legal documents have specific vocabulary ("aforementioned", "ad judicia") that may be tokenized into multiple tokens — consider adding special tokens',
          'Consistent formatting: contracts follow a rigid structure — fine-tuning should learn CLAUSE → PARAGRAPH → ITEM → SUBITEM',
          'Privacy: never use real client data — anonymize completely (replace names, SSNs, addresses with placeholders)',
          'Post-generation validation: even with fine-tuning, validate with regex that all required clauses are present and in the correct format',
          'Data versioning: keep the fine-tuning dataset versioned — each iteration may require corrections or expansions',
          'Adversarial testing: try to "break" the format with unexpected inputs — fine-tuning can make the model too rigid'
        ]
      },
      {
        title: 'Example: Fine-tuning with Synthetic Dataset',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from datasets import Dataset
from transformers import AutoTokenizer
from trl import SFTTrainer

# Generates synthetic dataset via LLM for fine-tuning
def generate_synthetic_data(model, prompt_template, n_examples=500):
    """Uses an LLM to generate training examples."""
    examples = []
    for i in range(n_examples):
        response = model.invoke(prompt_template.format(id=i))
        examples.append({
            "instruction": f"Generate a summary of document #{i}",
            "output": response.content
        })
    return examples

# Convert to format expected by trainer
synthetic_data = generate_synthetic_data(teacher_model, prompt, 1000)
dataset = Dataset.from_list(synthetic_data)

# Fine-tune with SFT (Supervised Fine-Tuning)
trainer = SFTTrainer(
    model=student_model,
    train_dataset=dataset,
    dataset_text_field="output",
    max_seq_length=2048,
    args=TrainingArguments(
        output_dir="./ft-output",
        per_device_train_batch_size=4,
        learning_rate=2e-4,
        num_train_epochs=3
    )
)
trainer.train()`
        },
        body: 'Synthetic dataset generated by LLM reduces human annotation cost by 90%. Use a large model (teacher) to generate data and fine-tune a smaller model (student) — a technique called distillation fine-tuning.'
      },
      {
        title: 'Real Scenario: Model Alignment with DPO for E-commerce Chatbot',
        type: 'everyday-scenario',
        body: 'Your team fine-tuned a Llama 3.2 8B to be an e-commerce assistant. The model knows the products and policies, but frequently gives very long answers, ignores the user\'s current cart, and worse, occasionally suggests more expensive products even when the user asks for "the cheapest". You decide to use DPO (Direct Preference Optimization) to align the model\'s behavior with what customers actually want: concise, context-relevant, and unbiased responses.',
        items: [
          'Collect 2,000 preference pairs (chosen/rejected) from real logs: for each prompt, two model responses — the one the user rated positively (chosen) and the one they rated negatively or ignored (rejected)',
          'Categorize the preference criteria: conciseness (<100 tokens), context relevance (mentions the cart?), impartiality (doesn\'t favor expensive products), tone (polite, not pushy) — each pair is annotated with the criterion that motivated the choice',
          'Configure DPO with beta=0.15 (balance between alignment and general capability) and learning rate=3e-6 — values tested in 5 experiments with 100 validation examples each',
          'Validate with a set of 200 test prompts: measure conciseness rate (responses <100 tokens), relevance rate (mentions context), fair recommendation rate (doesn\'t favor expensive products) — all should improve >15% vs baseline',
          'Real results: conciseness went from 45% to 82%, context relevance from 38% to 79%, fair recommendations from 62% to 91% — and user satisfaction (thumbs up feedback) increased from 3.2 to 4.1 stars',
          'Monitor alignment continuously: each week, compute the same metrics on that week\'s logs — if any metric drops >5%, retrain with new preference pairs collected during the period'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 5. AI AGENTS & AGENTIC SYSTEMS
  // ═══════════════════════════════════════════════
  Agent: {
    summary:
      'An AI Agent is an autonomous system that uses LLMs as a brain to reason, plan, and execute actions using tools. Unlike a regular LLM (which only generates text), an agent operates in a loop: Thought → Action → Observation → (repeat) → Final Answer.',
    everydayExample:
      'An AI Agent is like an executive assistant: you give a goal ("schedule a meeting with the marketing team about the Q3 campaign"). The assistant: (1) thinks "I need to check the calendar", (2) uses the calendar tool, (3) sees that Wednesday at 2 PM is free, (4) sends invites, (5) prepares an agenda. It doesn\'t stop until the task is complete — and tries again if something goes wrong. In software engineering, a practical agent would be a "devops agent" that receives: "Deploy of microservice X failed. Investigate and fix." The agent: (1) checks logs in Datadog (tool: query_logs), (2) finds a memory error, (3) checks CPU/memory metrics (tool: get_metrics), (4) identifies it needs to increase the memory limit, (5) opens a PR with the change in the Kubernetes deployment (tool: create_pr), (6) notifies the team on Slack (tool: send_slack). All autonomous, with the engineer only approving the final PR. That is the power of agents: not just "chatting", but ACTING in the real world.',
    quickTip: 'Always implement: (1) max_steps (prevents infinite loops), (2) timeout per step, (3) human-in-the-loop for destructive actions, (4) structured observation (result comes back as data, not text), (5) log all actions for debugging. For multi-agent systems: define an orchestrator that delegates tasks to specialized agents. Use short-term memory (conversation context) and long-term memory (vector store for facts). Implement reflection: after each action, ask the agent to reflect "did this action have the expected effect?" before proceeding. For critical functions, always have a "circuit breaker" that stops the agent if it detects loops or repeated errors.',
    sections: [
      {
        title: 'Agent Architecture',
        type: 'architecture',
        body: 'A modern agent has essential components: (1) Perception — receives user input and environment observations, (2) Brain (LLM) — reasons, plans, decides, (3) Memory — short-term (context), long-term (vector store), episodic (past experiences), (4) Tools — APIs, functions, databases the agent can call, (5) Execution Loop — Thought-Action-Observation cycle that repeats until completion, (6) Guardrails — safety limits, token budget, action validation.'
      },
      {
        title: 'Agent Patterns',
        type: 'key-concepts',
        items: [
          'ReAct (Reasoning + Acting): interleaves thought and action with observations. The most common.',
          'Plan-and-Execute: first plans all steps, then executes sequentially',
          'Reflection Agent: after executing, reflects on the result and improves iteratively',
          'Multi-Agent System: multiple specialized agents collaborate with an orchestrator',
          'Tool-use Agent: uses function calling (OpenAI) / tool use (Anthropic)',
          'Code Agent: generates code, executes in sandbox, analyzes result',
          'Memory Agent: maintains state between sessions with long-term memory',
          'Reflection Pattern: the agent analyzes its own output and improves it in cycles',
          'Orchestrator Pattern: a coordinator agent delegates subtasks to specialized agents'
        ]
      },
      {
        title: 'Memory Types in Agents',
        type: 'how-it-works',
        body: '(1) Short-Term Memory (Working Memory): the current conversation context / tokens in the prompt. Limited by the LLM context window (~4K-200K tokens). Includes recent action and observation history. (2) Long-Term Memory: stored in vector DB. Important facts, user preferences, knowledge learned over time. Retrieved via RAG when relevant. (3) Episodic Memory: the agent\'s past experiences — "last time I tried this, it errored". Essential for agents that learn from feedback. (4) Procedural Memory: "how to do X" — sequences of actions that worked before. Can be stored as stored procedures or dynamic few-shot examples. In practice, implement short-term memory as a sliding window of the last N interactions and long-term memory as periodic summaries stored in a vector DB.'
      },
      {
        title: 'Multi-Agent Systems',
        type: 'architecture',
        body: 'Instead of a single agent trying to do everything, multi-agent systems divide responsibilities: (1) Orchestrator Agent: receives the user request, plans, delegates, coordinates. (2) Research Agent: searches for information, reads documents, summarizes. (3) Coding Agent: generates/modifies code. (4) Review Agent: reviews code for security and quality. (5) Testing Agent: generates and runs tests. Advantages: specialization (each agent does what it does best), parallelism (agents work simultaneously), resilience (one agent fails, others continue). Challenges: coordination (how to synchronize?), cost (more LLM calls), debugging complexity. Frameworks: CrewAI, AutoGen (Microsoft), LangGraph (LangChain). In practice, start with 2-3 agents and increase as needed.'
      },
      {
        title: 'Reflection Pattern',
        type: 'how-it-works',
        body: 'The Reflection Pattern adds a "review" step in the agent cycle. Instead of just acting, the agent: (1) Executes action, (2) Observes result, (3) Reflects: "Is the result satisfactory? Are there errors? Could it be better?", (4) If unsatisfactory, rethinks and tries again. Practical example: a code agent generates a Python function, runs it, sees the test failed, reflects "the function has an index error, I need to fix the loop", corrects and retries. This dramatically improves quality without needing fine-tuning. Implementation: after each observation, add a "reflection" step in the prompt: "Analyze the result. Does it meet the goal? If not, what can be adjusted?" The agent then decides whether to continue or try again.'
      },
      {
        title: 'Tool Use Best Practices',
        type: 'pros-cons',
        body: 'For agents with tool use: (1) Clear descriptions: each tool must have impeccable name + description + parameter schema. The LLM chooses the tool based on the description — bad descriptions = wrong tools. (2) Atomic tools: each tool does one thing only. "search_database" is better than "execute_query" (too generic). (3) Strong types: use JSON schemas with specific types (string, integer, enum). (4) Error handling: the tool should return structured errors, not throw exceptions. (5) Rate limiting: external API tools must have abuse protection. (6) Logging: every tool call should be logged with timestamp, input, output, and duration. (7) Tool limit: do not expose more than 10-15 tools at a time — too many options confuse the LLM. Group related tools together.'
      },
      {
        title: 'Daily Example: Customer Support Agent',
        type: 'analogy',
        body: 'A support agent receives: "My order #456 hasn\'t arrived". It: (1) Thinks: "I need to check the order status", (2) Action: calls the get_order_status("456") API, (3) Observation: "order delayed at carrier", (4) Thinks: "I\'ll check the refund policy", (5) Action: searches the knowledge base, (6) Offers: "Offer refund or resend" for the user to approve (human-in-the-loop). All this happens in seconds, with full transparency.'
      },
      {
        title: 'Problems and Solutions',
        type: 'qa-list',
        qa: [
          { question: 'Agent entered an infinite loop. How to detect?', answer: 'Implement max_steps (e.g., 15 steps) and a global timeout. Monitor if the agent is repeating the same action with the same result. Add "early stopping" if a loop is detected (same thought sequence > 2x).' },
          { question: 'Agent consumes too many tokens. How to reduce?', answer: 'Limit history: keep the last N interactions (e.g., 10). Use periodic history summarization. Tools should return concise responses. Monitor and limit the size of observations.' },
          { question: 'Agent chooses the wrong tool. How to improve?', answer: 'Tool descriptions should be clear and specific: "search_flights(date, origin, destination) → list of flights. Use to search for airline tickets." Add examples of when to use each tool. Reduce the number of tools.' },
          { question: 'Agent deleted production. How to prevent?', answer: 'Classify tools by risk level. Destructive actions (DELETE, DROP, etc.) require human confirmation. Use staging environments. Implement automatic "revert mode" for reversible actions.' },
          { question: 'Tools return conflicting results. How to reconcile?', answer: 'The agent should have a "reconciliation" step: compare sources, check timestamps, prioritize official sources. Add confidence per source: "official_source > tertiary_source".' },
          { question: 'Multi-agent system has coordination problems. How to resolve?', answer: 'Implement a structured communication format between agents (JSON schema). Use an orchestrator that centralizes decisions. Clearly define each agent\'s scope. Add a "handoff protocol" for when an agent needs to pass context to another.' },
          { question: 'Agent is not reflecting before acting. How to implement reflection?', answer: 'Add an explicit step in the prompt: "Before executing, analyze: (1) Is this action appropriate? (2) Are there risks? (3) What is plan B?" After each action, force: "Analyze the result. Was the action successful? If not, what should be adjusted?"' },
          { question: 'Agent\'s long-term memory is polluted with irrelevant information. How to clean?', answer: 'Implement periodic "memory consolidation": summarize old memories, remove duplicates, archive outdated information. Use importance scores to rank memories (more important = more retained). Implement "memory decay": information not accessed for N days loses relevance.' }
        ]
      },
      {
        title: 'MCP - Model Context Protocol',
        type: 'how-it-works',
        body: 'MCP (Anthropic) is an open protocol that standardizes how LLMs and agents connect to external tools. Client-server architecture: (1) MCP Client: the LLM/agent that consumes, (2) MCP Server: exposes tools via stdio or HTTP/SSE, (3) The client dynamically discovers which tools are available. Benefits: any tool that implements MCP is automatically compatible with any MCP client. It is the "USB-C of AI tools".'
      },
      {
        title: 'Example: ReAct Agent',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Gets the current temperature of a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        }
    }
]

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the temperature in São Paulo today?"}
]

# The model decides whether to call the tool or respond
response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# If there is a tool_call, execute and return
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        if tool_call.function.name == "get_weather":
            result = get_weather_api(tool_call.function.arguments["city"])
            messages.append({"role": "tool", "content": str(result)})
    # New call with the result
    final = client.chat.completions.create(model="gpt-4o", messages=messages)
    print(final.choices[0].message.content)`
        },
        body: 'The LLM autonomously decides when to use tools and how to interpret results.'
      },
      {
        title: 'Example: Agent with Reflection',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from openai import OpenAI

client = OpenAI()
tools = [...]  # Same tools as the previous example

def agent_with_reflection(task: str, max_attempts=3):
    messages = [
        {"role": "system", "content": "You solve tasks using tools. "
         "After each action, analyze if the result is correct. "
         "If not, try again in a different way."},
        {"role": "user", "content": task}
    ]
    
    for attempt in range(max_attempts):
        response = client.chat.completions.create(
            model="gpt-4o", messages=messages, tools=tools
        )
        
        if response.choices[0].message.content:
            # Agent decided to respond — check if it is satisfactory
            reflection = client.chat.completions.create(
                model="gpt-4o",
                messages=[*messages, response.choices[0].message,
                    {"role": "user", "content": "Does this response solve the task? "
                     "Answer YES or NO and justify."}]
            )
            if "YES" in reflection.choices[0].message.content:
                return response.choices[0].message.content
            # If not, keep trying
            messages.append(response.choices[0].message)
            messages.append({
                "role": "user",
                "content": f"Your response was not satisfactory. "
                           f"Reason: {reflection.choices[0].message.content}\n"
                           f"Try again in a different way. Attempt {attempt+2}/{max_attempts}"
            })
        else:
            # If it called a tool, execute and continue
            ...
    
    return "Could not resolve after {max_attempts} attempts."`
        },
        body: 'Adding a reflection step allows the agent to self-correct errors before delivering the result.'
      },
      {
        title: 'Real Scenario: Automatic Code Review Agent',
        type: 'everyday-scenario',
        body: 'Your team of 20 engineers opens 40 PRs per day. Reviewing each PR manually is slow and inconsistent. You decide to build a code review agent that automatically analyzes PRs, finds bugs, suggests improvements, and checks team standards. The agent needs to access the Git repository, read the diff, run tests, check coverage, and comment on the PR — all autonomously, but with human supervision for critical decisions.',
        items: [
          'Configure the agent with tools: read_diff(repo, pr_number), run_tests(repo, branch), check_lint(repo), search_similar_bugs(description) and comment_on_pr(repo, pr_number, message)',
          'Implement the ReAct cycle: Thought ("I need to understand what this PR changes") → Action (read_diff) → Observation ("modifies 3 files, adds 150 lines, removes 30") → Thought ("I\'ll check if there are tests for the new functions")',
          'Add a reflection step after each analysis: the agent reviews its own comments before publishing — "is this comment useful? is it correct? is it constructive?"',
          'Classify severity: security bugs (critical) require blocking the PR + Slack notification, style issues (minor) become suggestions without blocking',
          'Keep human-in-the-loop for merge decisions: the agent reviews and recommends (approve/request changes), but the engineer decides whether to merge',
          'Log all agent actions in a database for auditing: "on PR #452, the agent suggested X, the reviewer accepted Y, the result was Z"'
        ]
      },
      {
        title: 'Code Review Agent Architecture',
        type: 'architecture',
        body: 'The architecture of a code review agent involves: (1) GitHub Webhook listens for PR events, (2) Trigger fires the main agent, (3) The agent uses ReAct to analyze the PR: first reads the full diff, then checks modified files one by one, runs lint on changed files, searches for security patterns (SQL injection, XSS, leaked secrets), checks test coverage, and analyzes the PR description. (4) The agent compiles a structured report with: change summary, problems found (categorized by severity), improvement suggestions, and questions for the author. (5) The report is posted as a comment on the PR. (6) If it finds critical issues, the agent also notifies on Slack and blocks the merge via status check. All this in under 2 minutes for an average PR.'
      },
      {
        title: 'Real Scenario: Multi-Tool Agent for Data Analysis',
        type: 'everyday-scenario',
        body: 'The data team receives 50 ad-hoc analysis requests per week: "what is the conversion rate by region?", "how is churn this month?" Each request takes an analyst 2 to 8 hours to answer. You build an AI agent that has access to the SQL database, the business metrics API, and Slack — and answers data questions in minutes, not hours. The agent needs to understand the question, query the right sources, execute queries, interpret results, and generate a natural language response.',
        items: [
          'Configure 4 tools for the agent: (1) query_database(sql_query) → executes SQL in the warehouse and returns a DataFrame, (2) get_metric(metric_name, period) → fetches a pre-calculated metric, (3) list_tables() → lists available tables with descriptions, (4) send_slack(channel, message) → sends result to Slack',
          'The agent receives: "What is the conversion rate by region in the last quarter?" and executes: Thought ("I need to know which tables have conversion data") → Action (list_tables) → Observation ("table `conversions` with columns region, date, value") → Thought ("I will aggregate by region in the last quarter") → Action (query_database) → Observation (data) → Final Answer',
          'Challenge: the agent generates SQL with incorrect syntax. Solution: add a "SQL auto-correction" step — if the query fails, the agent reads the error, adjusts syntax and retries (up to 3x). Reduced error rate from 35% to 8%',
          'Implement result validation: after executing the query, the agent should verify the result makes sense (e.g., totals >0, proportions between 0-1) — if something seems wrong, it re-executes with a different query',
          'Add "explanatory mode": before showing numbers, the agent explains what it did ("I queried the conversions table, grouped by region, filtered the last 3 months, and calculated the average") — increases user trust and simplifies debugging',
          'Result: 70% of requests are answered in <5 min without human intervention. The remaining 30% (very complex or ambiguous questions) are escalated to analysts, who now focus on deep analysis instead of simple queries'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 15. MODEL CONTEXT PROTOCOL (MCP)
  // ═══════════════════════════════════════════════
  MCP: {
    summary: 'Model Context Protocol (MCP) is an open protocol created by Anthropic that standardizes how LLMs and agents connect to external tools and data sources. It is the "USB-C of AI tools" — any tool that implements MCP is automatically compatible with any MCP client.',
    everydayExample: 'MCP is like a universal power adapter: before you needed a specific charger for each device (each LLM with its own tools API). With MCP, any "plug" (tool) works with any "socket" (LLM/agent). In practice, this means you can build a tool once (e.g., "search_docs") and it works with Claude, GPT, Llama, and any other MCP client. It is a paradigm shift: from point-to-point integrations to a standardized tool ecosystem.',
    quickTip: 'MCP uses a client-server architecture. The MCP client (LLM/agent) dynamically discovers which tools are available via "capability discovery". MCP servers can run via stdio (local) or HTTP/SSE (remote). To get started: implement a simple MCP server with Python (mcp library) or TypeScript (@modelcontextprotocol/sdk).',
    sections: [
      {
        title: 'What is MCP?',
        type: 'overview',
        body: 'Model Context Protocol (MCP) solves a fundamental problem: every LLM provider has its own function calling/tool use API. OpenAI has its own, Anthropic has theirs, and open-source models have variations. MCP standardizes this: any tool that implements the MCP protocol works with any LLM that supports MCP. Architecture: (1) MCP Client: the LLM/agent that consumes tools, (2) MCP Server: exposes tools via stdio or HTTP, (3) The client dynamically discovers available tools via "list_tools".'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'MCP Client: LLM or agent that connects to MCP servers to obtain tools',
          'MCP Server: process that exposes tools, resources, and prompts via a standardized protocol',
          'Capability Discovery: client automatically discovers which tools the server offers',
          'Transports: stdio (local process) or HTTP + SSE (remote server)',
          'Resources: data that the server exposes (files, APIs, databases)',
          'Tools: functions the LLM can call (with JSON schema)',
          'Prompts: pre-defined prompt templates that the server offers',
          'Sampling: server can ask the LLM to generate text (callback)'
        ]
      },
      {
        title: 'How MCP Works: The Protocol in Detail',
        type: 'how-it-works',
        body: 'MCP follows a client-server architecture with dynamic capability discovery via JSON-RPC. The complete flow: (1) Initialization — the MCP client sends "initialize" with version and capability info, the server responds with what it supports (tools, resources, prompts). (2) Discovery — client calls "list_tools" to get the list of available tools with full JSON schemas. (3) Invocation — when the LLM decides to use a tool, the client calls "call_tool" with name and arguments. (4) Response — the server executes and returns TextContent, ImageContent, or ResourceContent. (5) Notifications — the server can notify the client about changes (e.g., new tools) without polling. The protocol is asynchronous, supports multiple concurrent requests, and available transports are stdio (local process, low latency) or HTTP with SSE (remote communication). This architecture allows any tool to implement MCP once and be automatically compatible with any MCP client — whether Claude Desktop, a custom agent, or an IDE.'
      },

      {
        title: 'MCP vs Traditional Function Calling',
        type: 'pros-cons',
        body: 'Traditional function calling: each LLM has its own API, you need to adapt your tools for each provider, switching providers means rewriting integrations. MCP: write the tool once in MCP format, any compatible LLM can use it. MCP\'s main advantage is interoperability — it is the same principle that made USB replace dozens of proprietary connectors. Disadvantages: it is still new (small ecosystem), protocol latency overhead, and not all LLMs natively support MCP.',
        items: [
          '✅ Interoperability: one tool works with multiple LLMs',
          '✅ Dynamic discovery: client automatically knows which tools are available',
          '✅ Separation of concerns: tool lives in a separate process',
          '✅ Security: MCP server can run in an isolated sandbox',
          '⚠️ Additional latency: calls pass through the MCP protocol',
          '⚠️ Early ecosystem: fewer ready-made tools compared to native APIs'
        ]
      },
      {
        title: 'MCP Problems and Solutions',
        type: 'qa-list',
        qa: [
          { question: 'MCP server does not appear in the client. How to debug?', answer: 'Check if the server is running (ps aux | grep mcp-server). Test communication by sending a manual JSON-RPC via stdio. Check if the executable is in the PATH (for stdio transport). For HTTP, check CORS and firewall. Enable verbose server logs with --verbose.' },
          { question: 'High latency when calling MCP tools. How to optimize?', answer: 'Prefer stdio transport (local communication, no network) over HTTP. Keep the MCP server warm to avoid cold starts. Implement caching on the server for frequently called tools. Use persistent connection (keep-alive) for HTTP.' },
          { question: 'How to handle tools that require authentication?', answer: 'MCP does not define authentication — it is the server\'s responsibility to implement. Patterns: (1) API key in an environment variable on the server, (2) OAuth flow during initialization, (3) Periodically rotated token via proxy server. Never expose credentials in the tool schema.' },
          { question: 'MCP server went down. How does the client discover and recover?', answer: 'Implement periodic health checks: the client sends "ping" to the server every N seconds. If no response, it tries to reconnect with exponential backoff. For HTTP transport, SSE closes the connection automatically if the server goes down. Use a circuit breaker on the client to avoid unnecessary calls.' },
          { question: 'How to version MCP servers and tools?', answer: 'The MCP protocol has versioning at initialization — the server declares the supported version. For your tools, version each MCP server semantically. Use tags like "search-tools-v2" and "search-tools-v1" on different endpoints. The client chooses which version to connect to based on compatibility.' },
          { question: 'MCP exposes too many tools and the LLM gets confused. How to organize?', answer: 'Group related tools into separate servers (search_server, database_server, slack_server). Use an MCP Gateway to aggregate multiple servers into a single unified endpoint. Practical limit: ~15-20 tools per server — beyond that, the LLM has difficulty choosing the right one.' },
          { question: 'MCP vs OpenAI plugins: what is the fundamental difference?', answer: 'OpenAI plugins are proprietary and only work with OpenAI. MCP is an open protocol that any LLM can implement. Plugins use manifest.json + REST API. MCP uses JSON-RPC with dynamic discovery and bidirectional transport. Plugins were discontinued by OpenAI in favor of GPTs. MCP is the future of interoperability.' },
          { question: 'How to test MCP servers locally before going to production?', answer: 'Use the MCP Inspector (official Anthropic tool) that connects to any MCP server and lets you test tools visually. Alternative: write a script that sends JSON-RPC requests manually to the server\'s stdio. For integration tests, use the testing SDKs that mock the MCP server.' }
        ]
      },

      {
        title: 'Example: MCP Server in Python',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import httpx
import json

# MCP server that exposes web search as a tool
server = Server("web-search")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search_web",
            description="Searches for information on the web",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search term"},
                    "num_results": {"type": "integer", "default": 5}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "search_web":
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": arguments["query"], "format": "json"}
            )
            return [TextContent(type="text", text=resp.text)]
    raise ValueError(f"Tool not found: {name}")

# Runs via stdio (local connection with the LLM)
if __name__ == "__main__":
    import anyio
    anyio.run(stdio_server, server)`
        },
        body: 'With MCP, your tools are portable across any LLM that supports the protocol.'
      },
      {
        title: 'Example: MCP Client in TypeScript',
        type: 'code-example',
        code: {
          language: 'typescript',
          source: `import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const client = new Client({
  name: "my-agent",
  version: "1.0.0"
})

// Connects to the MCP server via stdio
const transport = new StdioClientTransport({
  command: "python",
  args: ["mcp_server.py"]
})

await client.connect(transport)

// Discovers available tools
const tools = await client.listTools()
console.log("Tools:", tools.map(t => t.name))
// ["search_web", "get_weather", "read_document"]

// Calls a tool
const result = await client.callTool({
  name: "search_web",
  arguments: { query: "MCP protocol explained" }
})
console.log("Result:", result.content)`
        },
        body: 'The MCP SDK simplifies the connection between LLMs and external tools.'
      },
      {
        title: 'Real Scenario: Adopting MCP in an Agent Ecosystem',
        type: 'everyday-scenario',
        body: 'Your company has 15 internal tools (doc search, SQL query, Slack, GitHub, Jira) each with its own API and specific integration with the OpenAI LLM. When they decided to migrate to Claude, all integrations had to be rewritten. With MCP, each tool becomes an MCP Server, and any MCP-compatible LLM/agent can use them immediately. The migration that previously took 3 months now takes 1 week.',
        items: [
          'Map all existing tools: each tool becomes an MCP Server with a standardized interface (list_tools, call_tool, resources) — regardless of whether the backend is Python, Node, or Go',
          'Each MCP Server runs as an independent process: security isolation (one compromised server does not affect others) and independent deployment (update search without affecting SQL)',
          'The main agent (Claude, GPT, Llama) dynamically discovers available tools via capability discovery — no manual tool configuration needed',
          'Switch LLM providers without rewriting integrations: today uses Claude (native MCP), tomorrow GPT (MCP SDK for OpenAI), later Llama (MCP via LiteLLM) — the tools stay the same',
          'Add an MCP Gateway (Apollo Federation style) that aggregates multiple MCP Servers into a single endpoint — the agent sees all tools as if from one server',
          'Estimated savings: 80% less integration time, 60% less boilerplate code, and the ability to experiment with different LLMs without lock-in'
        ]
      },
      {
        title: 'Daily Example: MCP as a Universal Socket',
        type: 'analogy',
        body: 'Imagine you have 5 devices (LLMs) and 10 appliances (tools). Without MCP, each device needs a specific charger: the iPhone charger (OpenAI tool) does not charge the Samsung (Claude). With MCP, all devices use USB-C: one cable for everything. In practice, your company has search, database, Slack, GitHub, and email tools. Without MCP, each LLM you hire needs custom integration with different APIs. With MCP, you write the tool once using the standardized protocol and any compatible LLM (Claude, GPT, Llama, Gemini) can use it immediately. The gain is enormous: less boilerplate code, fewer integration bugs, and the freedom to switch providers without rewriting integrations. That is why Anthropic opened the protocol — to create an ecosystem where tools are interchangeable and LLMs are your choice, not lock-in.'
      },
      {
        title: 'Real Scenario: Building a Tool Ecosystem with MCP',
        type: 'everyday-scenario',
        body: 'Your company adopted MCP as the standard for all AI integrations and now has 20 MCP servers in production (search, database, Slack, GitHub, Jira, email, calendar, CRM, etc.). The problem has shifted: it is no longer "how to integrate", but "how to manage, version, test, and monitor 20 MCP servers". You need to build an internal MCP platform that standardizes deployment, authentication, logging, and server discovery.',
        items: [
          'Internal MCP Registry: a central service (equivalent to npm/pip for MCP) where each team publishes their MCP servers with name, version, description, tool schemas, and documentation. The registry also serves as "service discovery" for MCP clients',
          'Standardize deployment: each MCP server is a Docker container with health check at /health, metrics at /metrics (Prometheus), and structured logging (JSON to stdout). Use Kubernetes for orchestration with auto-scaling based on requests per second',
          'Centralized authentication and authorization: implement an MCP Gateway (reverse proxy) that adds authentication (OAuth2), rate limiting (per server and per client), and logging of all calls. Each MCP client receives an API key that the gateway validates before routing to the server',
          'MCP integration tests: for each server, maintain a test suite that: (1) connects to the server, (2) discovers tools (list_tools), (3) calls each tool with valid parameters, (4) calls with invalid parameters (should return schema error), (5) checks latency <500ms P95. Runs in CI/CD',
          'Monitoring and alerts: Grafana dashboard shows per server: requests/minute, latency P50/P95/P99, error rate, and top tools called. Alerts: P95 latency >2s for 5 min, error rate >5%, server offline, and "tool drift" (tool schema changed without versioning — detected by comparing current schema vs registered schema)',
          'Semantic versioning: breaking compatibility = major version bump. The registry maintains multiple versions. Old clients continue using v1 while new clients migrate to v2. The MCP Gateway routes based on the X-MCP-Version header. Deprecation policy: old version receives header "Warning: 299 server/v1 "migrate to v2 by 06/01""'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // NEW NODES — writer-agent
  // ═══════════════════════════════════════════════

  StructuredOutputs: {
    summary:
      'Structured Outputs is the set of techniques and libraries that ensure LLMs generate outputs in rigid, validatable formats like JSON, Pydantic schemas, and types. With libraries like instructor, Outlines, and native JSON mode, you transform the LLM\'s free-form output into structured data that your system can consume without fragile parsing. Essential for production: without structured output, every system that consumes an LLM is a house of cards.',
    everydayExample:
      'Imagine you ask an intern to fill out a spreadsheet with customer data. If you say "write down the data", they might write it any old way — names in uppercase, dates in different formats, phone numbers with or without area code. Structured Outputs is like giving them a template spreadsheet with fixed columns and automatic validation: name (string, up to 100 chars), date_of_birth (date, YYYY-MM-DD format), phone (string, regex \\d{10,11}). The LLM is forced to fill it in exactly the expected format. In a software engineer\'s daily work, this shows up when you use instructor to extract data from emails: "extract name, email, amount, date and category from this invoice" → it returns a validated Pydantic object, not loose text that you need to regex to parse.',
    quickTip:
      'Always use `response_format={"type": "json_object"}` (OpenAI) or `response_format={"type": "json_schema", ...}` (Anthropic). For heavy validation, use instructor with Pydantic: it handles automatic retry, field validators, and object streaming. In production, combine Structured Outputs with retry: if validation fails, resend the prompt with the validation error as feedback. For TypeScript, use Zod + Vercel AI SDK. Avoid parsing JSON with regex — always use schema validation.',
    sections: [
      {
        title: 'What are Structured Outputs?',
        type: 'overview',
        body: 'Structured Outputs solve the fundamental problem that LLMs generate free text, but software systems need structured data. Without format guarantees, each LLM response must be parsed with fragile regex, leading to bugs in production. The solution is to force the LLM to generate within a defined schema — via constrained decoding (grammars), JSON mode (instruction in the prompt), or post-processing with validation and retry. Libraries like instructor (Python) and Outlines (Python) implement these techniques robustly, allowing you to define Pydantic schemas and receive validated objects directly.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Constrained Decoding: techniques that restrict LLM generation to tokens that respect a grammar — guarantees 100% syntactic compliance',
          'JSON Mode: OpenAI and Anthropic offer a native `response_format` parameter that instructs the model to generate valid JSON — but does not validate schema',
          'Schema Validation: Pydantic or Zod validate the output against a schema — if it fails, the system can request regeneration with error feedback',
          'instructor: Python library that integrates Pydantic + LLM APIs with automatic retry, object streaming, and real-time validation',
          'Outlines: library that implements constrained decoding via FSM (finite state machine) to guarantee error-free formatting',
          'Retry with Feedback: when validation fails, the error is sent back to the LLM as context for regeneration — loop up to N attempts',
          'Object Streaming: receive validated partial JSON during generation, enabling progressive UI without waiting for the full response',
          'Type Providers: TypeScript SDKs (Vercel AI SDK, LangChain TS) that automatically generate types from Zod schemas'
        ]
      },
      {
        title: 'How It Works in Practice',
        type: 'how-it-works',
        body: 'The Structured Outputs flow has three layers. (1) Schema definition: you define a Pydantic model (Python) or Zod interface (TypeScript) that describes exactly the expected format — fields, types, validations, allowed values. (2) Constrained generation: the system uses one of three approaches — constrained decoding (safest, but slower), JSON mode + post-hoc validation (faster, but requires retry), or instructor which combines validation + automatic retry. (3) Safe consumption: the result is a validated object that your system can consume without additional checks — no try/catch for parsing, no regex for extraction. In production, the most adopted pattern is instructor with max_retries=3: try to generate, validate with Pydantic, if it fails send the validation error as feedback and try again. This achieves 99.5%+ success rate.'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of the Structured Outputs system.',
        items: [
          'Schema Registry: centralized catalog of versioned Pydantic/Zod schemas, with documentation and validation tests',
          'Generator: wrapper around the LLM API that adds the schema to the prompt, configures response_format, and manages retries with feedback',
          'Validator: runs Pydantic/Zod validation on the output, collects field errors, and returns structured feedback to the generator',
          'Retry Loop: cycle generator → validator → (if fails) generator with error feedback → up to N attempts or fallback',
          'Streamer: converts partial tokens into validated partial objects for progressive UI (useful for long forms)',
          'Fallback Handler: if all attempts fail, returns a default object with `error=true` flag and the last error message'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from pydantic import BaseModel, Field, EmailStr
from typing import Literal
import instructor
from openai import OpenAI

# Define the schema with validations
class ExtractedData(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    amount: float = Field(..., gt=0, le=1000000)
    category: Literal["food", "transport", "health", "leisure", "others"]
    due_date: str  # format YYYY-MM-DD

# Patch the OpenAI client
client = instructor.from_openai(OpenAI())

# Validated extraction with automatic retry
data = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=ExtractedData,
    messages=[
        {"role": "user", "content": "Extract: Payment slip of R$ 150.00 "
         "from the pharmacy for John Smith, john@email.com, due 2024-12-15"}
    ],
    max_retries=3  # tries 3x with error feedback
)
print(data.model_dump_json(indent=2))
# {"name": "John Smith", "email": "john@email.com",
#  "amount": 150.0, "category": "health", "due_date": "2024-12-15"}`
        },
        body: 'instructor lets you define Pydantic schemas and receive validated objects directly, with automatic retry and error feedback.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Each Structured Outputs approach has advantages and limitations.',
        items: [
          '✅ instructor + Pydantic: robust validation with automatic retry, error feedback, and object streaming support',
          '✅ Constrained Decoding (Outlines): 100% format guarantee, no retries needed, ideal for critical systems',
          '❌ Constrained Decoding is 2-5x slower than free generation, requires inference engine support (vLLM, TensorRT-LLM)',
          '⚠️ Native JSON Mode (response_format): simple to implement, but does not validate schema — only guarantees valid JSON'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between JSON Mode and instructor?', answer: 'JSON Mode only instructs the LLM to generate valid JSON via an API parameter — there is no schema validation, only JSON syntax. Instructor adds Pydantic validation, automatic retry with error feedback, and object streaming. JSON Mode is sufficient for simple cases; instructor is necessary for production where format accuracy matters.' },
          { question: 'How to handle validation failures in production?', answer: 'Implement the "retry with feedback" pattern: when validation fails, capture the validation error (field, value, reason) and send it back to the LLM as a system message: "Validation failed on field X: Y. Fix it and try again." Use max_retries=3 and total timeout of 30s. If all fail, return a default object with an error flag and log the case for analysis.' },
          { question: 'How does constrained decoding work?', answer: 'Constrained decoding uses an FSM (finite state machine) that, at each token, filters the allowed vocabulary based on the schema grammar. If the schema expects an "age" field of type integer, the FSM only allows numeric tokens at that position. This guarantees 100% compliance. Implementations: Outlines (using FSM), LMQL, JSONformer. The downside is that it requires integration with the inference engine and can be 2-5x slower.' },
          { question: 'How to validate outputs partially during streaming?', answer: 'Use object streaming: instead of waiting for the full JSON, instructor validates partial tokens and builds the object incrementally. As each field completes, it is validated and emitted as an event. The frontend can display partial data while waiting for the rest. Implementation: instructor + Partial[T] from Pydantic v2. Limitation: complex nested fields may not be partially validated.' },
          { question: 'How to structure schemas for LLMs in production?', answer: '(1) Use descriptive field names and add Field(description="...") to guide the LLM. (2) Prefer Literal[] for fixed values (enum), float with gt/lt for ranges, and regex patterns for specific formats. (3) Avoid too many optional fields — each Optional increases the chance the LLM will omit the field. (4) For lists, use conlist() with min_length/max_length to avoid giant arrays. (5) Version your schemas in the registry and never break compatibility without a major bump.' }
        ]
      },
      {
        title: 'Real Scenario: Extracting Data from Tax Documents',
        type: 'everyday-scenario',
        body: 'Your fintech processes 50 thousand tax documents per day. Each document has semi-structured data (PDF, image, HTML). You need to extract fields like CNPJ, amount, date, item descriptions, taxes — and guarantee 99.9% accuracy because errors turn into tax fines. Structured Outputs with instructor + Pydantic solves this, but the challenge lies in edge cases: documents with special characters, amounts in different formats (R$ 1,500.00 vs 1500.00), and optional fields that may or may not appear.',
        items: [
          'Define the Pydantic schema with strict validations: CNPJ (regex \\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}), amount (Decimal, gt=0), date (date, future dates not allowed), and Items (list with min_length=1, each item with description (str, max 200), unit_price, quantity, and icms_rate)',
          'Implement pre-processing: use OCR (Tesseract, Azure Document Intelligence) to convert PDF/image to text, then normalize encoding (UTF-8), remove control characters, and detect Brazilian data format (dd/mm/yyyy, R$ 1,500.00, decimal comma)',
          'Configure the extraction pipeline: OCR → text normalization → instructor extraction with gpt-4o-mini (fast and cheap model) → Pydantic validation → if it fails, retry with gpt-4o (more capable model) with the Pydantic error as feedback in the prompt',
          'Implement cross-validation: after extraction, verify CNPJ (check digits), calculate total_amount = sum(unit_price * quantity) and compare with the total_amount field from the document — divergence > 1% triggers manual review alert',
          'Add drift monitoring: track extraction success rate by document type (NF-e, NFC-e, CT-e, boleto), by issuer, and by period. If the rate drops below 98% in any category, trigger an alert to review the schema or extraction prompt',
          'Result: 99.7% accuracy on first attempt, 99.95% after retry, average extraction time of 2.3s per document, zero tax fines due to extraction errors in the first quarter of operation'
        ]
      },
      {
        title: 'Daily Example: Filling Forms Automatically',
        type: 'analogy',
        body: 'Think of Structured Outputs as a notary form: each field has a specific type (name:string, date:date, CPF:pattern), mandatory validation, and fixed format. The LLM is the notary filling it out — but unlike a human, it can invent formats or skip fields. Structured Outputs is the "auto-validating form" that prevents the LLM from filling it wrong, forcing it to respect the exact schema. In daily engineering work, this appears in: email data extraction, resume parsing, support ticket classification, report generation in standardized format, LLM-to-REST API integration (where the body needs to be JSON with a fixed schema), and relational database population.'
      }
    ]
  },

}

