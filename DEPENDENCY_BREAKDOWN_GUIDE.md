# Dependency Breakdown Tool - Complete Guide

## ✅ Implementation Complete!

### What Was Added:

#### 1. **Cache Configuration Updated**
**File:** `src/lib/cache/tool-response-cache.ts`

```typescript
get_dependency_breakdown: {
  ttl: 6 * 60 * 60 * 1000, // 6 hours - static for same buildId
  cacheable: true,
}
```

**How it works:**
- Same `buildId` + `project` combination returns cached result for 6 hours
- No MCP server hit for repeated queries
- Cache key: `get_dependency_breakdown:{"buildId":"722b2ae","project":"find-technicians"}`

#### 2. **New UI Component**
**File:** `src/app/test-mcp/DependencyBreakdown.tsx`

**Features:**
- 🎨 Beautiful visual breakdown of packages
- 📊 Top 10 packages with percentage bars
- 🏆 Highlights top 3 contributors
- 🎯 Color-coded by package type (app-code, react, @scoped, etc.)
- 🔗 Separate cards for each chunk (shared, routes)
- ⚠️ Helpful error messages when webpack stats unavailable

#### 3. **Test Page Integration**
**File:** `src/app/test-mcp/page.tsx`

**New example queries:**
- "Get dependency breakdown for commit 722b2ae in find-technicians"
- "Show me which packages are in the shared bundle for 722b2ae"

---

## 🚀 How to Use

### Option 1: Natural Language Query (Recommended)

1. Navigate to: `http://localhost:3000/test-mcp`
2. Type: **"Get dependency breakdown for commit 722b2ae in find-technicians"**
3. Click **🚀 Ask**

### Option 2: Direct API Call

```typescript
import { createMCPClient } from './lib/mcp-client';

const result = await createMCPClient().callTool({
  name: "get_dependency_breakdown",
  arguments: {
    buildId: "722b2ae",
    project: "find-technicians"
  }
});
```

---

## 📊 Output Example

### When Webpack Stats Available:

```json
{
  "buildInfo": {
    "commitSha": "722b2aea98060e95c0fd20fe4ab4edff61b09fdc",
    "branch": "main",
    "timestamp": "2026-11-26T15:09:01Z"
  },
  "chunks": [
    {
      "chunkId": "shared",
      "totalSize": "87.3 kB",
      "packageCount": 15,
      "breakdown": [
        { "package": "react", "size": "28.5 kB", "percentage": "32.6" },
        { "package": "next/router", "size": "15.2 kB", "percentage": "17.4" },
        { "package": "app-code", "size": "43.6 kB", "percentage": "50.0" }
      ]
    },
    {
      "chunkId": "/",
      "totalSize": "109 kB",
      "packageCount": 12,
      "breakdown": [...]
    }
  ]
}
```

### When Webpack Stats NOT Available:

```json
{
  "error": "Module-level data not available",
  "message": "To enable dependency breakdown, configure @next/bundle-analyzer...",
  "documentation": {
    "setup": [
      "1. Install: npm install @next/bundle-analyzer",
      "2. Configure in next.config.js/mjs",
      "3. Update CI to upload .next/analyze/ folder"
    ]
  }
}
```

---

## 🎨 UI Features

### Visual Elements:

1. **Chunk Cards**
   - Shared Bundle: Purple theme
   - Homepage (`/`): Yellow theme
   - Other routes: Green theme

2. **Package List**
   - Top 3 packages: Highlighted with colored backgrounds
   - Rank badges: Numbered circles
   - Percentage bars: Animated gradient bars
   - Size display: Human-readable (kB/MB)

3. **Summary Footer**
   - Quick overview of top 3 contributors
   - Total percentage at a glance

---

## ⚡ Cache Behavior

### First Request (Cache MISS):
```
User Query → Ollama selects tool → Check cache → MISS
  → Call MCP server → Download artifact → Parse webpack stats
  → Return result → Store in cache (6 hours)
  
Time: ~2-5 seconds
```

### Subsequent Request (Cache HIT):
```
User Query → Ollama selects tool → Check cache → HIT
  → Return cached result
  
Time: ~100-200ms (instant)
```

### Cache Key Format:
```
get_dependency_breakdown:{"buildId":"722b2ae","project":"find-technicians"}
get_dependency_breakdown:{"buildId":"722b2ae","project":"find-technicians","chunkId":"shared"}
```

**Different `chunkId` = Different cache entry**

---

## 🔧 Testing

### Test Commits Available:
- `722b2ae` - Latest commit
- `46659df` - Previous commit
- `2ed0071` - Older commit

### Test Queries:

1. **All chunks:**
   ```
   Get dependency breakdown for commit 722b2ae in find-technicians
   ```

2. **Specific chunk:**
   ```
   Show packages in shared bundle for 722b2ae in find-technicians
   ```

3. **Different commit:**
   ```
   Get dependency breakdown for commit 46659df in find-technicians
   ```

---

## 📝 Notes

1. **CI Workflow**: Already configured to upload `.next/analyze/` folder
2. **Webpack Stats**: Generated automatically with `ANALYZE=true`
3. **Storage**: ~1 MB per commit, 7-day retention
4. **Cache TTL**: 6 hours (adjustable in `tool-response-cache.ts`)

---

## 🎯 Next Steps

1. **Push to GitHub** to trigger CI and generate artifacts
2. **Test locally** with the UI at `/test-mcp`
3. **Monitor cache hits** in browser console (shows ⚡ HIT or MISS)

---

## 🐛 Troubleshooting

### "Module-level data not available"
- **Cause**: Workflow didn't upload `.next/analyze/` folder
- **Fix**: Verify CI workflow uploaded artifacts (check GitHub Actions)

### Cache not working
- **Check**: Browser console for cache logs
- **Clear**: Call `toolResponseCache.clear()` in console
- **Verify**: Cache TTL is 6 hours (21,600,000 ms)

### UI not showing
- **Check**: Component imported in page.tsx
- **Verify**: Tool name matches exactly: `get_dependency_breakdown`
- **Inspect**: Browser console for parsing errors

---

## 📚 Architecture

```
┌─────────────────────────┐
│   User Query (UI)       │
│   "Get dependency..."   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Ollama (Llama 3.1)    │
│   Selects tool          │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Cache Check           │
│   (6-hour TTL)          │
└───────────┬─────────────┘
            ↓
     Cache HIT? ──YES──→ Return cached result ⚡
            │
           NO
            ↓
┌─────────────────────────┐
│   MCP Server            │
│   Downloads artifact    │
│   Parses webpack stats  │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│   Store in cache        │
│   Return result         │
└─────────────────────────┘
```

---

**🎉 Your dependency breakdown tool is ready to use!**
