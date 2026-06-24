// Here recordings will be found
import React, { useEffect, useState, useRef } from "react"; // Added useRef
import { ChevronDown, ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react"; // Added ChevronDown

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RecordingsDashboard() {
  const [recordings, setRecordings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // --- New State for Custom Filter Dropdown ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef(null);
  const filterOptions = ["all", "today", "yesterday", "last week", "last month"];
  // -------------------------------------------

  useEffect(() => {
    const fetchRecordings = async () => {
      const token = localStorage.getItem('auth_token');
      
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        setError('Please log in to view your recordings');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/recordings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status);

        if (response.status === 401) {
          setError('Session expired or invalid. Please log in again.');
          setLoading(false);
          localStorage.removeItem('auth_token');
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched recordings:', data);
        
        const existing = data.filter((rec) => rec.path);
        setRecordings(existing);
        setError(null);
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setError('Failed to load recordings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);


  // --- New useEffect for closing the filter dropdown on outside click ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const handleFilterSelect = (newFilter) => {
    setFilter(newFilter);
    setIsFilterOpen(false);  
  };
  // ---------------------------------------------------------------------

  // ===== Filter logic (remains the same) =====
  const filteredRecordings = recordings.filter((rec) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const recDate = rec.createdAt.slice(0, 10);

    switch (filter) {
      case "today":
        return recDate === today;
      case "yesterday":
        return recDate === yesterday;
      case "last week":
        return recDate > lastWeek;
      case "last month":
        return recDate > lastMonth;
      default:
        return true;
    }
  });

  // ===== Calendar helpers (Enhanced) =====
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    // Logic for highlighting today's date
    const todayActual = new Date();
    const isThisActualMonth = month === todayActual.getMonth() && year === todayActual.getFullYear();
    const actualDayOfMonth = todayActual.getDate();

    // Group recordings by day for the current month
    const recordingsByDay = recordings.reduce((acc, rec) => {
      const recDate = new Date(rec.createdAt);
      if (recDate.getFullYear() === year && recDate.getMonth() === month) {
        const day = recDate.getDate();
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {});


    const calendarDays = [];

    // Add padding days
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Add actual days
    for (let i = 1; i <= numDays; i++) {
      const isToday = isThisActualMonth && i === actualDayOfMonth;
      const count = recordingsByDay[i] || 0;

      calendarDays.push(
        <div
          key={`day-${i}`}
          className={`
            relative w-8 h-8 flex flex-col items-center justify-center rounded-full 
            cursor-pointer text-sm font-medium transition duration-200 ease-in-out
            ${isToday ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-gray-300'}
          `}
        >
          <span className="z-10">{i}</span>
          {count > 0 && (
            <span
              className={`
                absolute bottom-0.5 w-1.5 h-1.5 rounded-full transition-colors duration-200
                ${isToday ? 'bg-white' : 'bg-green-600'} 
              `}
              title={`${count} recording${count > 1 ? 's' : ''}`}
            />
          )}
        </div>
      );
    }
    return calendarDays;
  };

  const handlePrevMonth = () => setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const openModal = (recording) => {
    console.log('Opening recording:', recording);
    console.log('Video URL:', recording.url);
    console.log('Video path:', recording.path);
    console.log('Question:', recording.question);
    setSelectedRecording(recording);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecording(null);
    setAnalysisResult(null);
    setShowAnalysis(false);
  };

  const analyzeRecording = async () => {
    if (!selectedRecording) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please log in to analyze recordings');
        setIsAnalyzing(false);
        return;
      }

      // Create form data with recording information
      const formData = new FormData();
      formData.append("recordingId", selectedRecording._id);
      formData.append("role", selectedRecording.role);
      formData.append("difficulty", selectedRecording.difficulty);
      formData.append("videoUrl", selectedRecording.url || `${API_BASE_URL}${selectedRecording.path}`);

      const response = await fetch(`${API_BASE_URL}/api/analyze-recording`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      // Update the recording to reflect that it now has analysis
      setSelectedRecording(prev => ({
        ...prev,
        hasAnalysis: true,
        analysisDate: new Date()
      }));
      
      // Update the recordings list to reflect the analysis
      setRecordings(prevRecordings => 
        prevRecordings.map(rec => 
          rec._id === selectedRecording._id 
            ? { ...rec, hasAnalysis: true, analysisDate: new Date() }
            : rec
        )
      );
    } catch (error) {
      console.error("Analysis error:", error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewExistingAnalysis = async () => {
    if (!selectedRecording || !selectedRecording.hasAnalysis) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please log in to view analysis');
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/analysis/${selectedRecording._id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setError('Failed to load existing analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen font-sans p-4 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Recordings */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-extrabold text-gray-800">Interview Recordings</h1>
            <div className="flex items-center space-x-4">
              <span className="text-lg text-gray-600 font-medium">Date: </span>
              <span className="text-lg text-gray-800 font-semibold">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md">
              <p className="font-semibold text-lg">⚠️ {error}</p>
              {error.includes('log in') && (
                <a href="/signin" className="text-blue-600 underline mt-2 inline-block">
                  Go to Sign In
                </a>
              )}
            </div>
          )}

          {/* Recordings Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRecordings.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-xl text-gray-500">No recordings found</p>
                  <p className="text-gray-400 mt-2">Start your first interview to see recordings here!</p>
                </div>
              ) : (
                filteredRecordings.map((rec) => (
                  <div
                    key={rec._id}
                    className="relative aspect-video bg-gray-300 rounded-xl overflow-hidden shadow-lg flex items-center justify-center group cursor-pointer"
                    onClick={() => openModal(rec)}
                  >
                    {/* Analysis Badge */}
                    {rec.hasAnalysis && (
                      <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg flex items-center gap-1">
                        <span>📊</span>
                        Analyzed
                      </div>
                    )}
                    
                    <PlayCircle className="absolute w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-300 z-10" />
                    <video
                      src={rec.url || `${API_BASE_URL}${rec.path}`}
                      className="w-full h-full object-cover pointer-events-none"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.classList.add('bg-gray-500');
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                      <span className="block text-sm font-semibold truncate">{rec.filename}</span>
                      <span className="block text-xs text-gray-300">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                      <span className="block text-xs text-gray-300 flex items-center justify-between">
                        <span>Role: {rec.role}, Difficulty: {rec.difficulty}</span>
                        {rec.hasAnalysis && (
                          <span className="text-blue-300 font-medium">✓ Analyzed</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- Sidebar --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filter (Refactored to Custom Dropdown) */}
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter</h2>
            
            {/* Custom Select Implementation with ref for outside click */}
            <div className="relative w-full" ref={dropdownRef}>
              {/* Visible Select Button */}
              <button
                type="button"
                className={`
                  w-full p-2.5 bg-gray-300 border border-gray-400 text-gray-700 shadow-inner rounded-xl 
                  flex justify-between items-center transition duration-200 
                  ${isFilterOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-blue-400'}
                `}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <span className="capitalize">{filter}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl 
                                     shadow-xl overflow-hidden z-20"
                >
                  <ul className="py-1">
                    {filterOptions.map((option) => (
                      <li
                        key={option}
                        className={`
                          p-2.5 text-gray-800 capitalize cursor-pointer transition-colors duration-150
                          ${filter === option 
                            ? 'bg-blue-600 text-white font-semibold' 
                            : 'hover:bg-blue-100 hover:text-gray-900' 
                          }
                        `}
                        onClick={() => handleFilterSelect(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Calendar (Enhanced) */}
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 text-gray-800 font-semibold text-xl">
              <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-300 transition duration-200">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span>
                {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-300 transition duration-200">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>
            <div className="grid grid-cols-7 text-center gap-y-1">{renderCalendar()}</div>
          </div>
        </div>
      </div>

      {/* Video Modal (Remains the same) */}
      {isModalOpen && selectedRecording && (
        <div 
          className="fixed inset-0 backdrop-blur-lg bg-gradient-to-br from-gray-900/80 via-slate-900/80 to-zinc-900/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 max-w-6xl w-full max-h-[92vh] overflow-hidden transform transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-50 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-white rounded-full p-2.5 transition-all duration-200 border border-red-400/30 hover:border-red-400/50 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header - Glassmorphism */}
            <div className="bg-gradient-to-r from-slate-800/40 via-gray-800/40 to-zinc-800/40 backdrop-blur-xl px-8 py-5 border-b border-white/10">
              {/* <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {selectedRecording.filename}
              </h2> */}
              {/* <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-gray-200 flex items-center gap-2">
                  <span className="text-blue-400">📅</span>
                  {new Date(selectedRecording.createdAt).toLocaleString()}
                </span>
                <span className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-lg border border-emerald-400/30 text-emerald-300 flex items-center gap-2">
                  <span>👔</span>
                  {selectedRecording.role}
                </span>
                <span className={`px-3 py-1.5 backdrop-blur-md rounded-lg border flex items-center gap-2 ${
                  selectedRecording.difficulty === 'easy' ? 'bg-green-500/20 border-green-400/30 text-green-300' :
                  selectedRecording.difficulty === 'medium' ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' :
                  'bg-red-500/20 border-red-400/30 text-red-300'
                }`}>
                  <span>⚡</span>
                  {selectedRecording.difficulty}
                </span>
                {selectedRecording.size && (
                  <span className="px-3 py-1.5 bg-purple-500/20 backdrop-blur-md rounded-lg border border-purple-400/30 text-purple-300 flex items-center gap-2">
                    <span>📦</span>
                    {(selectedRecording.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div> */}

              {/* Interview Question */}
              {selectedRecording.question && (
                <div className="mt-4 p-4 bg-indigo-500/10 backdrop-blur-md rounded-lg border border-indigo-400/30">
                  <div className="flex items-start gap-2">
                    {/* <span className="text-indigo-300 mt-1">❓</span> */}
                    {/* <div> */}
                      {/* <h4 className="text-sm font-semibold text-indigo-200 mb-1">Interview Question</h4> */}
                      <p className="text-indigo-100 text-sm leading-relaxed">
                        {selectedRecording.question}
                      </p>
                    {/* </div> */}
                  </div>
                </div>
              )}
            </div>

            {/* Video Player Container */}
            <div className="relative bg-black/40 backdrop-blur-sm p-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <video
                  key={selectedRecording._id}
                  controls
                  autoPlay
                  className="w-full max-h-[65vh] object-contain bg-black"
                  onError={(e) => {
                    console.error('Video load error:', e);
                    console.error('Attempted URL:', selectedRecording.url || `${API_BASE_URL}${selectedRecording.path}`);
                  }}
                >
                  <source 
                    src={selectedRecording.url || `${API_BASE_URL}${selectedRecording.path}`} 
                    type="video/webm" 
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Modal Footer - Glassmorphism */}
            <div className="bg-gradient-to-r from-slate-800/40 via-gray-800/40 to-zinc-800/40 backdrop-blur-xl px-8 py-5 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-wrap">
                  {selectedRecording.bucket && (
                    <span className="px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30 text-blue-300 text-sm font-medium">
                      🗄️ {selectedRecording.bucket}
                    </span>
                  )}
                  <span className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-md rounded-lg border border-emerald-400/30 text-emerald-300 flex items-center gap-2">
                    <span>👔</span>
                    {selectedRecording.role}
                  </span>
                  <span className={`px-3 py-1.5 backdrop-blur-md rounded-lg border flex items-center gap-2 ${
                    selectedRecording.difficulty === 'easy' ? 'bg-green-500/20 border-green-400/30 text-green-300' :
                    selectedRecording.difficulty === 'medium' ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' :
                    'bg-red-500/20 border-red-400/30 text-red-300'
                  }`}>
                    <span>⚡</span>
                    {selectedRecording.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={selectedRecording?.hasAnalysis ? viewExistingAnalysis : analyzeRecording}
                    disabled={isAnalyzing}
                    className={`px-6 py-2.5 backdrop-blur-md text-white font-semibold rounded-xl transition-all duration-200 border transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      selectedRecording?.hasAnalysis 
                        ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 border-blue-400/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/30'
                        : 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 border-green-400/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/30'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {selectedRecording?.hasAnalysis ? 'Loading...' : 'Analyzing...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{selectedRecording?.hasAnalysis ? '📊' : '🔍'}</span>
                        {selectedRecording?.hasAnalysis ? 'View Analysis' : 'Analyze Interview'}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 backdrop-blur-md text-white font-semibold rounded-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Modal */}
      {showAnalysis && analysisResult && (
        <div 
          className="fixed inset-0 backdrop-blur-lg bg-gradient-to-br from-gray-900/90 via-slate-900/90 to-zinc-900/90 flex items-center justify-center z-60 p-4 animate-in fade-in duration-200"
          onClick={() => setShowAnalysis(false)}
        >
          <div 
            className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAnalysis(false)}
              className="absolute top-6 right-6 z-50 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md text-white rounded-full p-2.5 transition-all duration-200 border border-red-400/30 hover:border-red-400/50 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Analysis Header */}
            <div className="bg-gradient-to-r from-purple-800/40 via-blue-800/40 to-indigo-800/40 backdrop-blur-xl px-8 py-6 border-b border-white/10">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                🔍 Interview Analysis Report
              </h2>
              <p className="text-gray-300 mt-2">AI-powered evaluation of your interview performance</p>
            </div>

            {/* Analysis Content */}
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Overall Score */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md p-6 rounded-2xl border border-green-400/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-300 mb-2">
                      {analysisResult.overallScore}%
                    </div>
                    <div className="text-green-200 font-medium">Overall Performance</div>
                    <div className="text-sm text-green-400 mt-1">Comprehensive Rating</div>
                  </div>
                </div>
                
                {/* Speaking Clarity */}
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md p-6 rounded-2xl border border-blue-400/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-300 mb-2">
                      {analysisResult.clarityScore}%
                    </div>
                    <div className="text-blue-200 font-medium">Speaking Clarity</div>
                    <div className="text-sm text-blue-400 mt-1">Communication Skills</div>
                  </div>
                </div>
                
                {/* Technical Accuracy */}
                <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 backdrop-blur-md p-6 rounded-2xl border border-purple-400/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-300 mb-2">
                      {analysisResult.technicalScore}%
                    </div>
                    <div className="text-purple-200 font-medium">Technical Knowledge</div>
                    <div className="text-sm text-purple-400 mt-1">Subject Expertise</div>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-6">
                {/* Strengths */}
                {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                  <div className="bg-green-500/10 backdrop-blur-md border border-green-400/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      Key Strengths
                    </h3>
                    <div className="grid gap-3">
                      {analysisResult.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 bg-green-500/5 p-3 rounded-lg">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-green-100">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement */}
                {analysisResult.improvements && analysisResult.improvements.length > 0 && (
                  <div className="bg-orange-500/10 backdrop-blur-md border border-orange-400/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      Areas for Improvement
                    </h3>
                    <div className="grid gap-3">
                      {analysisResult.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-3 bg-orange-500/5 p-3 rounded-lg">
                          <span className="text-orange-400 mt-1">•</span>
                          <span className="text-orange-100">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Mistakes */}
                {analysisResult.mistakes && analysisResult.mistakes.length > 0 && (
                  <div className="bg-red-500/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      Key Mistakes to Address
                    </h3>
                    <div className="grid gap-3">
                      {analysisResult.mistakes.map((mistake, index) => (
                        <div key={index} className="flex items-start gap-3 bg-red-500/5 p-3 rounded-lg">
                          <span className="text-red-400 mt-1">•</span>
                          <span className="text-red-100">{mistake}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Feedback */}
                {analysisResult.feedback && (
                  <div className="bg-blue-500/10 backdrop-blur-md border border-blue-400/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💬</span>
                      Additional Feedback
                    </h3>
                    <div className="bg-blue-500/5 p-4 rounded-lg">
                      <p className="text-blue-100 leading-relaxed">{analysisResult.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="bg-purple-500/10 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Recommendations
                    </h3>
                    <div className="grid gap-3">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg">
                          <span className="text-purple-400 mt-1">•</span>
                          <span className="text-purple-100">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Footer */}
            <div className="bg-gradient-to-r from-slate-800/40 via-gray-800/40 to-zinc-800/40 backdrop-blur-xl px-8 py-5 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {analysisResult?.analysisDate ? (
                    <>Analysis generated on {new Date(analysisResult.analysisDate).toLocaleDateString()} at {new Date(analysisResult.analysisDate).toLocaleTimeString()}</>
                  ) : (
                    <>Analysis generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</>
                  )}
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 backdrop-blur-md text-white font-semibold rounded-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display for Analysis */}
      {error && isAnalyzing === false && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl border border-red-400/30 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold">Analysis Error</div>
              <div className="text-sm text-red-200">{error}</div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}