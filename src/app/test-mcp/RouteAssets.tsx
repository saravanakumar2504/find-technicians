/**
 * Component to display route assets in a simple, visual way
 * Easy for non-technical people to understand
 */
export default function RouteAssets({ data }: { data: any }) {
  // Defensive checks
  if (!data) {
    return <div>No route assets data available</div>;
  }

  const route = data.route || "Unknown Route";
  const totalSize = data.totalSize || "0 B";
  const fileCount = data.fileCount || 0;
  const breakdown = data.breakdown || {};
  const summary = data.summary || {};
  const insights = data.insights || [];

  // Calculate percentages for visual bars
  const totalBytes = data.totalSizeBytes || 1;
  const getPercentage = (sizeStr: string) => {
    if (!sizeStr || sizeStr === "0 B") return 0;
    const match = sizeStr.match(/(\d+\.?\d*)\s*(\w+)/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2];

    // Convert to bytes for percentage calculation
    let bytes = value;
    if (unit === "kB") bytes = value * 1024;
    if (unit === "MB") bytes = value * 1024 * 1024;

    return (bytes / totalBytes) * 100;
  };

  // Category info with friendly descriptions
  const categories = [
    {
      key: "core",
      label: "🎯 Core Files",
      description: "Essential files needed by every page (React, Webpack)",
      color: "#3b82f6",
      bgColor: "#dbeafe",
      size: summary.coreSize || "0 B",
      files: breakdown.core || [],
    },
    {
      key: "routeSpecific",
      label: "📄 Page Code",
      description: "Code specific to this page only",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      size: summary.routeSize || "0 B",
      files: breakdown.routeSpecific || [],
    },
    {
      key: "layout",
      label: "🏗️ Layout",
      description: "Shared navigation, header, footer",
      color: "#06b6d4",
      bgColor: "#cffafe",
      size: summary.layoutSize || "0 B",
      files: breakdown.layout || [],
    },
    {
      key: "css",
      label: "🎨 Styles",
      description: "Colors, fonts, and design",
      color: "#ec4899",
      bgColor: "#fce7f3",
      size: summary.cssSize || "0 B",
      files: breakdown.css || [],
    },
    {
      key: "polyfills",
      label: "🔧 Compatibility",
      description: "Makes it work on older browsers",
      color: "#84cc16",
      bgColor: "#ecfccb",
      size: summary.polyfillsSize || "0 B",
      files: breakdown.polyfills || [],
    },
  ].filter(cat => cat.files.length > 0 || cat.size !== "0 B"); // Only show non-empty categories

  return (
    <div style={{ fontFamily: "system-ui" }}>
      {/* Header with route info */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          color: "white",
        }}
      >
        <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "0.5rem" }}>
          📊 Analyzing Page
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          {route}
        </div>
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Total Files</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{fileCount}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Total Size</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{totalSize}</div>
          </div>
        </div>
      </div>

      {/* Insights - What does this mean? */}
      {insights.length > 0 && (
        <div
          style={{
            background: insights.some((i: string) => i.includes("✅")) ? "#f0fdf4" :
                       insights.some((i: string) => i.includes("🔴")) ? "#fef2f2" : "#fef3c7",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: insights.some((i: string) => i.includes("✅")) ? "2px solid #22c55e" :
                   insights.some((i: string) => i.includes("🔴")) ? "2px solid #ef4444" : "2px solid #eab308",
          }}
        >
          <div style={{
            fontSize: "0.875rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
            color: insights.some((i: string) => i.includes("✅")) ? "#166534" :
                   insights.some((i: string) => i.includes("🔴")) ? "#991b1b" : "#a16207"
          }}>
            💡 What This Means:
          </div>
          {insights.map((insight: string, index: number) => (
            <div
              key={index}
              style={{
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                color: insights.some((i: string) => i.includes("✅")) ? "#14532d" :
                       insights.some((i: string) => i.includes("🔴")) ? "#7f1d1d" : "#713f12",
              }}
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* Visual breakdown by category */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", color: "#1e293b", fontSize: "1.1rem" }}>
          📦 What Gets Loaded?
        </h3>
        <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.5rem" }}>
          When someone visits this page, their browser downloads these files:
        </div>

        {/* Category cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {categories.map((category) => {
            const percentage = getPercentage(category.size);
            const hasFiles = category.files.length > 0;

            return (
              <div
                key={category.key}
                style={{
                  background: category.bgColor,
                  padding: "1rem",
                  borderRadius: "8px",
                  border: `2px solid ${category.color}`,
                }}
              >
                {/* Category header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "600", color: category.color }}>
                      {category.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                      {category.description}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color: category.color,
                    }}
                  >
                    {category.size}
                  </div>
                </div>

                {/* Visual bar showing percentage of total */}
                {percentage > 0 && (
                  <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{
                      height: "8px",
                      background: "#f1f5f9",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: category.color,
                          borderRadius: "4px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                      {percentage.toFixed(1)}% of total page size
                    </div>
                  </div>
                )}

                {/* File list (expandable) */}
                {hasFiles && (
                  <details style={{ marginTop: "0.75rem" }}>
                    <summary style={{
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      color: category.color,
                      fontWeight: "600",
                      padding: "0.5rem",
                      background: "white",
                      borderRadius: "4px",
                    }}>
                      📁 View {category.files.length} file{category.files.length > 1 ? "s" : ""}
                    </summary>
                    <div style={{ marginTop: "0.5rem", paddingLeft: "0.5rem" }}>
                      {category.files.map((file: any, index: number) => (
                        <div
                          key={index}
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.4rem 0.5rem",
                            background: "white",
                            borderRadius: "4px",
                            marginTop: "0.25rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <code style={{
                            color: "#475569",
                            fontSize: "0.7rem",
                            wordBreak: "break-all"
                          }}>
                            {file.file || "Unknown"}
                          </code>
                          <span style={{
                            color: category.color,
                            fontWeight: "600",
                            marginLeft: "0.5rem",
                            whiteSpace: "nowrap"
                          }}>
                            {file.size || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple explanation for non-technical users */}
      <div
        style={{
          background: "#f8fafc",
          padding: "1.25rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
        }}
      >
        <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "0.75rem" }}>
          🤔 What Does This Mean?
        </div>
        <div style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.6" }}>
          <p style={{ margin: "0 0 0.5rem 0" }}>
            • <strong>Smaller is better</strong> - Less data means faster page loading
          </p>
          <p style={{ margin: "0 0 0.5rem 0" }}>
            • <strong>Fewer files is better</strong> - Each file requires a separate download
          </p>
          <p style={{ margin: "0 0 0.5rem 0" }}>
            • <strong>Core Files</strong> are shared by all pages, so they're cached after first visit
          </p>
          <p style={{ margin: "0" }}>
            • <strong>Page Code</strong> is downloaded fresh each time you visit this page
          </p>
        </div>
      </div>

      {/* Quick comparison guide */}
      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
        }}
      >
        <div style={{
          background: "#f0fdf4",
          padding: "0.75rem",
          borderRadius: "6px",
          textAlign: "center",
          border: "1px solid #22c55e"
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>✅</div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#166534" }}>Good</div>
          <div style={{ fontSize: "0.7rem", color: "#15803d", marginTop: "0.25rem" }}>{"< 300 kB"}</div>
        </div>
        <div style={{
          background: "#fef3c7",
          padding: "0.75rem",
          borderRadius: "6px",
          textAlign: "center",
          border: "1px solid #eab308"
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>⚠️</div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#a16207" }}>OK</div>
          <div style={{ fontSize: "0.7rem", color: "#a16207", marginTop: "0.25rem" }}>300-1000 kB</div>
        </div>
        <div style={{
          background: "#fef2f2",
          padding: "0.75rem",
          borderRadius: "6px",
          textAlign: "center",
          border: "1px solid #ef4444"
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🔴</div>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#991b1b" }}>Heavy</div>
          <div style={{ fontSize: "0.7rem", color: "#991b1b", marginTop: "0.25rem" }}>{"> 1 MB"}</div>
        </div>
      </div>
    </div>
  );
}
