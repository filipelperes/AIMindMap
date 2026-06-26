import type { NodeContent } from '../../types/mindmap'

export const categoryNodes: Record<string, NodeContent> = {

  // ═══════════════════════════════════════════════
  // 9. EVALUATION & TESTING
  // ═══════════════════════════════════════════════
  EvalTesting: {
    summary:
      'Evaluation-Driven Development (EDD) is the practice of defining metrics and tests before implementing AI systems. Unlike traditional software (where behavior is deterministic), LLMs require statistical evaluation across multiple dimensions: accuracy, relevance, faithfulness, safety, and consistency.',
    everydayExample:
      'Evaluating an LLM is like judging a cooking competition: it is not enough to say "it tastes good" (subjective score). You need objective criteria: (1) Was the recipe followed? (faithfulness), (2) Are the ingredients relevant? (relevance), (3) Is the dish safe? (safety), (4) Is the flavor consistent? (consistency). Each judge (metric) gives a score, and the average decides the winner. In the daily life of an AI engineer: you change the prompt from "answer in Portuguese" to "answer in formal Portuguese". How do you know if it improved? You have a golden dataset of 100 questions with ideal answers. You run eval before and after. If the faithfulness rate went from 85% to 92%, the change is positive. If latency increased 2x, maybe it is not worth it. Without metrics, you are "guessing" — with metrics, you are "knowing".',
    quickTip: 'Create a golden dataset with 50-200 examples of questions + ideal answers. Test every prompt/model change against this dataset. Use LLM-as-a-judge (G-Eval) for automatic evaluation. Monitor drift: if quality drops 5% in 1 week, investigate. For production: implement continuous eval (always running against a subset of real traffic). Use periodic "human eval" to calibrate your automatic metrics. Have automated "red teaming" to test safety and jailbreaks. Version eval results to track regressions.',
    sections: [
      {
        title: 'Evaluation Metrics',
        type: 'key-concepts',
        items: [
          'Faithfulness: is the answer faithful to the provided context? (did not invent anything?)',
          'Relevance: is the answer relevant to the question?',
          'G-Eval: LLM-as-a-judge — uses GPT-4 to evaluate on a Likert scale (1-5)',
          'BLEU/ROUGE/BERTScore: similarity with reference answer',
          'Hallucination Rate: % of answers with information not present in the context',
          'Context Precision: % of the context that was actually used in the answer',
          'Human Eval: human annotators evaluate (gold standard)',
          'Red Teaming: adversarial tests to break the system',
          'Toxicity Score: automatic detector of toxic content',
          'Consistency Score: does the same question produce consistent answers?'
        ]
      },
      {
        title: 'Evaluation Problems',
        type: 'qa-list',
        qa: [
          { question: 'Model passes one fairness metric but fails another. How to handle?', answer: 'Fairness metrics can conflict (e.g., equality of opportunity vs equality of outcome). Choose metrics based on error impact: which type of bias causes the most harm in your context?' },
          { question: 'Model was fair at deploy time, but became biased 6 months later. How to monitor?', answer: 'Monitor score distribution by demographic group continuously. Set alerts when fairness metrics change >5%. Re-train or re-calibrate periodically.' },
          { question: 'External auditor cannot reproduce results. How to ensure reproducibility?', answer: 'Version: model, prompts, parameters (temperature), test dataset, seed. Document the evaluation pipeline. Provide a reproducible notebook. Use checksums.' },
          { question: 'How to structure red teaming for a chatbot?', answer: 'Create attack categories: prompt injection, jailbreaks, data extraction, toxicity, sensitive topics. For each category, 20-50 tests. Automate with LLM red teamer. Iterate: test → fix → re-test.' },
          { question: 'LLM-as-a-judge is biased toward the model. How to mitigate?', answer: 'Use a different model as judge (e.g., GPT-4 evaluates Claude, Claude evaluates Gemini). Calibrate the judge with human examples. Use multiple judges and vote. Test the judge itself: what is its agreement with humans (Cohen Kappa)?' },
          { question: 'How to evaluate responses in multiple languages?', answer: 'Use multilingual judges or translate to English before evaluating. Have test datasets per language. Monitor metrics separately by language. Models can perform very differently in each language.' }
        ]
      },
      {
        title: 'Daily Example: Eval as a Civil Service Exam',
        type: 'analogy',
        body: 'Evaluating an LLM is like grading civil service exams. You do not ask "is the candidate good?" — you apply objective criteria: (1) Is the answer correct? (accuracy), (2) Did the candidate use only permitted material? (faithfulness), (3) Is the answer relevant to the question? (relevance), (4) Was the candidate respectful? (safety), (5) Is the answer in the required format? (format compliance). Each criterion becomes a score (1-5), and the weighted average decides whether the change is approved. Your golden dataset is the "previous exams" — questions with known ideal answers. Each system change (new prompt, new model) is like a new candidate taking the same exam. You compare scores against the previous version. If the faithfulness score dropped from 4.5 to 3.0, the new prompt may be encouraging the model to "invent" information. Without this evaluation system, you are deploying changes in the dark — without knowing whether you improved or worsened the user experience. Eval is not a cost, it is an accelerator: teams with mature eval iterate 3x faster because each change is validated in minutes, not in days.'
      },
      {
        title: 'Real Scenario: Eval Pipeline Caught a Regression in Production',
        type: 'everyday-scenario',
        body: 'A developer changed the prompt of the product recommendation system: changed "based on items in the cart" to "considering user history". It seemed like an innocent improvement. But the automated eval pipeline — which runs on every deploy against a golden dataset of 500 examples — detected that the faithfulness rate dropped from 94% to 71%. The system was now recommending products based on past conversations, ignoring the current cart. The deploy was automatically blocked, and the team investigated the cause before it affected real users.',
        items: [
          'Set up a CI/CD pipeline that runs full eval on every prompt push: golden dataset → generates answers → calculates metrics (faithfulness, relevance, safety) → compares with baseline',
          'Define regression thresholds: if any metric drops >3% compared to baseline, the pipeline fails and blocks the deploy — no exceptions',
          'Keep a history of all eval runs in a database: allows tracking "this eval function started failing after deploy X"',
          'Use LLM-as-a-judge (G-Eval) for automatic evaluation: configure specific criteria (e.g., "does the answer mention the current cart when relevant?")',
          'Implement "diff view" between versions: compare answers from current vs candidate version for the same input — quick visual review before approving',
          'In addition to offline eval, monitor online metrics: after deploy, compare click-through rate (CTR) and user feedback between new version and control (A/B)'
        ]
      },
      {
        title: 'Eval Pipeline Architecture',
        type: 'architecture',
        body: 'A robust evaluation pipeline has 4 stages: (1) Dataset — golden dataset with 200-1000 examples, balanced by category and difficulty; (2) Generation — the candidate system processes each input from the dataset; (3) Automatic Metrics — LLM-as-a-judge evaluates each answer across multiple dimensions (faithfulness, relevance, safety, format compliance, consistency); (4) Report — a comparative report between baseline and candidate, with aggregated scores, distribution by category, and regression detection. The pipeline runs on: every push (full eval on a reduced dataset of 100 examples), every deploy (full eval), and daily (eval with sampled real traffic). Results are stored over time to detect drift.'
      },
      {
        title: 'Real Scenario: Setting Up Human Evaluation at Scale',
        type: 'everyday-scenario',
        body: 'Your automated golden dataset with LLM-as-a-judge is working, but the CTO wants human validation before approving critical changes to the medical treatment recommendation system. You need to set up a human evaluation program with 5 expert medical annotators, inter-annotator calibration, and a pipeline that integrates human evaluation into CI/CD without creating bottlenecks.',
        items: [
          'Recruit 5 expert medical annotators. Each evaluates 100 examples/week across 4 dimensions: clinical accuracy (1-5), safety (pass/fail), clarity (1-5), completeness (1-5)',
          'Calibration: each annotator evaluates the same set of 20 examples. Calculate Cohen Kappa between each pair — if <0.7, discuss divergences and re-calibrate until everyone has Kappa >0.75',
          'Integration pipeline: when automatic tests pass, 50 examples go to human evaluation. Change approved only if: human score >4.0, no "fail" on safety, score not lower than current version (p<0.05)',
          'Stratified sampling: 40% easy cases (regressions), 30% edge cases (robustness), 20% new cases (drift), 10% golden repeats (annotator consistency)',
          'Fatigue auto-detection: if annotator evaluates >50 examples without changing category, system pauses and suggests a break — studies show 30% accuracy loss after 2 consecutive hours',
          'Result after 3 months: mean Kappa 0.82, 95% agreement with LLM judge on easy cases, detected 2 regressions that automatic tests missed'
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════
  // 10. AI SAFETY, ETHICS & RESPONSIBLE AI
  // ═══════════════════════════════════════════════
  AISafety: {
    summary:
      'AI Safety encompasses the practices and principles for building AI systems that are safe, ethical, transparent, and trustworthy. It includes hallucination mitigation, bias prevention, privacy protection, and compliance with regulations (EU AI Act, GDPR).',
    everydayExample:
      'AI Safety is like civil engineering: a building (AI system) needs solid foundations (quality data), support beams (guardrails), emergency exits (fallbacks), regular inspections (monitoring), and certification (auditing). If a bridge collapses (system fails), lives are affected. It is not optional — it is a responsibility. In the daily life of an engineer: you implement an AI system that suggests medical treatments. A wrong suggestion can cost a life. So you: (1) classify the system as "high risk" (EU AI Act), (2) implement guardrails to detect mentions of serious symptoms and redirect to professionals, (3) keep humans in the loop for all recommendations, (4) periodically audit suggestions by demographic group to detect bias, (5) have complete logs to track any incident. Safety is not a feature — it is an ongoing responsibility.',
    quickTip: 'Implement a "risk matrix": for each AI feature, classify (1) error impact: low/medium/high, (2) autonomy: human-in-the-loop, human-on-top, fully autonomous. For high risk, always have human oversight. Know the EU AI Act: high-risk systems need documentation, transparency, and human oversight. Implement input and output guardrails. Run bias tests regularly. Document design decisions that affect safety.',
    sections: [
      {
        title: 'Pillars of Responsible AI',
        type: 'key-concepts',
        items: [
          'Transparency: do users know they are interacting with AI? Are consequences clear?',
          'Fairness: does the system treat all groups equally? Test intersectionality.',
          'Privacy: are sensitive data protected? LGPD/GDPR compliance?',
          'Accountability: who is responsible when AI makes a mistake? Clear decision chain.',
          'Robustness: does the system resist attacks? Does it work with unexpected inputs?',
          'Explainability: can you explain why the AI made a decision?',
          'EU AI Act: European regulation that classifies AI systems by risk level',
          'AI Red Teaming: systematic adversarial testing to find vulnerabilities'
        ]
      },
      {
        title: 'Daily Example: AI as a Seatbelt',
        type: 'analogy',
        body: 'Implementing safety in AI is like a car manufacturer deciding to add seatbelts. In the 1960s, cars did not have seatbelts — and people died in accidents that would be survivable today. Manufacturers resisted: "seatbelts are expensive, slow down production, customers do not ask for them". Today, seatbelts are mandatory by law. AI Safety is at the same point: many teams see guardrails, bias tests, and safety eval as "costs" that delay launch. But one incident — a chatbot giving dangerous medical advice, an HR system discriminating against candidates — can destroy the company reputation and trigger million-dollar lawsuits. In the daily life of an engineer: you implement a content moderation system. Without guardrails, a malicious user can make the chatbot generate hate speech via prompt injection. With basic guardrails (toxicity filter + output validation), you block 90% of attacks. With advanced guardrails (intent classifier + automated red teaming + human-in-the-loop), you reach 99.9%. Investing in AI Safety is not optional — it is a professional responsibility and, increasingly, a legal requirement (EU AI Act).'
      },
      {
        title: 'Safety Problems',
        type: 'qa-list',
        qa: [
          { question: 'Health chatbot gave a diagnosis it should not have. How to add guardrails?', answer: 'Classify allowed/prohibited topics. Use an "AI is not a doctor" disclaimer. Detect mentions of serious symptoms and redirect to a professional. Monitor for risk keywords.' },
          { question: 'System reproduced copyrighted material. How to prevent?', answer: 'Implement memorization detection (training data extraction). Filter output with a blacklist of protected content. Use differential privacy in training.' },
          { question: 'HR system rejects more women than men. How to fix?', answer: 'Test bias with specific datasets (e.g., female vs male names). Remove proxy features (gender, race). Rebalance training data. Monitor outcomes by group.' },
          { question: 'User asked to "forget my data" (GDPR). How to comply?', answer: 'If the data is in model weights (fine-tuning), you cannot selectively delete. Solutions: (1) do not use personal data in fine-tuning, (2) keep data in a separate vector DB (easy to delete), (3) use machine unlearning techniques (experimental).' },
          { question: 'How to classify the risk level of an AI system (EU AI Act)?', answer: 'The EU AI Act classifies: (1) Minimal risk: chatbots, recommendation (no specific regulation), (2) Limited risk: systems that interact with humans (needs transparency), (3) High risk: recruitment, credit, health (needs documentation, assessment, human oversight), (4) Unacceptable risk: social scoring, manipulation (prohibited).' },
          { question: 'Bias test showed a difference between groups. What is the next step?', answer: 'Investigate the cause: unbalanced training data? Proxy feature? Sampling? Decide on action: rebalance data, remove features, post-processing (calibration). Monitor continuously. Document the decision and rationale.' }
        ]
      },
      {
        title: 'Real Scenario: Bias Incident — Detection, Mitigation, and Prevention',
        type: 'everyday-scenario',
        body: 'A user reported on Twitter that your resume screening system was disproportionately rejecting female candidates. Analysis confirmed: female candidates had 23% less chance of being approved than male candidates with identical qualifications. The bias came from the training data: 70% of "approved" resumes in the historical dataset were from men. The incident required immediate action: take the system offline, investigate the root cause, mitigate the bias, implement preventions, and communicate publicly.',
        items: [
          'Immediate (24h): remove the system from production, investigate the training dataset (distribution by gender, race, age), identify proxy features (e.g., "university name" can correlate with gender/race)',
          'Mitigation (1 week): rebalance the dataset (increase examples from underrepresented groups), remove features that correlate with protected attributes, retrain the model with fairness constraints',
          'Validation (2 weeks): test the new model with specific fairness datasets (e.g., pairing identical resumes varying only gender), monitor differences <1% per demographic group',
          'Prevention: implement automated bias tests in CI/CD — every deploy must pass 20+ fairness tests before going to production',
          'Transparency: publish a detailed post-mortem, communicate the changes made, and establish an AI ethics committee with external reviewers',
          'Continuous monitoring: fairness dashboard showing metrics by demographic group in real time — automatic alert if disparity >5%'
        ]
      },
      {
        title: 'Bias Incident Response Plan',
        type: 'key-concepts',
        items: [
          'Detection: continuous monitoring of fairness metrics by demographic group + user report channel',
          'Triage: classify bias severity (impact: low/medium/high, scope: few/many users)',
          'Containment: take the system offline or disable the affected feature immediately',
          'Investigation: root cause analysis — data, features, model, or post-processing?',
          'Mitigation: rebalancing, feature removal, retraining, post-processing calibration',
          'Validation: re-test with fairness datasets, document the improvement',
          'Communication: public post-mortem, transparency about what happened and the fixes',
          'Prevention: automate fairness tests in CI/CD, establish AI governance'
        ]
      },
      {
        title: 'Real Scenario: AI Regulation Compliance in Practice',
        type: 'everyday-scenario',
        body: 'Your European fintech company wants to launch an AI assistant that recommends personalized financial products. The EU AI Act classifies this as "high risk" — requiring technical documentation, conformity assessment, human oversight, and transparency. You need to navigate the regulatory process without paralyzing development, implementing the necessary controls while maintaining delivery speed.',
        items: [
          'Risk classification: following the EU AI Act, your financial recommendation system falls under "high risk" (Annex III, point 4: "access to essential financial services"). This requires: complete technical documentation, risk management system, event logging, human oversight, and adequate accuracy',
          'Technical documentation: create an "AI System Passport" documenting: system purpose, training data (source, volume, known biases), performance metrics (accuracy by demographic group), model architecture, safety measures (guardrails, fallbacks), and human oversight procedures',
          'Risk management system: implement a risk matrix with 15 scenarios (e.g., "recommend inappropriate product for elderly", "discriminate by postal code"). For each scenario: probability (1-5), impact (1-5), existing controls, planned controls, and responsible person',
          'Mandatory logging: every system event must be logged with timestamp, user input, system output, confidence score, and fallback decisions. Logs must be stored for 6 months (legal minimum) and auditable by regulatory authorities',
          'Human oversight: implement "human-on-the-loop" — the system makes recommendations automatically, but a human expert reviews a sample (10% of recommendations, focusing on high-risk cases such as >65 years old or >50K invested)',
          'Result: after 4 months of implementation, the system passes the internal compliance audit, the legal team approves the launch, and the competitive advantage of being one of the first compliant AI fintechs attracts 3 major corporate clients'
        ]
      }
    ]
  },

}

