# Design - Data & AI

## Data Collection

TODO(srividyaguthi): Fill this section based on your analysis.

Context: InterviewTrainer (AI-Powered Mock Interview Platform)

Key Challenges and Solutions

1. Lack of Labeled Data  
   * Problem: AI needs labeled input-output pairs; manual annotation is costly.  
   * Solution: Use semi-supervised learning and generate synthetic data from resumes.

2. Diversity and Representativeness 
   * Problem: Bias toward specific industries, roles, or demographics.  
   * Solution: Source diverse data across roles, industries, experience levels, and geographies. Partner with colleges and career platforms.

3. Data Privacy and Consent  
   * Problem: Resumes and responses contain personal data, risking GDPR/CCPA violations.  
   * Solution: Collect consent, anonymize data, and allow users to opt out.

4. Audio/Video Data Processing  
   * Problem: High storage and processing costs for large media files.  
   * Solution: Use cloud transcription services, compress videos, and extract metadata.

5. Scalability of Human Feedback  
   * Problem: Hard to scale expert annotations for training AI.  
   * Solution: Start with expert-curated datasets, use ranking instead of scoring, and incorporate user feedback loops.

6. Cold Start Problem  
   * Problem: Insufficient data in early stages leads to repetitive or unhelpful feedback.  
   * Solution: Seed with curated/public datasets and expert-written answers. Use retrieval-based models initially.

7. Platform Bias  
   * Problem: Early user bias affects global relevance and fairness.  
   * Solution: Ensure balanced datasets across demographics and implement fairness checks.

Summary Table

| Challenge                  | Mitigation Strategy                                     |
| -------------------------- | ------------------------------------------------------- |
| Sparse labeled data        | Semi-supervised learning, synthetic data               |
| Lack of diversity          | Source varied domains/roles/levels                     |
| Privacy risks              | Consent, anonymization, GDPR/CCPA compliance           |
| Large media files          | Transcribe, compress, store metadata                   |
| Human feedback bottlenecks | Expert seed data, user feedback loops                  |
| Cold start problem         | Curated/public data, expert-written answers            |
| Platform bias              | Balanced datasets, fairness metrics                   |

## Sample dataset

TODO(amulya-naalla): Fill this section based on your analysis.

Description about datasets and their purpose:

1.	Company Expectations dataset contains company-specific questions, skills required, number of interview rounds. This helps in targeted preparation.
<img width="1151" height="312" alt="image" src="https://github.com/user-attachments/assets/97405136-0b5c-479f-a980-cbf9ed073d60" />

2.	Feedback Dataset contains description about voice modulation, skills demonstrated and improvements. It also has scores for confidence, body language and overall rating. This gives the user an idea about overall performance in the mock interview.
<img width="1354" height="305" alt="image" src="https://github.com/user-attachments/assets/5215d479-108c-4aea-b2a0-9b6adf90be31" />

3.	Language Proficiency Dataset consists of performance score and grammatical errors if any. This helps in analysing in the overall communication of the user.
<img width="1382" height="310" alt="image" src="https://github.com/user-attachments/assets/4f568447-c6bc-44e1-9415-501e693d405e" />

4.	Mock Interview Interactions Dataset contains the questions, answers, confidence score and time taken to answer in the interview. This helps in providing suggestions to the user to improve their performance.
<img width="1829" height="313" alt="image" src="https://github.com/user-attachments/assets/20e345ac-aaac-4582-bb32-c50ee5a1a63d" />

5.	Question Bank Dataset has a variety of questions categorised on the basis of role, skill, domain, difficulty level and type (Technical, HR, behavioural). It ensures diverse interview practice.
<img width="1419" height="311" alt="image" src="https://github.com/user-attachments/assets/0dfa46c6-1fd7-4db3-9c7b-1c7895f43cfb" />

6.	Resume Dataset consists of information of the user like name, education, skills, work experience, projects, etc. It helps in generating role-specific interviews and resume improvement suggestions.
<img width="1696" height="314" alt="image" src="https://github.com/user-attachments/assets/12ab0bee-dd03-451e-a6ac-ae8fca1ec174" />
 
7.	Role Matching Compatibility Dataset links the job roles to the skills required and to what extent the resume matches to the specific role. It helps in recommending suitable roles and suggestions to modify the resume accordingly.
<img width="955" height="309" alt="image" src="https://github.com/user-attachments/assets/32876300-b965-45cb-a6a5-98bc5dd998dc" />

## Generic chatbots

TODO(Manikanta6205): Fill this section based on your analysis.

## Pre-built APIs
TODO(swayamj2495): Fill this section based on your analysis.

Pre - built apis which we might use in this particular project are as follows:-

1.Speech-to-Text (Voice Input):-

  a)Google Cloud Speech-to-Text

  b)Microsoft Azure Speech Service

  c)Deepgram

2.Question Generation:-

  a)OpenAI GPT

3.Answer Analysis / Scoring:-

  a)OpenAI GPT

  b)Hugging Face Inference API

4.Feedback Generation:-

  a)OpenAI GPT

5.Text-to-Speech (Ask Questions Aloud):-

  a)Amazon Polly

  b)Google Cloud Text-to-Speech

As per the requirement of the product we can then think of more API's we want to use.
## Vision Algorithms

TODO(mythrimutyapu7): Fill this section based on your analysis.

###  Speech-to-Text (STT) / Automatic Speech Recognition (ASR)

1. **Google Cloud Speech-to-Text** → Voice & real-time transcription (Chirp Transformer + CTC-LSTM/RNN)
2. **Microsoft Azure Speech Service** → Transcription, TTS, multilingual support (Conformer/Transformer)
3. **AssemblyAI** → Transcription + analysis (Transformer-based ASR)
4. **Deepgram** → Real-time speech recognition (Conformer/Transformer)


###  Text-to-Speech (TTS)

5. **Google Cloud Text-to-Speech** → TTS (WaveNet & Parallel WaveNet vocoders)
6. **Amazon Polly** → Natural voice TTS (LSTM/Transformer + Deep Voice)
7. **Play.ht** → Natural-sounding voices (Transformer-based TTS, proprietary)


###  Large Language Models (LLMs) & NLP APIs

8. **OpenAI GPT-4 / GPT-3.5 API** → Q\&A, summarization, reasoning (Decoder-only Transformer LLM)
9. **Cohere** → Search, classification, embeddings (Transformer LLMs)
10. **Hugging Face Inference API** → NLP tasks (summarization, NER, sentiment) using BERT/T5/etc.
11. **Google Cloud Natural Language API** → Sentiment, classification, entities (BERT-based Transformers)


###  Face / Emotion Recognition APIs

12. **Microsoft Azure Face API** → Identity, emotion recognition (CNN-based)
13. **Affectiva** → Emotion analysis from facial video (CNN + features)
14. **Face++** → Face detection, landmarks, demographics (CNN + ArcFace embeddings)
15. **Sightengine** → Expression detection + content moderation (Hybrid CNN-based)


###  Resume Parsing / HR Tech

16. **Rchilli Resume Parser** → Resume parsing, profiling (OCR + NER hybrid)
17. **Affinda Resume Parser** → Parsing + skill extraction (DL + NER + classifiers)
18. **HireAbility Resume Parser** → Structured resume extraction (Hybrid NER + OCR pipeline)


### ⚙ Orchestration / AI Pipelines

19. **PromptLayer** → Prompt tracking/orchestration (no ML model)
20. **LangChain** → AI workflow orchestration (retrieval + LLM chaining)


###  Video / Communication APIs

21. **Google Cloud Video Intelligence API** → Video analysis, labels, face detection (CNN + Transformer)
22. **Twilio** → Voice/video infra (STT/TTS integrations + orchestration)
23. **Agora** → Real-time audio/video infra (low-latency STT/TTS)


TODO(Aishwarya0322) : Fill this section based on your analysis.

1. Personally Identifiable Information (PII) Exposure
Issue: Names, emails, face/voice data can reveal identity.
Mitigation: Use candidate IDs, anonymize data, and encrypt PII.

2. Unauthorized Access
Issue: Sensitive data may be accessed by hackers or unapproved users.
Mitigation: Apply RBAC, enable 2FA, and use encryption at rest & in transit.

3. No User Consent
Issue: Users may not know data is being collected or used.
Mitigation: Use clear consent forms; explain data use; allow opt-out.

4. Video/Audio Risks
Issue: Raw recordings can be misused (e.g., for facial recognition).
Mitigation: Extract only features needed (e.g., tone/confidence); delete raw files.

5. Over-collection of Data
Issue: Unnecessary data like age or gender may be collected.
Mitigation: Collect only essential data needed for interview analysis.

6. Third-party Sharing Risks
Issue: Shared data could be leaked or misused.
Mitigation: Share only anonymized data; sign DPAs; ensure vendor compliance.

7. No Data Retention Policy
Issue: Data stored indefinitely without user knowledge.
Mitigation: Set auto-delete rules (e.g., 30–60 days); allow users to delete their data.

8. AI Bias
Issue: AI may provide unfair feedback based on gender, accent, etc.
Mitigation: Train on diverse data; exclude sensitive features; audit regularly.
9. Unsafe File Uploads
Issue: Files may carry malware or sensitive content.
Mitigation: Sanitize, validate, and store files securely; scan for threats.

10. Lack of Transparency
Issue: Users don’t know how their data is used or who sees it.
Mitigation: Provide clear privacy policy and visible data settings.

**InterviewTrainer: Baseline and Goal Overview**

1. The current version of InterviewTrainer operates as a prototype with basic AI-driven capabilities, showing potential but requiring enhancement in performance and scalability.

2. Present metrics indicate 75% accuracy in question relevance and 70% in answer evaluation, supported by precision (72%) and recall (68%), reflecting moderate reliability.

3. Major challenges include dependence on external APIs, limited dataset coverage, and shallow feedback analysis lacking tone, confidence, and delivery assessment.

4. The upcoming development phase aims to achieve over 90% accuracy, richer, multi-dimensional feedback, and latency below 2 seconds for improved real-time interaction.

5. With these advancements, InterviewTrainer is expected to evolve into a robust, scalable, and intelligent interview training platform, offering accurate evaluation and deeply personalized feedback.

6. Performance scalability will also be improved to support enterprise-level usage, allowing 100+ concurrent users with minimal lag or errors.
