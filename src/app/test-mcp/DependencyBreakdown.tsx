"use client";

import { useState } from "react";

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

  // Check if this is the new overall breakdown format (no chunks array)
  const isOverallBreakdown = !data.chunks && data.breakdown;
  const breakdown = data.breakdown || [];
  const totalSize = data.totalSize || "N/A";
  const packageCount = data.packageCount || breakdown.length;

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

      {/* Overall Breakdown Display */}
      {isOverallBreakdown ? (
        <OverallBreakdownCard
          totalSize={totalSize}
          packageCount={packageCount}
          breakdown={breakdown}
          note={data.note}
        />
      ) : (
        // Legacy format with chunks (kept for backward compatibility)
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {(data.chunks || []).map((chunk: any, chunkIndex: number) => (
            <ChunkCard key={chunk.chunkId || chunkIndex} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Overall bundle breakdown card
 */
function OverallBreakdownCard({ totalSize, packageCount, breakdown, note }: {
  totalSize: string;
  packageCount: number;
  breakdown: any[];
  note?: string;
}) {
  const getPackageColor = (packageName: string) => {
    if (packageName === "app-code") return { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" };
    if (packageName === "other") return { bg: "#f1f5f9", border: "#94a3b8", text: "#475569" };
    if (packageName === "next" || packageName === "next-internal") return { bg: "#f3e8ff", border: "#a855f7", text: "#7e22ce" };
    if (packageName.startsWith("react")) return { bg: "#dbeafe", border: "#0ea5e9", text: "#0369a1" };
    if (packageName.startsWith("@")) return { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };
    return { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" };
  };

  return (
    <div>
      {/* Compact Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ fontSize: "2rem" }}>📦</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>
              Bundle Dependency Breakdown
            </h3>
            <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: "0.25rem" }}>
              {packageCount} {packageCount === 1 ? "package" : "packages"} detected
            </div>
          </div>
        </div>

        <div style={{ fontSize: "2rem", fontWeight: "700" }}>
          {totalSize}
        </div>

        {note && (
          <div style={{
            fontSize: "0.75rem",
            opacity: 0.85,
            flex: "1 1 100%",
            marginTop: "0.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255,255,255,0.2)"
          }}>
            ℹ️ {note}
          </div>
        )}
      </div>

      {/* Package Grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {breakdown.map((pkg: any, index: number) => {
          return <PackageCard key={pkg.package} pkg={pkg} index={index} getPackageColor={getPackageColor} />;
        })}
      </div>
    </div>
  );
}

/**
 * Expandable package card with all details
 */
function PackageCard({ pkg, index, getPackageColor }: { pkg: any; index: number; getPackageColor: (name: string) => any }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getPackageColor(pkg.package);
  const percentage = parseFloat(pkg.percentage);
  const isTopPackage = index < 5;

  return (
    <div
      style={{
        background: isTopPackage ? colors.bg : "white",
        border: `2px solid ${colors.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      {/* Card Header - Always Visible */}
      <div
        style={{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank Badge */}
        <div
          style={{
            minWidth: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: colors.text,
            color: "white",
            fontWeight: "700",
            fontSize: "0.85rem",
          }}
        >
          {index + 1}
        </div>

        {/* Package Name & Size */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "700",
              color: colors.text,
              fontSize: "1.1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={pkg.package}
          >
            {pkg.package}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            {pkg.moduleCount} {pkg.moduleCount === 1 ? "module" : "modules"}
          </div>
        </div>

        {/* Size & Percentage */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: colors.text }}>
            {pkg.size}
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: "600", color: colors.text }}>
            {pkg.percentage}%
          </div>
        </div>

        {/* Expand Icon */}
        <div style={{ fontSize: "1.5rem", color: colors.text }}>
          {expanded ? "▼" : "▶"}
        </div>
      </div>

      {/* Percentage Bar */}
      <div style={{ padding: "0 1rem 1rem 1rem" }}>
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
              background: `linear-gradient(90deg, ${colors.text}, ${colors.border})`,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: `2px solid ${colors.border}`, background: "#fafafa" }}>
          {/* Insights */}
          {pkg.insights && pkg.insights.length > 0 && (
            <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem" }}>
                💡 Insights
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pkg.insights.map((insight: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.8rem",
                      color: "#64748b",
                      padding: "0.5rem",
                      background: "white",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Modules */}
          {pkg.modules && pkg.modules.length > 0 && (
            <div style={{ padding: "1rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem" }}>
                📄 All Modules ({pkg.modules.length})
              </div>
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {pkg.modules.map((mod: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.5rem",
                      background: "white",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "#475569",
                      }}
                      title={mod.path}
                    >
                      {mod.path}
                    </div>
                    <div style={{ fontWeight: "600", color: colors.text, whiteSpace: "nowrap" }}>
                      {mod.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Legacy chunk card (kept for backward compatibility)
 */
function ChunkCard({ chunk }: { chunk: any }) {
  const chunkId = chunk.chunkId || "Unknown";
  const totalSize = chunk.totalSize || "N/A";
  const breakdown = chunk.breakdown || [];
  const packageCount = chunk.packageCount || breakdown.length;

  const getChunkColor = () => {
    if (chunkId === "shared") return { bg: "#e0e7ff", border: "#6366f1", text: "#4338ca", icon: "🔗" };
    if (chunkId === "/") return { bg: "#fef3c7", border: "#eab308", text: "#a16207", icon: "🏠" };
    return { bg: "#f0fdf4", border: "#22c55e", text: "#15803d", icon: "📄" };
  };

  const chunkColor = getChunkColor();
  const topPackages = breakdown.slice(0, 3);

  return (
    <div
      style={{
        background: chunkColor.bg,
        borderRadius: "12px",
        border: `2px solid ${chunkColor.border}`,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ fontSize: "1.5rem" }}>{chunkColor.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "700",
              color: chunkColor.text,
              fontSize: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={chunkId === "shared" ? "Shared Bundle" : chunkId}
          >
            {chunkId === "shared" ? "Shared Bundle" : chunkId}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.125rem" }}>
            {packageCount} {packageCount === 1 ? "package" : "packages"}
          </div>
        </div>
      </div>

      {/* Total Size */}
      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          color: chunkColor.text,
          textAlign: "center",
          padding: "0.5rem",
          background: "white",
          borderRadius: "8px",
        }}
      >
        {totalSize}
      </div>

      {/* Top 3 Packages Preview */}
      {topPackages.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", marginBottom: "0.25rem" }}>
            Top Contributors:
          </div>
          {topPackages.map((pkg: any, index: number) => (
            <div
              key={pkg.package}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.75rem",
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
                title={pkg.package}
              >
                {index + 1}. {pkg.package}
              </div>
              <div style={{ color: chunkColor.text, fontWeight: "600", marginLeft: "0.5rem" }}>
                {pkg.percentage}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

