/**
 * Tool Response Cache
 * Caches MCP tool responses based on tool name and arguments
 * Different tools have different TTL and cacheability settings
 */

export interface CacheConfig {
  ttl: number | null; // TTL in milliseconds, null = don't cache
  cacheable: boolean;
}

export interface CachedEntry<T> {
  data: T;
  expiresAt: number | null;
}

// Tool-specific cache configuration
export const TOOL_CACHE_CONFIG: Record<string, CacheConfig> = {
  get_bundle_summary: {
    ttl: 6 * 60 * 60 * 1000, // 6 hours - static bundle data
    cacheable: true,
  },
  list_builds: {
    ttl: null,
    cacheable: false, // Dynamic - user's commits change frequently
  },
  // Add future tools here with their cache settings
  // example_tool: { ttl: 1 * 60 * 60 * 1000, cacheable: true }
};

class ToolResponseCache {
  private cache: Map<string, CachedEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of expired entries (every 5 minutes)
    this.startCleanup();
  }

  /**
   * Generate cache key from tool name and arguments
   */
  private generateKey(toolName: string, args: Record<string, unknown>): string {
    return `${toolName}:${JSON.stringify(args)}`;
  }

  /**
   * Check if a tool is cacheable
   */
  private isToolCacheable(toolName: string): boolean {
    return TOOL_CACHE_CONFIG[toolName]?.cacheable ?? false;
  }

  /**
   * Get TTL for a tool in milliseconds
   */
  private getTTL(toolName: string): number | null {
    return TOOL_CACHE_CONFIG[toolName]?.ttl ?? null;
  }

  /**
   * Get cached result if exists and not expired
   */
  get(toolName: string, args: Record<string, unknown>): any | null {
    if (!this.isToolCacheable(toolName)) {
      return null;
    }

    const key = this.generateKey(toolName, args);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log(`🗑️  Cache expired for key: ${key}`);
      return null;
    }

    console.log(`🎯 Cache hit for: ${key}`);
    return entry.data;
  }

  /**
   * Store result in cache
   */
  set(toolName: string, args: Record<string, unknown>, data: any): void {
    if (!this.isToolCacheable(toolName)) {
      return;
    }

    const key = this.generateKey(toolName, args);
    const ttl = this.getTTL(toolName);
    const expiresAt = ttl ? Date.now() + ttl : null;

    this.cache.set(key, { data, expiresAt });
    console.log(`💾 Cached result for: ${key} (TTL: ${ttl ? ttl / 1000 + "s" : "never"})`);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  Cleared cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresAt: entry.expiresAt ? new Date(entry.expiresAt).toISOString() : "never",
        isExpired: entry.expiresAt !== null && Date.now() > entry.expiresAt,
      })),
    };
  }

  /**
   * Periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      let cleanedCount = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries`);
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const toolResponseCache = new ToolResponseCache();
