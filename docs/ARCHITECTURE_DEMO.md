# Bundle Analysis: Token Optimization with Smart Caching

## The Problem
Asking the same question twice = Paying twice ❌

## The Solution
Smart memory remembers answers → Instant response + Reduced token cost ✅

---

## How It Works

```
User Query: "Get bundle for commit xyz123"
        ↓
   Check Cache?
      /    \
    YES    NO
     ↓      ↓
  Return   LLM → MCP → GitHub
  Instant       ↓
  FREE!     Cache it
               ↓
            Return
```

---

## Example Scenarios

### Scenario 1: First Request (Cache Miss ❌)
```
Query: "Get bundle data for commit abc123"

Timeline:
├─ Check cache → NOT FOUND
├─ LLM processes query (costs tokens)
├─ Call GitHub API
├─ Store in cache (6 hours)
└─ Return result

Time: ~5-10 seconds
Cost: Full token cost
```

### Scenario 2: Same Request Again (Cache Hit ✅)
```
Query: "Get bundle data for commit abc123" (same ID)

Timeline:
├─ Check cache → FOUND!
└─ Return result instantly

Time: <100ms (instant)
Cost: 0 tokens (FREE)
```

**Result:** Second request is instant and costs nothing!

---

## Which Tools are Cached?

✅ **Cached:** `get_bundle_summary` (static data, 6 hours TTL)  
❌ **Not Cached:** `list_builds` (dynamic data, always fresh)

---

## Architecture Flow

```
┌──────────────────────────────────────┐
│  User Query                          │
└──────────────┬───────────────────────┘
               ↓
      ┌────────────────┐
      │ Cache Layer    │
      └────────┬───────┘
               ↓
       Cache Hit?
         /    \
       YES    NO
        ↓      ↓
     Return   LLM (Ollama) → Costs tokens
              ↓
           MCP Tool
              ↓
          GitHub API
              ↓
         Cache + Return
```
