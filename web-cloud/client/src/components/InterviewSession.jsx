import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Sample questions based on role and difficulty
const interviewQuestions = {
  frontend: {
    easy: [
      "Tell me about yourself and your experience with frontend development. What projects have you worked on recently?"
    ],
    medium: [
      "How do you optimize website performance and what tools do you use to measure and improve it?"
    ],
    hard: [
      "How would you architect a large-scale React application with complex state management and real-time features?"
    ]
  },
  backend: {
    easy: [
      "Tell me about your experience with backend development and describe a recent API you've built."
    ],
    medium: [
      "How do you design and implement a robust authentication system with proper security measures?"
    ],
    hard: [
      "How would you design a distributed system that can handle millions of concurrent users while maintaining data consistency?"
    ]
  },
  fullstack: {
    easy: [
      "Walk me through your full-stack development experience and describe how you handle communication between frontend and backend."
    ],
    medium: [
      "How do you implement real-time features in web applications and ensure security across the entire stack?"
    ],
    hard: [
      "How would you architect a scalable, real-time collaboration platform that works offline and syncs data across multiple clients?"
    ]
  },
  "data-scientist": {
    easy: [
      "Tell me about your experience with data science and walk me through a recent project from data collection to model deployment."
    ],
    medium: [
      "How do you approach building and evaluating machine learning models, and how do you handle challenges like imbalanced datasets?"
    ],
    hard: [
      "How would you design and implement a real-time machine learning pipeline that can handle concept drift and scale to millions of predictions per day?"
    ]
  }
};

export default function InterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, difficulty } = location.state || {};

  const [recorder, setRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Get question for current role and difficulty (only one question now)
  const questions = interviewQuestions[role]?.[difficulty] || interviewQuestions.frontend.easy;
  const currentQuestion = questions[0]; // Always use the first (and only) question

  // Timer functionality
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Attach stream to video and ensure it plays
  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      } catch (err) {
        console.error("Failed to attach stream to video:", err);
      }
    }
  }, [stream]);

  // Handle horizontal resizing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth >= 25 && newWidth <= 75) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Redirect if no role/difficulty provided
  useEffect(() => {
    if (!role || !difficulty) {
      navigate('/start-interview');
    }
  }, [role, difficulty, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          if (!isRecording) {
            startRecording();
          } else {
            stopRecording();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setStream(mediaStream);
      
      const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "video/webm" });
          const formData = new FormData();
          formData.append("file", blob, "interview.webm");
          formData.append("role", role);
          formData.append("difficulty", difficulty);

          const token = localStorage.getItem('auth_token');

          const response = await fetch(`${API_BASE_URL}/api/recordings`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed: ' + response.statusText);
          }

          const result = await response.json();
          console.log('Upload successful:', result);
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          alert("Upload failed. See console for details.");
        } finally {
          chunks = [];
          try {
            mediaStream.getTracks().forEach((t) => t.stop());
          } catch (err) {
            console.warn("Error stopping tracks:", err);
          }
          setStream(null);
          setIsRecording(false);
          
          // Clear cached report data to force refresh
          localStorage.removeItem('cached_interview_report');
          localStorage.removeItem('report_cache_timestamp');
          
          alert("Recording uploaded successfully! Redirecting to your interview report...");
          
          // Navigate to interview report with refresh flag
          navigate('/interview-report', { state: { refreshReport: true } });
        }
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setRecorder(null);
    } else if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      setIsRecording(false);
    }
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-orange-600 bg-orange-50';  
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'frontend': 'Frontend Developer',
      'backend': 'Backend Developer', 
      'fullstack': 'Full Stack Engineer',
      'data-scientist': 'Data Scientist'
    };
    return roleNames[role] || role;
  };

  return (
    <div ref={containerRef} className="h-screen bg-black flex">
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Questions */}
        <div 
          className="bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col transition-all duration-200 shadow-lg"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Interview Question</h2>
                <p className="text-blue-100">AI-curated for {getRoleDisplayName(role)} - {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)} Level</p>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Current Question Card */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-2xl p-8 mb-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                  Q
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-bold text-blue-900 text-xl">Your Interview Question</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)} Level
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed text-lg font-medium">{currentQuestion}</p>
                </div>
              </div>
            </div>

            {/* Interview Tips */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Interview Tips
                </h4>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {[
                    {
                      icon: "🤔",
                      tip: "Take your time to think before answering",
                      desc: "A brief pause shows thoughtfulness"
                    },
                    {
                      icon: "📚",
                      tip: "Use specific examples from your experience", 
                      desc: "Concrete examples are more compelling"
                    },
                    {
                      icon: "⭐",
                      tip: "Structure with STAR method",
                      desc: "Situation, Task, Action, Result"
                    },
                    {
                      icon: "👁️",
                      tip: "Maintain eye contact with camera",
                      desc: "Look directly at the lens, not the screen"
                    }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{item.tip}</div>
                        <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recording Shortcuts */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Quick Actions: </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Space</kbd>
                    <span>Start/Stop Recording</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Resizer */}
        <div
          className={`w-2 bg-gradient-to-b from-gray-200 to-gray-300 hover:from-blue-400 hover:to-indigo-400 cursor-ew-resize flex-shrink-0 transition-all duration-200 relative group ${
            isDragging ? 'from-blue-500 to-indigo-500 shadow-lg' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="h-full flex items-center justify-center">
            <div className={`w-1 h-12 bg-white/60 rounded-full transition-all duration-200 ${
              isDragging ? 'bg-white h-16' : 'group-hover:bg-white/80 group-hover:h-14'
            }`}></div>
          </div>
          
          {/* Resize hint */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            Drag to resize
          </div>
        </div>

        {/* Right Panel - Video Recording */}
        <div 
          className="flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black relative"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="flex-1 relative overflow-hidden">
            {/* Top overlay with session info and controls */}
            <div className="absolute top-0 left-0 right-0 z-10">
              <div className="bg-black/20 backdrop-blur-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                  {/* Left side - Back button and session info */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/start-interview')}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    >
                      <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Setup
                    </button>
                    
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">AI Interview Session</div>
                        <div className="text-xs text-white/80">
                          {getRoleDisplayName(role)} • {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)} Level
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Timer and controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg text-white text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{isRecording ? 'Recording' : 'Ready'}: {formatTime(timer)}</span>
                      {isRecording && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-200 font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Stop & Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-gray-800 to-gray-900">
                <div className="text-center text-gray-300">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Camera Ready</h3>
                  <p className="text-lg mb-2 text-gray-300">Your interview space is prepared</p>
                  <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                    Click "Start Recording" above to begin your AI-powered interview session. 
                    Make sure you're in a quiet, well-lit environment.
                  </p>
                  
                  {/* Environment checks */}
                  <div className="mt-8 bg-black/30 rounded-xl p-4 max-w-sm mx-auto">
                    <h4 className="text-white font-semibold mb-3">Environment Check</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Camera Access
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Microphone Access
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Connection Stable
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recording indicator - enhanced version */}
            {/* {isRecording && (
              <div className="absolute top-20 left-6 z-10">
                <div className="flex items-center gap-3 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-2xl">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <div className="text-xs font-medium opacity-90">RECORDING</div>
                    <div className="text-sm font-bold">{formatTime(timer)}</div>
                  </div>
                </div>
              </div>
            )} */}


          </div>
        </div>
      </div>
    </div>
  );
}