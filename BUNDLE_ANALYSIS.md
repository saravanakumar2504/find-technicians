# Bundle Analysis Setup

This project uses Next.js Bundle Analyzer to track bundle sizes across builds.

## Quick Start

### Local Testing
```bash
# Build with bundle analysis (opens HTML reports)
npm run build:analyze

# Or extract JSON stats
npm run build > build-output.txt 2>&1
node scripts/extract-bundle-stats.js
cat bundle-stats.json
```

### CI (Automatic)
- Every push to `main` triggers GitHub Actions workflow
- Bundle analysis runs automatically
- Artifacts uploaded with **7-day retention**

## What Data You Get

### Per-Route Bundle Sizes
```json
{
  "path": "/",
  "type": "static",
  "size": "2.69 kB",
  "firstLoadJS": "109 kB"
}
```

### Summary Statistics
```json
{
  "totalRoutes": 7,
  "staticRoutes": 4,
  "dynamicRoutes": 3,
  "shared": { "size": "87.3 kB" },
  "largestRoute": { "path": "/", "firstLoadJS": "109 kB" }
}
```

## Artifact Contents

Each GitHub Actions artifact contains:
- `bundle-stats.json` - Structured route data (for MCP tool)
- `.next/analyze/client.html` - UI bundle visualization
- `.next/analyze/nodejs.html` - Server bundle visualization
- `.next/analyze/edge.html` - Edge runtime bundle

## Accessing Reports

### Via GitHub UI
1. Actions tab → Select workflow run
2. Scroll to "Artifacts" section
3. Download `bundle-report-{commitSha}`

### Via MCP Server
```javascript
// 1. List builds
list_builds({ project: "find-technicians", branch: "main" })

// 2. Get bundle summary
get_bundle_summary({ buildId: "12345..." })
```

## Configuration

- `next.config.mjs` - Bundle analyzer wrapper
- `.github/workflows/ci.yml` - CI automation
- `scripts/extract-bundle-stats.js` - JSON extraction
- Controlled by `ANALYZE=true` environment variable

## Quick Local Test

Test the complete workflow locally:

```bash
# 1. Build with analysis
npm run build > build-output.txt 2>&1

# 2. Extract stats
node scripts/extract-bundle-stats.js

# 3. View results
cat bundle-stats.json | head -50
```

Or for interactive HTML reports:
```bash
npm run build:analyze
# Opens in browser automatically
```
