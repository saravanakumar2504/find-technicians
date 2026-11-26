/**
 * Component to display dependency breakdown with beautiful visualizations
 */
export default function DependencyBreakdown({ data }: { data: any }) {
  if (!data) {
    return <div>No dependency data available</div>;
  }

  // Handle error response (webpack stats not available)
  if (data.error) {
    return (
      <div style={{ fontFamily: "system-ui" }}>
        <div
          style={{
            background: "#fef3c7",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "2px solid #f59e0b",
            marginBottom: "1rem",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#92400e", fontSize: "1.1rem" }}>
            ⚠️ {data.error}
          </h4>
          <p style={{ margin: "0.5rem 0", color: "#78350f", fontSize: "0.95rem" }}>
            {data.message}
          </p>
        </div>

        {data.documentation?.setup && (
          <div
            style={{
              background: "white",
              padding: "1.25rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h5 style={{ margin: "0 0 0.75rem 0", color: "#475569", fontSize: "0.95rem" }}>
              📋 Setup Instructions:
            </h5>
            <ol style={{ margin: 0, paddingLeft: "1.5rem", color: "#64748b" }}>
              {data.documentation.setup.map((step: string, index: number) => (
                <li key={index} style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  const buildInfo = data.buildInfo || {};
  const chunks = data.chunks || [];
  const singleChunk = data.chunkId ? data : null;

  // If single chunk response, wrap it
  const displayChunks = singleChunk ? [singleChunk] : chunks;

  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* Build Info Header */}
      {buildInfo.commitSha && (
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <h4 style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
              📦 Dependency Breakdown
            </h4>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b", flexWrap: "wrap" }}>
              <span>
                <strong>Commit:</strong>{" "}
                <code
                  style={{
                    background: "#f1f5f9",
                    padding: "0.125rem 0.4rem",
                    borderRadius: "3px",
                    fontSize: "0.7rem",
                  }}
                >
                  {buildInfo.commitSha.substring(0, 7)}
                </code>
              </span>
              <span>
                <strong>Branch:</strong> {buildInfo.branch || "N/A"}
              </span>
              {buildInfo.timestamp && (
                <span>
                  <strong>Time:</strong> {new Date(buildInfo.timestamp).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chunks Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {displayChunks.map((chunk: any, chunkIndex: number) => (
          <ChunkBreakdown key={chunk.chunkId || chunkIndex} chunk={chunk} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual chunk breakdown with package visualization
 */
function ChunkBreakdown({ chunk }: { chunk: any }) {
  const chunkId = chunk.chunkId || "Unknown";
  const totalSize = chunk.totalSize || "N/A";
  const breakdown = chunk.breakdown || [];
  const packageCount = chunk.packageCount || breakdown.length;

  // Color palette for different package types
  const getPackageColor = (packageName: string) => {
    if (packageName === "app-code") return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
    if (packageName === "next-internal") return { bg: "#f3e8ff", border: "#a855f7", text: "#7e22ce" };
    if (packageName.startsWith("react")) return { bg: "#dbeafe", border: "#0ea5e9", text: "#0369a1" };
    if (packageName.startsWith("@")) return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };
    return { bg: "#f1f5f9", border: "#94a3b8", text: "#475569" };
  };

  // Get chunk header color
  const getChunkColor = () => {
    if (chunkId === "shared") return { bg: "#e0e7ff", border: "#6366f1", text: "#4338ca" };
    if (chunkId === "/") return { bg: "#fef3c7", border: "#eab308", text: "#a16207" };
    return { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" };
  };

  const chunkColor = getChunkColor();

  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        border: "2px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Chunk Header */}
      <div
        style={{
          background: chunkColor.bg,
          padding: "1rem 1.25rem",
          borderBottom: `2px solid ${chunkColor.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h5 style={{ margin: "0 0 0.25rem 0", color: chunkColor.text, fontSize: "1.1rem", fontWeight: "700" }}>
              {chunkId === "shared" ? "🔗 Shared Bundle" : `📄 ${chunkId}`}
            </h5>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {packageCount} {packageCount === 1 ? "package" : "packages"}
            </div>
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: chunkColor.text,
            }}
          >
            {totalSize}
          </div>
        </div>
      </div>

      {/* Package Breakdown */}
      <div style={{ padding: "1.25rem" }}>
        {breakdown.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
            No package data available
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {breakdown.slice(0, 10).map((pkg: any, index: number) => {
              const colors = getPackageColor(pkg.package);
              const percentage = parseFloat(pkg.percentage);
              const isTopPackage = index < 3;

              return (
                <div
                  key={pkg.package}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 1rem",
                    background: isTopPackage ? colors.bg : "#fafafa",
                    borderRadius: "8px",
                    border: `1px solid ${isTopPackage ? colors.border : "#e5e7eb"}`,
                    transition: "all 0.2s",
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      minWidth: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: isTopPackage ? colors.text : "#e5e7eb",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Package Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={pkg.package}
                    >
                      {pkg.package}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.125rem" }}>
                      {pkg.size}
                    </div>
                  </div>

                  {/* Percentage Bar */}
                  <div style={{ width: "140px" }}>
                    <div
                      style={{
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(percentage, 100)}%`,
                          background: isTopPackage
                            ? `linear-gradient(90deg, ${colors.text}, ${colors.border})`
                            : "#94a3b8",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: colors.text,
                        fontWeight: "600",
                        marginTop: "0.25rem",
                        textAlign: "right",
                      }}
                    >
                      {pkg.percentage}%
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show more indicator */}
            {breakdown.length > 10 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "0.75rem",
                  color: "#64748b",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}
              >
                + {breakdown.length - 10} more packages
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top 3 Summary */}
      {breakdown.length >= 3 && (
        <div
          style={{
            background: "#fafafa",
            padding: "1rem 1.25rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>
            🏆 Top 3 Contributors:
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {breakdown.slice(0, 3).map((pkg: any) => (
              <div
                key={pkg.package}
                style={{
                  fontSize: "0.8rem",
                  color: "#475569",
                  fontWeight: "500",
                }}
              >
                <strong>{pkg.package}</strong> ({pkg.percentage}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
