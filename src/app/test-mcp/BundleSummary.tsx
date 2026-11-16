/**
 * Component to display bundle analysis summary
 */
export default function BundleSummary({ summary, showBuildInfo = true }: { summary: any; showBuildInfo?: boolean }) {
  // Defensive checks
  if (!summary) {
    return <div>No summary data available</div>;
  }

  const buildInfo = summary.buildInfo || {};
  const summaryData = summary.summary || {};
  const shared = summary.shared || {};
  const largestRoute = summary.largestRoute || {};
  const smallestRoute = summary.smallestRoute || {};
  const top5Routes = summary.top5Routes || [];

  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* Build Info - Compact */}
      {showBuildInfo && buildInfo.commitSha && (
        <div
          style={{
            background: "white",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "0.75rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.85rem" }}>
            📍 Build Information
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.375rem", fontSize: "0.8rem" }}>
            <span style={{ color: "#64748b", fontWeight: "600" }}>Commit:</span>
            <code style={{ background: "#f1f5f9", padding: "0.125rem 0.4rem", borderRadius: "3px", fontSize: "0.75rem" }}>
              {buildInfo.commitSha.substring(0, 7)}
            </code>

            <span style={{ color: "#64748b", fontWeight: "600" }}>Branch:</span>
            <span>{buildInfo.branch || "N/A"}</span>

            <span style={{ color: "#64748b", fontWeight: "600" }}>Time:</span>
            <span>{buildInfo.timestamp ? new Date(buildInfo.timestamp).toLocaleString() : "N/A"}</span>
          </div>
        </div>
      )}

      {/* Summary Stats - Compact */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ background: "#dbeafe", padding: "0.75rem", borderRadius: "6px", border: "1px solid #3b82f6" }}>
          <div style={{ fontSize: "0.75rem", color: "#1e40af", marginBottom: "0.125rem" }}>Total Routes</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e3a8a" }}>
            {summaryData.totalRoutes || 0}
          </div>
        </div>

        <div style={{ background: "#dcfce7", padding: "0.75rem", borderRadius: "6px", border: "1px solid #22c55e" }}>
          <div style={{ fontSize: "0.75rem", color: "#15803d", marginBottom: "0.125rem" }}>Static</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#14532d" }}>
            {summaryData.staticRoutes || 0}
          </div>
        </div>

        <div style={{ background: "#fef3c7", padding: "0.75rem", borderRadius: "6px", border: "1px solid #eab308" }}>
          <div style={{ fontSize: "0.75rem", color: "#a16207", marginBottom: "0.125rem" }}>Dynamic</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#713f12" }}>
            {summaryData.dynamicRoutes || 0}
          </div>
        </div>

        <div style={{ background: "#e0e7ff", padding: "0.75rem", borderRadius: "6px", border: "1px solid #6366f1" }}>
          <div style={{ fontSize: "0.75rem", color: "#4338ca", marginBottom: "0.125rem" }}>Shared Bundle</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#312e81" }}>
            {shared.size || "N/A"}
          </div>
        </div>
      </div>

      {/* Top 5 Routes - Scrollable */}
      {top5Routes.length > 0 && (
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4 style={{ margin: "0 0 0.75rem 0", color: "#475569", fontSize: "0.95rem" }}>
            🔝 Top 5 Largest Routes
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              maxHeight: "300px",
              overflowY: "auto",
              paddingRight: "0.5rem",
            }}
          >
            {top5Routes.map((route: any, index: number) => (
              <div
                key={route.path || index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.625rem 0.75rem",
                  background: index === 0 ? "#fef3c7" : "#f8fafc",
                  borderRadius: "6px",
                  border: index === 0 ? "2px solid #eab308" : "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      color: index === 0 ? "#a16207" : "#94a3b8",
                      minWidth: "1.5rem",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
                      {route.path || "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.125rem" }}>
                      {route.type === "static" ? "○ Static" : "ƒ Dynamic"} • Route: {route.size || "N/A"}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: index === 0 ? "#a16207" : "#475569",
                  }}
                >
                  {route.firstLoadJS || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Largest & Smallest */}
      {(largestRoute.path || smallestRoute.path) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          {largestRoute.path && (
            <div
              style={{
                background: "#fef2f2",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #f87171",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#991b1b", marginBottom: "0.5rem" }}>
                📈 Largest Route
              </div>
              <div style={{ fontWeight: "600", color: "#7f1d1d" }}>{largestRoute.path}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#991b1b", marginTop: "0.25rem" }}>
                {largestRoute.firstLoadJS || "N/A"}
              </div>
            </div>
          )}

          {smallestRoute.path && (
            <div
              style={{
                background: "#f0fdf4",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #4ade80",
              }}
            >
              <div style={{ fontSize: "0.875rem", color: "#166534", marginBottom: "0.5rem" }}>
                📉 Smallest Route
              </div>
              <div style={{ fontWeight: "600", color: "#14532d" }}>{smallestRoute.path}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#166534", marginTop: "0.25rem" }}>
                {smallestRoute.firstLoadJS || "N/A"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug: Show raw data if something is missing */}
      {(!buildInfo.commitSha || top5Routes.length === 0) && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "#fef3c7", borderRadius: "8px" }}>
          <strong>⚠️ Debug - Raw Data:</strong>
          <pre style={{ fontSize: "0.75rem", overflow: "auto", marginTop: "0.5rem" }}>
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
