# Design - Mobile

## Tech stack & Dev setup
| *Layer*        | *Tech Stack*                                                              |
|------------------|--------------------------------------------------------------------------------------|
| *Frontend*      | React Native, React Navigation, NativeBase / React Native Paper                     |
| *UI Components* | react-native-chart-kit, react-native-video, react-native-document-picker            |
| *Speech*        | Google Cloud Speech-to-Text API                    |
| *Recording*     | react-native-camera, react-native-audio-recorder-player                             |
| *Backend*       | Node.js + Express.js                                                                |
| *Resume Parsing*| Python script with PyPDF2/Spacy or APIs like Affinda, Rchilli                       |
| *Authentication*| JWT (JSON Web Token)                                                                |
| *Database*      | MongoDB (Cloud via MongoDB Atlas or local MongoDB)                                  |
| *File Storage*  | AWS S3 or Cloudinary for storing resumes & videos                                   |
| *Hosting*       | Render  / Vercel                                                                    |

## Data flow

TODO(srividyagajavalley03, syam-praneeth)
# Application

## Landing Page
- Entry point to the application

## Login / Sign Up
- User authentication interface  
- Generates authentication tokens

## JWT (JSON Web Token)
- Mechanism to securely authorize user sessions

## User Dashboard
### Features
- Scores
- Graphs
- Previous video replay
- Resume upload
- Enter job description
- Enter experience

## Resume Parsing and Preview
- Parses the uploaded resume  
- Previews the extracted information

## Interview Interface
### Capabilities
- Set timer for interview session
- Real-time question display
- Video/audio recording
- Speech-to-text conversion
- Webcam and microphone access permissions

## Feedback Module
### Post-interview Results
- Video replay
- Identification of lacking skills
- Score

<img width="1818" height="548" alt="dataflow" src="https://github.com/user-attachments/assets/fe80c0a8-d57e-459b-a068-8b397ebe7074" />



## Device APIs

TODO(anish66-dev, Ganesh-131)
# APIs
- **OpenAI / Gemini** → Question generation, answer evaluation, job description & resume analysis, code analysis, skill suggestions  
- **Google Cloud** → Text-to-Speech (TTS), Speech-to-Text (STT)  
- **MongoDB** → Storage, score/analytics, experience points  
- **JWT** → Authentication  
- **Supabase** → Video storage  
- **Affinda API** → Resume reading  
- **Azure API** → Face expression analysis  
- **ReportLab** → PDF report generation  
- **SendGrid** → Email reminders  

---

# Features & API Usage

- **Resume Reader** → MongoDB + Affinda API  
- **Job Description & Resume Analysis** → OpenAI/Gemini + Mobile UI  
- **Code Analysis** → MongoDB + OpenAI/Gemini  
- **Face Expression Analysis** → Azure API  
- **Score/Analytics** → MongoDB  
- **PDF Report** → ReportLab  
- **Skill Suggestions** → OpenAI/Gemini  
- **Experience Points** → MongoDB with React frontend  
- **Email Reminders** → SendGrid  

---

# Device APIs

## Voice & Speech
- **Voice Input** → `AudioRecord` (Android) / `AVAudioRecorder` (iOS)  
- **Speech-to-Text** → `SpeechRecognizer` (Android) / `SFSpeechRecognizer` (iOS)  
- **Text-to-Speech** → `TextToSpeech` (Android) / `AVSpeechSynthesizer` (iOS)  

## File Handling
- **Resume Upload** → `Intent.ACTION_GET_CONTENT` (Android) / `UIDocumentPickerViewController` (iOS)  
- **File Upload** → `HttpURLConnection` (Android) / `URLSession` (iOS)  
- **PDF Report Generation** → `PdfDocument` (Android) / `UIGraphicsPDFRenderer` (iOS)  
- **File Save & Share** → `MediaStore` (Android) / `UIActivityViewController` (iOS)  

## Authentication
- **Auth** → `Auth0 SDK` (Android & iOS)  

## Camera/Document Scan (Optional)
- **Camera Access** → `CameraX API` (Android) / `UIImagePickerController` (iOS)  


## Backend APIs required

# Backend API Endpoints

## Authentication
- **POST /api/auth/register** → User registration
- **POST /api/auth/login** → User authentication
- **POST /api/auth/refresh-token** → Refresh JWT token
- **POST /api/auth/logout** → User logout
- **GET /api/auth/verify-email/:token** → Email verification

## User Profile
- **GET /api/users/me** → Get current user profile
- **PUT /api/users/me** → Update user profile
- **GET /api/users/:userId/stats** → Get user statistics
- **GET /api/users/:userId/interviews** → Get user interview history

## Resume Management
- **POST /api/resumes/upload** → Upload resume file
- **GET /api/resumes/:resumeId** → Get parsed resume data
- **PUT /api/resumes/:resumeId** → Update resume information
- **DELETE /api/resumes/:resumeId** → Delete resume

## Interview Sessions
- **POST /api/interviews/create** → Create new interview session
- **GET /api/interviews/:interviewId** → Get interview details
- **PUT /api/interviews/:interviewId/complete** → Mark interview as completed
- **GET /api/interviews/:interviewId/questions** → Get interview questions
- **POST /api/interviews/:interviewId/answers** → Submit answer for review
- **GET /api/interviews/:interviewId/feedback** → Get interview feedback

## Job Descriptions
- **POST /api/jobs/analyze** → Analyze job description
- **GET /api/jobs/recommendations/:resumeId** → Get skill recommendations based on resume and job

## Video Management
- **POST /api/videos/upload** → Upload interview recording
- **GET /api/videos/:videoId** → Get video recording
- **DELETE /api/videos/:videoId** → Delete video recording

## Analytics
- **GET /api/analytics/performance** → Get performance metrics
- **GET /api/analytics/skill-gaps** → Get skill gap analysis
- **GET /api/analytics/progress** → Get progress over time

## Reports
- **GET /api/reports/generate/:interviewId** → Generate interview report
- **GET /api/reports/download/:reportId** → Download PDF report

## Notifications
- **GET /api/notifications** → Get user notifications
- **PUT /api/notifications/:notificationId/read** → Mark notification as read
- **POST /api/notifications/settings** → Update notification preferences

## Play Store Setup

TODO(Vinaykumarp2005)


## focus on prototyping to uncover unknowns/learn specific tech (Ganesh-131)
# Identified Unknowns and Risks for Prototyping

## Job Description and Resume Parsing
- Uploading of different types of files (PDF/Word/Images)  
- Handling image files (scanned documents/JPG)

## Question Generation
- Some generated questions may not be related to the job description/resume  
- Time gap between question generation and asking the question (from the app side)  
- In TTS, the bot’s voice may have a different accent, making it difficult for users to understand  
- Live generation of subtitles

## Answering the Questions
- Internet speed directly affects the quality of input voice  
- Live generation of subtitles

## Interview Recording
- Video file size may be large and take a long time to upload to the server  
- Video quality depends on environment and lighting  
- Large file size requires more internet bandwidth (mobile users relying on data may face high consumption)  
- Files accumulate in the database, leading to increased storage costs — how can we optimize this?

## Face Expression Analysis
- Quality of video depends on internet speed and lighting  
- Poor conditions may lead to incorrect analysis

## Feedback and Rating
- Combining all aspects (tone of voice, facial expression, confidence, etc.) into a single score is difficult  
- Deciding the scoring base/ranking criteria is unclear  
- Users may disagree with the given score (e.g., if they feel they performed well but got a low rating) — how do we handle this?
