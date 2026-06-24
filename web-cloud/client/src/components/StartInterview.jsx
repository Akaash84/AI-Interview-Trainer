import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StartInterview() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [allowAccess, setAllowAccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const isReady = role && difficulty && allowAccess && agreeTerms;

  const startInterview = () => {
    if (!isReady) return;

    // Navigate to the interview session with role and difficulty
    navigate('/interview-session', {
      state: { role, difficulty }
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          {/* <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Interview
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice with our advanced AI interviewer. Get real-time feedback and improve your interview skills.
            </p>
          </div> */}

          {/* Configuration Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-semibold text-white">Start Interview</h2>
              {/* <p className="text-blue-100 mt-2">Select your preferences to get started</p> */}
            </div>

            <div className="p-8 space-y-8">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0h4a2 2 0 012 2v2M8 6H4a2 2 0 00-2 2v2m0 4v4a2 2 0 002 2h4m8-8v8a2 2 0 01-2 2h-4" />
                    </svg>
                    Select Your Role
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'frontend', label: 'Frontend Developer', icon: '🎨', desc: 'UI/UX, React, Vue, Angular' },
                    { value: 'backend', label: 'Backend Developer', icon: '⚙️', desc: 'APIs, Databases, Server Logic' },
                    { value: 'fullstack', label: 'Full Stack Engineer', icon: '🚀', desc: 'End-to-end Development' },
                    { value: 'data-scientist', label: 'Data Scientist', icon: '📊', desc: 'ML, Analytics, Python' }
                  ].map((roleOption) => (
                    <div
                      key={roleOption.value}
                      onClick={() => setRole(roleOption.value)}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        role === roleOption.value
                          ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-105'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">{roleOption.icon}</div>
                        <h3 className="font-bold text-gray-900 mb-2">{roleOption.label}</h3>
                        <p className="text-sm text-gray-600">{roleOption.desc}</p>
                      </div>
                      {role === roleOption.value && (
                        <div className="absolute top-3 right-3">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Difficulty Level
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'easy', label: 'Easy', desc: 'Basic questions', color: 'green', icon: '🌱' },
                    { value: 'medium', label: 'Medium', desc: 'Intermediate level', color: 'yellow', icon: '🔥' },
                    { value: 'hard', label: 'Hard', desc: 'Advanced concepts', color: 'red', icon: '⚡' }
                  ].map((level) => (
                    <div
                      key={level.value}
                      onClick={() => setDifficulty(level.value)}
                      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        difficulty === level.value
                          ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{level.icon}</div>
                        <h3 className="font-semibold text-gray-900">{level.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{level.desc}</p>
                      </div>
                      {difficulty === level.value && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions & Agreement */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Permissions & Terms
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={allowAccess}
                        onChange={(e) => setAllowAccess(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        Camera & Microphone Access
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Required to record your interview session and provide feedback
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        Terms & Conditions
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <button
                  disabled={!isReady}
                  onClick={startInterview}
                  className={`group relative px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
                    !isReady 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105 active:scale-95"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Interview Session
                    {!isReady && (
                      <span className="text-sm font-normal opacity-75 ml-2">
                        (Complete all fields above)
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "AI-Powered Questions",
                desc: "Dynamic questions tailored to your role and experience level"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Real-time Analysis",
                desc: "Get instant feedback on your responses and performance"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: "Detailed Reports",
                desc: "Comprehensive analysis with improvement recommendations"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  {feature.icon}
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
