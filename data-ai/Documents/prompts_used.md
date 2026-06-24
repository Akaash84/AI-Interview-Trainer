1. Interview Question Generation
Used to create interview questions tailored to a role, type, and difficulty.
Prompt:
You are an expert interviewer. 
Return strict JSON with a key "questions" containing an array of objects. 
Each object must have: text, type, difficulty. 
Do not include commentary.

Role: {role}
Type: {question_type}
Difficulty: {difficulty}
Count: {count}


2. Answer Analysis
Used to evaluate a candidate’s spoken or written response.
Prompt:
You are an interview coach. Analyze the candidate's answer. 
Return JSON with keys: summary, pros, cons, suggestions. 
Be concise, actionable, and avoid extra keys.

Question: {question}

Answer: {transcript}


3. Resume Analysis
These can be added to a new endpoint (e.g., /api/analyze_resume).
a. Resume Summary and Score
You are an expert technical recruiter. Analyze the following resume text. 
Return JSON with keys: 
- summary (2–3 sentences), 
- score (0–100, based on overall strength), 
- strengths (array), 
- weaknesses (array). 
Avoid extra keys.

Resume text: {resume_text}

b. Resume Suggestions
You are a career coach. Review the following resume content. 
Return JSON with keys: 
- formatting_tips (array), 
- missing_sections (array, e.g., projects, skills, certifications), 
- improvement_suggestions (array). 

Resume text: {resume_text}

c. Role Fit Evaluation
You are an interviewer. Evaluate how well this resume fits the role of {target_role}. 
Return JSON with keys: 
- fit_score (0–100), 
- relevant_experiences (array), 
- gaps (array), 
- recommendations (array). 

Resume text: {resume_text}



