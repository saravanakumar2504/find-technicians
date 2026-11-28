"use client";

import { useState } from "react";
import BuildsList from "./BuildsList";
import BundleSummary from "./BundleSummary";
import ComparisonResult from "../compare/ComparisonResult";
import DependencyBreakdown from "./DependencyBreakdown";
import RouteAssets from "./RouteAssets";

/**
 * Streaming progress state
 */
type StreamingProgress = {
  availableTools?: string[];
  filteredTools?: string[];
  ollamaThinking?: boolean;
  toolSelected?: { name: string; arguments: Record<string, unknown> };
  toolExecuting?: { name: string; fromCache: boolean };
  toolResult?: { name: string; result: any; fromCache: boolean };
};

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
  const [progress, setProgress] = useState<StreamingProgress>({});

  const repository = "find-technicians";
  const branch = "main";

  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setProgress({});

    try {
      const res = await fetch("/api/mcp-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const eventData = JSON.parse(line.slice(6));

            // Update progress based on event type
            switch (eventData.type) {
              case 'available_tools':
                setProgress(prev => ({ ...prev, availableTools: eventData.data.tools }));
                break;

              case 'filtered_tools':
                setProgress(prev => ({ ...prev, filteredTools: eventData.data.tools }));
                break;

              case 'ollama_thinking':
                setProgress(prev => ({ ...prev, ollamaThinking: true }));
                break;

              case 'tool_selected':
                setProgress(prev => ({
                  ...prev,
                  ollamaThinking: false,
                  toolSelected: { name: eventData.data.toolName, arguments: eventData.data.arguments }
                }));
                break;

              case 'tool_executing':
                setProgress(prev => ({
                  ...prev,
                  toolExecuting: { name: eventData.data.toolName, fromCache: eventData.data.fromCache }
                }));
                break;

              case 'tool_result':
                setProgress(prev => ({
                  ...prev,
                  toolResult: {
                    name: eventData.data.toolName,
                    result: eventData.data.result,
                    fromCache: eventData.data.fromCache
                  }
                }));
                break;

              case 'complete':
                setResponse(eventData.data);
                setLoading(false);
                break;

              case 'error':
                setError(eventData.data.error);
                setLoading(false);
                break;
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Show me all builds for find-technicians",
    "List the latest builds",
    "Get bundle summary for commit 46d07bf in find-technicians",
    "Show bundle analysis for latest build",
    "What files are loaded on the / route for commit c2a7ecb in find-technicians?",
    "Show me route assets for /test-mcp page in latest build",
    "Compare builds 46d07bf vs 5ec68fa for find-technicians",
    "Get dependency breakdown for commit 722b2ae in find-technicians",
    "Show me which packages are in the shared bundle for 722b2ae",
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
        {!response && !loading && (
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

        {/* Streaming Progress Display */}
        {loading && (
          <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "white", borderRadius: "8px", border: "2px solid #3b82f6" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#1e40af", fontSize: "1.1rem" }}>
              🔄 Processing Your Query...
            </h3>

            {/* Horizontal Progress Steps */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
              {/* Step 1: Available Tools */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "120px",
                padding: "0.75rem",
                background: progress.availableTools ? "#ecfdf5" : "#f8fafc",
                borderRadius: "8px",
                border: progress.availableTools ? "2px solid #10b981" : "2px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {progress.availableTools ? "✅" : "⏳"}
                </span>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155", textAlign: "center" }}>
                  Available Tools
                </div>
                {progress.availableTools && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    {progress.availableTools.length} tools
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>→</div>

              {/* Step 2: Filtered Tools */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "120px",
                padding: "0.75rem",
                background: progress.filteredTools ? "#ecfdf5" : "#f8fafc",
                borderRadius: "8px",
                border: progress.filteredTools ? "2px solid #10b981" : "2px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {progress.filteredTools ? "✅" : progress.availableTools ? "⏳" : "⚪"}
                </span>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155", textAlign: "center" }}>
                  Filtered Tools
                </div>
                {progress.filteredTools && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    {progress.filteredTools.length} matched
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>→</div>

              {/* Step 3: LLM Selection */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "120px",
                padding: "0.75rem",
                background: progress.toolSelected ? "#ecfdf5" : progress.ollamaThinking ? "#fef3c7" : "#f8fafc",
                borderRadius: "8px",
                border: progress.toolSelected ? "2px solid #10b981" : progress.ollamaThinking ? "2px solid #f59e0b" : "2px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {progress.toolSelected ? "✅" : progress.ollamaThinking ? "🤔" : "⚪"}
                </span>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155", textAlign: "center" }}>
                  LLM Selection
                </div>
                {progress.toolSelected && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    {progress.toolSelected.name}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>→</div>

              {/* Step 4: Cache Check */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "120px",
                padding: "0.75rem",
                background: progress.toolExecuting
                  ? (progress.toolExecuting.fromCache ? "#fef3c7" : "#ecfdf5")
                  : progress.toolSelected
                    ? "#dbeafe"
                    : "#f8fafc",
                borderRadius: "8px",
                border: progress.toolExecuting
                  ? (progress.toolExecuting.fromCache ? "2px solid #f59e0b" : "2px solid #10b981")
                  : progress.toolSelected
                    ? "2px solid #3b82f6"
                    : "2px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {progress.toolExecuting
                    ? (progress.toolExecuting.fromCache ? "⚡" : "🔍")
                    : progress.toolSelected
                      ? "⏳"
                      : "⚪"}
                </span>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155", textAlign: "center" }}>
                  Cache Check
                </div>
                {progress.toolExecuting && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem", fontWeight: "600" }}>
                    {progress.toolExecuting.fromCache ? "⚡ HIT" : "MISS"}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>→</div>

              {/* Step 5: Tool Execution */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "120px",
                padding: "0.75rem",
                background: progress.toolResult
                  ? (progress.toolResult.fromCache ? "#fef3c7" : "#ecfdf5")
                  : progress.toolExecuting && !progress.toolExecuting.fromCache
                    ? "#dbeafe"
                    : "#f8fafc",
                borderRadius: "8px",
                border: progress.toolResult
                  ? (progress.toolResult.fromCache ? "2px solid #f59e0b" : "2px solid #10b981")
                  : progress.toolExecuting && !progress.toolExecuting.fromCache
                    ? "2px solid #3b82f6"
                    : "2px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {progress.toolResult
                    ? "✅"
                    : progress.toolExecuting && !progress.toolExecuting.fromCache
                      ? "⚙️"
                      : progress.toolExecuting && progress.toolExecuting.fromCache
                        ? "⚡"
                        : "⚪"}
                </span>
                <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#334155", textAlign: "center" }}>
                  Execution
                </div>
                {progress.toolExecuting && !progress.toolExecuting.fromCache && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Running...
                  </div>
                )}
                {progress.toolExecuting && progress.toolExecuting.fromCache && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Skipped
                  </div>
                )}
                {progress.toolResult && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                    {progress.toolResult.fromCache ? "⚡ Instant" : "✓ Complete"}
                  </div>
                )}
              </div>
            </div>

            {/* Details below */}
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "6px", fontSize: "0.875rem" }}>
              {progress.availableTools && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Available:</strong> {progress.availableTools.join(", ")}
                </div>
              )}
              {progress.filteredTools && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Filtered:</strong> {progress.filteredTools.join(", ")}
                </div>
              )}
              {progress.toolSelected && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Selected Tool:</strong> <code style={{ background: "white", padding: "0.125rem 0.4rem", borderRadius: "3px" }}>
                    {progress.toolSelected.name}
                  </code>
                </div>
              )}
              {progress.toolExecuting && (
                <div style={{
                  padding: "0.5rem",
                  background: progress.toolExecuting.fromCache ? "#fef3c7" : "#ecfdf5",
                  borderRadius: "4px",
                  border: progress.toolExecuting.fromCache ? "1px solid #f59e0b" : "1px solid #10b981",
                }}>
                  <strong>Cache Status:</strong> {progress.toolExecuting.fromCache ? (
                    <span style={{ color: "#f59e0b", fontWeight: "700" }}>⚡ HIT - Retrieved from cache (instant response)</span>
                  ) : (
                    <span style={{ color: "#10b981", fontWeight: "700" }}>MISS - Executing fresh tool call</span>
                  )}
                </div>
              )}
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
              ) : response.toolCalled.name === "compare_builds" ? (
                /* Special handling for compare_builds - show comparison UI */
                <div
                  style={{
                    background: "#f0fdf4",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #22c55e",
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  <h3 style={{ margin: "0 0 1.5rem 0", color: "#15803d" }}>
                    🔄 Bundle Comparison
                  </h3>
                  {(() => {
                    try {
                      const content = response.toolCalled.result?.content?.[0];
                      if (content?.type === "text" && content.text) {
                        const comparison = JSON.parse(content.text);
                        return <ComparisonResult data={comparison} />;
                      }
                    } catch (error) {
                      console.error("Error parsing comparison result:", error);
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
              ) : response.toolCalled.name === "get_dependency_breakdown" ? (
                /* Special handling for get_dependency_breakdown - show dependency UI */
                <div
                  style={{
                    background: "#fef9f3",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #fb923c",
                    height: "100%",
                    overflow: "auto",
                  }}
                >
                  <h3 style={{ margin: "0 0 1.5rem 0", color: "#c2410c" }}>
                    📊 Dependency Breakdown
                  </h3>
                  {(() => {
                    try {
                      const content = response.toolCalled.result?.content?.[0];
                      if (content?.type === "text" && content.text) {
                        const breakdown = JSON.parse(content.text);
                        return <DependencyBreakdown data={breakdown} />;
                      }
                    } catch (error) {
                      console.error("Error parsing dependency breakdown:", error);
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
              ) : response.toolCalled.name === "get_route_assets" ? (
                /* Special handling for get_route_assets - show route assets UI */
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
                  <h3 style={{ margin: "0 0 1.5rem 0", color: "#7e22ce" }}>
                    📦 Route Assets
                  </h3>
                  {(() => {
                    try {
                      const content = response.toolCalled.result?.content?.[0];
                      if (content?.type === "text" && content.text) {
                        const routeAssets = JSON.parse(content.text);
                        return <RouteAssets data={routeAssets} />;
                      }
                    } catch (error) {
                      console.error("Error parsing route assets:", error);
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
