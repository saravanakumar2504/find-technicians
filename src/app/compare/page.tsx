"use client";

import { useState } from "react";
import ComparisonResult from "./ComparisonResult";

export default function ComparePage() {
  const [baselineId, setBaselineId] = useState("46d07bf");
  const [candidateId, setCandidateId] = useState("5ec68fa");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const project = "find-technicians";

  const handleCompare = async () => {
    if (!baselineId.trim() || !candidateId.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/mcp-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `Compare builds ${baselineId} vs ${candidateId} for ${project}`,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setResponse(result.data);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui",
        background: "#f8fafc",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "#1e293b" }}>
          🔄 Bundle Comparison
        </h1>
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#64748b" }}>
          Compare two commits and analyze bundle size changes
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#475569" }}>
              Baseline Commit (Reference)
            </label>
            <input
              type="text"
              value={baselineId}
              onChange={(e) => setBaselineId(e.target.value)}
              placeholder="e.g., 46d07bf or full SHA"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "monospace",
              }}
            />
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
              The "before" commit (main)
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.5rem", color: "#475569" }}>
              Candidate Commit (New)
            </label>
            <input
              type="text"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="e.g., 5ec68fa or full SHA"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "monospace",
              }}
            />
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
              The "after" commit (PR)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={handleCompare}
              disabled={loading || !baselineId.trim() || !candidateId.trim()}
              style={{
                padding: "0.75rem 2rem",
                background: loading || !baselineId.trim() || !candidateId.trim() ? "#cbd5e1" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading || !baselineId.trim() || !candidateId.trim() ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                fontWeight: "600",
              }}
            >
              {loading ? "⏳ Comparing..." : "🚀 Compare"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "2rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {response && !error && <ComparisonResult data={response} />}

      {/* Empty State */}
      {!response && !loading && !error && (
        <div
          style={{
            background: "white",
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            padding: "3rem",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontSize: "3rem" }}>📊</p>
          <p style={{ margin: 0, fontSize: "1rem" }}>
            Enter two commit SHAs and click Compare to analyze bundle changes
          </p>
        </div>
      )}
    </div>
  );
}
