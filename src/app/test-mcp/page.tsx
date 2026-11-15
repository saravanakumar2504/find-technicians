"use client";

import { useState } from "react";
import BuildsList from "./BuildsList";

/**
 * Helper component to render the list_builds result
 */
function BuildsListRenderer({ result }: { result: any }) {
  try {
    const content = result?.content?.[0];
    if (content?.type === 'text' && content.text) {
      const builds = JSON.parse(content.text);
      if (Array.isArray(builds)) {
        return <BuildsList builds={builds} />;
      }
    }
  } catch (error) {
    console.error('Error parsing builds:', error);
  }

  return (
    <pre style={{
      background: "white",
      padding: "0.75rem",
      borderRadius: "4px",
      overflow: "auto",
      fontSize: "0.9rem",
      border: "1px solid #ddd",
      marginTop: "0.5rem",
      maxHeight: "400px"
    }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

/**
 * Test page for MCP + Ollama (Llama 3.1) integration
 */
export default function TestMCPPage() { '
  const [query, setQuery] = useState("");
  const [repository, setRepository] = useState("find-technicians");
  const [branch, setBranch] = useState("main");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>🔌 MCP + Ollama Tool Orchestration</h1>
      <p>Ask a question and Llama 3.1 (local, free) will pick the right tool to answer it</p>

      {/* Query Input */}
      <div style={{ marginTop: "2rem" }}>
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

        <div style={{ marginTop: "1rem" }}>
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
            {loading ? "⏳ Processing..." : "🚀 Ask Llama"}
          </button>

          <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#666" }}>
            Press Cmd+Enter to submit
          </span>
        </div>
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

      {/* Response Display */}
      {response && (
        <div style={{ marginTop: "2rem" }}>
          {response.toolCalled ? (
            <>
              {response.toolCalled.name === 'list_builds' ? (
                /* Special handling for list_builds - show table directly */
                <div style={{ background: "#f0f9ff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #0ea5e9" }}>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0369a1" }}>
                    📊 Builds for {response.toolCalled.arguments?.project || 'Project'}
                  </h3>
                  <BuildsListRenderer result={response.toolCalled.result} />
                </div>
              ) : (
                /* Default tool display with arguments and result */
                <div style={{ background: "#f0f9ff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #0ea5e9" }}>
                  <h3 style={{ margin: "0 0 1rem 0", color: "#0369a1" }}>
                    🔧 Tool Executed: <code>{response.toolCalled.name}</code>
                  </h3>

                  {/* Arguments */}
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>📥 Arguments:</strong>
                    <pre style={{
                      background: "white",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      overflow: "auto",
                      fontSize: "0.9rem",
                      border: "1px solid #ddd",
                      marginTop: "0.5rem"
                    }}>
                      {JSON.stringify(response.toolCalled.arguments, null, 2)}
                    </pre>
                  </div>

                  {/* Result */}
                  <div>
                    <strong>📤 Result:</strong>
                    <pre style={{
                      background: "white",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      overflow: "auto",
                      fontSize: "0.9rem",
                      border: "1px solid #ddd",
                      marginTop: "0.5rem",
                      maxHeight: "400px"
                    }}>
                      {JSON.stringify(response.toolCalled.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* No tool called - just text response */}
              <div style={{ background: "#fef3c7", padding: "1.5rem", borderRadius: "8px", border: "1px solid #fbbf24" }}>
                <h3 style={{ margin: "0 0 1rem 0" }}>💬 Response:</h3>
                <p style={{ margin: 0 }}>{response.answer}</p>
              </div>
            </>
          )}

          {/* Available Tools */}
          <details style={{ marginTop: "1rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: "600", padding: "0.5rem" }}>
              📋 Available Tools ({response.availableTools?.length || 0})
            </summary>
            <ul style={{ marginTop: "0.5rem", paddingLeft: "2rem" }}>
              {response.availableTools?.map((tool: string) => (
                <li key={tool}>
                  <code>{tool}</code>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {/* Example Queries */}
      <div style={{ marginTop: "3rem", padding: "1.5rem", background: "#f9fafb", borderRadius: "8px" }}>
        <h3 style={{ margin: "0 0 1rem 0" }}>💡 Example Queries:</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            `Show me all builds for ${repository}`,
            `List builds for ${repository} on branch ${branch}`,
            `What builds are available for ${repository}?`,
            `Get the latest builds from ${repository}`,
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              style={{
                padding: "0.5rem 1rem",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
              }}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
