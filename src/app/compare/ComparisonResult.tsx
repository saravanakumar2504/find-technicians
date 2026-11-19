interface ComparisonData {
  metadata?: {
    baselineId: string;
    candidateId: string;
    timestamp: string;
  };
  totalSize?: {
    baseline: { size: string };
    candidate: { size: string };
    delta: {
      displaySize: string;
      percentage: number | null;
      status: string;
    };
  };
  routeComparison?: Array<{
    path: string;
    type: string;
    delta: {
      displaySize: string;
      percentage: string;
      status: string;
    };
  }>;
  sharedChunk?: {
    baseline: string;
    candidate: string;
    delta: {
      displaySize: string;
      status: string;
    };
  };
  assetAnalysis?: {
    added: any[];
    removed: any[];
    modified: any[];
  };
  analysis?: {
    summary: string;
    recommendations: string[];
    riskLevel: string;
  };
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "high":
      return "#dc2626";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

const getStatusColor = (status: string) => {
  if (status.includes("Increased")) return "#ef4444";
  if (status.includes("Reduced")) return "#10b981";
  return "#6b7280";
};

const getDeltaEmoji = (status: string) => {
  if (status.includes("Increased")) return "📈";
  if (status.includes("Reduced")) return "📉";
  return "➡️";
};

export default function ComparisonResult({ data }: { data: ComparisonData }) {
  // Try to parse if it's a string
  const comparison = typeof data === "string" ? JSON.parse(data) : data;

  if (!comparison.metadata) {
    return (
      <div style={{ background: "#fee2e2", padding: "1rem", borderRadius: "6px", color: "#991b1b" }}>
        No comparison data available
      </div>
    );
  }

  const totalDelta = comparison.totalSize?.delta;
  const riskLevel = comparison.analysis?.riskLevel || "low";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Total Size Card */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b" }}>
          📦 Total Bundle Size
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "6px" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
              Baseline
            </p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>
              {comparison.totalSize?.baseline.size}
            </p>
          </div>

          <div style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "6px" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
              Candidate
            </p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>
              {comparison.totalSize?.candidate.size}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "6px",
              border: `2px solid ${getStatusColor(totalDelta?.status)}`,
            }}
          >
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
              {getDeltaEmoji(totalDelta?.status)} Delta
            </p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: getStatusColor(totalDelta?.status) }}>
              {totalDelta?.displaySize}
            </p>
            {totalDelta?.percentage !== null && (
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                {totalDelta?.percentage.toFixed(2)}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Card */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>🎯 Analysis</h2>
          <span
            style={{
              background: getRiskColor(riskLevel),
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {riskLevel} Risk
          </span>
        </div>

        <p style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#334155", lineHeight: "1.5" }}>
          {comparison.analysis?.summary}
        </p>

        {comparison.analysis?.recommendations && comparison.analysis.recommendations.length > 0 && (
          <div>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: "600", color: "#475569" }}>
              💡 Recommendations:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#475569" }}>
              {comparison.analysis.recommendations.map((rec: string, idx: number) => (
                <li key={idx} style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Routes Comparison */}
      {comparison.routeComparison && comparison.routeComparison.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b" }}>
            🗺️ Routes Changed
          </h2>

          <div style={{ display: "grid", gap: "0.75rem" }}>
            {comparison.routeComparison.map((route: any, idx: number) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: `1px solid ${getStatusColor(route.delta.status)}`,
                  borderLeft: `4px solid ${getStatusColor(route.delta.status)}`,
                  borderRadius: "6px",
                  padding: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
                      {route.path}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                      {route.type} • {route.delta.percentage}
                    </p>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: getStatusColor(route.delta.status),
                    }}
                  >
                    {getDeltaEmoji(route.delta.status)} {route.delta.displaySize}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Chunk */}
      {comparison.sharedChunk && (
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b" }}>
            🔗 Shared Code (All Routes)
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
                Baseline
              </p>
              <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b" }}>
                {comparison.sharedChunk.baseline}
              </p>
            </div>

            <div style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "6px" }}>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
                Candidate
              </p>
              <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b" }}>
                {comparison.sharedChunk.candidate}
              </p>
            </div>

            <div
              style={{
                background: "white",
                padding: "1rem",
                borderRadius: "6px",
                border: `2px solid ${getStatusColor(comparison.sharedChunk.delta.status)}`,
              }}
            >
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>
                {getDeltaEmoji(comparison.sharedChunk.delta.status)} Delta
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: getStatusColor(comparison.sharedChunk.delta.status),
                }}
              >
                {comparison.sharedChunk.delta.displaySize}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Asset Changes */}
      {comparison.assetAnalysis &&
        (comparison.assetAnalysis.added.length > 0 ||
          comparison.assetAnalysis.removed.length > 0 ||
          comparison.assetAnalysis.modified.length > 0) && (
          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b" }}>
              📝 Asset Changes
            </h2>

            {comparison.assetAnalysis.added.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: "600", color: "#059669" }}>
                  ✨ Added ({comparison.assetAnalysis.added.length})
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#475569", fontSize: "0.9rem" }}>
                  {comparison.assetAnalysis.added.slice(0, 3).map((asset: any, idx: number) => (
                    <li key={idx}>
                      {asset.name} - {asset.size}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comparison.assetAnalysis.removed.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: "600", color: "#dc2626" }}>
                  🗑️ Removed ({comparison.assetAnalysis.removed.length})
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#475569", fontSize: "0.9rem" }}>
                  {comparison.assetAnalysis.removed.slice(0, 3).map((asset: any, idx: number) => (
                    <li key={idx}>
                      {asset.name} - {asset.size}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comparison.assetAnalysis.modified.length > 0 && (
              <div>
                <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: "600", color: "#2563eb" }}>
                  🔄 Modified ({comparison.assetAnalysis.modified.length})
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#475569", fontSize: "0.9rem" }}>
                  {comparison.assetAnalysis.modified.slice(0, 3).map((asset: any, idx: number) => (
                    <li key={idx}>
                      {asset.name} - {asset.delta.displaySize}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      {/* Metadata */}
      <div style={{ fontSize: "0.85rem", color: "#94a3b8", textAlign: "center" }}>
        <p style={{ margin: 0 }}>
          Comparing {comparison.metadata?.baselineId?.slice(0, 7)} → {comparison.metadata?.candidateId?.slice(0, 7)}
        </p>
      </div>
    </div>
  );
}
