import os
import pdfplumber
import traceback
import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY is not set. /analyze will not work without it.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# -----------------------------
# Flask app + CORS
# -----------------------------
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)  # restrict to React dev URL

# -----------------------------
# Utility: extract text from PDF
# -----------------------------
def extract_text_from_pdf(pdf_file):
    text = ""
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
    return text.strip()

# -----------------------------
# Health check
# -----------------------------
@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}

# -----------------------------
# Analyze resume
# -----------------------------
@app.route("/analyze", methods=["POST", "OPTIONS"])
def analyze_resume():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST")
        return response, 200

    try:
        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY not set"}), 500

        if "resume" not in request.files or "jobRole" not in request.form:
            return jsonify({"error": "Missing resume or job role"}), 400

        resume_file = request.files["resume"]
        job_role = request.form["jobRole"]

        resume_text = extract_text_from_pdf(resume_file)
        if not resume_text:
            return jsonify({"error": "Could not extract text from resume"}), 400

        valid_model_name = "models/gemini-2.5-flash"
        prompt = f"""
You are an AI interview coach. Analyze the following resume for the role: {job_role}.

Resume:
{resume_text}

Provide:
- Strengths
- Weaknesses
- Suggestions to improve resume for this job role.
"""

        model = genai.GenerativeModel(valid_model_name)
        response = model.generate_content(prompt)
        analysis_text = response.text

        return jsonify({"analysis": analysis_text, "model_used": valid_model_name})

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Auto port detection
# -----------------------------
def find_free_port(start_port=5000):
    port = start_port
    while port < 5100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
            port += 1
    raise RuntimeError("No free port found in range 5000–5099")

# -----------------------------
# Run Flask
# -----------------------------
if __name__ == "__main__":
    port_to_use = find_free_port(5001)  # use 5001+
    print(f"Backend running at: http://127.0.0.1:{port_to_use}")
    app.run(host="0.0.0.0", port=port_to_use, debug=True)
