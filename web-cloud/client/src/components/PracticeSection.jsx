import { useState } from "react";

function PracticeSection() {
  const [role, setRole] = useState("option1");

  const topics = [
    {
      title: "Topic-1",
      problems: ["Problem 1", "Problem 2"],
    },
    {
      title: "Topic-2",
      problems: ["Problem 1", "Problem 2"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow bg-white">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg">Logo</div>
          <button className="border rounded px-3 py-1">Resume</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          <span>Username</span>
        </div>
      </nav>

      {/* Practice Section */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Practice Section</h1>

        {/* Role Select */}
        <div className="text-center mb-10">
          <p className="mb-2">Select the Role</p>
          <select
            className="border rounded px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="option1">option1</option>
            <option value="option2">option2</option>
            <option value="option3">option3</option>
          </select>
        </div>

        {/* Topics */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {topics.map((topic, tIdx) => (
            <div key={tIdx} className="border rounded-lg bg-white shadow-sm">
              {/* Topic Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold">{topic.title}</h2>
                <div className="w-24 h-3 bg-gray-200 rounded overflow-hidden">
                  <div className="bg-blue-500 h-full w-1/2"></div>
                </div>
              </div>

              {/* Resources */}
              <div className="p-4 border-b">
                <button className="underline text-blue-600">
                  Resources & Explanation
                </button>
              </div>

              {/* Problems */}
              <div className="p-4 space-y-4">
                <h3 className="font-semibold mb-2">Practice Problems</h3>
                {topic.problems.map((problem, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-center justify-between border rounded p-3"
                  >
                    <span>{problem}</span>
                    <div className="flex items-center gap-3">
                      <button className="border px-3 py-1 rounded">
                        Solve
                      </button>
                      <button className="bg-yellow-200 px-3 py-1 rounded">
                        Add Notes
                      </button>
                      <button className="text-blue-600 underline">
                        Solution
                      </button>
                      <input type="checkbox" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default PracticeSection;
