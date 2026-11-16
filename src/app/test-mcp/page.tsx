"use client";

import { useState } from "react";
import BuildsList from "./BuildsList";
import BundleSummary from "./BundleSummary";

/**
 * Helper component to render the list_builds result
 */
function BuildsListRenderer({ result }: { result: any }) {
  try {
    const content = result?.content?.[0];
    if (content?.type === "text" && content.text) {
      const builds = JSON.parse(content.text);
      if (Array.isArray(builds)) {
        return <BuildsList builds={builds} />;
      }
    }
  } catch (error) {
    console.error("Error parsing builds:", error);
  }

  return (
    <pre
      style={{
        background: "white",
        padding: "0.75rem",
        borderRadius: "4px",
        overflow: "auto",
        fontSize: "0.9rem",
        border: "1px solid #ddd",
        marginTop: "0.5rem",
        maxHeight: "400px",
      }}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

/**
 * Test page for MCP + Ollama (Llama 3.1) integration
 */
export default function TestMCPPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = "find-technicians";
  const branch = "main";

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/mcp-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
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

  const exampleQueries = [
    "Show me all builds for find-technicians",
    "List the latest builds",
    "Get bundle summary for commit 46d07bf in find-technicians",
    "Show bundle analysis for latest build",
  ];

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem",
        fontFamily: "system-ui",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: "1.5rem" }}>
        
        <p style={{ margin: 0, fontSize: "0.95rem", color: "#64748b" }}>
          Ask questions about your builds using natural language. Powered by MCP + Ollama (Llama 3.1)
        </p>
      </div>

      {/* Query Input */}
      <div style={{ flexShrink: 0 }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Try: 'Show me all builds for ${repository}' or 'List builds on branch ${branch}'`}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "1rem",
            fontSize: "1rem",
            border: "2px solid #ddd",
            borderRadius: "8px",
            fontFamily: "system-ui",
            resize: "vertical",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleQuery();
            }
          }}
        />

        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={handleQuery}
            disabled={loading || !query.trim()}
            style={{
              padding: "0.75rem 2rem",
              background: loading || !query.trim() ? "#ccc" : "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            {loading ? "⏳ Processing..." : "🚀 Ask"}
          </button>

          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
            Press Cmd+Enter to submit
          </span>
        </div>

        {/* Example Queries */}
        {!response && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem" }}>
              💡 Try these examples:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {exampleQueries.map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#334155",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                    e.currentTarget.style.borderColor = "#94a3b8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#fee",
            color: "#c00",
            borderRadius: "8px",
            border: "1px solid #fcc",
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Response Display - Scrollable */}
      {response && (
        <div
          style={{
            marginTop: "1rem",
            flex: 1,
            overflow: "auto",
            minHeight: 0,
          }}
        >
          {response.toolCalled ? (
            <>
              {response.toolCalled.name === "list_builds" ? (
                /* Special handling for list_builds - show table directly */
                <div
                  style={{
                    background: "#f0f9ff",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #0ea5e9",
                    height: "100%",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0369a1" }}>
                    📊 Builds for{" "}
                    {response.toolCalled.arguments?.project || "Project"}
                  </h3>
                  <BuildsListRenderer result={response.toolCalled.result} />
                </div>
              ) : response.toolCalled.name === "get_bundle_summary" ? (
                /* Special handling for get_bundle_summary - show formatted summary */
                <div
                  style={{
                    background: "#faf5ff",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #a855f7",
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  {(() => {
                    try {
                      const content = response.toolCalled.result?.content?.[0];

                      if (content?.type === "text" && content.text) {
                        const summary = JSON.parse(content.text);
                        const buildInfo = summary.buildInfo || {};

                        return (
                          <>
                            {/* Header with Build Info inline */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem" }}>
                              <h3 style={{ margin: 0, color: "#7e22ce", flexShrink: 0 }}>
                                📦 Bundle Analysis for{" "}
                                {response.toolCalled.arguments?.project || "Project"}
                              </h3>

                              {buildInfo.commitSha && (
                                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                  <span>
                                    <strong>Commit:</strong>{" "}
                                    <code style={{ background: "#e9d5ff", padding: "0.125rem 0.4rem", borderRadius: "3px", color: "#6b21a8", fontSize: "0.7rem" }}>
                                      {buildInfo.commitSha.substring(0, 7)}
                                    </code>
                                  </span>
                                  <span><strong>Branch:</strong> {buildInfo.branch || "N/A"}</span>
                                  <span><strong>Time:</strong> {buildInfo.timestamp ? new Date(buildInfo.timestamp).toLocaleString() : "N/A"}</span>
                                </div>
                              )}
                            </div>

                            <BundleSummary summary={summary} showBuildInfo={false} />
                          </>
                        );
                      }
                    } catch (error) {
                      console.error("Error parsing bundle summary:", error);
                    }
                    return (
                      <pre
                        style={{
                          background: "white",
                          padding: "0.75rem",
                          borderRadius: "4px",
                          overflow: "auto",
                          fontSize: "0.9rem",
                          border: "1px solid #ddd",
                        }}
                      >
                        {JSON.stringify(response.toolCalled.result, null, 2)}
                      </pre>
                    );
                  })()}
                </div>
              ) : (
                /* Default tool display with arguments and result */
                <div
                  style={{
                    background: "#f0f9ff",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #0ea5e9",
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0369a1" }}>
                    🔧 Tool Executed: <code>{response.toolCalled.name}</code>
                  </h3>

                  {/* Arguments */}
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>📥 Arguments:</strong>
                    <pre
                      style={{
                        background: "white",
                        padding: "0.75rem",
                        borderRadius: "4px",
                        overflow: "auto",
                        fontSize: "0.9rem",
                        border: "1px solid #ddd",
                        marginTop: "0.5rem",
                      }}
                    >
                      {JSON.stringify(response.toolCalled.arguments, null, 2)}
                    </pre>
                  </div>

                  {/* Result */}
                  <div>
                    <strong>📤 Result:</strong>
                    <pre
                      style={{
                        background: "white",
                        padding: "0.75rem",
                        borderRadius: "4px",
                        overflow: "auto",
                        fontSize: "0.9rem",
                        border: "1px solid #ddd",
                        marginTop: "0.5rem",
                        maxHeight: "400px",
                      }}
                    >
                      {JSON.stringify(response.toolCalled.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* No tool called - just text response */}
              <div
                style={{
                  background: "#fef3c7",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  border: "1px solid #fbbf24",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0" }}>💬 Response:</h3>
                <p style={{ margin: 0 }}>{response.answer}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
