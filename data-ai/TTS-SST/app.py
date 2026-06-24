import os
import uuid
import json
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
import logging
import hashlib

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

import google.generativeai as genai
from gtts import gTTS


# Setup
# -------------------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment (.env)")
genai.configure(api_key=API_KEY)

BASE_DIR = Path(__file__).parent.resolve()
STATIC_DIR = BASE_DIR / "static"
TTS_DIR = STATIC_DIR / "tts"
STATIC_DIR.mkdir(exist_ok=True)
TTS_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(STATIC_DIR), template_folder=str(BASE_DIR / "templates"))

# -------------------------
# Generate questions
# 3-4 prompts are used.
# -------------------------
@app.route("/api/generate_questions", methods=["POST"])
def generate_questions():
    payload = request.get_json(silent=True) or {}
    role = payload.get("role", "Software Engineer")
    qtype = payload.get("question_type", "technical")
    difficulty = payload.get("difficulty", "medium")
    count = int(payload.get("count") or 5)
    count = max(1, min(count, 12))

    prompt = (
        "You are an expert interviewer.\n"
        "Return strict JSON with a key 'questions' containing an array of objects.\n"
        "Each object must have: text, type, difficulty.\n"
        "Do not include commentary.\n\n"
        f"Role: {role}\nType: {qtype}\nDifficulty: {difficulty}\nCount: {count}"
    )

    model = genai.GenerativeModel("gemini-2.5-flash")
    resp = model.generate_content(prompt)
    raw = resp.text or ""
## Try to load the JSON data directly from the variable 'raw'
    try:
        data = json.loads(raw)
    except Exception:
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end != -1:
            try:
                data = json.loads(raw[start:end+1])
            except Exception:
                data = {"questions": []}
        else:
            data = {"questions": []}

    questions = data.get("questions") or []
    out = []
    for q in questions:
        text = q.get("text") if isinstance(q, dict) else str(q)
        q_type = q.get("type") if isinstance(q, dict) else qtype
        q_diff = q.get("difficulty") if isinstance(q, dict) else difficulty
        out.append({"id": str(uuid.uuid4()), "text": text.strip(), "type": q_type, "difficulty": q_diff})

    return jsonify({"questions": out})

# -------------------------
# Text-to-speech (with caching added)
# -------------------------
@app.route("/api/tts", methods=["POST"])
def tts():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "").strip()
    qid = payload.get("id") or str(uuid.uuid4())

    if not text:
        return jsonify({"error": "Text required"}), 400

    # --- Added feature: cache based on text hash ---
    hash_name = hashlib.md5(text.encode()).hexdigest()
    filename = f"tts_{hash_name}.mp3"
    out_path = TTS_DIR / filename

    # If already generated, reuse the same file
    if not out_path.exists():
        gTTS(text=text, lang="en").save(str(out_path))
    # ------------------------------------------------

    return jsonify({"url": f"/static/tts/{filename}"})


# -------------------------
# Analyze transcript
# -------------------------
@app.route("/api/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(silent=True) or {}
    transcript = (payload.get("transcript") or "").strip()
    question = (payload.get("question") or "").strip()

    if not transcript:
        return jsonify({"error": "Transcript required"}), 400

    system = (
        "You are an interview coach. Analyze the candidate's answer. "
        "Return JSON with keys: summary, pros, cons, suggestions. "
        "Be concise, actionable, and avoid extra keys."
    )
    user_prompt = f"Question: {question}\n\nAnswer: {transcript}"

    model = genai.GenerativeModel("gemini-2.5-flash")
    resp = model.generate_content(f"{system}\n\n{user_prompt}")
    raw = resp.text or ""

    try:
        parsed = json.loads(raw)
    except Exception:
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end != -1:
            try:
                parsed = json.loads(raw[start:end+1])
            except Exception:
                parsed = {"summary": raw[:200], "pros": [], "cons": [], "suggestions": []}
        else:
            parsed = {"summary": raw[:200], "pros": [], "cons": [], "suggestions": []}

    for k in ("pros", "cons", "suggestions"):
        if not isinstance(parsed.get(k), list):
            parsed[k] = []

    parsed["summary"] = parsed.get("summary", "")
    return jsonify(parsed)

# -------------------------
# Serve frontend
# -------------------------
@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)


