// askarthikey made this page
import React, { useState, useEffect, useRef } from 'react';
import { makeAuthenticatedRequest } from '../utils/authUtils';

const SpeechToTextDis = () => {
  // State management
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('question');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState('prompt');
  const [audioSupported, setAudioSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [recordingStage, setRecordingStage] = useState('idle'); // 'idle', 'preparing', 'countdown', 'recording', 'processing'
  const [statusMessage, setStatusMessage] = useState('Ready to start your interview response');
  const [showStartPrompt, setShowStartPrompt] = useState(true);

  // Refs
  const containerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch interview history from database
  const fetchInterviewHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setHistoryError(null);

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/interview/responses?limit=20`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Transform database format to component format
          const transformedHistory = result.data.responses.map(item => ({
            id: item._id,
            response: item.response.text,
            wordCount: item.response.wordCount,
            timeSpent: item.response.timeSpent,
            confidence: item.response.confidence,
            timestamp: item.response.timestamp,
            saved: true,
            question: item.question.text,
            category: item.question.category,
            difficulty: item.question.difficulty
          }));

          setSubmissionHistory(transformedHistory);
          setHistoryStats(result.data.statistics);
          console.log('📊 Fetched interview history:', transformedHistory.length, 'responses');
        } else {
          throw new Error(result.message || 'Failed to fetch history');
        }
      } else {
        throw new Error(`HTTP ${response.status}: Failed to fetch history`);
      }
    } catch (error) {
      console.error('❌ Error fetching interview history:', error);
      setHistoryError(error.message);
      
      // If there's an auth error, don't show error message as user might not be logged in
      if (!error.message.includes('Unauthorized') && !error.message.includes('401')) {
        setHistoryError('Failed to load interview history. Please try again.');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle opening response details modal
  const openResponseDetails = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  // Handle closing response details modal
  const closeResponseDetails = () => {
    setSelectedResponse(null);
    setShowResponseModal(false);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Check for audio support on component mount
  useEffect(() => {
    const checkAudioSupport = async () => {
      try {
        const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        setAudioSupported(supported);
        
        if (!supported) {
          console.error('getUserMedia not supported');
          setRecordingStatus('Audio recording not supported in this browser');
        }
      } catch (error) {
        console.error('Error checking audio support:', error);
        setAudioSupported(false);
        setRecordingStatus('Error checking audio support');
      }
    };

    checkAudioSupport();
  }, []);

  // Update word count when transcript changes
  useEffect(() => {
    const words = finalTranscript.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [finalTranscript]);

  // Fetch history when history tab is activated
  useEffect(() => {
    if (activeTab === 'history' && submissionHistory.length === 0) {
      fetchInterviewHistory();
    }
  }, [activeTab]);

  // Fetch history on component mount
  useEffect(() => {
    // Only fetch if user might be logged in (has token)
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchInterviewHistory();
    }
  }, []);

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showResponseModal) {
        closeResponseDetails();
      }
    };

    if (showResponseModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showResponseModal]);

  // Countdown function
  const startCountdown = () => {
    setIsCountingDown(true);
    setRecordingStage('countdown');
    setStatusMessage('Get ready! Recording will start in...');
    setCountdown(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Countdown finished, start recording
          clearInterval(countdownIntervalRef.current);
          setIsCountingDown(false);
          setRecordingStage('recording');
          setStatusMessage('🎤 Recording... Speak now!');
          startActualRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the actual recording after countdown
  const startActualRecording = () => {
    setIsRecording(true);
    setShowStartPrompt(false);
    
    // Reset and start timer from 0
    setTimeSpent(0);
    setIsTimerActive(true);
    
    // Initialize Web Speech API
    initWebSpeechAPI();
  };

  // Send audio chunk to OpenAI Whisper for transcription
  const transcribeAudioChunk = async (audioBlob) => {
    try {
      setIsProcessing(true);
      setRecordingStatus('Processing audio...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch(`${API_BASE_URL}/api/transcribe/stream`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if it's a quota exceeded error
        if (response.status === 429 || (errorData.error && errorData.error.code === 'insufficient_quota')) {
          setRecordingStatus('OpenAI quota exceeded. Falling back to browser speech recognition...');
          initWebSpeechAPI();
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.transcript) {
        // Add the new transcript to the final transcript
        setFinalTranscript(prev => prev + ' ' + result.transcript);
        setInterimTranscript('');
        setConfidence(0.9); // OpenAI Whisper doesn't provide confidence, so we use a default high value
        setRecordingStatus('Transcription updated');
      }

    } catch (error) {
      console.error('Error transcribing audio:', error);
      setRecordingStatus('OpenAI failed. Falling back to browser speech recognition...');
      // Fall back to Web Speech API
      initWebSpeechAPI();
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize Web Speech API as fallback
  const initWebSpeechAPI = () => {
    console.log('Initializing Web Speech API...');
    setUseFallback(true);
    setRecordingStage('preparing');
    setStatusMessage('Initializing speech recognition...');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configuration
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        console.log('Web Speech API started');
        setRecordingStatus('🎤 Listening...');
        setStatusMessage('🎤 Recording active - Speak clearly into your microphone');
        setRecordingStage('recording');
        setMicrophonePermission('granted');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            final += transcript;
            setConfidence(confidence || 0.9);
            setStatusMessage('✅ Speech detected and transcribed');
          } else {
            interim += transcript;
            setStatusMessage('👂 Listening... (speak clearly)');
          }
        }

        if (final) {
          setFinalTranscript(prev => prev + final + ' ');
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (event) => {
        console.error('Web Speech API error:', event.error);
        setRecordingStatus('❌ Speech recognition error: ' + event.error);
        setStatusMessage('❌ Error: ' + event.error + '. Please try again.');
        setRecordingStage('idle');
        
        if (event.error === 'not-allowed') {
          setMicrophonePermission('denied');
          setStatusMessage('❌ Microphone access denied. Please allow permissions and try again.');
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          setStatusMessage('🔄 Restarting speech recognition...');
          // Restart recognition for continuous listening
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              recognitionRef.current.start();
            }
          }, 100);
        } else {
          setStatusMessage('⏹️ Recording stopped');
          setRecordingStage('idle');
        }
      };

      // Start recognition
      recognition.start();
    } else {
      setRecordingStatus('❌ Speech recognition not supported in this browser');
      setStatusMessage('❌ Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      setRecordingStage('idle');
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      setRecordingStatus('Requesting microphone permission...');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper works well with 16kHz
        } 
      });
      
      setMicrophonePermission('granted');
      streamRef.current = stream;
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Good compression for real-time
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available (audio chunks)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudioChunk(audioBlob);
          audioChunksRef.current = [];
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('Recording... Speak now');
      
      if (!isTimerActive) {
        setIsTimerActive(true);
      }

      // Set up periodic processing (every 3 seconds for real-time feedback)
      recordingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          
          // Start a new recording session immediately
          setTimeout(() => {
            if (isRecording) {
              const newMediaRecorder = new MediaRecorder(streamRef.current, {
                mimeType: 'audio/webm;codecs=opus',
              });
              
              newMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
                }
              };

              newMediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length > 0) {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  await transcribeAudioChunk(audioBlob);
                  audioChunksRef.current = [];
                }
              };

              mediaRecorderRef.current = newMediaRecorder;
              newMediaRecorder.start();
            }
          }, 100);
        }
      }, 3000); // Process every 3 seconds

    } catch (error) {
      console.error('Error starting recording:', error);
      setMicrophonePermission('denied');
      setRecordingStatus('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    try {
      setIsRecording(false);
      setIsTimerActive(false); // Pause timer when recording stops
      setRecordingStage('idle');
      setStatusMessage('⏹️ Recording stopped. Ready for next response.');
      setRecordingStatus('Recording stopped');

      // Clear countdown if active
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        setIsCountingDown(false);
        setCountdown(0);
      }

      // Stop Web Speech API
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // COMMENTED OUT: MediaRecorder cleanup for OpenAI Whisper
      /*
      if (useFallback && recognitionRef.current) {
        // Stop Web Speech API
        recognitionRef.current.stop();
        setRecordingStatus('Web Speech API stopped');
      } else {
        // Stop MediaRecorder (OpenAI Whisper mode)
        // Clear the interval
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }

        // Stop media stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        setRecordingStatus('Recording stopped');
      }
      */
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingStatus('Error stopping recording');
      setStatusMessage('❌ Error stopping recording. Please try again.');
    }
  };

  // Toggle recording with countdown
  const toggleRecording = () => {
    if (!audioSupported) {
      alert('❌ Audio recording not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording || isCountingDown) {
      stopRecording();
    } else {
      // Start countdown before recording
      setRecordingStage('preparing');
      setStatusMessage('📋 Preparing to record...');
      setTimeout(() => {
        startCountdown();
      }, 500); // Small delay to show "preparing" state
    }
  };

  // Handle horizontal resizing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    if (newWidth >= 20 && newWidth <= 80) {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const testTranscript = () => {
    console.log('🧪 Testing transcript display...');
    setFinalTranscript('This is a test transcript to verify the UI is working correctly. ');
    setInterimTranscript('This is interim text...');
    setWordCount(10);
    setConfidence(0.95);
  };

  const clearTranscript = () => {
    setFinalTranscript('');
    setInterimTranscript('');
    setWordCount(0);
    setConfidence(0);
    setUseFallback(false);
    setRecordingStatus('');
    setRecordingStage('idle');
    setStatusMessage('Ready to start your interview response');
    setShowStartPrompt(true);
    setCountdown(0);
    setIsCountingDown(false);
    setTimeSpent(0);
    setIsTimerActive(false);
    
    // Clear any active intervals
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Clear console
    console.clear();
  };

  const submitResponse = async () => {
    if (!finalTranscript.trim()) {
      alert('Please provide a response before submitting.');
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        question: interviewQuestion.title,
        questionId: interviewQuestion.id,
        response: finalTranscript.trim(),
        wordCount,
        timeSpent,
        confidence,
        category: interviewQuestion.category,
        difficulty: interviewQuestion.difficulty
      };

      // Log submission data to console
      console.log('📤 Interview Response Submitted:');
      console.log('⏱️ Time spent:', formatTime(timeSpent));
      console.log('📝 Speech text:', finalTranscript);
      console.log('📊 Word count:', wordCount);
      console.log('🎯 Confidence:', Math.round(confidence * 100) + '%');
      console.log('📅 Timestamp:', new Date().toLocaleString());
      console.log('🔗 Sending to backend:', submissionData);

      // Send to backend
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/interview/response`, {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend response:', result);
        
        // Create local submission for UI
        const submission = {
          id: result.responseId || Date.now(),
          response: finalTranscript,
          wordCount,
          timeSpent,
          confidence,
          timestamp: new Date().toISOString(),
          saved: true
        };

        setSubmissionHistory(prev => [submission, ...prev]);
        setShowSubmissionModal(true);
        
        // Refresh history stats immediately to update tab count
        fetchInterviewHistory();
        
        // Clear everything after successful submission
        setTimeout(() => {
          clearTranscript();
        }, 2000);
        
        console.log('🎉 Response successfully saved to database!');
      } else {
        throw new Error(`Failed to save response: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Error submitting response:', error);
      
      // Still save locally and show modal even if backend fails
      const submission = {
        id: Date.now(),
        response: finalTranscript,
        wordCount,
        timeSpent,
        confidence,
        timestamp: new Date().toISOString(),
        saved: false,
        error: error.message
      };

      setSubmissionHistory(prev => [submission, ...prev]);
      setShowSubmissionModal(true);
      
      // Show user-friendly error
      alert('Your response was recorded locally but couldn\'t be saved to the server. Please check your connection and try again.');
      
      // Clear after showing error
      setTimeout(() => {
        clearTranscript();
      }, 2000);
    }
  };

  const interviewQuestion = {
    id: 1,
    category: "Behavioral",
    difficulty: "Medium",
    title: "Tell me about a challenging project you worked on",
    description: "Describe a project that presented significant challenges and how you overcame them. Focus on your problem-solving approach, the obstacles you faced, and the final outcome.",
    keyPoints: [
      "Describe the project context and your role",
      "Explain the specific challenges you encountered", 
      "Detail your approach to solving these challenges",
      "Share the outcome and what you learned",
      "Reflect on how this experience has shaped your approach to future projects"
    ],
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Be specific about your contributions",
      "Focus on your problem-solving process",
      "Mention measurable outcomes when possible",
      "Show growth and learning from the experience"
    ],
    timeLimit: "3-5 minutes recommended"
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';  
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div ref={containerRef} className="h-screen bg-white flex relative">
      {/* Left Panel - Question */}
      <div 
        className="border-r border-gray-200 flex flex-col transition-all duration-200"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {/* Question Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {interviewQuestion.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interviewQuestion.difficulty)}`}>
                  {interviewQuestion.difficulty}
                </span>
                <span className="text-gray-600">{interviewQuestion.category}</span>
                <span className="text-gray-600">{interviewQuestion.timeLimit}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            {['Question', 'Tips', 'Examples', 'History'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-1 ${
                  activeTab === tab.toLowerCase()
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab}</span>
                {tab === 'History' && historyStats && historyStats.totalResponses > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === 'history' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {historyStats.totalResponses}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'question' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Question Description</h3>
                <p className="text-gray-700 leading-relaxed">{interviewQuestion.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Points to Address</h3>
                <ul className="space-y-2">
                  {interviewQuestion.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 text-sm">•</span>
                      <span className="text-gray-700 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-900 mb-1">💡 Remember:</div>
                <div className="text-blue-800 text-sm">Take your time to think before speaking. Structure your response and speak clearly.</div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Interview Tips</h3>
              {interviewQuestion.tips.map((tip, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 text-sm">{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">💼</div>
              <div className="text-gray-500">Example responses coming soon...</div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {/* History Header with Stats and Refresh */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Interview History</h3>
                  <button
                    onClick={fetchInterviewHistory}
                    disabled={isLoadingHistory}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingHistory ? '🔄' : '↻'} Refresh
                  </button>
                </div>
                
                {submissionHistory.length > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    💡 Click on any response below to view detailed analysis and full transcript
                  </p>
                )}
                
                {/* Stats Summary */}
                {historyStats && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">Total Responses</div>
                      <div className="text-lg font-bold text-blue-900">{historyStats.totalResponses}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Avg Confidence</div>
                      <div className="text-lg font-bold text-green-900">
                        {Math.round(historyStats.averageConfidence * 100)}%
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">Avg Words</div>
                      <div className="text-lg font-bold text-purple-900">
                        {Math.round(historyStats.averageWordCount)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm text-yellow-600 font-medium">Total Time</div>
                      <div className="text-lg font-bold text-yellow-900">
                        {formatTime(historyStats.totalTimeSpent)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoadingHistory && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <div className="text-gray-500 text-sm">Loading your interview history...</div>
                </div>
              )}

              {/* Error State */}
              {historyError && !isLoadingHistory && (
                <div className="text-center py-8">
                  <div className="text-red-400 mb-2">❌</div>
                  <div className="text-red-600 text-sm mb-3">{historyError}</div>
                  <button
                    onClick={fetchInterviewHistory}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* History List */}
              {!isLoadingHistory && !historyError && (
                <>
                  {submissionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {submissionHistory.map((submission) => (
                        <div 
                          key={submission.id} 
                          className="group p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-300 hover:bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-md"
                          onClick={() => openResponseDetails(submission)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(submission.timestamp).toLocaleDateString()}
                              </span>
                              {submission.saved !== false ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Database
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Local
                                </span>
                              )}
                              {submission.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  {submission.category}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatTime(submission.timeSpent)}
                            </span>
                          </div>
                          
                          {/* Question */}
                          {submission.question && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500 mb-1">Question:</div>
                              <div className="text-sm text-gray-700 font-medium line-clamp-2">
                                {submission.question}
                              </div>
                            </div>
                          )}
                          
                          {/* Response */}
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">Your Response:</div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {submission.response.substring(0, 200)}
                              {submission.response.length > 200 ? '...' : ''}
                            </p>
                          </div>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {submission.wordCount} words • Confidence: {Math.round(submission.confidence * 100)}%
                            </div>
                            <div className="flex items-center space-x-2">
                              {submission.error && (
                                <span className="text-xs text-red-500" title={submission.error}>
                                  ⚠ Error
                                </span>
                              )}
                              <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to view details →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">📊</div>
                      <div className="text-gray-500">No interview responses found.</div>
                      <div className="text-gray-400 text-sm mt-1">Start practicing to see your history here!</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Resizer */}
      <div
        className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-ew-resize flex-shrink-0 relative group ${
          isDragging ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-gray-300 group-hover:bg-opacity-50 transition-colors">
          <div className="h-full flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Speech to Text */}
      <div 
        className="flex-1 flex flex-col bg-gray-50"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="font-semibold text-gray-900">
                Browser Speech Recognition
              </h2>
              
              {/* Recording Stage Indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                recordingStage === 'idle' ? 'bg-gray-100 text-gray-800' :
                recordingStage === 'preparing' ? 'bg-blue-100 text-blue-800' :
                recordingStage === 'countdown' ? 'bg-yellow-100 text-yellow-800' :
                recordingStage === 'recording' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {recordingStage === 'idle' && 'Ready'}
                {recordingStage === 'preparing' && 'Preparing'}
                {recordingStage === 'countdown' && `${countdown}`}
                {recordingStage === 'recording' && '🎤'}
                {recordingStage === 'processing' && 'Processing'}
              </div>
              
              {/* Timer Display */}
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-lg text-sm font-mono ${
                  timeSpent > 300 ? 'bg-red-100 text-red-800' : 
                  timeSpent > 180 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  ⏱️ {formatTime(timeSpent)}
                </div>
              </div>

              {/* Stats */}
              <div className="text-sm text-gray-600 flex items-center space-x-4">
                <span>Words: {wordCount}</span>
                <span>Confidence: {Math.round(confidence * 100)}%</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  audioSupported 
                    ? microphonePermission === 'granted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {audioSupported 
                    ? microphonePermission === 'granted' 
                      ? '✓ Ready' 
                      : '⚠ Mic Access'
                    : '✗ Not Supported'
                  }
                </span>
                {isProcessing && (
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 animate-pulse">
                    🤖 AI Processing
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* <button
                onClick={clearTranscript}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button> */}
              <button
                onClick={toggleRecording}
                disabled={!audioSupported}
                className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium flex items-center space-x-2 ${
                  !audioSupported 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title={!audioSupported ? 'Audio recording not supported in this browser' : ''}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>
                  {!audioSupported 
                    ? 'Not Supported' 
                    : isRecording 
                      ? 'Stop Recording' 
                      : 'Start Recording'
                  }
                </span>
              </button>
              <button
                onClick={submitResponse}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Submit Response
              </button>
            </div>
          </div>
          
          {/* Status Message Bar */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                recordingStage === 'recording' ? 'bg-red-500 animate-pulse' :
                recordingStage === 'preparing' || recordingStage === 'countdown' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">{statusMessage}</span>
              {recordingStatus && (
                <span className="text-xs text-gray-500 ml-2">• {recordingStatus}</span>
              )}
            </div>
          </div>
        </div>

        {/* Speech Display Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* Countdown Display */}
            {isCountingDown && countdown > 0 && (
              <div className="mb-6 flex items-center justify-center">
                <div className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-600 mb-2 animate-bounce">
                      {countdown}
                    </div>
                    <div className="text-lg font-medium text-yellow-800">
                      Get ready to speak...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recording Status Indicator */}
            {isRecording && (
              <div className="mb-4 flex items-center justify-center">
                <div className="flex items-center space-x-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 text-sm font-medium">
                    🎤 Recording with Browser Speech Recognition
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                    <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Preparing Status Indicator */}
            {recordingStage === 'preparing' && (
              <div className="mb-4 flex items-center justify-center">
                <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 text-sm font-medium">
                    📋 Preparing speech recognition...
                  </span>
                </div>
              </div>
            )}

            {/* Transcript Display */}
            <div className="bg-white rounded-lg border border-gray-200 min-h-96 p-6">
              {!audioSupported && (
                <div className="text-center py-8 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-yellow-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Audio Recording Not Supported</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Your browser doesn't support audio recording. Please use one of the following browsers:
                  </p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <span className="bg-white px-3 py-1 rounded-full text-yellow-800">Chrome</span>
                    <span className="bg-white px-3 py-1 rounded-full text-yellow-800">Edge</span>
                    <span className="bg-white px-3 py-1 rounded-full text-yellow-800">Safari</span>
                  </div>
                </div>
              )}
              
              <div className="prose prose-lg max-w-none">
                {finalTranscript || interimTranscript ? (
                  <>
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {finalTranscript}
                      {interimTranscript && (
                        <span className="text-gray-400 italic">{interimTranscript}</span>
                      )}
                      {isRecording && <span className="animate-pulse">|</span>}
                    </p>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {useFallback ? 'Ready to record with Browser Speech' : 'Ready to record with AI Whisper'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Click "Start Recording" to begin speaking. 
                      {useFallback 
                        ? ' Your browser will transcribe your words in real-time.' 
                        : ' OpenAI Whisper will transcribe your words in real-time.'
                      }
                    </p>
                    {microphonePermission === 'denied' && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 inline-block">
                        ⚠️ Microphone access denied. Please allow microphone permissions and refresh the page.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {finalTranscript && (
              <div className="mt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => navigator.clipboard.writeText(finalTranscript)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  📋 Copy Text
                </button>
                <button 
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(finalTranscript);
                    speechSynthesis.speak(utterance);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  🔊 Play Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Get latest submission for status */}
              {(() => {
                const latestSubmission = submissionHistory[0];
                const isSuccessful = latestSubmission?.saved !== false;
                const hasError = latestSubmission?.error;
                
                return (
                  <>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isSuccessful ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {isSuccessful ? (
                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isSuccessful ? 'Response Submitted!' : 'Response Recorded Locally'}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {isSuccessful 
                        ? 'Your interview response has been saved to the database and transcribed using AI.'
                        : 'Your response was recorded but couldn\'t be saved to the server. It\'s stored locally.'
                      }
                    </p>
                    
                    {hasError && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Note:</strong> {hasError}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mb-4 space-y-1">
                      <div>Time spent: {formatTime(timeSpent)}</div>
                      <div>Word count: {wordCount} words</div>
                      <div>Confidence: {Math.round(confidence * 100)}%</div>
                      {isSuccessful && (
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Saved to database</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Details Modal */}
      {showResponseModal && selectedResponse && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) {
              closeResponseDetails();
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Interview Response Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Recorded on {new Date(selectedResponse.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={closeResponseDetails}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Question Section */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Question</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-800 leading-relaxed">
                        {selectedResponse.question || interviewQuestion.title}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Category</span>
                          <span className="text-sm text-gray-900">{selectedResponse.category || 'General'}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Difficulty</span>
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            selectedResponse.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            selectedResponse.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {selectedResponse.difficulty || 'Medium'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Time Spent</span>
                          <span className="text-sm text-gray-900">{formatTime(selectedResponse.timeSpent)}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Word Count</span>
                          <span className="text-sm text-gray-900">{selectedResponse.wordCount} words</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Confidence</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  selectedResponse.confidence >= 0.8 ? 'bg-green-500' :
                                  selectedResponse.confidence >= 0.6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${selectedResponse.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">
                              {Math.round(selectedResponse.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Status</span>
                          {selectedResponse.saved !== false ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Saved to Database
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Local Only
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Your Response</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedResponse.response)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(selectedResponse.response);
                          speechSynthesis.speak(utterance);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 15h2.5L12 21V3L7.5 9H5v6z" />
                        </svg>
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {selectedResponse.response}
                      </p>
                    </div>
                  </div>

                  {/* Response Analysis */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Response Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-900">{selectedResponse.wordCount}</div>
                        <div className="text-sm text-blue-600">Total Words</div>
                        <div className="text-xs text-blue-500 mt-1">
                          ~{Math.round(selectedResponse.wordCount / (selectedResponse.timeSpent / 60))} words/min
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-900">{formatTime(selectedResponse.timeSpent)}</div>
                        <div className="text-sm text-green-600">Speaking Time</div>
                        <div className="text-xs text-green-500 mt-1">
                          {selectedResponse.timeSpent < 60 ? 'Too short' : 
                           selectedResponse.timeSpent > 300 ? 'Very detailed' : 'Good length'}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-900">
                          {selectedResponse.response.split('.').filter(s => s.trim().length > 0).length}
                        </div>
                        <div className="text-sm text-purple-600">Sentences</div>
                        <div className="text-xs text-purple-500 mt-1">
                          Avg {Math.round(selectedResponse.wordCount / selectedResponse.response.split('.').filter(s => s.trim().length > 0).length)} words/sentence
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-900">
                          {Math.round(selectedResponse.confidence * 100)}%
                        </div>
                        <div className="text-sm text-yellow-600">Confidence</div>
                        <div className="text-xs text-yellow-500 mt-1">
                          {selectedResponse.confidence >= 0.8 ? 'Excellent clarity' :
                           selectedResponse.confidence >= 0.6 ? 'Good clarity' : 'Could be clearer'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedResponse.error && (
                    <span className="text-red-600">⚠ {selectedResponse.error}</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Create a downloadable text file
                      const content = `Interview Response - ${new Date(selectedResponse.timestamp).toLocaleDateString()}\n\nQuestion: ${selectedResponse.question || interviewQuestion.title}\n\nResponse:\n${selectedResponse.response}\n\nMetrics:\n- Word Count: ${selectedResponse.wordCount}\n- Time Spent: ${formatTime(selectedResponse.timeSpent)}\n- Confidence: ${Math.round(selectedResponse.confidence * 100)}%\n- Category: ${selectedResponse.category || 'General'}\n- Difficulty: ${selectedResponse.difficulty || 'Medium'}`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `interview-response-${new Date(selectedResponse.timestamp).toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={closeResponseDetails}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechToTextDis;
