`# 

import os
import time
import pandas as pd
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

# ----------------------------
# 1. Setup
# ----------------------------
from dotenv import load_dotenv
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not found. Please set it in .env file")

genai.configure(api_key=API_KEY)

# Use Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# ----------------------------
# 2. Load dataset
# ----------------------------
df = pd.read_excel(r"C:\Users\aishw\Downloads\Mock_interview_interactions (1).xlsx")

# Ensure required columns exist
required_cols = ['Question', 'User Response', 'Manual Labelling']
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"❌ Missing required column: {col}")

# ----------------------------
# 3. Function to call Gemini API safely
# ----------------------------
def evaluate_response(question, answer, retries=3):
    """Send Q&A to Gemini API and return a score out of 10."""
    prompt = f"""
    You are an interview evaluator.
    Question: {question}
    Candidate's Answer: {answer}
    Give a single integer score from 1 to 10 based on correctness, clarity, and relevance.
    Answer format: just the number (no explanation).
    """
    for attempt in range(retries):
        try:
            result = model.generate_content(prompt)
            score_text = result.text.strip()
            score = int(score_text.split()[0])  # Ensure it's an integer
            return max(1, min(score, 10))  # keep within 1–10
        except ResourceExhausted:
            wait_time = 60  # wait 1 minute before retry
            print(f"⚠️ Quota exceeded, waiting {wait_time}s before retry...")
            time.sleep(wait_time)
        except Exception as e:
            print(f"❌ Error: {e} (attempt {attempt+1}/{retries})")
            time.sleep(5)
    return None

# ----------------------------
# 4. Apply evaluation
# ----------------------------
api_scores = []
for idx, row in df.iterrows():
    q = row["Question"]
    ans = row["User Response"]

    print(f"Evaluating row {idx+1}/{len(df)} ...")
    score = evaluate_response(q, ans)
    api_scores.append(score)
    time.sleep(5)  # <-- rate limiting (avoid hitting API quota)

df["API Score"] = api_scores

# ----------------------------
# 5. Compare with Manual Labels
# ----------------------------
correct = df.dropna(subset=["API Score"]).apply(
    lambda row: 1 if row["API Score"] == row["Manual Labelling"] else 0, axis=1
)

accuracy = correct.mean() * 100

print("\n✅ Evaluation Complete!")
print(f"Accuracy of API vs Manual labels: {accuracy:.2f}%")

# Save results
df.to_excel("evaluation_results.xlsx", index=False)
print("📂 Results saved to evaluation_results.xlsx")
