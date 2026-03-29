/**
 * Rate limiter for external API calls
 * Tracks API usage per endpoint and enforces limits
 */

import { logger } from "./logger";
import { env } from "./env";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private maxRequests: number;
  private windowSeconds: number;

  constructor() {
    this.limits = new Map();
    this.maxRequests = env.cache.rateLimitMaxRequests;
    this.windowSeconds = env.cache.rateLimitWindowSeconds;
  }

  /**
   * Check if request is allowed for endpoint
   */
  async checkLimit(endpoint: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.limits.get(endpoint);

    // No entry or window expired - allow and create new entry
    if (!entry || now > entry.resetAt) {
      this.limits.set(endpoint, {
        count: 1,
        resetAt: now + this.windowSeconds * 1000,
      });
      return true;
    }

    // Within window - check count
    if (entry.count >= this.maxRequests) {
      logger.warn("Rate limit exceeded", {
        endpoint,
        count: entry.count,
        maxRequests: this.maxRequests,
      });
      return false;
    }

    // Increment count
    entry.count++;
    this.limits.set(endpoint, entry);

    // Log warning when approaching limit (80% threshold)
    if (entry.count >= this.maxRequests * 0.8) {
      logger.warn("Approaching rate limit", {
        endpoint,
        count: entry.count,
        maxRequests: this.maxRequests,
        remaining: this.maxRequests - entry.count,
      });
    }

    return true;
  }

  /**
   * Record a successful API call
   */
  recordCall(endpoint: string): void {
    const now = Date.now();
    const entry = this.limits.get(endpoint);

    if (!entry || now > entry.resetAt) {
      this.limits.set(endpoint, {
        count: 1,
        resetAt: now + this.windowSeconds * 1000,
      });
    } else {
      entry.count++;
      this.limits.set(endpoint, entry);
    }

    logger.debug("API call recorded", {
      endpoint,
      count: entry?.count || 1,
    });
  }

  /**
   * Get remaining requests for endpoint
   */
  getRemaining(endpoint: string): number {
    const now = Date.now();
    const entry = this.limits.get(endpoint);

    if (!entry || now > entry.resetAt) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until rate limit resets (in seconds)
   */
  getResetTime(endpoint: string): number {
    const now = Date.now();
    const entry = this.limits.get(endpoint);

    if (!entry || now > entry.resetAt) {
      return 0;
    }

    return Math.ceil((entry.resetAt - now) / 1000);
  }

  /**
   * Reset rate limit for endpoint
   */
  reset(endpoint: string): void {
    this.limits.delete(endpoint);
    logger.info("Rate limit reset", { endpoint });
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
    logger.info("All rate limits cleared");
  }

  /**
   * Get rate limit statistics
   */
  getStats(): Record<
    string,
    { count: number; remaining: number; resetIn: number }
  > {
    const stats: Record<
      string,
      { count: number; remaining: number; resetIn: number }
    > = {};
    const now = Date.now();

    for (const [endpoint, entry] of this.limits.entries()) {
      if (now <= entry.resetAt) {
        stats[endpoint] = {
          count: entry.count,
          remaining: Math.max(0, this.maxRequests - entry.count),
          resetIn: Math.ceil((entry.resetAt - now) / 1000),
        };
      }
    }

    return stats;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
