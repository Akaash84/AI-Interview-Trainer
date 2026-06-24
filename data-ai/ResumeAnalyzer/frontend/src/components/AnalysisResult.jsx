import React from "react";

const AnalysisResult = ({ result }) => {
  if (!result) return null;

  return (
    <div>
      <h2>📊 Resume Analysis</h2>
      {result.analysis ? (
        <div className="result-box">
          <p style={{ whiteSpace: "pre-line" }}>{result.analysis}</p>
        </div>
      ) : (
        <p>No analysis available.</p>
      )}
    </div>
  );
};

export default AnalysisResult;
