"use client";

import { useState } from "react";

/**
 * Test page to demonstrate MCP server integration
 */
export default function TestMCPPage() {
  const [builds, setBuilds] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuilds = async () => {
    setLoading(true);
    setError(null);

    try {
      // Don't pass project parameter - let it use GITHUB_REPO from .env
      const response = await fetch("/api/builds");
      const result = await response.json();

      if (result.success) {
        setBuilds(result.data);
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
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>🔌 MCP Server Test</h1>
      <p>Testing bundle-analysis MCP server integration</p>

      <button
        onClick={fetchBuilds}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          background: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "1rem",
        }}
      >
        {loading ? "Loading..." : "Fetch Builds"}
      </button>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#fee",
            color: "#c00",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {builds && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Build Results:</h2>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(builds, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
