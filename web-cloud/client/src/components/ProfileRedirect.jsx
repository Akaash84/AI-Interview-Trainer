import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Reusable Input Component
function FormInput({ label, type = "text", value, onChange, placeholder, accept, textarea }) {
  return (
    <label className="block mb-6">
      <span className="block text-gray-700 font-semibold mb-2">{label}</span>
      {textarea ? (
        <textarea
          rows="4"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none"
        />
      ) : (
        <input
          type={type}
          value={type !== "file" ? value : undefined}
          onChange={onChange}
          placeholder={placeholder}
          accept={accept}
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200
            ${
              type === "file" 
                ? "border-dashed border-gray-400 p-6 text-center cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                : "border-gray-300"
            }`}
        />
      )}
    </label>
  );
}


// ✅ Sidebar Component
function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-blue-400">Navigation</h2>
      <ul className="space-y-4">
        <li>
          <a href="#" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            Dashboard
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            Profile
          </a>
        </li>
        <li>
          <a href="#" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            Logout
          </a>
        </li>
      </ul>
    </aside>
  );
}

// ✅ SetProfile Page
function SetProfile() {
  const [resume, setResume] = useState(null);
  const [linkedin, setLinkedin] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ resume, linkedin, jobDesc });
    alert("Details submitted!");
    navigate("/resume-analyzer"); // redirect after submit
  };

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h2 className="text-xl text-gray-600 mb-1">Welcome User_Name</h2>
          <h1 className="text-4xl font-extrabold text-gray-800">Set Your Profile</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200"
        >
          <FormInput
            label="Upload your resume"
            type="file"
            onChange={(e) => setResume(e.target.files[0])}
            accept=".pdf,.doc,.docx"
          />

          <FormInput
            label="Enter your LinkedIn URL"
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />

          <FormInput
            label="Enter Job Description"
            textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here..."
          />

          <button
            type="submit"
            className="w-full px-6 py-3 mt-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Details
          </button>
        </form>
      </div>
    </main>
  );
}

function ProfileRedirect() {
  return (
    <div className="min-h-screen flex">
      {/* Navbar would go here */}
      {/* <Sidebar /> */}
      <div className="flex-1">
        <SetProfile />
      </div>
    </div>
  );
}

export default ProfileRedirect;