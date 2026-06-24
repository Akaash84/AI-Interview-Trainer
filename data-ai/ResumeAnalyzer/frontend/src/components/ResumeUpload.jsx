import React, { useState } from "react";
import axios from "axios";
import "../styles/ResumeUpload.css";

const ResumeUpload = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Backend API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5002";

  const handleFileChange = (e) => setResumeFile(e.target.files[0]);
  const handleJobRoleChange = (e) => setJobRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resumeFile || !jobRole) {
      setError("Please select a resume and enter a job role.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobRole", jobRole);

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/analyze`, formData);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSections = (text) => {
    const sections = text.split(/### /).filter(Boolean);
    return sections.map((sec, idx) => {
      const [title, ...contentArr] = sec.split("\n");
      const content = contentArr.join("\n").trim();
      const cleanContent = content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/^\*\s+/gm, "• ");
      return (
        <details key={idx} open={idx === 0} className="analysis-section">
          <summary>{title}</summary>
          <pre>{cleanContent}</pre>
        </details>
      );
    });
  };

  return (
    <div className="resume-upload-container">
      <h2>Upload Your Resume</h2>
      <form onSubmit={handleSubmit} className="resume-form">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="Enter Job Role (e.g., Data Scientist)"
          value={jobRole}
          onChange={handleJobRoleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {analysis && (
        <div className="analysis-container">
          <h3>Resume Analysis</h3>
          {renderSections(analysis)}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
