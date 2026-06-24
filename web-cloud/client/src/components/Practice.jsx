import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Practice() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Static topics data
  const topics = [
    {
      id: 'dsa',
      name: 'Algorithms',
      icon: '🧩',
      questionCount: 150
    },
    {
      id: 'oops',
      name: 'Object-Oriented',
      icon: '🎯',
      questionCount: 45
    },
    {
      id: 'dbms',
      name: 'Database',
      icon: '🗄️',
      questionCount: 60
    },
    {
      id: 'os',
      name: 'Operating Systems',
      icon: '⚙️',
      questionCount: 50
    },
    {
      id: 'networks',
      name: 'Networks',
      icon: '🌐',
      questionCount: 40
    },
    {
      id: 'system-design',
      name: 'System Design',
      icon: '🏗️',
      questionCount: 35
    }
  ];

  // Static questions data (will be replaced with API later)
  const questions = {
    dsa: [
      { id: 1, title: 'Two Sum', difficulty: 'Easy', accepted: '49.1%' },
      { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', accepted: '42.3%' },
      { id: 3, title: 'Longest Substring Without Repeating', difficulty: 'Medium', accepted: '35.8%' },
      { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', accepted: '38.2%' },
      { id: 5, title: 'Reverse Integer', difficulty: 'Medium', accepted: '47.5%' },
      { id: 6, title: 'Valid Parentheses', difficulty: 'Easy', accepted: '51.2%' },
      { id: 7, title: 'Merge Two Sorted Lists', difficulty: 'Easy', accepted: '62.1%' },
      { id: 8, title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', accepted: '71.4%' }
    ],
    oops: [
      { id: 101, title: 'Design a Parking Lot System', difficulty: 'Medium', accepted: '45.2%' },
      { id: 102, title: 'Implement Abstract Factory Pattern', difficulty: 'Medium', accepted: '38.7%' },
      { id: 103, title: 'Design a Library Management System', difficulty: 'Easy', accepted: '55.3%' },
      { id: 104, title: 'Singleton Pattern Implementation', difficulty: 'Easy', accepted: '67.8%' },
      { id: 105, title: 'Design an Elevator System', difficulty: 'Hard', accepted: '32.1%' }
    ],
    dbms: [
      { id: 201, title: 'Write SQL Query for Employee Salary', difficulty: 'Easy', accepted: '58.4%' },
      { id: 202, title: 'Database Normalization - 3NF', difficulty: 'Medium', accepted: '41.2%' },
      { id: 203, title: 'Design Schema for E-commerce', difficulty: 'Medium', accepted: '36.9%' },
      { id: 204, title: 'Optimize Query Performance', difficulty: 'Hard', accepted: '29.5%' },
      { id: 205, title: 'JOIN Operations Practice', difficulty: 'Easy', accepted: '62.7%' }
    ],
    os: [
      { id: 301, title: 'Implement Process Scheduling Algorithm', difficulty: 'Medium', accepted: '44.3%' },
      { id: 302, title: 'Deadlock Detection and Prevention', difficulty: 'Hard', accepted: '31.8%' },
      { id: 303, title: 'Memory Management - Paging', difficulty: 'Medium', accepted: '39.2%' },
      { id: 304, title: 'Producer-Consumer Problem', difficulty: 'Medium', accepted: '48.6%' }
    ],
    networks: [
      { id: 401, title: 'Explain TCP 3-Way Handshake', difficulty: 'Easy', accepted: '61.2%' },
      { id: 402, title: 'Design a CDN Architecture', difficulty: 'Hard', accepted: '28.4%' },
      { id: 403, title: 'HTTP vs HTTPS Comparison', difficulty: 'Easy', accepted: '72.5%' },
      { id: 404, title: 'Subnet Mask Calculations', difficulty: 'Medium', accepted: '42.8%' }
    ],
    'system-design': [
      { id: 501, title: 'Design Twitter/X', difficulty: 'Hard', accepted: '25.3%' },
      { id: 502, title: 'Design URL Shortener', difficulty: 'Medium', accepted: '47.1%' },
      { id: 503, title: 'Design Rate Limiter', difficulty: 'Medium', accepted: '38.9%' },
      { id: 504, title: 'Design Netflix', difficulty: 'Hard', accepted: '22.7%' },
      { id: 505, title: 'Design Notification Service', difficulty: 'Medium', accepted: '41.5%' }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleQuestionClick = (question) => {
    // Navigate to Code page with question data
    navigate('/code', {
      state: {
        questionId: question.id,
        questionTitle: question.title,
        difficulty: question.difficulty,
        topic: selectedTopic
      }
    });
  };

  const filteredQuestions = questions[selectedTopic]?.filter(q => {
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty.toLowerCase() === selectedDifficulty;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar - LeetCode style */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {selectedTopic && (
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {selectedTopic ? topics.find(t => t.id === selectedTopic)?.name : 'Problems'}
            </h1>
          </div>
          
          {selectedTopic && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedTopic ? (
          // Topics Grid - LeetCode style
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select a Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className="group border border-gray-200 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-all hover:border-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{topic.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-900">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {topic.questionCount} questions
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Practice Interviews Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Practice Interviews</h2>
              <div
                onClick={() => navigate('/start-interview')}
                className="group border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-3xl">
                      🎤
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700">
                        Start Mock Interview
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Practice real interview scenarios with AI-powered feedback
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Video Recording
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          AI Analysis
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Instant Feedback
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Questions Table - LeetCode style
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Acceptance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No questions found
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((question, index) => (
                      <tr
                        key={question.id}
                        onClick={() => handleQuestionClick(question)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {question.title}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {question.accepted}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
