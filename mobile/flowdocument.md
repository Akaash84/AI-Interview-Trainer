<!--
This is a pull request from Anish
-->

# **InterviewTrainer - App Flow Document (V2)**

**Product Group 4: "Interview Trainer to Crack that Job"**

---

### 🧩 **1. Overview**
**Purpose:**  
To provide job seekers with a realistic, AI-driven mock interview experience that helps them prepare effectively, gain confidence, and receive personalized feedback.

**Core Features:**  
- Resume upload & profile-based question generation  
- AI Virtual Interviewer (voice/video interaction)  
- Real-time and recorded feedback  
- Interview replay and analytics  
- Personalized improvement tips  

---

### 🧭 **2. App Flow**

#### **A. Onboarding Flow**
1. **Splash Screen**
   - App logo + tagline (“Crack Every Interview with Confidence”)  
   - Progress animation (2–3 seconds)

2. **Welcome Screen**
   - Options:  
     - **Sign Up** → Create account  
     - **Log In** → Existing user access  

3. **Sign Up / Login**
   - Email / Google / LinkedIn authentication  
   - On first sign-up:  
     - Collect name, profession, target role, experience level  

4. **Permissions**
   - Request access to camera, microphone, and file storage (for resume upload and interview recording).  

---

#### **B. Home Screen (Dashboard)**
Displays user progress and key actions:
- 👤 **Profile Summary:** Name, target role, skill tags  
- 📊 **Recent Interview Stats:** Last score, feedback snippet  
- 🎯 **Main Actions:**
  - Start New Interview  
  - Upload / Update Resume  
  - View Past Interviews  
  - Settings  

---

#### **C. Resume Upload & Profile Setup**
1. **Upload Resume**
   - User uploads PDF/DOC file.  
   - System parses resume → Extracts key info (skills, experience, education).  

2. **Profile Customization**
   - User verifies or edits parsed details:  
     - Job role  
     - Key skills  
     - Experience level  
   - App stores data for personalized question generation.

---

#### **D. Mock Interview Flow**
1. **Select Interview Type**
   - **Technical / HR / Behavioral / Mixed**  
   - Choose difficulty: Beginner / Intermediate / Expert  

2. **AI Interview Preparation**
   - AI analyzes profile and generates question set.  
   - Displays short “Ready to Begin?” screen with microphone & camera test.  

3. **Live Interview Session**
   - Virtual interviewer (AI Avatar or Chatbot interface).  
   - Types of questions:
     - Skill-based (based on resume)
     - General HR
     - Scenario-based / problem-solving  
   - User answers verbally (voice or video).  
   - Timer or progress indicator shown.  

4. **Session Recording**
   - Entire session is recorded (video + audio).  
   - Auto-saved in user’s “Interview History.”  

---

#### **E. Post-Interview Feedback**
1. **AI Analysis Phase**
   - App analyzes:
     - Voice tone & confidence  
     - Response clarity & accuracy  
     - Keyword relevance to the question  
     - Eye contact & posture (if video enabled)

2. **Feedback Summary Screen**
   - Overall performance score  
   - Strengths & weaknesses  
   - Recommended improvements  
   - Skill-based tips (e.g., “Improve your STAR method for behavioral questions”).  

3. **Replay & Review**
   - Users can:
     - Watch their interview recording  
     - See timestamps of AI comments (e.g., “You paused too long here”).  

---

#### **F. Progress & Insights**
- View all past interviews  
- Performance trends (charts/graphs)  
- Suggested next interview type for improvement  

---

#### **G. Settings / Additional Features**
- Edit profile / resume  
- Choose AI interviewer voice or avatar  
- Toggle between light/dark mode  
- Notification settings  
- Log out  

---

### 📊 **3. Data Flow Summary**

| Step | Input | Process | Output |
|------|--------|----------|---------|
| Resume Upload | Resume File | AI parsing of skills & experience | User Profile |
| Start Interview | Profile + Mode | AI question generation | Question Set |
| During Interview | User responses | Real-time recording | Audio/Video data |
| After Interview | Recorded session | AI analysis (speech, content, tone) | Feedback & Score |
| Review | Past interviews | Replay & Comparison | Insights report |

---

### 💡 **4. Tech Components (High-Level)**

| Component | Description |
|------------|-------------|
| **Frontend (Mobile)** | Flutter / React Native (for cross-platform) |
| **Backend** | Node.js / Python (FastAPI) |
| **Database** | Firebase / MongoDB for user data & sessions |
| **AI Services** | OpenAI / Gemini / Local ML models for NLP + Speech analysis |
| **Storage** | Firebase Storage / AWS S3 for interview recordings |
| **Authentication** | Firebase Auth / Google Sign-In / LinkedIn OAuth |

---

### 🚀 **5. Optional Add-ons (Future Features)**
- AI Resume Improvement Suggestions  
- Job-specific interview templates (e.g., “Software Engineer – Google”)  
- Peer comparison dashboard  
- Real-time interviewer feedback (during interview)

---

