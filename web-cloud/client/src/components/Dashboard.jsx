import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  FileText,
  Video,
  Code,
  BookOpen,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Check for cached data first
      const cachedReport = localStorage.getItem("cached_interview_report");
      const cachedRecordings = localStorage.getItem("cached_recordings");
      const cacheTimestamp = localStorage.getItem("dashboard_cache_timestamp");

      // Use cached data immediately if available
      if (cachedReport && cachedRecordings) {
        setDashboardData({
          report: JSON.parse(cachedReport),
          recordings: JSON.parse(cachedRecordings),
        });
      } else {
        setLoading(true);
      }

      // Only fetch recordings (lightweight) in background
      try {
        const recordingsRes = await fetch(`${API_BASE_URL}/api/recordings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (recordingsRes.ok) {
          const recordingsData = await recordingsRes.json();
          localStorage.setItem("cached_recordings", JSON.stringify(recordingsData));
          
          setDashboardData(prev => ({
            report: prev?.report || JSON.parse(cachedReport || "null"),
            recordings: recordingsData || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching recordings:", error);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  // Chart configurations with user-friendly colors
  const performanceData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Performance Score",
        data: [6.5, 7.2, 7.8, 8.1],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const skillsData = {
    labels: ["Technical", "Communication", "Problem Solving", "Confidence"],
    datasets: [
      {
        data: [75, 82, 68, 78],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"],
        borderWidth: 0,
      },
    ],
  };

  const topicsData = {
    labels: ["Algorithms", "System Design", "DBMS", "Networks", "OS"],
    datasets: [
      {
        label: "Practice Count",
        data: [45, 23, 18, 15, 12],
        backgroundColor: [
          "#3b82f6", // Blue
          "#8b5cf6", // Purple
          "#06b6d4", // Cyan
          "#10b981", // Green
          "#f59e0b", // Amber
        ],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
        },
      },
    },
  };

  const QuickStatCard = ({ icon: Icon, label, value, trend, onClick, gradient }) => (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`${gradient} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  // Show loading only if no cached data
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.name || "User"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your progress and enhance your skills
            </p>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <Crown className="w-5 h-5" />
            Get Pro
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickStatCard
            icon={Target}
            label="Interviews Completed"
            value={dashboardData?.report?.totalInterviews || "0"}
            trend="+12% this month"
            onClick={() => navigate("/interview-report")}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <QuickStatCard
            icon={Award}
            label="Average Score"
            value={dashboardData?.report?.overallScore?.toFixed(1) || "0.0"}
            trend="+0.5 from last week"
            onClick={() => navigate("/interview-report")}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <QuickStatCard
            icon={Video}
            label="Recordings"
            value={dashboardData?.recordings?.length || "0"}
            onClick={() => navigate("/recordings")}
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <QuickStatCard
            icon={BookOpen}
            label="Practice Sessions"
            value="113"
            trend="+23 this week"
            onClick={() => navigate("/practice-page")}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Performance Trend
                </h2>
                <p className="text-sm text-gray-600">
                  Your progress over the last month
                </p>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 4 Weeks</option>
                <option>Last 3 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Skills Breakdown
            </h2>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={skillsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#374151",
                        font: { size: 11 },
                        padding: 12,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/start-interview")}
                className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all group shadow-md"
              >
                <Target className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold">Start Interview</p>
                <p className="text-xs text-blue-100 mt-1">Begin new session</p>
              </button>
              <button
                onClick={() => navigate("/practice-page")}
                className="bg-white border-2 border-gray-300 text-gray-900 p-4 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <Code className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform text-purple-600" />
                <p className="font-semibold">Practice</p>
                <p className="text-xs text-gray-600 mt-1">Solve problems</p>
              </button>
              <button
                onClick={() => navigate("/resume-analyzer")}
                className="bg-white border-2 border-gray-300 text-gray-900 p-4 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <FileText className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform text-cyan-600" />
                <p className="font-semibold">Analyze Resume</p>
                <p className="text-xs text-gray-600 mt-1">Get feedback</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Interview Completed
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 text-purple-700 p-2 rounded">
                  <Code className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Solved 5 Problems
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-cyan-100 text-cyan-700 p-2 rounded">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Resume Analyzed
                  </p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Practice Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Practice by Topic
              </h2>
              <p className="text-sm text-gray-600">
                Your focus areas this month
              </p>
            </div>
            <button
              onClick={() => navigate("/practice")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64">
            <Bar
              data={topicsData}
              options={{
                ...chartOptions,
                indexAxis: "y",
              }}
            />
          </div>
        </div>

        {/* Recommendations & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  Personalized Recommendations
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Based on your recent performance
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <p className="font-medium mb-1 text-gray-900">Focus on Algorithms</p>
                <p className="text-sm text-gray-700">
                  Your weakest area - practice 5 problems daily
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium mb-1 text-gray-900">Improve Time Management</p>
                <p className="text-sm text-gray-700">
                  Practice under timed conditions
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-3 rounded-full shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Week Streak</p>
                  <p className="text-sm text-gray-600">
                    5 days of continuous practice
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-3 rounded-full shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Problem Solver</p>
                  <p className="text-sm text-gray-600">
                    Solved 100+ practice problems
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white p-3 rounded-full shadow-md">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Consistent Growth</p>
                  <p className="text-sm text-gray-600">
                    +15% improvement this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
