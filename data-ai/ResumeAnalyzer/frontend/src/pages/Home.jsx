import React, { useState } from "react";
import ResumeUpload from "../components/ResumeUpload";
import AnalysisResult from "../components/AnalysisResult";

function Home() {
  const [result, setResult] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="container">
      <h1>Interview Trainer</h1>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Left column (form) */}
        <div className="card" style={{ flex: drawerOpen ? "0 0 40%" : "0 0 60%" }}>
          <ResumeUpload
            setResult={(r) => {
              setResult(r);
              setDrawerOpen(true);
            }}
          />
        </div>

        {/* Right drawer (analysis) */}
        {drawerOpen && (
          <div className="card" style={{ flex: "0 0 60%" }}>
            <h2>Analysis</h2>
            {!result ? (
              <p style={{ color: "#9ca3af" }}>Upload a resume and click Analyze to see results.</p>
            ) : (
              <AnalysisResult result={result} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
