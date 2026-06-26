import type { NodeContent } from '../../types/mindmap'

export const categoryNodes: Record<string, NodeContent> = {

  // ═══════════════════════════════════════════════
  // 11. MULTIMODAL AI
  // ═══════════════════════════════════════════════
  Multimodal: {
    summary:
      'Multimodal Models process and integrate multiple data types: text, images, audio, video. Models like GPT-4V, Claude 3.5 Vision, and Gemini understand images, while DALL-E, Stable Diffusion, and Midjourney generate images from text.',
    everydayExample:
      'Multimodal AI is like a doctor who not only reads your chart (text) but also looks at your X-ray (image), listens to your breathing (audio), and watches your movement exam (video). Each modality gives a different perspective, and combining them enables a much more precise diagnosis. In engineering practice: you have an application that processes invoices. The user takes a photo of the receipt. The system needs to: (1) extract text from the image (OCR + VLM), (2) understand the invoice structure (items, amounts, taxes), (3) validate whether the amounts are correct. With a multimodal model (GPT-4V), you do everything in one call: "Analyze this invoice image. Extract: items, unit prices, total, taxes. Validate whether the sum is correct." Another example: a content moderation system that analyzes images + text + audio simultaneously to detect violations.',
    quickTip: 'To process images with LLMs: use GPT-4V or Claude 3.5 Vision for description. To extract text from images: OCR + VLM. For multimodal search: use CLIP embeddings that encode images and text in the same vector space. For image generation: Stable Diffusion (open source, customizable) or DALL-E (quality, easy). Consider "interleaved vision-language" for documents that mix text and images. Cache image embeddings to avoid re-processing.',
    sections: [
      {
        title: 'Models and Architectures',
        type: 'key-concepts',
        items: [
          'CLIP: contrastive learning between image and text — embeddings in the same space for cross-modal search',
          'GPT-4V / Claude 3 Vision: LLMs that "see" images and reason about them',
          'Stable Diffusion / DALL-E / Flux: diffusion models that generate images from text',
          'Whisper: speech-to-text from OpenAI, multilingual, robust to noise',
          'TTS (Text-to-Speech): ElevenLabs, OpenAI TTS — natural voices',
          'Video Understanding: frame-by-frame processing + temporal analysis',
          'Early vs Late Fusion: early fuses modalities at input, late fuses at outputs',
          'SigLIP: improved version of CLIP with sigmoid loss (Google)'
        ]
      },
      {
        title: 'Daily Example: Multilingual Receptionist',
        type: 'analogy',
        body: 'Multimodal AI is like a receptionist who speaks 5 languages, reads documents in any format, and identifies people by photo. When a foreign visitor arrives with a passport (image), she reads the document, asks in English (audio), notes it in the system (text), and takes a photo (image). Each modality alone is limited, but the combination enables complete and accurate service. In engineering: you build a system that processes PDF resumes. The candidate submits a PDF with a photo, running text, and an experience table. With a multimodal pipeline: (1) Extract text from PDF with OCR, (2) Detect and analyze the photo, (3) Convert experience tables into structured JSON, (4) Combine everything into a single profile. With modern multimodal models (GPT-4V, Claude Vision), you do everything in a single API call — the model understands the PDF image as a whole, extracting text, tables, and visual context simultaneously. The trend is clear: models that natively process text + image + audio as a single modality, eliminating the need for separate pipelines for each data type.'
      },
      {
        title: 'Multimodal Problems',
        type: 'qa-list',
        qa: [
          { question: 'VLM ignores the image and generates a text description. How to fix?', answer: 'Check if the image is being correctly encoded. Increase the weight of the image in the prompt: "Describe ONLY what you see IN THE IMAGE." Test with images that contradict the text.' },
          { question: 'Diffusion model generates blurry images. How to improve?', answer: 'Increase inference steps (50→100 steps). Use a better scheduler (DPM++ 2M Karras). Consider an upscaler (ESRGAN). Adjust CFG scale (7-12).' },
          { question: 'Text in generated images is illegible. How to fix?', answer: 'Use specialized models (SDXL, Flux). Add "clear text, no errors" to the prompt. For critical text, generate with model + overlay real text.' },
          { question: 'Need to process video in real time with VLM. Is it possible?', answer: 'Yes, with limitations. Sample frames every N seconds (e.g., 1fps). Use a fast VLM (GPT-4o-mini, Claude Haiku). Consider a video-specialized model (VideoLlama). For real time, process audio separately with Whisper.' },
          { question: 'CLIP embeddings do not work well for medical images. What to do?', answer: 'General CLIP models are trained on natural images (cats, cars). For specific domains (X-rays, satellite), fine-tune CLIP with domain images. Use specialized models like BioCLIP for medical images.' }
        ]
      },
      {
        title: 'Real Scenario: Multimodal Document Processing Pipeline',
        type: 'everyday-scenario',
        body: 'Your company receives thousands of PDF documents per day: invoices, contracts, reports with charts and tables. You need to extract all information — text, table values, text in images, and even diagrams — in a structured way. A multimodal pipeline solves this by combining OCR, table detection, VLMs for chart analysis, and LLMs for final structuring. The result is a system that understands the document as a human would: reading text, interpreting tables, and analyzing charts.',
        items: [
          'Parse the PDF with Unstructured.io or LlamaParse: extract text by page, detect tables (coordinates), extract images (charts, photos, diagrams) as separate files',
          'For tables: use Table Transformer (Microsoft) to detect and structure tables into JSON/CSV — accuracy >95% on simple tables, ~80% on complex tables with merged cells',
          'For images: use GPT-4V or Claude 3.5 Vision to describe charts ("bar chart showing sales Q1=120K, Q2=145K...") and extract text from images (OCR + VLM combined)',
          'For complex charts: the VLM analyzes the chart and extracts trends ("sales grew 20% QoQ with peak in March"), not just numbers — semantic understanding of the visual',
          'Combine everything into a structured document: {sections: [{type: "text", content}, {type: "table", headers, rows}, {type: "chart", description, data_points}]}',
          'Cache image embeddings: each processed image generates a CLIP embedding — if the same image appears in another document, reuse the analysis (60% savings in VLM calls)'
        ]
      },
      {
        title: 'Multimodal Pipeline Architecture',
        type: 'architecture',
        body: 'The multimodal pipeline has 5 stages: (1) Parse — PDF is decomposed into elements (text blocks, tables, images, figures) using layout detectors (LayoutLM, DocTR). (2) Classification — each element is classified: "body text", "table", "chart", "image", "header". (3) Specialized processing: text → LLM for summarization, table → Table Transformer for CSV, chart → VLM for description, image → CLIP for embedding + VLM for description. (4) Fusion — all results are combined into a hierarchical structured document (preserving original order). (5) Generation — a multimodal LLM receives the complete document (text + table descriptions + image descriptions) and answers questions about it. This pipeline processes a 10-page document in ~30 seconds at a cost of ~$0.05.'
      },
      {
        title: 'Real Scenario: Real-Time Video Analysis Pipeline',
        type: 'everyday-scenario',
        body: 'Your security company needs a system that analyzes camera feeds in real time: detect intruders, recognize license plates, identify suspicious packages — all with latency <2 seconds. Video combines image processing, audio, and temporal analysis, requiring a multimodal pipeline optimized for speed without sacrificing accuracy.',
        items: [
          'Architecture: extract 1 frame/second/camera. For each frame: YOLOv8 (5ms), OCR for plates via PaddleOCR (15ms if text detected), scene classifier via CLIP (10ms)',
          'Smart filtering: instead of sending every frame to VLM ($0.01/frame), use YOLO + classifier to filter relevant frames. Only send to VLM when anomaly is detected — reduction from 86,400 to ~50 frames/day (99.9%)',
          'Parallel audio: transcribe audio with Whisper (10s audio → 500ms). Detect keywords: "help", "emergency", "fire" trigger immediate alerts independent of VLM',
          'Temporal analysis: buffer of last 10 frames with bounding boxes. If a person runs toward an exit with a backpack, escape probability increases 3x vs isolated frame',
          'Alert integration: when incident detected with confidence >85%, send to human operator: frame + audio transcription + VLM description + action recommendation',
          'Result: 50 simultaneous cameras on 2 GPUs L40, average latency 800ms, 94% detection, 2/1000 false positives, $0.003/hour/camera cost'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 13. CODING & PRACTICAL IMPLEMENTATION
  // ═══════════════════════════════════════════════
  Coding: {
    summary:
      'Practical implementation is where theory meets reality. This section covers real implementations of RAG, agents, semantic search, chunking, evaluation, and complete systems — everything you need to build real-world AI applications.',
    everydayExample:
      'Implementing an AI system is like cooking a new recipe: the recipe (theory) lists the ingredients and steps, but in practice you need to adjust the seasoning (prompts), the cooking time (parameters), and you may need to improvise when an ingredient is missing (fallbacks). Knowing how to cook (code) is different from knowing the recipe by heart. In daily life: you need to implement a content moderation system. The theory says: "use a toxicity classifier". The practice: you discover that the classifier blocks legitimate discussions about mental health (false positive), that the "detect hate speech" prompt fails in subtle cases, that the API latency is inconsistent, and that you need a local fallback for traffic spikes. Implementation is where the details matter — and where 90% of the work lies.',
    quickTip: 'Have a "playground" to quickly test prompts and parameters. Version every prompt with git. Use data structures (Pydantic) to validate outputs. Always handle API errors with retry + fallback. For production: implement an LLM Gateway (Portkey/Helicone) from day 1 — it gives you tracing, cache, and fallback for free. Use async/await for LLM calls (they are I/O bound). Test with local fixtures (mock the LLM) for fast unit tests.',
    sections: [
      {
        title: 'Essential Implementations',
        type: 'key-concepts',
        items: [
          'Implement RAG pipeline: chunking → embedding → vector search → generation',
          'Build agent with tool use: define tools, ReAct cycle, structured observation',
          'Implement semantic search: embeddings + cosine similarity from scratch',
          'Chunking system: fixed-size, recursive, semantic, agentic',
          'Prompt templates with variables and versioning',
          'Evaluation pipeline: LLM-as-a-judge, automated metrics',
          'Response streaming: Server-Sent Events (SSE) for responsive UX',
          'Semantic cache: detect similar queries, return cached response',
          'Implement fallback chain: expensive model → cheap model → static fallback'
        ]
      },
      {
        title: 'Daily Example: Debugging an AI Pipeline in Practice',
        type: 'analogy',
        body: 'Debugging an AI system is like a mechanic diagnosing a modern car: you don\'t go straight for the engine (LLM) — you first check the sensors (logs and metrics), the connections (APIs and integrations), and the fluids (data quality). Often the problem is not the engine, but a sensor giving a bad reading. In daily life: your documentation RAG started giving strange responses. You investigate: (1) Check the logs — no apparent errors. (2) Test retrieval in isolation — the search is returning wrong chunks, with high scores but irrelevant content. (3) Discover that the embedding model was silently updated by OpenAI and changed the vector distribution. (4) Solution: pin the embedding model version in code, re-embed the entire corpus, and add a test that checks retrieval quality weekly. The most important lesson: in AI systems, the problem is rarely where you look first. Have distributed tracing (each pipeline stage logged with correlation IDs), isolate components (test retrieval separately from generation), and monitor not only obvious metrics (latency) but also subtle ones (embedding drift, similarity score distribution).'
      },
      {
        title: 'Practical Implementation Problems',
        type: 'qa-list',
        qa: [
          { question: 'How to implement streaming of LLM responses?', answer: 'Use Server-Sent Events (SSE). On the backend: stream=True in chat.completions.create, iterate over chunks (response.iter_lines()). On the frontend: EventSource or fetch with ReadableStream. For Python: FastAPI + StreamingResponse. Ex: response = client.chat.completions.create(stream=True, ...); for chunk in response: yield chunk.choices[0].delta.content' },
          { question: 'How to implement semantic caching in practice?', answer: '1) Embed the query, 2) Search cache by cosine similarity > threshold (e.g., 0.95), 3) If found, return cached response, 4) If not, call LLM and store in cache. Use Redis + FAISS for scale. Invalidation: by TTL (e.g., 24h) or manual (if knowledge changed). Typical savings: 30-50% of queries.' },
          { question: 'How to implement graceful degradation when LLM is down?', answer: 'Fallback chain: (1) Try primary model (GPT-4), (2) If it fails, try secondary model (Claude 3), (3) If it fails, try local model (Llama 3.2), (4) If everything fails, return template response: "Sorry, the system is temporarily unavailable." Cache common responses as a last resort.' },
          { question: 'How to structure tests for AI systems?', answer: '3 levels: (1) Unit tests: mock the LLM, test pipeline logic, schema validation. (2) Integration tests: use real LLM with fixed prompts, verify format and keywords. (3) Eval tests: golden dataset with LLM-as-a-judge, compare before/after changes.' }
        ]
      },
      {
        title: 'Common Interview Implementations',
        type: 'code-example',
        code: {
          language: 'python',
          source: `# Simple semantic search implementation
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class SemanticSearch:
    def __init__(self, embedding_model):
        self.model = embedding_model
        self.documents = []
        self.embeddings = []
    
    def add_documents(self, docs):
        self.documents.extend(docs)
        new_embeds = [self.model.encode(d) for d in docs]
        if len(self.embeddings) == 0:
            self.embeddings = new_embeds
        else:
            self.embeddings = np.vstack([self.embeddings, new_embeds])
    
    def search(self, query, k=5):
        query_vec = self.model.encode([query])
        scores = cosine_similarity(query_vec, self.embeddings)[0]
        top_k = np.argsort(scores)[-k:][::-1]
        return [
            {"doc": self.documents[i], "score": float(scores[i])}
            for i in top_k
        ]`
        },
        body: 'Concepts like this are the foundation of RAG systems and enterprise chatbots.'
      },
      {
        title: 'Example: Semantic Cache',
        type: 'code-example',
        code: {
          language: 'python',
          source: `import hashlib, json, time
import numpy as np
from redis import Redis

class SemanticCache:
    """Cache that returns responses for semantically similar queries."""
    
    def __init__(self, embedding_model, redis_url="redis://localhost", 
                 similarity_threshold=0.92, ttl_seconds=86400):
        self.model = embedding_model
        self.redis = Redis.from_url(redis_url)
        self.threshold = similarity_threshold
        self.ttl = ttl_seconds
    
    def _get_cache_key(self, embedding):
        """Uses simplified LSH (Locality-Sensitive Hashing) as key."""
        # In practice, use FAISS or Redisearch for ANN search
        return None  # Placeholder - real implementation would use vector search in Redis
    
    def get(self, query: str):
        """Returns cached response if similar query exists."""
        query_emb = self.model.encode(query)
        
        # Search for similar embeddings in cache
        # (simplified implementation - in production use FAISS/Redisearch)
        cached_keys = self.redis.keys("cache:*")
        for key in cached_keys:
            cached = json.loads(self.redis.get(key))
            cached_emb = np.array(cached["embedding"])
            similarity = cosine_similarity([query_emb], [cached_emb])[0][0]
            
            if similarity >= self.threshold:
                return cached["response"]
        
        return None
    
    def set(self, query: str, response: str):
        """Stores response in cache."""
        embedding = self.model.encode(query).tolist()
        cache_entry = {
            "query": query,
            "response": response,
            "embedding": embedding,
            "timestamp": time.time()
        }
        # Use a unique identifier based on the embedding
        key = f"cache:{hashlib.md5(str(embedding).encode()).hexdigest()}"
        self.redis.setex(key, self.ttl, json.dumps(cache_entry))`
        },
        body: 'Semantic cache reduces API costs by 30-50% and dramatically improves latency.'
      },
      {
        title: 'Real Scenario: Debugging a RAG Pipeline — Why Did Quality Drop?',
        type: 'everyday-scenario',
        body: 'Your LangChain-based RAG was working perfectly — until response quality plummeted out of nowhere. Users reported that the chatbot started giving vague and irrelevant responses. You had to debug the entire pipeline: chunking, embedding, retrieval, and generation. After hours of investigation, you discovered that a silent update to the embedding model (text-embedding-3-small → new version) had changed the embedding distribution, making the semantic search inaccurate.',
        items: [
          'First, check retrieval in isolation: take a known query, see which chunks the RAG returned — if the chunks are irrelevant, the problem is in retrieval, not generation',
          'Calculate the cosine similarity between the query and the returned chunks: if scores >0.85 but chunks are irrelevant, the embedding model lost discrimination capability (model drift)',
          'Compare old vs new embeddings: take 100 queries from the golden dataset and calculate the similarity between old and new model embeddings — if it changed >5%, you need to re-embed the entire corpus',
          'Check chunking: documents may have changed format (e.g., markdown → PDF) — the chunker was breaking text in wrong places, destroying semantic context',
          'Test the reranker: is the cross-encoder still working? If the reranker failed silently, the Top-5 may be full of irrelevant chunks even with good initial search',
          'Solution: pin the embedding model version (text-embedding-3-small@dec-2024), re-embed the entire corpus, and add an integration test that checks retrieval quality weekly'
        ]
      },
      {
        title: 'Debugging RAG: Checklist',
        type: 'qa-list',
        qa: [
          { question: 'Retrieval returns chunks but the response is poor. What to check?', answer: '(1) Does the context have enough information? Increase K from 3 to 5-7. (2) Is the LLM being faithful to the context? Check faithfulness score. (3) Is the generation prompt well-structured? Test with "answer based ONLY on the context below".' },
          { question: 'Semantic search doesn\'t find documents it should. How to investigate?', answer: '(1) Test the query manually: embed it and calculate cosine similarity against some known chunks. (2) Check if the embedding model version changed. (3) Check if the query is being truncated or misprocessed. (4) Test with hybrid search (vector + BM25).' },
          { question: 'Chunks are too large and overflowing the context. How to solve?', answer: '(1) Reduce chunk_size (1024→512). (2) Use parent-child: search in small chunks, pass the parent chunk as context. (3) Implement summarization of multiple chunks before passing to the LLM.' },
          { question: 'RAG works in dev but breaks in production. Common differences?', answer: '(1) Different data: production has documents that dev does not. (2) Different scale: production has 10x more chunks — HNSW index may need different parameters. (3) Concurrency: multiple simultaneous queries can cause contention in the vector DB.' }
        ]
      },
      {
        title: 'Real Scenario: Building a Complete AI Feature in 2 Weeks',
        type: 'everyday-scenario',
        body: 'The VP of Product came up with an idea: "I want the user to take a photo of a product and the app to automatically find similar products in our catalog using AI." Deadline: 2 weeks for the MVP. You need to go from zero to a functional feature in production — choosing the right tools, managing risks, and delivering real value, not a fragile prototype.',
        items: [
          'Day 1-2: choose the approach — instead of fine-tuning a VLM (too slow), use CLIP for image embeddings + vector search. CLIP is already pre-trained and understands visual-semantic similarity. Also decide: don\'t build infrastructure from scratch, use managed services (Supabase Vector or Pinecone)',
          'Day 3-5: implement the pipeline — (1) user uploads photo, (2) extract embedding via CLIP API (5 lines of code), (3) search Top-10 in vector DB via cosine similarity, (4) return product IDs to the frontend. + integration tests',
          'Day 6-8: frontend — add a "search by image" button on the search page. The user takes/uploads a photo, sees a loading spinner while searching (which takes ~300ms), and results appear with thumbnail + name + price + badge "similarity: 92%"',
          'Day 9-10: validation — test with 50 real product photos against a 10K item catalog. Expected accuracy: 85% (Top-5 relevant). If below, adjust the similarity threshold or increase K to 20 with re-ranking',
          'Day 11-12: production — add caching (photo embedding cached for 24h), rate limiting (10 searches/minute per user), monitoring (P95 latency, success rate, zero results), and fallback (if CLIP goes down, try text search with product tags)',
          'Day 13-14: launch and iterate — launch with a feature flag for 10% of users. Collect feedback: "the search found similar products but not exact matches". Iterate: add re-ranking with metadata (same category gets higher weight) — improves satisfaction by 30%. Feature flag to 100% in week 3'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 14. BEHAVIORAL & SCENARIO-BASED
  // ═══════════════════════════════════════════════
  Behavioral: {
    summary:
      'Behavioral and scenario-based questions test not only technical knowledge, but also decision-making ability, stakeholder communication, and critical thinking. They are the hardest questions in AI Engineering interviews because there is no single right answer.',
    everydayExample:
      'AI behavioral questions are like flight simulators for pilots: the scenario could be "an engine failed during takeoff" (hallucination in production) or "storm on the route" (model drift). The interviewer doesn\'t want the "right" answer — they want to see your thought process, how you prioritize, and how you communicate under pressure. In the day-to-day of a senior AI engineer: you\'re in a meeting with the VP of Product who wants to launch a support chatbot "without human supervision" to "reduce costs." You need to explain the risks (hallucinations, bias, safety) without sounding like you\'re "making excuses." You propose: "Let\'s start with human supervision on 100% of cases, measure accuracy for 1 month, and gradually reduce supervision as results come in. Meanwhile, we build guardrails and a fallback system." This shows you understand both technology and business.',
    quickTip: 'Use the STAR+AI framework: Situation, Task, Action, Result + AI-specific considerations (ethics, cost, latency). Always mention trade-offs: "We did X instead of Y because Z was more important for this context." For system design questions, draw the architecture in 3 layers: (1) Data/Ingestion, (2) AI/Model, (3) Application. Explain decisions in terms of: cost vs quality, latency vs accuracy, simplicity vs flexibility.',
    sections: [
      {
        title: 'Typical Questions',
        type: 'qa-list',
        qa: [
          { question: 'How do you decide between LLM API vs self-hosted model?', answer: 'Consider: (1) Request volume — API is cheaper up to ~1M req/month, (2) Sensitive data — self-host if data cannot leave, (3) Latency — self-host can be faster if well optimized, (4) Team — self-host requires a dedicated ML/infra engineer, (5) Variety — API provides access to multiple models with no effort.' },
          { question: 'How do you measure the ROI of an AI feature?', answer: 'Define business metrics before implementing: (1) Time reduction (e.g., customer response time), (2) Satisfaction increase (NPS/CSAT), (3) Cost reduction (e.g., fewer human agents), (4) Revenue increase (conversion, upsell). Establish a baseline before deployment and compare after.' },
          { question: 'Stakeholder wants to launch a feature with 15% hallucination rate. How do you communicate the risk?', answer: 'Translate to business language: "15% hallucination means that 1 in every 7 customers will receive an incorrect response. If this is a support chatbot, 15% of customers will leave with wrong information. I suggest we start with a monitored pilot, with human fallback, and establish a continuous improvement plan."' },
          { question: 'Your system has degraded in quality over time. What do you do?', answer: '(1) Investigate the cause: data drift? model drift? change in user behavior? (2) Monitor: input distribution, confidence scores, user feedback, (3) Re-train or adjust prompts, (4) Implement automatic drift detection with alerts, (5) Consider scheduled periodic re-training.' },
          { question: 'How do you explain LLM limitations to non-technical executives?', answer: 'Use analogies: "LLMs are like brilliant research assistants but they sometimes make up facts. That\'s why, for critical recommendations, we always verify sources (RAG) and have human supervision. The value is in productivity: they do 80% of the work, and we review the critical 20%."' },
          { question: 'You need to choose between launching an AI MVP in 2 weeks with low quality or in 2 months with high quality. Which do you choose?', answer: 'It depends on the context. For non-critical features (e.g., "product suggestions"), launch fast with low quality and iterate. For critical features (e.g., "medical diagnosis"), wait and ensure quality. The important thing: clearly define what "acceptable quality" means for the use case and communicate the risks of the MVP.' },
          { question: 'Your team proposes using RAG for a problem that is clearly a fine-tuning problem. How do you convince them?', answer: 'Show data: "We tested RAG and fine-tuning on our dataset. RAG achieved 72% accuracy vs 91% for fine-tuning. The cost of fine-tuning with LoRA is ~$10 in GPU vs RAG which costs $0.01/query — at 10K queries/month, RAG already costs more. Plus, the consistent format we need is only guaranteed by fine-tuning." Always use data, not opinions.' }
        ]
      },
      {
        title: 'Trade-offs in AI Engineering Decisions',
        type: 'pros-cons',
        body: 'AI engineering decisions rarely have a right answer — they are trade-offs between cost, quality, latency, and risk. Knowing how to navigate these trade-offs and communicate them to stakeholders is what distinguishes senior engineers. The most common decisions in interviews and day-to-day involve: RAG vs fine-tuning, API vs self-host, expensive vs cheap model, launch fast vs wait, human supervision vs autonomous. For each decision, evaluate the specific context: what is the impact of an error? What is the budget? What is the timeline?',
        items: [
          'RAG vs Fine-tuning: RAG is more flexible (data changes fast), fine-tuning is more consistent (fixed format). Use RAG first, fine-tuning only when you need a specific format',
          'API vs Self-host: API is cheaper up to ~1M req/month, self-host scales better after that. Start with API, switch to self-host when cost or privacy require it',
          'Expensive vs cheap model: use a router — simple requests go to the cheap model, complex ones to the expensive model. Save 40-60% without losing quality on complex tasks',
          'Speed vs quality: fast MVP with 70% accuracy can be acceptable for non-critical features. For healthcare/finance, wait for >95%',
          'Autonomy vs supervision: start with human-in-the-loop for all decisions. Gradually increase autonomy as eval shows it\'s safe'
        ]
      },
      {
        title: 'Decision Frameworks for AI Engineering',
        type: 'key-concepts',
        items: [
          'Risk-Impact Matrix: classify every decision as (impact: low/medium/high) x (risk: low/medium/high). High risk + high impact = requires in-depth analysis and approval from multiple stakeholders',
          'Cost-Benefit Analysis (CBA): for each AI feature, estimate cost (development + operation) vs benefit (savings + revenue). Feature only moves forward if ROI > 2x in 6 months',
          'Decision Tree: map decisions as a tree: "if cost < $X, use API; if not, self-host." Automates repetitive decisions and documents the rationale',
          'Pre-Mortem: before launching, imagine the project failed in the worst possible way — what went wrong? This reveals hidden risks that no one considered',
          'Stakeholder Mapping: identify who wins and who loses with each AI decision. A system that automates tasks can save money but create political resistance from the affected teams'
        ]
      },

      {
        title: 'Real Scenario: Convincing Stakeholders to Invest in Evaluation',
        type: 'everyday-scenario',
        body: 'Your engineering team wants to implement an evaluation pipeline (golden dataset, LLM-as-a-judge, regression tests). But the VP of Product says: "This will delay the launch. Let\'s ship first, evaluate later." You need to convince them that eval is not a cost — it\'s an accelerator. Without evaluation, every prompt change is a "leap in the dark": you don\'t know if it improved or worsened things. With evaluation, the team iterates faster because they know what works.',
        items: [
          'Translate eval into business language: "Without eval, every change to the AI system is a 30% risk of worsening the user experience. With eval, we reduce that risk to 3% — and we can iterate 3x faster because we know with confidence whether each change is positive"',
          'Show the cost of not having eval: "Last month, a prompt change reduced the chatbot resolution rate from 78% to 52%. It took 3 days to detect and another 2 days to revert. This cost ~500 unsatisfied customers and ~$15K in extra human support"',
          'Propose an eval MVP in 1 week: "In 5 business days, we implement: (1) golden dataset of 100 examples, (2) automated eval script, (3) CI gate that blocks deploys if quality drops >3%. Investment: 1 engineer for 1 week"',
          'Connect eval to delivery speed: "With automated eval, we reduce the prompt review cycle from 3 days to 2 hours. The team can experiment more, because each experiment is validated in minutes, not days"',
          'Use data from other companies: "Anthropic published that teams with a mature eval pipeline have 4x fewer production incidents and 2x faster AI feature development velocity"',
          'Result: after implementing eval, the team reduced incidents by 70%, increased deployment frequency from 1x/week to 3x/week, and the VP of Product became the biggest advocate for eval on the board'
        ]
      },
      {
        title: 'Stakeholder Communication about AI',
        type: 'qa-list',
        qa: [
          { question: 'How do you explain that AI is not magic to an executive?', answer: 'Use the "brilliant intern" analogy: AI is like an intern who has read every book in the company but has never worked here. They give amazing answers 80% of the time, but 20% of the time they make things up. Our job is to build systems that maximize the 80% and minimize the 20% — with RAG (providing context), guardrails (boundaries), and human supervision (critical review).' },
          { question: 'How do you justify the investment in AI infrastructure?', answer: 'Show the cost curve: "Without infrastructure, each request costs $0.05 with GPT-4. With caching + model routing + fine-tuning, we reduce that to $0.008 — an 84% savings. The $50K investment in infrastructure pays for itself in 3 months at current volume. And with projected growth, in 6 months we\'ll be saving $30K/month."' },
          { question: 'Stakeholder wants 100% autonomous AI without supervision. How do you respond?', answer: 'Don\'t say "you can\'t" — show the risk in business terms: "100% autonomous means that 1 in 20 customers will receive an incorrect response. For an e-commerce site with 10K orders/day, that\'s 500 customers/day with wrong information. I suggest we start with 100% supervision, measure accuracy for 30 days, and together define the acceptable level of autonomy based on real data."' },
          { question: 'How do you measure the ROI of an AI initiative to present to the board?', answer: 'Define 3 metrics: (1) Cost reduction: work hours saved × cost/hour, (2) Revenue increase: improvement in conversion/upsell attributable to AI, (3) Customer satisfaction: NPS/CSAT before and after. Always present with a confidence interval: "we estimate savings of $100-150K/year with 90% confidence based on the 3-month pilot."' }
        ]
      },
      {
        title: 'Real Scenario: The Big Decision — Refactor or Deliver?',
        type: 'everyday-scenario',
        body: 'Your team of 5 engineers is building an AI assistant for lawyers. The MVP was a success: 200 paying users in 3 months. But the code is a "house of cards": the RAG pipeline was written in a hurry, has no tests, the prompt engineering is spread across 15 different files, and any change breaks something. The CTO wants to refactor ("we\'ll lose 2 months but have a solid foundation"). The CEO wants new features ("competitors are advancing"). You\'re in the middle — and you need to decide.',
        items: [
          'Technical debt analysis: (1) Monolithic RAG pipeline — any change in chunking affects retrieval which affects generation. (2) Prompts in loose files — no versioning, no tests, no golden dataset. (3) Zero integration tests — every deploy is a gamble. (4) No quality monitoring — you don\'t know if a change improved or worsened things',
          'Middle-ground proposal: instead of "refactor everything" or "push forward," propose 3 sprints of "feature-driven refactoring": each new feature comes with refactoring of the area it touches. E.g., "contract summarization feature" → refactor the chunking pipeline (which affects summarization) + add tests for chunking. In 3 months, 60% of the system is refactored and 5 new features have been delivered',
          'Implement the "boy scout rule": every time an engineer touches a file, they leave it 5% better — rename a confusing variable, add a useful comment, extract a function. Small continuous improvements that don\'t block deliveries but gradually reduce debt',
          'Create barriers against new debt: (1) every new prompt must have a test in the golden dataset, (2) every new integration must have logging and monitoring, (3) every new RAG component must be isolated (cannot be monolithic). Debt doesn\'t grow while existing debt is being paid down',
          'Communicate in business language: "Without refactoring, each new feature takes 20% longer than the previous one — in 6 months, features that now take 2 weeks will take 5 weeks. With continuous refactoring, the cost stays stable. The investment of 20% of time in quality pays 3x in future productivity."',
          'Result: after 6 months, the team delivered 12 features (vs 18 that could have been delivered without refactoring), but delivery speed INCREASED 30% (from 2 weeks to 1.5 weeks per feature) — while without refactoring it would have DROPPED 40% (to 3.5 weeks). The CEO understood that quality is an accelerator, not a brake'
        ]
      }
    ]
  },


  ContextEngineering: {
    summary:
      'Context Engineering is the discipline of designing, optimizing, and managing the context sent to LLMs to maximize response quality while minimizing cost and latency. It includes techniques like context compression (LLMLingua), sliding window, token budget management, context distillation, and information prioritization. In production, poorly optimized context is the leading cause of bad responses, high costs, and slowness.',
    everydayExample:
      'Imagine you need to give instructions to a brilliant assistant but with limited memory (context window). If you give them a 500-page manual, they\'ll read it all but might forget what\'s most important (Lost in the Middle). Context Engineering is the art of summarizing, prioritizing, and structuring that manual so the assistant always has the right information at the right time. In engineering practice, this shows up when you implement a RAG system that needs to fit 100 documents into the context — without Context Engineering, the LLM ignores documents in the middle of the list and misses critical information. With techniques like "contextual re-ranking" and "summary-first", you ensure the most relevant documents are always at the beginning of the context.',
    quickTip:
      'Apply the "context sandwich" rule: place the most important instruction at the beginning AND end of the context. Use compression (LLMLingua) to reduce context by 50-80% without quality loss. Monitor the token budget: if it exceeds 70% of the limit, degrade to summarization. For RAG systems, reorder the chunks: the most relevant first and last, the rest in the middle. Consider "context distillation": ask the LLM to summarize the long context before responding.',
    sections: [
      {
        title: 'What is Context Engineering?',
        type: 'overview',
        body: 'Context Engineering goes beyond simply "putting more tokens in the prompt". It is the systematic design of: (1) Token Budget — how much of the available context to use for instructions, data, and examples, leaving room for the response; (2) Information Hierarchy — what should come first (most important), what goes in the middle, what stays at the end; (3) Compression — techniques like LLMLingua that remove redundant tokens without losing semantics; (4) Sliding Window — when history exceeds the limit, how to choose which part to keep; (5) Context Distillation — using the LLM itself to summarize long contexts before the main call. Each technique solves a specific aspect of the limited context problem. By 2024-2025, Context Engineering became its own discipline because the bottleneck of AI systems is no longer the model — it\'s efficient context management.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Token Budget: context allocation plan — how many tokens for system prompt, how many for data, how many for response. E.g.: 50% system + 30% data + 20% response',
          'LLMLingua: prompt compression technique that removes low-importance semantic tokens, reducing size by 50-80% with minimal quality loss',
          'Sliding Window: when conversation history exceeds the limit, keeps only the N most recent messages + a summary of old messages',
          'Lost in the Middle: phenomenon where information in the middle of the context has less influence on the response than information at the beginning or end',
          'Context Distillation: using the LLM itself to summarize a long context into a few paragraphs before sending to the main model',
          'Recursive Summarization: for very long contexts (books, codebases), summarize in multiple layers — chapters → sections → executive summary',
          'Contextual Priors: including at the start of the context general instructions (persona, formatting, rules) that apply to the entire interaction',
          'Selective Context: loading only the most relevant data fragments for the current query, instead of the entire dataset at once'
        ]
      },
      {
        title: 'How Context Compression Works',
        type: 'how-it-works',
        body: 'Context compression with LLMLingua works in three steps. (1) Tokenization: the full prompt is tokenized and each token receives an importance score based on a small language model (ALBERT, DistilBERT). Tokens with low probability (high surprise) are considered informative; predictable tokens are candidates for removal. (2) Pruning: tokens with scores below a threshold are removed, but the system preserves the basic grammatical structure so the resulting text is still readable. (3) Reconstruction: the compressed text is fed to the target LLM. Studies show that 50-80% compression maintains 90%+ of original quality for QA, summarization, and classification tasks. The trade-off: very aggressive compression (>85%) degrades quality on tasks requiring factual precision. The ideal rate depends on the task: 50% for code, 70% for narrative text, 40% for legal documents.'
      },
      {
        title: 'Context Engineering Architecture',
        type: 'architecture',
        body: 'Components of the context management pipeline.',
        items: [
          'Context Budget Manager: monitors used vs available tokens, decides when to compress or summarize based on remaining budget',
          'Compression Engine (LLMLingua): applies selective compression with configurable rate by content type (high for boilerplate, low for instructions)',
          'Sliding Window Manager: maintains conversational history with retention policy (last N messages + summaries of previous ones)',
          'Content Prioritizer: reorders context by placing the most relevant content at beginning and end (mitigating Lost in the Middle)',
          'Distillation Pipeline: for contexts that still exceed the limit even after compression, triggers recursive multi-layer summarization',
          'Context Cache: stores processed contexts for similar queries, avoiding full reprocessing'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from llmlingua import PromptCompressor
import tiktoken

# Initialize compressor
compressor = PromptCompressor(
    model_name="microsoft/llmlingua-2-xlm-roberta-large-meetingbank",
    use_llmlingua2=True
)

# Long context to compress
context = """
The company's return policy allows returns within 30 days
of purchase, provided the product is unused and in its original packaging.
For electronics, the return window is 7 days. Custom products
are not eligible for returns. Refunds are processed within 10 business days
after receiving the returned product.
... (more 1000 tokens of policy content)
"""

# Compress keeping 40% of original
compressed = compressor.compress_prompt(
    context,
    rate=0.4,  # reduces to 40%
    force_tokens=["return", "refund", "deadline", "electronics"],
    drop_consecutive=True
)
print(f"Original: {len(tiktoken.encoding_for_model('gpt-4').encode(context))} tokens")
print(f"Compressed: {len(tiktoken.encoding_for_model('gpt-4').encode(compressed['compressed_prompt']))} tokens")
# Output: keeps 40% of tokens preserving information
# about return deadlines and exceptions`
        },
        body: 'LLMLingua compresses prompts by removing redundant tokens, keeping essential information with minimal quality loss.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Each Context Engineering strategy involves trade-offs between quality, cost, and latency.',
        items: [
          '✅ LLMLingua Compression: reduces tokens by 50-80%, maintains 90%+ quality, ideal for saving cost on large contexts',
          '✅ Sliding Window with Summarization: enables infinite conversations without losing critical context from recent messages',
          '❌ Aggressive compression (>85%) degrades factual precision, especially in legal and technical documents',
          '⚠️ Context Distillation (summarize first): useful for very long contexts, but adds an extra LLM call (cost + latency)'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'How does the "Lost in the Middle" phenomenon work and how to mitigate it?', answer: 'Studies (Liu et al. 2023) show that LLMs perform ~15% worse when relevant information is in the middle of the context. Mitigations: (1) place the most important information at the beginning and end, (2) use re-ranking to position more similar chunks first and last, (3) for multiple documents, interleave short summaries between full documents, (4) use directed attention techniques like "pay special attention to document 3".' },
          { question: 'What is the difference between prompt compression and summarization?', answer: 'Compression (LLMLingua) removes individual low-importance tokens without altering the text structure — it operates at the token level, preserving the original text but shorter. Summarization uses an LLM to rewrite the content in fewer words — it operates at the semantic level, potentially losing nuances. Compression is faster (seconds vs minutes), but summarization can be more effective for very long contexts (>50K tokens).' },
          { question: 'How to calculate the ideal token budget for a task?', answer: 'Rule of thumb: 20% system prompt (persona, rules, output format), 50% input data (context, documents, history), 10% few-shot examples, 20% reserve for the response. Adjust based on complexity: analysis tasks (more data, fewer instructions) vs creative tasks (more instructions, less data). Monitor actual usage and adjust: if responses are frequently truncated, increase the response budget.' },
          { question: 'How to implement sliding window with summarization in production?', answer: 'Maintain two layers: (1) short-term buffer: last 10 full messages (preserve immediate context), (2) long-term summary: when the buffer exceeds N tokens, send the oldest messages to a summarization LLM and replace with the summary. Configure thresholds: window_size=10 (or ~8K tokens), summarize_trigger=12 messages, summarize_model= gpt-4o-mini (cheaper). The summary is prefixed to the buffer on each iteration.' },
          { question: 'How to handle contexts that exceed 200K tokens?', answer: 'Use recursive multi-layer summarization: (1) divide into 10K token blocks, (2) summarize each block to 1K tokens, (3) summarize the summaries to 2K tokens, (4) use the final summary as context. Alternatives: MapReduce (process each block separately then combine), or selective RAG (search only relevant chunks). The choice depends on the use case: global summarization (recursive), specific analysis (RAG).' }
        ]
      },
      {
        title: 'Real Scenario: Context Optimization in a Support Chatbot',
        type: 'everyday-scenario',
        body: 'Your customer support chatbot needs to process conversations with 50+ history messages, a knowledge base of 200 articles, and user data (plan, purchase history, previous tickets). Without Context Engineering, the prompt reaches 40K tokens — expensive, slow, and the LLM ignores information in the middle. With Context Engineering, you reduce it to 8K tokens and improve response quality by 35%.',
        items: [
          'Apply 60% compression on the conversation history with LLMLingua: removes greetings, confirmations, and low-information messages — keeps only questions, technical responses, and decisions. Reduces history from 12K to 4.8K tokens',
          'Use selective context on the knowledge base: instead of loading all 200 articles, use RAG to fetch only the 3-5 most relevant articles for the current question. Limit each article to 1K tokens (if larger, compress with LLMLingua)',
          'Apply "instruction sandwich": at the beginning of the context place the main instruction ("You are a support agent. Answer based only on the provided context."), at the end reinforce ("Remember: answer only with information from the context above.")',
          'Prioritize user data: place user profile information (name, plan, recent history) right after the initial instruction — before the knowledge base and history',
          'Implement sliding window with summarization: every 20 history messages, summarize the 10 oldest into 2 paragraphs and remove them from the buffer. Keep only the last 10 full messages + the summary of previous ones',
          'Result: prompt from 40K → 8K tokens, cost reduced by 80%, P95 latency from 8s to 2.5s, and customer satisfaction score increased from 4.1 to 4.6/5.0 because the LLM now "sees" all relevant information'
        ]
      }
    ]
  },


  KnowledgeGraphs: {
    summary:
      'Knowledge Graphs represent information as entities (nodes) and relationships (edges), enabling structured multi-hop search that traditional RAG cannot handle. With GraphRAG (Microsoft), Neo4j, and entity extraction frameworks, you build connected knowledge bases that answer compound questions like "What is the impact of policy X on employees in department Y?" — something impossible for simple similarity search.',
    everydayExample:
      'Imagine a library where books are organized by subject (traditional RAG: similarity search). If you ask "books about programming," you find them easily. But if you ask "which science fiction authors also wrote popular science books?", you need to cross-reference information — author → genre → author → another genre. This is a multi-hop query that a knowledge graph answers naturally: authors are nodes, "wrote" are edges, and you navigate from node to node. In engineering practice, Knowledge Graphs appear in systems that need reasoning about relationships: "which enterprise customers using feature X also use feature Y?" or "which teams were affected by the change in deploy policy?"',
    quickTip:
      'Use LLMs to automatically extract entities and relationships from text — do not create graphs manually. For GraphRAG, configure extraction with gpt-4o-mini (cheaper) and relationship with gpt-4o (more accurate). Start with a small graph (100-200 nodes) and expand. Use Neo4j for graphs with thousands of nodes or NetworkX for prototyping. For global summarization, configure community detection (Leiden algorithm) with resolution between 1.0 and 1.5.',
    sections: [
      {
        title: 'What are Knowledge Graphs?',
        type: 'overview',
        body: 'Knowledge Graphs organize knowledge as a graph: real-world entities (people, companies, concepts, documents) are nodes, and the relationships between them are edges. Unlike vector databases that search by semantic similarity, graphs enable structured navigation: "John → works_at → CompanyX → uses_technology → Kubernetes". This enables multi-hop queries ("what technologies do John\'s colleagues use?") that traditional RAG handles poorly. The best-known application is the Google Knowledge Graph (that panel to the right of search results). In AI, GraphRAG (Microsoft, 2024) popularized combining graphs with LLMs: it automatically extracts entities and relationships from documents, builds the graph, and enables both global queries (community summarization) and local queries (specific entities).'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Entities: graph nodes representing real-world objects (people, companies, concepts, documents, technologies)',
          'Relationships: graph edges with semantic types (works_at, uses_technology, located_in, reports_to)',
          'GraphRAG: Microsoft pipeline that extracts entities/relationships from documents, builds a graph, detects communities, and summarizes globally',
          'Multi-hop Query: a query that traverses multiple edges ("which team uses library X and also uses Y?")',
          'Community (Leiden Algorithm): cluster of densely connected nodes in the graph — used by GraphRAG for global summarization',
          'Triplets: basic graph unit — (entity1, relationship, entity2), e.g., ("GPT-4", "is_a", "LLM")',
          'Graph Embedding: vector representation of nodes and subgraphs for hybrid search (graph + vector)',
          'SPARQL: query language for RDF graphs — equivalent to SQL for relational databases'
        ]
      },
      {
        title: 'How GraphRAG Works',
        type: 'how-it-works',
        body: 'The GraphRAG (Microsoft) pipeline has 5 steps. (1) Entity Extraction: each text chunk is sent to an LLM with instructions to extract entities (people, organizations, concepts, events) and their relationships. The LLM returns triples (entity1, relationship, entity2). (2) Graph Construction: the triples are aggregated into a graph — nodes are unique entities, edges are relationships with weight (co-occurrence frequency). (3) Community Detection: applies the Leiden algorithm to identify clusters of densely connected entities — each community represents a cohesive "theme" or "subject". (4) Community Summarization: for each community, an LLM generates a consolidated summary of the theme — used for global queries. (5) Query: combines local search (specific entities via embedding) with global search (relevant communities via summarization) to answer questions that require either overview or specific details.'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of a Knowledge Graph system for AI.',
        items: [
          'Entity Extractor: LLM configured to extract entities and relationships from text chunks, with Pydantic schema defining entity and relationship types',
          'Graph Builder: builds the graph from extracted triples, deduplicates entities (synonym merging), and computes edge weights',
          'Community Detector: applies the Leiden algorithm to cluster the graph into communities with configurable resolution',
          'Summarizer: generates textual summary for each community using LLM — used as the "global index" of knowledge',
          'Hybrid Retriever: combines vector search (chunk + entity embeddings) with graph search (entity neighborhood + communities)',
          'Query Engine: receives the user question, triggers the retriever, combines local and global context, and generates the final response via LLM'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from graphrag.query import GlobalSearch, LocalSearch
import pandas as pd

# Configures GraphRAG (after indexing)
# Indexing extracts entities and builds the graph automatically

# Local query — searches for specific entities
local_engine = LocalSearch(
    llm="gpt-4o-mini",
    graph_index="./indices/graphrag",
    community_level=2
)

result = local_engine.search(
    "What are the security policies for production deployment?"
)
print(f"Local response: {result.response}")
print(f"Context: {len(result.context)} entities")

# Global query — summarization by community
global_engine = GlobalSearch(
    llm="gpt-4o",
    graph_index="./indices/graphrag",
    dynamic_community_selection=True
)

result = global_engine.search(
    "What are the main security topics covered in the documentation?"
)
print(f"Global response: {result.response}")
# GraphRAG combines the specific view (local) with the overview (global)`
        },
        body: 'GraphRAG enables local queries (specific entities) and global queries (communities/themes) by combining knowledge graphs with LLMs.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Knowledge Graphs vs traditional RAG — each approach solves different problems.',
        items: [
          '✅ Multi-hop queries: Knowledge Graphs answer compound questions that require navigation between entities — something similarity-based RAG cannot do',
          '✅ Global summarization: GraphRAG groups knowledge by thematic communities, enabling comprehensive answers about the entire dataset',
          '❌ Indexing cost: GraphRAG costs 2-5x more than traditional RAG during indexing (multiple LLM calls for extraction and summarization)',
          '⚠️ Operational complexity: managing graph, communities, and summaries requires more infrastructure than a simple vector DB'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between RAG and GraphRAG?', answer: 'Traditional RAG searches chunks by vector similarity — works well for direct factual questions. GraphRAG builds a graph of entities and relationships, enabling multi-hop queries ("what is the impact of X on Y?") and global summarization ("what are the main themes?"). RAG is simpler and cheaper; GraphRAG is more expensive to index but supports more complex questions. Many systems use both: RAG for quick questions, GraphRAG for deep analysis.' },
          { question: 'How to extract entities efficiently?', answer: 'Use an LLM (gpt-4o-mini for cost savings) with a Pydantic schema defining entity types (Person, Company, Technology, Concept) and relationship types (works_at, uses, implements, depends_on). Process in batches of 10-20 chunks per call. For deduplication: normalize names (lowercase, remove punctuation), use embedding similarity to merge similar entities (>0.9 similarity), and an LLM to resolve ambiguities (e.g., "Apple" the fruit vs "Apple" the company).' },
          { question: 'How does the Leiden algorithm work for community detection?', answer: 'Leiden is an evolution of the Louvain algorithm. It works in 3 phases: (1) local movement: each node tries to move to the neighbor\'s community that maximizes modularity, (2) refinement: within each community, nodes are regrouped to ensure internal connectivity, (3) aggregation: each community becomes a "super-node" and the process repeats. The resolution (gamma) controls community size: gamma < 1 → larger communities (more aggregated summarization), gamma > 1 → smaller communities (more specific). Default value: 1.0.' },
          { question: 'How to combine graph search with vector search?', answer: 'Implement hybrid search in two stages. (1) Vector search: embed the query and search for similar chunks (traditional RAG) + graph nodes with similar embeddings. (2) Graph expansion: for each relevant node found, expand its neighborhood (1-2 hops) to bring in related entities. Combine results by weighting: score = α * vector_score + β * (1 / graph_distance). Adjust α/β based on query type: α > β for factual questions, β > α for relational questions.' },
          { question: 'How to scale Knowledge Graphs to millions of documents?', answer: 'For scale, use a layered approach: (1) primary index: graph with high-level entities (departments, systems, main policies), (2) secondary index: per-domain graphs, (3) traditional RAG as fallback for details not captured in the graph. For extraction, use smaller models (gpt-4o-mini, Llama 3.2 8B) and parallel processing with rate limiting. Consider "incremental graph": instead of re-indexing everything, add new documents to the existing graph with duplicate detection.' }
        ]
      },
      {
        title: 'Real Scenario: Knowledge Graph for SaaS Platform Documentation',
        type: 'everyday-scenario',
        body: 'Your SaaS platform has 5 thousand documentation pages, 200 microservices, 50 internal libraries, and 30 product teams. When a new engineer asks "which email service does feature X use?" or "which teams are impacted by the migration of database Y?", traditional RAG returns loose chunks that don\'t connect the information. You implement GraphRAG to build a knowledge graph of the platform: entities are services, teams, libraries, features; relationships are "uses", "depends_on", "maintained_by", "impacted_by".',
        items: [
          'Extract entities and relationships automatically: process all technical documentation, READMEs, ADRs (Architecture Decision Records), and on-call runbooks with an LLM extracting services, dependencies, responsible teams, and technologies used — generate ~5 thousand entities and ~15 thousand relationships',
          'Build the graph in Neo4j: entities as nodes with labels (:Service, :Team, :Library, :Feature), typed relationships (:USES, :DEPENDS_ON, :MAINTAINED_BY, :IMPACTS). Add properties: status (active/deprecated), language, version, and links to documentation',
          'Implement typical queries: "critical path between service A and service B" (shortest path), "all services that depend on library X" (neighborhood), "features impacted by database Y migration" (multi-hop traversal)',
          'Integrate with the internal chatbot: when an engineer asks "what is the impact of taking down the payment service?", the system traverses the graph to list all services that depend on it, the affected features, and the responsible teams — answer in seconds vs hours of manual investigation',
          'Keep the graph updated: CI/CD pipelines trigger re-extraction when documentation changes, with graph diff to detect changes (new services, removed dependencies) and notify teams about impacts',
          'Result: onboarding time for new engineers reduced from 3 months to 3 weeks, incidents from undetected impact dropped 60%, and the internal chatbot answers 85% of architecture questions without human intervention'
        ]
      },
      {
        title: 'Daily Example: Corporate Knowledge Map',
        type: 'analogy',
        body: 'Think of a Knowledge Graph as your company\'s org chart, but for knowledge instead of people. The org chart shows who reports to whom (hierarchical relationships). A Knowledge Graph shows which services depend on which libraries, which teams are experts in which technologies, which features impact which customers. It is a "treasure map" of corporate knowledge: you navigate from node to node following the relationships. "Ah, service X uses library Y which has been deprecated — who else uses Y? Team Z. Who on team Z can help? Person W, who is an expert in Y." In daily engineering, this avoids hours on Slack asking "does anyone know who handles this?"'
      }
    ]
  },


  Workflows: {
    summary:
      'AI Workflows are orchestrated pipelines that coordinate multiple LLM calls, tools, validations, and human decisions in deterministic or dynamic sequences. With LangGraph, Prefect, and Temporal, you build DAGs (Directed Acyclic Graphs) and stateful loops, ranging from simple linear chains to complex systems with parallel branches, human-in-the-loop, and recursion. They are the natural evolution from "call the LLM once" to "orchestrate a complete AI process."',
    everydayExample:
      'Imagine a travel assistant that doesn\'t just answer questions but executes a complete process: (1) receives the user request, (2) searches flights via an API (tool), (3) searches hotels (another tool), (4) calculates total budget (function), (5) presents options to the user, (6) WAITS for human confirmation (human-in-the-loop), (7) makes the reservation (tool), (8) sends confirmation email (tool). This is a workflow. Each step can fail, require approval, or make decisions based on the previous step\'s result. LangGraph allows modeling this as a state graph — each node is an action (LLM call, tool, decision), each edge is the transition between actions. In engineering practice, workflows appear in content moderation (LLM classifies → human reviews → publishes), document analysis (extracts → classifies → summarizes → stores), and data pipelines (fetches → transforms → validates → loads).',
    quickTip:
      'Start with LangGraph\'s StateGraph: define the state (TypedDict), the nodes (functions that modify the state), and the edges (conditional or fixed transitions). For human-in-the-loop, use interrupt() before critical actions. For parallelism, use fan-out/fan-in with Send commands. Monitor each execution with LangSmith — multi-step workflows are hard to debug without tracing. Consider Prefect for workflows that need scheduling, retry, and observability beyond what LangGraph offers.',
    sections: [
      {
        title: 'What are AI Workflows?',
        type: 'overview',
        body: 'AI Workflows solve the problem that a single LLM call rarely handles complex real-world tasks. A workflow defines: (1) Shared state between steps — an object that carries accumulated data during execution, (2) Nodes — work units (LLM calls, tools, functions, human decisions), (3) Edges — conditional transitions that determine flow based on the current state, (4) Flow control — sequences, parallelism, loops, recursion, and pauses for human intervention. LangGraph\'s (2024) main innovation is modeling workflows as state graphs, enabling loops and cycles (unlike traditional DAGs like Prefect). This is essential for agents that need to "think, act, observe, repeat" in cycles until completing a task.',
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'StateGraph: LangGraph data structure that defines nodes, edges, and shared workflow state',
          'Node: work unit — can be an LLM call, tool, Python function, or conditional decision',
          'Conditional Edge: transition that chooses the next node based on the current state (e.g., "if validation failed → try again")',
          'Human-in-the-Loop: workflow pause for human approval via interrupt() — essential for critical actions',
          'Fan-out/Fan-in: parallel execution of multiple nodes followed by aggregation of results',
          'State Reducer: function that defines how to update state when multiple nodes modify the same field',
          'Checkpoint: state snapshot at each step — allows pausing, resuming, and debugging workflows',
          'Command (LangGraph): mechanism to send instructions from a node to the runtime (e.g., Send for parallel spawn)'
        ]
      },
      {
        title: 'How StateGraph Works',
        type: 'how-it-works',
        body: 'LangGraph models workflows as a directed state graph. The state is a TypedDict that carries all workflow data. Each node is a function that receives the state and returns a partial dictionary with updates. Edges define the execution order: normal edges (always execute the next node), conditional edges (choose the next node based on state). The runtime executes nodes in topological order, passing state between them. The major difference from traditional DAGs: LangGraph allows cycles (loops), which is essential for ReAct agents that iterate between thinking and acting. Checkpointing saves the state after each node, enabling pausing (human-in-the-loop), resuming from failures, and step-by-step debugging. Each execution has a unique thread_id that allows recovering state from any checkpoint.'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of an AI Workflows system.',
        items: [
          'Graph Definition: defines nodes, edges, initial state, and compiles the graph into an executable',
          'State Store: stores the current workflow state (in memory for execution, in DB for persistence)',
          'Runtime Engine: executes nodes in the defined order, manages parallelism and loops',
          'Checkpoint Manager: saves state snapshots after each node, enabling pausing, resuming, and debugging',
          'Human-in-the-Loop Gateway: manages pauses for human approval, notifies channels (Slack, email), and awaits response',
          'Observability Layer: LangSmith/Langfuse tracing of each workflow step, including latency, tokens, and partial results'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

# Defines the workflow state
class WorkflowState(TypedDict):
    query: str
    search_results: list
    analysis: str
    needs_review: bool
    final_response: str

# Defines the nodes (each modifies part of the state)
def search_node(state: WorkflowState) -> dict:
    results = search_api(state["query"])
    return {"search_results": results}

def analyze_node(state: WorkflowState) -> dict:
    analysis = llm.analyze(state["query"], state["search_results"])
    needs_review = "uncertain" in analysis.lower()
    return {"analysis": analysis, "needs_review": needs_review}

def generate_node(state: WorkflowState) -> dict:
    response = llm.generate(state["analysis"])
    return {"final_response": response}

# Conditional routing
def route_after_analysis(state: WorkflowState) -> Literal["generate", "human_review"]:
    if state["needs_review"]:
        return "human_review"  # Pause for human approval
    return "generate"  # Continues automatically

# Builds the graph
builder = StateGraph(WorkflowState)
builder.add_node("search", search_node)
builder.add_node("analyze", analyze_node)
builder.add_node("generate", generate_node)

builder.add_edge(START, "search")
builder.add_edge("search", "analyze")
builder.add_conditional_edges("analyze", route_after_analysis)
builder.add_edge("generate", END)

# Compiles with checkpointing
graph = builder.compile(checkpointer=MemorySaver())

# Executes
result = graph.invoke(
    {"query": "AI impact on the job market 2025"},
    config={"configurable": {"thread_id": "session_123"}}
)
print(result["final_response"])`
        },
        body: 'LangGraph enables building complex workflows with shared state, conditional edges, and checkpointing.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'LangGraph vs Prefect vs traditional chains — each approach to workflows has trade-offs.',
        items: [
          '✅ LangGraph: support for loops/cycles (essential for agents), native checkpointing, integrated human-in-the-loop',
          '✅ Prefect: advanced scheduling, retry policies, rich observability, ideal for data workflows',
          '❌ LangGraph: steep learning curve, difficult debugging without tracing, still young community',
          '⚠️ Sequential chains (LangChain Expression Language): simple for linear chains, but without support for loops or real parallelism'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between LangGraph and Prefect for AI workflows?', answer: 'LangGraph is specialized in LLM workflows with native support for loops (essential for ReAct agents), human-in-the-loop via interrupt(), and automatic checkpointing. Prefect is a general-purpose orchestrator (data pipelines, ETL) with advanced scheduling, retry policies, and rich observability. Use LangGraph for LLM-centric workflows (agents, chains with decisions), Prefect for data workflows that include LLM as one step. Many systems use both: LangGraph for agent logic, Prefect for orchestration and scheduling.' },
          { question: 'How to implement human-in-the-loop in LangGraph?', answer: 'Use the interrupt() command in the node where human approval is needed. The workflow pauses, saves the checkpoint, and waits for an external call. To resume, call graph.invoke() with the same thread_id and the "resume" or "reject" command. Example: a "confirm_payment" node calls interrupt("Waiting for payment approval of $1,500"), an external system notifies the human via Slack, the human clicks "approve" which calls the resume API.' },
          { question: 'How does checkpointing work in LangGraph?', answer: 'At each node execution, LangGraph saves the complete state in a checkpoint. MemorySaver keeps it in memory (fast, volatile), SqliteSaver persists to disk (for production). Each checkpoint is identified by thread_id + step_number. You can: (1) list checkpoints of a thread, (2) revert to any previous checkpoint, (3) resume from a checkpoint after failure, (4) debug the state at each step. Checkpointing also enables "fork": creating a new execution from a checkpoint to test alternatives.' },
          { question: 'How to do parallel execution in LangGraph?', answer: 'Use Commands with Send() for parallel fan-out. Example: after fetching multiple documents, send each one to a parallel analysis node. Each Send(msg, destination) creates a separate execution of the analysis node. Use add_conditional_edges with the router function returning [Send("analyze", {"doc": doc}) for doc in documents]. For fan-in (aggregating results), use a state reducer that combines lists of partial results in the shared state.' },
          { question: 'How to debug workflows with multiple steps?', answer: 'LangSmith is the official tool: each execution generates a trace with all steps, latency per node, tokens consumed, and state at each checkpoint. For local debugging: (1) use verbose_mode=True during compilation, (2) inspect checkpoints with graph.get_state(thread_id), (3) use graph.get_state_history(thread_id) to see the evolution, (4) for reproducibility, fix LLM seeds. Recommended pattern: structured logs at each node (json), tracing with LangSmith, and Grafana alerts when the success rate drops below 95%.' }
        ]
      },
      {
        title: 'Real Scenario: Content Moderation Pipeline with Human Review',
        type: 'everyday-scenario',
        body: 'Your user-generated content (UGC) platform receives 100 thousand posts per day. You need to moderate each post before publishing: detect spam, inappropriate content, hate speech, and copyright violations. An LLM alone is not enough (false positives generate complaints), humans alone are slow and expensive. Workflows with LangGraph solve this: LLM automatically classifies 80% of posts (clear spam and safe content), the remaining 20% ambiguous ones go to human review with context from the LLM\'s decision.',
        items: [
          'Classify node: sends the post to GPT-4o-mini with classification schema (category, confidence, justification, flag for human review). If confidence > 0.95 and category is "safe" or "clear_spam", route directly to publish or reject without human review',
          'Post-classification conditional: confidence < 0.95 OR ambiguous category (doubtful_offensive_speech, doubtful_copyright) → route to human review. Confidence > 0.95 and safe or clear_spam category → direct route',
          'Human_review node: sends the post + LLM classification + justification to a human moderation queue (internal dashboard). Interrupt() pauses the workflow until the moderator decides: approve, reject, or request more information',
          'Notify node: after decision (automatic or human), sends notification to the post author with the result and instructions if rejected. Triggers Webhook for downstream systems (search indexing, feed, analytics)',
          'Learn node: posts that went to human review + the final decision are stored as a fine-tuning dataset. Every 10 thousand examples, fine-tuning is triggered to improve the classification model, gradually reducing the rate of posts needing human review',
          'Result: 80% of posts are moderated automatically in <2 seconds, 20% go to human review with average resolution of 3 minutes, false positive rate <0.5%, and each month the automation rate increases ~2% with continuous fine-tuning'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // NEW NODES — writer-agent (continued)
  // ═══════════════════════════════════════════════

  MultiAgentSystems: {
    summary:
      'Multi-Agent Systems (MAS) orchestrate multiple specialized agents that collaborate, debate, and solve complex problems. With frameworks like CrewAI, AutoGen, and Orion, you define roles (orchestrator, researcher, critic, executor) that work together — each with its own LLM, tools, and personality. The result: systems that solve tasks a single agent cannot, combining different perspectives and cross-validating results.',
    everydayExample:
      'Imagine a law firm with 5 specialists: a constitutional lawyer, a labor lawyer, a tax lawyer, a criminal lawyer, and a reviewer. Each one analyzes the case from their perspective, produces an opinion, and then everyone debates to reach a joint conclusion. Multi-Agent Systems is that: you define roles, each agent has its "background" (LLM + context), and they collaborate via messages. In engineering practice, MAS appears in: (1) code review: one agent writes, another reviews security, another reviews performance, (2) document analysis: one extracts data, another classifies, another validates, (3) research: one searches, another synthesizes, another critiques.',
    quickTip:
      'Start with CrewAI: define Agent(tools, llm, role) + Task(description, agent) + Process(sequential or hierarchical). For debates between agents, use AutoGen with GroupChat. Define specialized agents (not generalists): each with tools and context limited to their role. For production, monitor the number of conversation turns between agents — infinite loops are common. Consider an "orchestrator agent" that coordinates and a "validator agent" that checks outputs.',
    sections: [
      {
        title: 'What are Multi-Agent Systems?',
        type: 'overview',
        body: 'Multi-Agent Systems extend the concept of a single agent to multiple interacting agents. Unlike a monolithic agent that tries to do everything, MAS divides responsibility: each agent has a specific role (CEO, researcher, engineer, critic), its own LLM (can differ per agent), specific tools, and a "character prompt" that defines its personality. Communication between agents can be sequential (one after another), hierarchical (orchestrator delegates to specialists), or in a group (free debate). The big benefit is superior quality: multiple perspectives, cross-validation, and specialization. The big challenge is cost: each conversation turn between agents consumes LLM call tokens.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Specialized Agent: each agent has a role (e.g., "researcher"), tools (e.g., web search), and a configurable LLM — it does not do everything, it is an expert in its function',
          'Orchestrator (Supervisor): central agent that coordinates the others, decides who executes what, and consolidates results',
          'CrewAI: Python framework for MAS with declarative definition of agents, tasks, and processes (sequential, hierarchical)',
          'AutoGen: Microsoft framework for MAS, supports GroupChat with debate between agents and automatic handoff',
          'GroupChat: multiple agents converse in a group chat, each responds when relevant to their role',
          'Handoff: mechanism to pass control from one agent to another based on conversation context',
          'Reflection: critic agent that reviews and validates the outputs of other agents before final delivery',
          'Tool Sharing: agents can share tools (e.g., search, calculator) or have exclusive tools'
        ]
      },
      {
        title: 'How Agent Coordination Works',
        type: 'how-it-works',
        body: 'MAS coordination follows three main patterns. (1) Sequential: agent A executes, passes the result to B, which passes to C. Simple, predictable, but no interaction between steps. (2) Hierarchical: an orchestrator evaluates the task, decides which agent to call, evaluates the result, and decides the next step. More flexible, but depends on the orchestrator quality. (3) Debate/GroupChat: all agents converse in a shared chat, each contributing when relevant. More natural for problems requiring multiple perspectives, but more expensive (each message from each agent consumes tokens). The choice depends on the problem: linear tasks (sequential), tasks with delegatable sub-tasks (hierarchical), tasks requiring cross-validation (debate).'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of a Multi-Agent System.',
        items: [
          'Agent Registry: catalog of available agents with their capabilities, tools, and associated LLM',
          'Orchestrator: central coordinator that receives the task, plans execution, delegates to agents, and consolidates results',
          'Message Bus: messaging system between agents — can be pub/sub, queue, or group chat',
          'Context Store: shared storage of conversation state and partial results between agents',
          'Validator Agent: specialized agent that reviews and critiques the outputs of other agents before final delivery',
          'Memory Manager: manages the history of interactions between agents to avoid repetition and infinite loops'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from crewai import Agent, Task, Crew, Process

# Define specialized agents
researcher = Agent(
    role="AI Researcher",
    goal="Find accurate and current information about the topic",
    backstory="Research expert with web search access",
    tools=[search_tool],
    llm="gpt-4o-mini",
    verbose=True
)

analyst = Agent(
    role="Technical Analyst",
    goal="Analyze data and extract actionable insights",
    backstory="10 years of experience in AI systems analysis",
    llm="gpt-4o",
    verbose=True
)

writer = Agent(
    role="Technical Writer",
    goal="Produce clear and well-structured documentation",
    backstory="Specialist in technical communication",
    llm="gpt-4o-mini",
    verbose=True
)

# Define the tasks
research_task = Task(
    description="Research the AI trends for 2025",
    agent=researcher,
    expected_output="Report with 5 main trends and sources"
)

analysis_task = Task(
    description="Analyze the collected data and identify patterns",
    agent=analyst,
    expected_output="Analysis with 3-5 key insights"
)

writing_task = Task(
    description="Write a technical article based on the analysis",
    agent=writer,
    expected_output="1000-word article ready for publication"
)

# Create the crew with sequential execution
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,
    verbose=True
)

result = crew.kickoff()
print(f"Final result: {result}")`
        },
        body: 'CrewAI lets you define agents with specific roles and chained tasks in sequential or hierarchical processes.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Multi-Agent Systems vs Single Agent — when to use each approach.',
        items: [
          '✅ Superior quality: multiple perspectives and cross-validation reduce errors and hallucinations',
          '✅ Specialization: each agent focuses on what it does best, with tools and context specific to its role',
          '❌ High cost: each conversation turn between agents generates LLM calls — a simple MAS can cost 5-10x more than a single agent',
          '⚠️ Coordination complexity: infinite loops, circular responses, and conflicts between agents are common in production'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between CrewAI and AutoGen?', answer: 'CrewAI uses a declarative approach: you define agents, tasks, and the process (sequential/hierarchical). It is simpler to configure and understand. AutoGen is more flexible: it supports GroupChat with free debate, dynamic handoff between agents, and conversation-based orchestration. CrewAI is better for predictable workflows; AutoGen for scenarios requiring complex interaction between agents.' },
          { question: 'How to avoid infinite loops in MAS?', answer: 'Implement: (1) max_turns: limit on conversation turns between agents (e.g., 10), (2) timeout: maximum execution time (e.g., 5 min), (3) repetition detection: if an agent repeats the same message >2x, interrupt, (4) progress validation: every N turns, check if there was progress on the task. If not, switch to a fallback.' },
          { question: 'How to debug interactions between multiple agents?', answer: 'Use LangSmith or Langfuse for tracing: each LLM call from each agent is logged as a span, with the agent that generated it. For local debugging, enable verbose=True on each agent and inspect the log. Recommended pattern: each agent should log its decision (which tool it called, what result it got) in a structured format. Create an "agent transcript" that shows the entire conversation between agents for human review.' },
          { question: 'How to choose between sequential and hierarchical process?', answer: 'Sequential: when tasks have a fixed order (research → analyze → write). Hierarchical: when the orchestrator needs to dynamically decide which agent to call based on the previous result. Sequential is faster and more predictable; hierarchical is more flexible and adaptable. General rule: start with sequential, evolve to hierarchical when you need branching.' },
          { question: 'How to define each agent\'s prompts to avoid conflicts?', answer: 'Each agent needs: (1) clear role: "You are an AI researcher. Your function is to find accurate information." (2) boundary: "DO NOT try to analyze the data — that is the analyst\'s job." (3) collaboration: "If you need additional data, request it from the researcher." (4) output format: specific format so the next agent can easily consume it. Avoid generic prompts like "do your best" — be specific about what each agent should and should NOT do.' }
        ]
      },
      {
        title: 'Real Scenario: Multi-Agent System for Market Analysis',
        type: 'everyday-scenario',
        body: 'Your investment fund wants a system that analyzes companies automatically: collect financial data, analyze market trends, assess risks, and produce investment reports. Each step requires different expertise. A single agent does everything superficially; with MAS, you create specialized agents that collaborate for deep and validated analysis.',
        items: [
          'Data Collector Agent: accesses financial APIs (Yahoo Finance, SEC EDGAR), downloads financial statements, income statements, balance sheets, and recent news. Tools: web_search, yfinance, sec_api. Output: structured dataset with raw data',
          'Financial Analyst Agent: processes raw data, calculates multiples (P/E, EV/EBITDA, ROE), analyzes historical trends, and identifies patterns. LLM: gpt-4o (needs numerical reasoning). Output: fundamental analysis report',
          'Risk Analyst Agent: assesses risks: revenue concentration, currency exposure, regulatory risks, litigation, and ESG risks. Tools: web_search (news), regulatory_database. Output: risk matrix with probability and impact',
          'Report Writer Agent: receives the financial and risk analyses, and produces a cohesive investment report in a standardized format (executive summary, detailed analysis, recommendation, risks). LLM: gpt-4o-mini. Output: final report in markdown',
          'Reviewer/Validator Agent: reviews the final report: checks numerical consistency (do the sums add up?), verifies sources, identifies contradictions between financial and risk analysis, and suggests corrections before final delivery',
          'Result: each company is analyzed in 5 minutes vs 8 human hours, with 95% accuracy in recommendations (compared to human analysis), and the system covers 200 companies/day — something impossible for a human team'
        ]
      }
    ]
  },


  FunctionCalling: {
    summary:
      'Function Calling (Tool Use) is the native ability of LLMs to declare calls to external tools during generation. Instead of only generating text, the model can return a structured request: "call the function get_weather(location="São Paulo")". This allows LLMs to fetch real-time data, execute actions in external systems, and compose results from multiple sources. OpenAI, Anthropic, and Google implement variations of the standard.',
    everydayExample:
      'Imagine a call center agent who, during a call, can look up the order system, check inventory, and update the customer record — all while conversing. Function Calling is that: the LLM "talks" with the user and, when it needs data or wants to perform an action, it "pauses" the conversation, calls a function, receives the result, and continues. In engineering practice, this appears when you use an AI assistant that responds "the status of your order #12345 is: in transit" — behind the scenes, the LLM called get_order_status("12345"), received the status, and incorporated it into the response.',
    quickTip:
      'Define tools with clear JSON schemas and detailed descriptions for each parameter. Use `tool_choice: "required"` to force the model to always call a tool. For parallelism, most providers support multiple tool calls in a single response. Monitor the % of successful tool calls vs schema errors. In production, implement parameter validation BEFORE executing the tool — LLMs can invent parameters.',
    sections: [
      {
        title: 'What is Function Calling?',
        type: 'overview',
        body: 'Function Calling is the mechanism by which the LLM, instead of generating free text, decides it needs to call an external function and returns a structured request containing the function name and parameters. The system then executes the function (fetch data, write to DB, call API) and returns the result to the LLM, which incorporates it into the final response. This differs from MCP: Function Calling is the native mechanism of the LLM API (transport level), while MCP is a standardized protocol built on top of that mechanism. All major providers (OpenAI, Anthropic, Google, Mistral) implement Function Calling with small variations in format. The trend is convergence toward the MCP standard.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Tool Definition: JSON schema that describes the function — name, description, parameters (type, required, description), and examples',
          'Tool Choice: parameter that controls whether the LLM MUST call a tool (required), MAY call (auto), or NEVER call (none)',
          'Parallel Tool Calls: a single response can contain multiple tool calls executed in parallel (since 2024)',
          'Tool Response: the result of function execution is returned to the LLM as a "tool" message to continue generation',
          'Streaming with Tools: tools can be announced during streaming, allowing real-time decisions without waiting for the complete response',
          'Fallback Tools: when a tool fails, an alternative tool can be called automatically by the system',
          'Tool Registry: centralized catalog of available tools, with versioning and schema validation',
          'Structured Outputs + Tools: combine function calling with response_format so the tool output is validated against a Pydantic schema'
        ]
      },
      {
        title: 'How the Tool Calling Cycle Works',
        type: 'how-it-works',
        body: 'The complete Function Calling cycle has 4 steps. (1) Definition: the system passes the list of available tools to the LLM along with the user message. (2) Decision: the LLM analyzes the message and decides if any tool can help. If so, it returns a "tool_call" object with the function name and parameters extracted from the conversation. (3) Execution: the system receives the tool_call, validates the parameters, executes the function (e.g., API call, SQL query), and returns the result to the LLM as a "tool" message. (4) Integration: the LLM receives the tool result and generates the final response to the user, incorporating the obtained data. The cycle can repeat: the LLM can call multiple tools sequentially, where the result of one tool feeds the decision to call the next.'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of a Function Calling system.',
        items: [
          'Tool Registry: centralized catalog of all available functions with JSON schemas, version, and authentication metadata',
          'Tool Router: receives the tool_call from the LLM, validates parameters against the schema, and routes to the correct executor',
          'Tool Executor: executes the function (API call, DB query, command) with timeout, retry, and logging',
          'Validator: validates parameters before execution — LLMs can invent values or pass wrong types',
          'Response Handler: receives the execution result and formats it for the LLM to consume (can truncate large results)',
          'Fallback Manager: if execution fails, decides whether to retry, call an alternative tool, or inform the LLM'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from openai import OpenAI
import json

client = OpenAI()

# Define available tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Gets the current temperature of a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City name, e.g.: São Paulo, SP"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "default": "celsius"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_air_quality",
            "description": "Gets the air quality of a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    }
]

messages = [{"role": "user", "content": "How is the weather and air quality in São Paulo?"}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# Process tool calls (can be parallel)
for tool_call in response.choices[0].message.tool_calls:
    if tool_call.function.name == "get_weather":
        args = json.loads(tool_call.function.arguments)
        result = get_weather(args["location"])
    elif tool_call.function.name == "get_air_quality":
        args = json.loads(tool_call.function.arguments)
        result = get_air_quality(args["location"])
    # Return result to the LLM
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": json.dumps(result)
    })

# LLM generates final response with the results
final = client.chat.completions.create(
    model="gpt-4o", messages=messages
)
print(final.choices[0].message.content)`
        },
        body: 'Function Calling allows LLMs to call external tools during generation, integrating real-time data into the response.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Function Calling vs alternative approaches for tool integration.',
        items: [
          '✅ Native in all major providers: OpenAI, Anthropic, Google, Mistral — no extra frameworks needed',
          '✅ Parallel call support: the LLM can call multiple tools in a single response, reducing latency',
          '❌ Schemas can be complex: defining nested parameters or complex validations requires large JSON schemas',
          '⚠️ LLMs can invent parameters: server-side validation is essential — never blindly trust the arguments',
          '⚠️ Cost: tool calls consume additional tokens (schemas are sent in every request)'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between Function Calling and MCP?', answer: 'Function Calling is the native mechanism of the LLM API (OpenAI, Anthropic) that allows the model to declare function calls. MCP (Model Context Protocol) is a standardized protocol built on top of this mechanism, defining how tools are discovered, authenticated, and invoked consistently across different LLMs. Function Calling = transport level, MCP = protocol level. MCP uses Function Calling internally but adds a standardization layer.' },
          { question: 'How to implement parameter validation in tool calls?', answer: 'Never trust the arguments the LLM returns — LLMs can invent values, ignore formats, or pass wrong types. Implement: (1) schema validation with Pydantic/Zod before executing the function, (2) parameter sanitization (escaping, size limits), (3) timeout per tool call (e.g., 10s), (4) if parameters are invalid, return a descriptive error to the LLM so it can correct them.' },
          { question: 'How to do tool calls in streaming?', answer: 'During streaming, the LLM can announce tool calls before completing the response. When a delta contains tool_calls, the system must collect the fragments until it has the complete tool_call, execute the function, and send the result. The final response will be generated after receiving all results. Streaming support with tools varies by provider: OpenAI supports it, Anthropic has partial support, Google supports it.' },
          { question: 'How to handle tool schema growth?', answer: 'With many tools (20+), the schema can consume thousands of tokens per request. Solutions: (1) group related tools into a "super-tool" with a discriminator parameter, (2) use tool_choice to force only the relevant tool, (3) implement "tool discovery": first the LLM chooses a tool category, then sees the specific tools in that category, (4) consider separate MCP servers by domain.' },
          { question: 'How to test tool calls in development?', answer: 'Use mocks for all tools: instead of calling real APIs, return synthetic data. Create unit tests that verify: (1) the LLM chooses the right tool for each input, (2) the extracted parameters are correct, (3) error handling works (tool fails, tool returns empty, tool is slow). Use a golden dataset with pairs (input, expected_tool, expected_params).' }
        ]
      },
      {
        title: 'Real Scenario: Technical Support Assistant with Multiple Tools',
        type: 'everyday-scenario',
        body: 'Your SaaS company has a support assistant that needs to access 15 different tools: look up customer, check service status, query knowledge base, create ticket, update plan, etc. Function Calling lets the LLM dynamically decide which tools to call based on the user question. The challenge is not implementing the tools — it is ensuring the LLM chooses the right tool, with the right parameters, and handles errors appropriately.',
        items: [
          'Define each tool with a detailed JSON schema: descriptive name ("get_customer_by_email"), clear description ("Looks up customer data by email. Use when the user provides the email."), and parameters with examples ("email": "joao@empresa.com"). The better the description, the better the choice precision',
          'Implement double validation: (1) Pydantic/Zod validates the parameters before executing the function, (2) business logic validates whether the action is allowed (e.g., can the user cancel the plan?). If it fails, return a descriptive error to the LLM so it can retry with corrected parameters',
          'Configure tool_choice="auto" (lets the LLM decide whether to call or not). For critical flows (e.g., create ticket), force tool_choice with "required" to ensure the tool is always called',
          'Add structured logging for each tool_call: tool name, params, status (success/error), latency, and result (truncated). Use LangSmith for tracing and debugging',
          'Implement rate limiting per tool: query tools (rate: 100/min), write tools (rate: 10/min). If the rate is exceeded, return "rate_limit_exceeded" to the LLM, which can retry after waiting',
          'Result: 92% of tool calls succeed on the first attempt, average ticket resolution time dropped from 15min to 3min, and the error rate due to invalid parameters is <1% thanks to double validation'
        ]
      }
    ]
  },


  HybridSearch: {
    summary:
      'Hybrid Search combines semantic vector search with lexical keyword search (BM25) to obtain more precise results than any isolated approach. Using RRF (Reciprocal Rank Fusion) to combine rankings, alpha calibration to balance weights, and cross-encoder re-ranking to refine results, it is the backbone of RAG systems that need to find information with high precision — for both natural language and exact technical terms.',
    everydayExample:
      'Imagine a library with two search systems: a librarian who understands the meaning of words (semantic search) and an indexer who finds exact words (lexical search). If you ask "books about dogs", the librarian finds books about canines (synonyms), but the indexer only finds the exact "dogs". If you search for "XPTO-123 manual", the indexer finds the exact term, but the librarian may get confused. Hybrid Search uses BOTH and combines the results. In engineering practice, this appears in technical documentation search systems: the user asks "how do I deploy with Docker?" (semantic search) or "error E-1234 on startup" (lexical search). Without hybrid search, one of the two search types fails.',
    quickTip:
      'Use RRF (Reciprocal Rank Fusion) with k=60 to combine rankings. The alpha between vector and BM25 depends on your data: start with 0.5 and adjust based on results. For technical terms, IDs, codes — increase BM25 weight (alpha=0.3). For open-ended questions — increase vector weight (alpha=0.7). Qdrant and Elasticsearch have native hybrid search support. Always add cross-encoder re-ranking as the final step.',
    sections: [
      {
        title: 'What is Hybrid Search?',
        type: 'overview',
        body: 'Hybrid Search solves the fundamental limitation of each isolated approach. Semantic search (embeddings): understands synonyms and context ("car" ≈ "automobile"), but fails on rare terms, acronyms, IDs, and exact matches. Lexical search (BM25): finds exact terms ("XPTO-123", "error E-343"), but ignores synonyms and context. Hybrid Search combines both using RRF (Reciprocal Rank Fusion): each result receives a combined score based on its position in each method\'s ranking. The result: superior precision across a wide range of queries — from natural language questions to searches for exact technical terms.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'BM25: lexical search algorithm that ranks documents by term frequency (evolved TF-IDF), with saturation adjustment (k1) and length normalization (b)',
          'RRF (Reciprocal Rank Fusion): formula to combine rankings: score = 1/(k + rank_vector) + 1/(k + rank_bm25) — default k = 60',
          'Embedding Search: cosine similarity search between embedding vectors — captures semantics, synonyms, and context',
          'Alpha Calibration: parameter (0-1) that controls the relative weight between vector and lexical search in the combined result',
          'Cross-Encoder Re-ranking: model that processes query + document TOGETHER to evaluate real relevance, reordering the Top-K',
          'HNSW Index: Hierarchical Navigable Small World — ANN approximation algorithm for fast vector search across millions of vectors',
          'Metadata Filtering: pre-filtering by metadata (date, author, category) before the hybrid search',
          'Query Transformation: expand/enrich the query before searching (e.g., HyDE, synonym expansion)'
        ]
      },
      {
        title: 'How RRF Fusion Works',
        type: 'how-it-works',
        body: 'RRF (Reciprocal Rank Fusion) is the most used algorithm to combine multiple rankings. The formula is simple: for each document present in any ranking, the RRF score = Σ 1/(k + rank_i(d)), where rank_i(d) is the position of document d in ranking i, and k is a constant (typically 60) that controls the impact of high positions. This means: a document that appears 1st in the vector ranking (score = 1/61) and 5th in the BM25 ranking (score = 1/65) will have RRF score = 1/61 + 1/65 ≈ 0.032. Documents that appear in only one ranking have a lower score. The result is that documents relevant to BOTH methods are prioritized, but documents highly relevant in just one method are still considered.'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of a Hybrid Search system.',
        items: [
          'Vector Index: stores embeddings for semantic similarity search (HNSW, IVF, or brute force)',
          'Lexical Index (BM25): inverted index for exact term search with BM25 ranking (Elasticsearch, Qdrant)',
          'Hybrid Fuser (RRF): combines both rankings using RRF with configurable k, optional score normalization',
          'Query Analyzer: classifies the query as "semantic", "lexical", or "hybrid" and adjusts alpha dynamically',
          'Re-ranker (Cross-Encoder): re-ranking model (BGE-reranker, Cohere) that reorders the combined Top-50',
          'Metadata Filter: applies filters (date, category, author, permission) before or after the search'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from qdrant_client import QdrantClient
from qdrant_client.http.models import HybridParams
import numpy as np

client = QdrantClient("localhost", port=6333)

# Hybrid query: vector + BM25
query_text = "How to deploy with Docker on AWS?"
query_vector = embedding_model.encode(query_text)

results = client.search(
    collection_name="tech_docs",
    query_vector=query_vector,
    query_text=query_text,          # automatic BM25
    limit=20,                        # Top-20 combined
    with_payload=True,
    search_params=HybridParams(
        alpha=0.6,                   # 60% vector, 40% BM25
        fusion="rrf",               # RRF fusion
        rrf_k=60                     # RRF k constant
    )
)

# Re-ranking with cross-encoder
from sentence_transformers import CrossEncoder
reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")

# Prepare query-document pairs for re-ranking
pairs = [(query_text, hit.payload["text"]) for hit in results]
scores = reranker.predict(pairs)

# Reorder by cross-encoder score
ranked = sorted(
    zip(results, scores),
    key=lambda x: x[1],
    reverse=True
)

for hit, score in ranked[:5]:
    print(f"Score: {score:.4f} | {hit.payload['text'][:80]}...")`
        },
        body: 'Hybrid Search combines vector search (semantic) with BM25 (lexical) via RRF, followed by cross-encoder re-ranking.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Hybrid Search vs pure vector or pure BM25 — when each one shines.',
        items: [
          '✅ Hybrid Search: best overall precision — works well for both natural language and technical terms',
          '✅ Pure BM25: fast and effective for searches with rare terms, IDs, codes — no GPU needed for embeddings',
          '❌ Hybrid Search costs more: requires dual indexing (vector + lexical), more storage, and cross-encoder re-ranking',
          '⚠️ Alpha calibration is sensitive: the ideal weight between vector and BM25 varies by domain and query type'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What is the difference between Hybrid Search and traditional RAG?', answer: 'RAG is the complete pipeline (retrieve → augment → generate). Hybrid Search is the search strategy WITHIN RAG — specifically how to combine vector and lexical search. RAG can use only vector search, only lexical search, or hybrid search. Hybrid Search improves the retrieval step of RAG, but RAG also includes chunking, embedding, augmentation, and generation.' },
          { question: 'How to calibrate alpha between vector and BM25?', answer: 'Use a golden dataset of queries with expected results. Test different alpha values (0.1 to 0.9 in 0.1 steps) and measure NDCG@10 or MAP. For data with many technical terms (code, IDs), alpha tends toward 0.3-0.4. For natural language data (articles, docs), alpha tends toward 0.6-0.7. Consider dynamic alpha: analyze the query and adjust alpha based on the presence of technical terms vs natural language.' },
          { question: 'What is the role of k in RRF?', answer: 'The k parameter in RRF controls how much high positions in the ranking are rewarded. Low k (10-30): documents at the top of the ranking dominate, lower results have little impact. High k (60-100): more uniform distribution, documents in middle positions still contribute significantly. The default value is 60, which works well for most cases. Adjust k based on how many relevant results you expect to find.' },
          { question: 'How to implement hybrid search with metadata filters?', answer: 'Apply filters BEFORE the search to reduce the search space. E.g.: "search only engineering department documents published after 2024". Implement: (1) filters are applied to the index, reducing the candidate set, (2) hybrid search runs only on the filtered candidates, (3) re-ranking with cross-encoder refines results. Benefit: pre-filtering reduces workload and improves precision.' },
          { question: 'When NOT to use hybrid search?', answer: 'Avoid hybrid search when: (1) All your terms are unique and without synonyms (e.g., product catalog with unique codes) — pure BM25 is sufficient. (2) Your data is purely semantic without technical terms — pure vector search is enough. (3) You have severe infrastructure cost constraints (two indexes, GPU for cross-encoder). (4) Your maximum latency is <100ms (hybrid + re-ranking adds 50-200ms).' }
        ]
      },
      {
        title: 'Real Scenario: Hybrid Search in Technical Documentation',
        type: 'everyday-scenario',
        body: 'Your technical documentation platform has 50 thousand articles mixing conceptual guides (natural language), API references (technical terms), and code tutorials. Users search for both "how to implement JWT authentication" (semantic) and "error E-1234 api-rate-limit" (lexical). Pure vector search fails on technical terms; pure BM25 fails on natural language. Hybrid Search with dynamic alpha solves both with high precision.',
        items: [
          'Implement dual index in Qdrant: embedding vector (text-embedding-3-small, 1536 dims) + automatic BM25 index. Configure collection with "hybrid" mode and HNSW index for fast vector search',
          'Implement Query Analyzer: use a fast classifier (regex + lightweight LLM) to detect if the query contains technical terms (error codes, IDs, function names, commands). If yes, alpha=0.3 (favors BM25). If natural language, alpha=0.7 (favors vector)',
          'Configure RRF with k=60 and search Top-50 combined. After RRF, re-rank the 50 with cross-encoder BGE-reranker-v2-m3 (GPU, ~50ms for 50 pairs). Return Top-10 after re-ranking',
          'Add pre-search metadata filtering: by product version (v2, v3), by doc type (guide, API, tutorial), by programming language. Filters reduce the search space by 60%',
          'Implement "did you mean?" for queries with zero results: detect low-frequency terms in BM25 and suggest corrections (Levenshtein distance, word embeddings)',
          'Result: NDCG@10 of 0.89 (vs 0.72 pure vector, vs 0.68 pure BM25), P95 latency of 180ms (including re-ranking), and 94% of users find what they need on the first search'
        ]
      }
    ]
  },


  ObservabilityAI: {
    summary:
      'Observability for AI is the set of tools and practices for monitoring, tracing, debugging, and optimizing AI systems in production. With LangSmith, Langfuse, and Phoenix, you capture every LLM call, every tool call, every workflow step — measuring latency, cost, quality, and behavior. Essential when your system moves from prototype (it works) to production (it needs to work reliably, with predictable cost and measurable quality).',
    everydayExample:
      'Imagine your car has 50 sensors that measure engine temperature, tire pressure, fuel level, etc. Without these sensors, you drive in the dark — the car could be overheating and you only find out when the warning light comes on (or when the engine blows). ObservabilityAI is the sensor system for your AI: each LLM call becomes an "event" with metrics on latency, tokens, cost, and response quality. In engineering practice, you discover that a specific prompt is costing $500/day because it generated 4000-token responses, or that a model is hallucinating on Portuguese queries, or that P95 latency is at 8s because a specific provider is slow.',
    quickTip:
      'Implement tracing on DAY ONE of development, not later. Use LangSmith (LangChain), Langfuse (open-source), or Phoenix (Arize). Capture: model, prompt, response, latency, tokens (input+output), estimated cost, and user feedback (like/dislike). Create dashboards for: latency P50/P95/P99, error rate by model, cost per user/feature, and quality drift over time. Alert when daily cost exceeds 2x the average or when the negative feedback rate exceeds 10%.',
    sections: [
      {
        title: 'What is Observability for AI?',
        type: 'overview',
        body: 'Observability for AI (also called LLM Observability, AI Monitoring) is the practice of instrumenting systems that use LLMs to capture metrics, traces, logs, and feedback. Unlike traditional monitoring (which focuses on infrastructure: CPU, memory, latency), AI observability focuses on: (1) Quality: is the response correct? Did the LLM hallucinate? (2) Behavior: did the model follow instructions? Did it call the right tools? (3) Cost: how many tokens per request? What is the cost per user? (4) Security: was there a prompt injection attempt? Did sensitive data leak? Tools like LangSmith, Langfuse, and Phoenix capture all of this in structured traces that allow debugging complex multi-step AI systems.'
      },
      {
        title: 'Essential Concepts',
        type: 'key-concepts',
        items: [
          'Trace: complete record of a request — from user input to final response, including all LLM calls, tools, and intermediate decisions',
          'Span: individual unit within a trace — an LLM call, a tool call, a decision. Each span has: start_time, end_time, input, output, tokens, cost',
          'LangSmith: LangChain\'s platform for tracing, debugging, evaluation, and LLM testing — market leader, native integration with LangChain',
          'Langfuse: open-source alternative focused on tracing, analytics, and user feedback — self-hosted or cloud',
          'Phoenix (Arize): open-source platform from Arize AI for LLM observability focused on drift detection and hallucination detection',
          'Feedback Scoring: evaluation of response quality (thumbs up/down, rating 1-5, or LLM-as-a-Judge evaluation)',
          'Cost Tracking: calculation of cost per call based on model, input/output tokens, and price per token',
          'Drift Detection: monitoring changes in model behavior over time (quality, latency, cost, topics)'
        ]
      },
      {
        title: 'How LLM Tracing Works',
        type: 'how-it-works',
        body: 'Tracing captures the entire journey of a request: (1) Input: user message + metadata (user_id, feature, version). (2) Workflow: if using LangGraph, each graph step becomes a span — decisions, tool calls, LLM calls. (3) LLM Call: model used, prompt (system + user + history), response, tokens (input + output), latency, cost. (4) Tool Calls: tool name, parameters, result, status (success/error). (5) Output: final response, user feedback, quality score. Everything is connected via a unique trace_id, allowing debugging of complex problems: "why did user X receive a bad response?" → look at the trace → "the LLM called the wrong tool because the schema was outdated".'
      },
      {
        title: 'Architecture',
        type: 'architecture',
        body: 'Components of an ObservabilityAI system.',
        items: [
          'Tracer (SDK): library that instruments code and sends spans to the backend — LangChain has native integration, for custom code use OpenTelemetry',
          'Trace Backend: stores and indexes traces for fast querying — LangSmith cloud, Langfuse self-hosted, or OpenTelemetry Collector + Jaeger',
          'Dashboard: aggregated metrics visualization — latency, cost, errors, feedback, drift. Grafana + Prometheus for infrastructure metrics',
          'Evaluator: automatic evaluation pipeline — LLM-as-a-Judge that evaluates each response for quality, safety, and context adherence',
          'Alert System: configurable alerts: daily cost above limit, P95 latency >5s, negative feedback rate >10%, drift detected in model behavior',
          'Feedback Collector: collects explicit user feedback (thumbs, rating) and implicit feedback (re-clicks, abandonment)'
        ]
      },
      {
        title: 'Code Example',
        type: 'code-example',
        code: {
          language: 'python',
          source: `from langsmith import Client
from langchain_openai import ChatOpenAI
from langchain.callbacks import LangSmithCallbackHandler

# Configure LangSmith
client = Client()
tracer = LangSmithCallbackHandler(
    project_name="support-bot-v2",
    metadata={"environment": "production", "version": "2.3.1"}
)

# LLM with automatic tracing
llm = ChatOpenAI(
    model="gpt-4o-mini",
    callbacks=[tracer],
    temperature=0,
    tags=["customer-support", "production"]
)

# Each call generates an automatic trace
response = llm.invoke(
    "Explain the return policy to customer John",
    metadata={"user_id": "joao123", "ticket_id": "TKT-456"}
)

print(f"Trace: {tracer.trace_url}")
# Opens the full trace in LangSmith: prompt, response,
# tokens, latency, cost, and metadata

# Post-hoc evaluation
client.create_feedback(
    run_id=tracer.run_id,
    key="quality",
    score=0.95,  # 0-1
    comment="Correct response and within policy"
)`
        },
        body: 'LangSmith automatically captures traces with metadata, enabling debugging and evaluation of each LLM call in production.'
      },
      {
        title: 'Trade-offs',
        type: 'pros-cons',
        body: 'Each observability platform has specific trade-offs.',
        items: [
          '✅ LangSmith: native integration with LangChain/LangGraph, market leader, automatic tracing without boilerplate code',
          '✅ Langfuse: open-source, self-hosted (data does not leave the company), predictable cost, integrated user feedback',
          '❌ LangSmith: cloud only (data goes to LangChain servers), event-based cost, can get expensive at scale',
          '⚠️ Phoenix: open-source but less mature than LangSmith, better for drift detection but more limited tracing'
        ]
      },
      {
        title: 'Interview Questions',
        type: 'qa-list',
        qa: [
          { question: 'What metrics are essential for monitoring LLMs in production?', answer: 'Essential metrics: (1) Latency: TTFT (Time to First Token) and TBT (Time Between Tokens) — P50/P95/P99, (2) Tokens: input tokens, output tokens, and total per request, (3) Cost: cost per request, per user, per feature, and daily total, (4) Errors: error rate by model, by tool call, by provider, (5) Quality: average feedback score, hallucination rate, retry rate, (6) Behavior: % of tool calls, distribution of used models, topic drift.' },
          { question: 'How to detect hallucinations in production?', answer: 'Techniques: (1) LLM-as-a-Judge: a second LLM evaluates the response against the provided context — "is the response grounded in the context?" (2) Factual verification: extract claims from the response and verify against data source, (3) Consistency check: generate multiple responses to the same question and measure consistency, (4) Confidence scoring: monitor the perplexity/logprob of the response — responses with high perplexity are more likely to hallucinate. No single technique is 100% accurate — use a combination.' },
          { question: 'How to estimate LLM costs in production before scaling?', answer: 'Use the formula: daily_cost = reqs_per_day × (input_tokens × input_price + output_tokens × output_price) / 1M. To estimate: measure average input and output tokens for your use case with a pilot. Ex: GPT-4o-mini: input $0.15/1M tokens, output $0.60/1M. If each request uses 2K input + 500 output tokens and you do 100K reqs/day: cost = 100K × (2000×0.15 + 500×0.60) / 1M = 100K × (0.30 + 0.30) / 1M = $60/day. Add 20% for testing and retries.' },
          { question: 'How to configure alerts for model drift?', answer: 'Monitor: (1) Input drift: did the topic distribution of questions change? (compare query embeddings with baseline), (2) Output drift: did the distribution of sentiment, categories, or response length change? (3) Performance drift: did accuracy on golden dataset drop? (4) Feedback drift: did negative feedback rate increase >20%? Configure alerts in Grafana: "negative_feedback_7d_rolling > mean_30d + 2*stddev" triggers alert.' },
          { question: 'How to implement user feedback in AI systems?', answer: 'Capture feedback at three levels: (1) Explicit: thumbs up/down after each response, 1-5 star rating, and optional comment field. (2) Implicit: did the user edit the response? copy it? ask a similar follow-up? abandon the conversation? (3) Automatic: LLM-as-a-Judge evaluates each response for quality, safety, and adherence. Explicit feedback has low rate (~2% of users rate), but is the most reliable. Implicit feedback has higher coverage (~40%) but is less precise.' }
        ]
      },
      {
        title: 'Real Scenario: Debugging an AI System with LangSmith',
        type: 'everyday-scenario',
        body: 'Your support chatbot started giving strange responses — human agents report that the bot is recommending wrong products and ignoring return policies. Without observability, you would have to reproduce the problem manually. With LangSmith, you check the traces from the last 30 minutes, discover the root cause in 5 minutes, and revert the problematic change.',
        items: [
          'Check the traces dashboard in LangSmith: filter by last 30 min, feedback score < 0.5, and environment=production. Identify 47 low quality traces — concentrated in a specific prompt template',
          'Open a low feedback trace: see the full prompt — the system prompt is asking "answer creatively" (wrong template version). Compare with a high quality trace: the correct system prompt asks "answer based only on context"',
          'Identify the root cause: the deploy of prompt template version 2.4 overwrote the system prompt with a development version (temperature=0.9, no context constraint). The change was made 45 minutes ago and affected ~300 requests',
          'Revert the prompt to version 2.3 (the last stable one) using the prompt registry. In 2 minutes, all new traces already show the correct prompt and feedback score returns to >0.9',
          'Configure alert: "if average feedback score drops below 0.7 in any 5-minute window, notify the team on Slack". This would detect the problem in real-time next time',
          'Document the incident: add a test case to the golden dataset that covers this scenario (prompt with high temperature + no context constraint → bad response), preventing the same change from passing CI/CD again'
        ]
      }
    ]
  },
}


