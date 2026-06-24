// askarthikey made this page
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// Get API URL from environment or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CodeEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [outputHeight, setOutputHeight] = useState(40);
  const [isDraggingOutput, setIsDraggingOutput] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(true); // Always ready since we use server-side execution
  const [isInstalling, setIsInstalling] = useState(false);
  
  const editorRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Real code execution using backend API
  const executeCode = async (code, language) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        output: `Network error: ${error.message}. Make sure the execution server is running.`
      };
    }
  };

  // Safe JavaScript execution using Web Worker (fallback for client-side)
  const executeJavaScriptClient = (code) => {
    return new Promise((resolve) => {
      const workerCode = `
        let output = '';
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
          output += args.join(' ') + '\\n';
          originalLog(...args);
        };
        
        console.error = (...args) => {
          output += 'Error: ' + args.join(' ') + '\\n';
          originalError(...args);
        };
        
        try {
          ${code}
          self.postMessage({ success: true, output: output || 'Code executed successfully (no output)' });
        } catch (error) {
          self.postMessage({ success: false, output: 'Error: ' + error.message });
        }
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({ success: false, output: 'Error: Execution timeout (5 seconds)' });
      }, 5000);
      
      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve(e.data);
      };
      
      worker.onerror = (error) => {
        clearTimeout(timeout);
        worker.terminate();
        resolve({ success: false, output: 'Error: ' + error.message });
      };
    });
  };

  // Timer functionality
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerActive]);

  // Start timer when component mounts
  useEffect(() => {
    setIsTimerActive(true);
    return () => clearInterval(timerRef.current);
  }, []);

  // Handle horizontal resizing (left/right panels)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle vertical resizing (editor/output panels)
  const handleOutputMouseDown = (e) => {
    setIsDraggingOutput(true);
    e.preventDefault();
  };

  const handleOutputMouseMove = (e) => {
    if (!isDraggingOutput) return;
    
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel) return;
    
    const rightPanelRect = rightPanel.getBoundingClientRect();
    const newHeight = ((rightPanelRect.bottom - e.clientY) / rightPanelRect.height) * 100;
    
    // Constrain between 15% and 70%
    if (newHeight >= 15 && newHeight <= 70) {
      setOutputHeight(newHeight);
    }
  };

  const handleOutputMouseUp = () => {
    setIsDraggingOutput(false);
  };

  // Add global mouse event listeners
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

  useEffect(() => {
    if (isDraggingOutput) {
      document.addEventListener('mousemove', handleOutputMouseMove);
      document.addEventListener('mouseup', handleOutputMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleOutputMouseMove);
      document.removeEventListener('mouseup', handleOutputMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleOutputMouseMove);
      document.removeEventListener('mouseup', handleOutputMouseUp);
    };
  }, [isDraggingOutput]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
  ];

  const problemData = {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: "49.1%",
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6", 
        output: "[1,2]",
        explanation: null
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]", 
        explanation: null
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹", 
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    followUp: "Can you come up with an algorithm that is less than O(n²) time complexity?"
  };

  const getStarterCode = (language) => {
    const templates = {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    // Example approach: brute force O(n²)
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}

// Test your function
console.log("Testing twoSum([2,7,11,15], 9):");
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]`,

      python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your solution here
    # Example approach: brute force O(n²)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# Test your function
print("Testing twoSum([2,7,11,15], 9):")
print(twoSum([2,7,11,15], 9))  # Expected: [0,1]
print("Testing twoSum([3,2,4], 6):")
print(twoSum([3,2,4], 6))      # Expected: [1,2]`,

      java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        // Example approach: brute force O(n²)
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] result = solution.twoSum(new int[]{2,7,11,15}, 9);
        System.out.println("Result: [" + result[0] + "," + result[1] + "]");
    }
}`,

      cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        // Example approach: brute force O(n²)
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};

int main() {
    Solution solution;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> result = solution.twoSum(nums, 9);
    cout << "Result: [" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`,

      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    // Example approach: brute force O(n²)
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}

// Test your function
console.log("Testing twoSum([2,7,11,15], 9):");
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]`
    };
    return templates[language] || templates.javascript;
  };

  useEffect(() => {
    setCode(getStarterCode(selectedLanguage));
  }, [selectedLanguage]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Notion-inspired theme
    monaco.editor.defineTheme('notionTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'dc2626' },
      ],
      colors: {
        'editor.background': '#fafafa',
        'editor.foreground': '#374151',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f3f4f6',
        'editorLineNumber.foreground': '#9ca3af',
        'editor.selectionBackground': '#ddd6fe40',
        'editorWidget.background': '#ffffff',
        'editorWidget.border': '#e5e7eb',
      }
    });
    
    monaco.editor.setTheme('notionTheme');
  };

  const runCode = async () => {
    if (!code.trim()) {
      setExecutionOutput('❌ Error: No code to execute');
      setShowOutput(true);
      return;
    }

    setIsExecuting(true);
    setShowOutput(true);
    setExecutionOutput('🔄 Executing code...\n');

    try {
      let result;
      
      // Use backend API for all languages for real execution
      result = await executeCode(code, selectedLanguage);
      
      const timestamp = new Date().toLocaleTimeString();
      const status = result.success ? '✅' : '❌';
      const header = `${status} Execution ${result.success ? 'completed' : 'failed'} at ${timestamp}\n`;
      const languageInfo = `Language: ${selectedLanguage.toUpperCase()}\n`;
      const separator = '─'.repeat(50) + '\n';
      
      setExecutionOutput(header + languageInfo + separator + result.output);
      
      // Auto-run test cases for coding problems if execution was successful
      if (result.success && selectedLanguage === 'javascript' && code.includes('twoSum')) {
        setTimeout(() => {
          runTestCases();
        }, 500);
      }
      
    } catch (error) {
      setExecutionOutput(`❌ Execution Error:\n${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const runTestCases = async () => {
    const testCases = [
      { input: '[2,7,11,15], 9', expected: '[0,1]', desc: 'Basic case' },
      { input: '[3,2,4], 6', expected: '[1,2]', desc: 'Different order' },
      { input: '[3,3], 6', expected: '[0,1]', desc: 'Same numbers' }
    ];

    let testOutput = '\n🧪 Running test cases...\n' + '═'.repeat(50) + '\n';
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const testCode = `
          ${code}
          
          const result = twoSum(${testCase.input});
          console.log(JSON.stringify(result));
        `;
        
        const result = await executeCode(testCode, 'javascript');
        const output = result.output.trim();
        const passed = output.includes(testCase.expected);
        
        testOutput += `Test ${i + 1} (${testCase.desc}): ${passed ? '✅ PASS' : '❌ FAIL'}\n`;
        testOutput += `  Input: twoSum(${testCase.input})\n`;
        testOutput += `  Expected: ${testCase.expected}\n`;
        testOutput += `  Got: ${output}\n\n`;
        
      } catch (error) {
        testOutput += `Test ${i + 1}: ❌ ERROR\n`;
        testOutput += `  ${error.message}\n\n`;
      }
    }
    
    setExecutionOutput(prev => prev + testOutput);
  };

  const submitCode = () => {
    // Stop the timer when submitting
    setIsTimerActive(false);
    clearInterval(timerRef.current);
    
    const metrics = {
      language: selectedLanguage,
      time: formatTime(timeSpent),
      linesOfCode: code.split('\n').length,
      characters: code.length,
    };
    
    alert(`🎉 Solution submitted successfully!\n\nMetrics:\n• Language: ${metrics.language}\n• Time: ${metrics.time}\n• Lines of Code: ${metrics.linesOfCode}\n• Characters: ${metrics.characters}\n\n⏱️ Timer has been stopped.`);
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
      {/* Left Panel - Problem Description */}
      <div 
        className="border-r border-gray-200 flex flex-col transition-all duration-200"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {/* Problem Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {problemData.id}. {problemData.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problemData.difficulty)}`}>
                  {problemData.difficulty}
                </span>
                <span className="text-gray-600">Accepted: {problemData.acceptance}</span>
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
            {['Description', 'Editorial', 'Solutions', 'Submissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'description' && (
            <div className="space-y-6">
              {/* Problem Description */}
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: problemData.description }}
              />

              {/* Examples */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Examples</h3>
                {problemData.examples.map((example, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">Example {index + 1}:</div>
                    <div className="space-y-1 text-sm font-mono">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && (
                        <div><strong>Explanation:</strong> {example.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Constraints</h3>
                <ul className="space-y-1 text-sm">
                  {problemData.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <code className="text-gray-700">{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow Up */}
              {problemData.followUp && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Follow-up:</div>
                  <div className="text-blue-800 text-sm">{problemData.followUp}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editorial' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">📝</div>
              <div className="text-gray-500">Editorial coming soon...</div>
            </div>
          )}

          {activeTab === 'solutions' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">💡</div>
              <div className="text-gray-500">Community solutions will appear here...</div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">📊</div>
              <div className="text-gray-500">Your submissions will appear here...</div>
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

      {/* Right Panel - Code Editor */}
      <div 
        className="flex-1 flex flex-col bg-gray-50 right-panel"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              
              {/* Runtime Status */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">
                    {selectedLanguage.toUpperCase()} runtime ready
                  </span>
                </div>
              </div>
              
              <div className={`text-sm flex items-center space-x-1 ${isTimerActive ? 'text-gray-600' : 'text-red-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time: {formatTime(timeSpent)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCode(getStarterCode(selectedLanguage))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={runCode}
                disabled={isExecuting}
                className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isExecuting ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={submitCode}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div 
          className="flex-1 transition-all duration-200"
          style={{ height: showOutput ? `${100 - outputHeight}%` : '100%' }}
        >
          <Editor
            height="100%"
            language={selectedLanguage}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              lineHeight: 24,
              renderLineHighlight: 'gutter',
              selectionHighlight: false,
              occurrencesHighlight: false,
              contextmenu: false,
            }}
          />
        </div>

        {/* Output Panel Resizer */}
        {showOutput && (
          <div
            className={`h-1 bg-gray-200 hover:bg-gray-300 cursor-ns-resize flex-shrink-0 relative group ${
              isDraggingOutput ? 'bg-blue-400' : ''
            }`}
            onMouseDown={handleOutputMouseDown}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-gray-300 group-hover:bg-opacity-50 transition-colors">
              <div className="w-full flex items-center justify-center">
                <div className="h-1 w-8 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Output Panel */}
        {showOutput && (
          <div 
            className="bg-white border-t border-gray-200 flex flex-col transition-all duration-200"
            style={{ height: `${outputHeight}%` }}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Output Terminal</span>
                </h3>
                {isExecuting && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span className="text-xs font-medium">Running {selectedLanguage}...</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 flex items-center space-x-3">
                  <span>Language: {selectedLanguage.toUpperCase()}</span>
                  <span>•</span>
                  <span>Status: {isExecuting ? 'Running' : 'Ready'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={runCode}
                  disabled={isExecuting}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="Run code again"
                >
                  {isExecuting ? 'Running...' : 'Re-run'}
                </button>
                <button
                  onClick={() => setExecutionOutput('')}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title="Clear output"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title="Close terminal"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="h-full bg-gray-900 p-4 overflow-y-auto">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs mb-2 font-mono">
                    $ Replit Code Executor - {selectedLanguage} environment
                  </div>
                  {executionOutput ? (
                    <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                      {executionOutput}
                    </pre>
                  ) : (
                    <div className="text-gray-500 text-sm font-mono">
                      <div className="text-gray-400">Waiting for code execution...</div>
                      <div className="text-gray-600 mt-2">💡 Tips:</div>
                      <div className="text-gray-600">• Click "Run" to execute your {selectedLanguage} code</div>
                      <div className="text-gray-600">• Use console.log() in JavaScript or print() in Python for output</div>
                      <div className="text-gray-600">• Test cases will run automatically for coding problems</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
