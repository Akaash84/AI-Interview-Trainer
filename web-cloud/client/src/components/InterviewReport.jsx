import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertCircle, BarChart3, Target, Zap, Award, ChevronRight, Calendar, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function InterviewReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're coming from a new interview completion
    const forceRefresh = location.state?.refreshReport;
    
    if (forceRefresh) {
      // Clear the state to prevent re-fetching on subsequent visits
      window.history.replaceState({}, document.title);
      fetchReportData(true);
    } else {
      fetchReportData(false);
    }
  }, []);

  const fetchReportData = async (forceRefresh = false) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please log in to view reports');
        setLoading(false);
        return;
      }

      // Check for cached data first
      const cachedReport = localStorage.getItem('cached_interview_report');
      const cacheTimestamp = localStorage.getItem('report_cache_timestamp');
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
      
      // Use cached data if available and not forcing refresh
      if (!forceRefresh && cachedReport && cacheAge < 24 * 60 * 60 * 1000) { // Cache for 24 hours
        console.log('Using cached interview report');
        setReportData(JSON.parse(cachedReport));
        setLoading(false);
        return;
      }
      
      // Fetch fresh data
      const endpoint = `${API_BASE_URL}/api/interview-report/comprehensive`;
      
      console.log('Fetching comprehensive report from:', endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report data');
      }

      const data = await response.json();
      console.log('Comprehensive report data:', data);
      
      // Cache the report data
      localStorage.setItem('cached_interview_report', JSON.stringify(data.comprehensiveAnalysis));
      localStorage.setItem('report_cache_timestamp', Date.now().toString());
      
      setReportData(data.comprehensiveAnalysis);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Analyzing interview data...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Report</h2>
          <p className="text-gray-600 mb-6">{error || 'No interview data found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('Comprehensive report data:', reportData);

  // Use comprehensive analysis data
  const safeResponse = {
    overallScore: reportData?.overallScore || 0,
    clarityScore: reportData?.clarityScore || 0,
    technicalScore: reportData?.technicalScore || 0,
    totalInterviews: reportData?.totalInterviews || 0,
    progressTrend: reportData?.progressTrend || 'stable',
    feedback: reportData?.feedback || 'No feedback available',
    strengths: Array.isArray(reportData?.strengths) ? reportData.strengths : [],
    improvements: Array.isArray(reportData?.improvements) ? reportData.improvements : [],
    recommendations: Array.isArray(reportData?.recommendations) ? reportData.recommendations : [],
    nextSteps: Array.isArray(reportData?.nextSteps) ? reportData.nextSteps : [],
    keyInsights: Array.isArray(reportData?.keyInsights) ? reportData.keyInsights : [],
    scoreProgression: Array.isArray(reportData?.scoreProgression) ? reportData.scoreProgression : [],
    interviewHistory: Array.isArray(reportData?.interviewHistory) ? reportData.interviewHistory : []
  };

  console.log('Safe response:', safeResponse);

  // Calculate percentage for visual representation
  const getScorePercentage = (score) => Math.min((score / 10) * 100, 100);
  const getScoreColor = (score) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getBarColor = (score) => {
    if (score >= 7) return 'bg-green-600';
    if (score >= 4) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{safeResponse.totalInterviews} Interview{safeResponse.totalInterviews !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Overall Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                safeResponse.overallScore >= 7 ? 'bg-green-100 text-green-700' :
                safeResponse.overallScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {safeResponse.overallScore >= 7 ? 'Excellent' : safeResponse.overallScore >= 4 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{safeResponse.overallScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Overall Score</div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getBarColor(safeResponse.overallScore)}`}
                style={{ width: `${getScorePercentage(safeResponse.overallScore)}%` }}
              ></div>
            </div>
          </div>

          {/* Clarity Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                safeResponse.clarityScore >= 7 ? 'bg-green-100 text-green-700' :
                safeResponse.clarityScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {safeResponse.clarityScore >= 7 ? 'Clear' : safeResponse.clarityScore >= 4 ? 'Fair' : 'Unclear'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{safeResponse.clarityScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Clarity Score</div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getBarColor(safeResponse.clarityScore)}`}
                style={{ width: `${getScorePercentage(safeResponse.clarityScore)}%` }}
              ></div>
            </div>
          </div>

          {/* Technical Score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                safeResponse.technicalScore >= 7 ? 'bg-green-100 text-green-700' :
                safeResponse.technicalScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {safeResponse.technicalScore >= 7 ? 'Strong' : safeResponse.technicalScore >= 4 ? 'Average' : 'Weak'}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{safeResponse.technicalScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Technical Score</div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getBarColor(safeResponse.technicalScore)}`}
                style={{ width: `${getScorePercentage(safeResponse.technicalScore)}%` }}
              ></div>
            </div>
          </div>

          {/* Progress Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                safeResponse.progressTrend === 'improving' ? 'bg-green-50' : 
                safeResponse.progressTrend === 'declining' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                {safeResponse.progressTrend === 'improving' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : safeResponse.progressTrend === 'declining' ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <Activity className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 capitalize">{safeResponse.progressTrend}</div>
            <div className="text-sm text-gray-500">Progress Trend</div>
          </div>
        </div>

        {/* Score Progression Chart */}
        {safeResponse.scoreProgression && safeResponse.scoreProgression.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              Score Progression
            </h2>
            <div className="h-80">
              <Line
                data={{
                  labels: safeResponse.scoreProgression.map((_, index) => `#${index + 1}`),
                  datasets: [
                    {
                      label: 'Overall Score',
                      data: safeResponse.scoreProgression.map(interview => interview.overall),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                    },
                    {
                      label: 'Clarity Score',
                      data: safeResponse.scoreProgression.map(interview => interview.clarity || interview.overall),
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgb(34, 197, 94)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                    },
                    {
                      label: 'Technical Score',
                      data: safeResponse.scoreProgression.map(interview => interview.technical || interview.overall),
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgb(168, 85, 247)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: '500'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        weight: 'bold'
                      },
                      bodyFont: {
                        size: 13
                      },
                      callbacks: {
                        label: function(context) {
                          return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}/10`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                      ticks: {
                        stepSize: 2,
                        font: {
                          size: 11
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 11,
                          weight: '500'
                        }
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Performance Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Overall Performance', score: safeResponse.overallScore },
              { label: 'Communication Clarity', score: safeResponse.clarityScore },
              { label: 'Technical Knowledge', score: safeResponse.technicalScore }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                    {item.score.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getBarColor(item.score)}`}
                    style={{ width: `${getScorePercentage(item.score)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            Comprehensive Analysis
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {safeResponse.feedback}
          </p>
        </div>

        {/* Key Insights */}
        {safeResponse.keyInsights && safeResponse.keyInsights.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Key Insights</h2>
            </div>
            <ul className="space-y-3">
              {safeResponse.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Your Strengths</h2>
            </div>
            {safeResponse.strengths.length > 0 ? (
              <ul className="space-y-3">
                {safeResponse.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span className="text-gray-700 text-sm leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm italic">No strengths recorded</p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-amber-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Areas for Improvement</h2>
            </div>
            {safeResponse.improvements.length > 0 ? (
              <ul className="space-y-3">
                {safeResponse.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <ChevronRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span className="text-gray-700 text-sm leading-relaxed">{improvement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm italic">No improvements recorded</p>
            )}
          </div>
        </div>

        {/* Recommendations & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recommendations */}
          {safeResponse.recommendations && safeResponse.recommendations.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Recommendations</h2>
              </div>
              <ul className="space-y-3">
                {safeResponse.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span className="text-gray-700 text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {safeResponse.nextSteps && safeResponse.nextSteps.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Next Steps</h2>
              </div>
              <ul className="space-y-3">
                {safeResponse.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 text-sm pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Interview History */}
        {safeResponse.interviewHistory && safeResponse.interviewHistory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-700" />
                Recent Interviews
              </h2>
              {safeResponse.interviewHistory.length > 3 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Showing latest 3 of {safeResponse.interviewHistory.length}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {safeResponse.interviewHistory.slice(0, 3).map((interview, index) => (
                <div key={interview.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        #{index + 1} - {interview.role || 'General Interview'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(interview.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })} • 
                        <span className={`ml-1 font-medium ${
                          interview.difficulty === 'easy' ? 'text-green-600' :
                          interview.difficulty === 'medium' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {interview.difficulty ? interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1) : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-white rounded border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Overall</div>
                      <div className={`text-base font-bold ${getScoreColor(interview.scores.overall)}`}>
                        {interview.scores.overall.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Clarity</div>
                      <div className={`text-base font-bold ${getScoreColor(interview.scores.clarity)}`}>
                        {interview.scores.clarity.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Technical</div>
                      <div className={`text-base font-bold ${getScoreColor(interview.scores.technical)}`}>
                        {interview.scores.technical.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pb-8">
          <button
            onClick={() => navigate('/start-interview')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition-all hover:shadow-lg flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Take Another Interview
          </button>
          <button
            onClick={() => navigate('/recordings')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all hover:border-gray-400 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            View Recordings
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewReport;
