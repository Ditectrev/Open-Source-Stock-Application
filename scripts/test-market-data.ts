/**
 * Test script for Market Data Infrastructure
 * Tests caching, rate limiting, and API integrations
 */

import { cacheService } from "../lib/cache";
import { rateLimiter } from "../lib/rate-limiter";
import { retryWithBackoff } from "../lib/retry";
import { marketDataService } from "../services/market-data.service";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.cyan);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

// Test 1: Cache Service
async function testCacheService() {
  log("\n=== Testing Cache Service ===", colors.blue);

  try {
    // Test cache set and get
    const testKey = cacheService.generateKey("AAPL", "quote");
    const testData = { symbol: "AAPL", price: 150.0 };

    cacheService.set(testKey, testData, 60);
    const retrieved = cacheService.get<{ symbol: string; price: number }>(testKey);

    if (retrieved && retrieved.symbol === "AAPL") {
      logSuccess("Cache set and get working");
    } else {
      logError("Cache retrieval failed");
    }

    // Test cache expiration
    cacheService.set("test:expire", "data", 0);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const expired = cacheService.get("test:expire");

    if (!expired) {
      logSuccess("Cache expiration working");
    } else {
      logError("Cache expiration not working");
    }

    // Test cache invalidation
    cacheService.set("AAPL:test", "data", 60);
    cacheService.invalidateSymbol("AAPL");
    const invalidated = cacheService.get("AAPL:test");

    if (!invalidated) {
      logSuccess("Cache invalidation working");
    } else {
      logError("Cache invalidation not working");
    }

    // Show cache stats
    const stats = cacheService.getStats();
    logInfo(`Cache size: ${stats.size} entries`);
  } catch (error) {
    logError(`Cache test failed: ${error}`);
  }
}

// Test 2: Rate Limiter
async function testRateLimiter() {
  log("\n=== Testing Rate Limiter ===", colors.blue);

  try {
    const endpoint = "test:endpoint";

    // Clear any existing limits
    rateLimiter.reset(endpoint);

    // Test rate limit checking
    const allowed1 = await rateLimiter.checkLimit(endpoint);
    if (allowed1) {
      logSuccess("First request allowed");
    } else {
      logError("First request blocked incorrectly");
    }

    // Test rate limit recording
    rateLimiter.recordCall(endpoint);
    const remaining = rateLimiter.getRemaining(endpoint);
    logInfo(`Remaining requests: ${remaining}`);

    // Test rate limit stats
    const stats = rateLimiter.getStats();
    if (stats[endpoint]) {
      logSuccess("Rate limit stats tracking working");
      logInfo(
        `Endpoint stats: ${stats[endpoint].count} calls, ${stats[endpoint].remaining} remaining`
      );
    }

    // Clean up
    rateLimiter.reset(endpoint);
  } catch (error) {
    logError(`Rate limiter test failed: ${error}`);
  }
}

// Test 3: Retry with Backoff
async function testRetryBackoff() {
  log("\n=== Testing Retry with Backoff ===", colors.blue);

  try {
    let attempts = 0;

    // Test successful retry
    const result = await retryWithBackoff(
      async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error("Simulated failure");
        }
        return "success";
      },
      "test:retry"
    );

    if (result === "success" && attempts === 2) {
      logSuccess("Retry with backoff working (succeeded on attempt 2)");
    } else {
      logError("Retry logic not working correctly");
    }

    // Test max retries
    attempts = 0;
    try {
      await retryWithBackoff(
        async () => {
          attempts++;
          throw new Error("Always fails");
        },
        "test:max-retry",
        { maxAttempts: 3 }
      );
      logError("Should have thrown after max retries");
    } catch (error) {
      if (attempts === 3) {
        logSuccess("Max retry limit working (3 attempts)");
      } else {
        logError(`Wrong number of attempts: ${attempts}`);
      }
    }
  } catch (error) {
    logError(`Retry test failed: ${error}`);
  }
}

// Test 4: Market Data Service (with mock data)
async function testMarketDataService() {
  log("\n=== Testing Market Data Service ===", colors.blue);

  try {
    logWarning(
      "Note: These tests will fail if external APIs are not accessible"
    );
    logWarning("This is expected in a local development environment");

    // Test symbol data (will likely fail without real API access)
    try {
      logInfo("Testing getSymbolData for AAPL...");
      const symbolData = await marketDataService.getSymbolData("AAPL");
      logSuccess(`Symbol data retrieved: ${symbolData.name} at $${symbolData.price}`);
    } catch (error) {
      logWarning(`Symbol data test failed (expected): ${error instanceof Error ? error.message : error}`);
    }

    // Test historical data
    try {
      logInfo("Testing getHistoricalPrices for AAPL...");
      const historical = await marketDataService.getHistoricalPrices(
        "AAPL",
        "1M"
      );
      logSuccess(`Historical data retrieved: ${historical.length} data points`);
    } catch (error) {
      logWarning(`Historical data test failed (expected): ${error instanceof Error ? error.message : error}`);
    }

    // Test technical indicators
    try {
      logInfo("Testing getTechnicalIndicators for AAPL...");
      const indicators = await marketDataService.getTechnicalIndicators("AAPL");
      logSuccess(
        `Technical indicators calculated: RSI=${indicators.rsi.value.toFixed(2)}`
      );
    } catch (error) {
      logWarning(`Technical indicators test failed (expected): ${error instanceof Error ? error.message : error}`);
    }

    // Test Fear & Greed Index
    try {
      logInfo("Testing getFearGreedIndex...");
      const fearGreed = await marketDataService.getFearGreedIndex();
      logSuccess(
        `Fear & Greed Index retrieved: ${fearGreed.value} (${fearGreed.label})`
      );
    } catch (error) {
      logWarning(`Fear & Greed test failed (expected): ${error instanceof Error ? error.message : error}`);
    }

    // Test cache invalidation
    logInfo("Testing cache invalidation...");
    await marketDataService.invalidateCache("AAPL");
    logSuccess("Cache invalidation completed");
  } catch (error) {
    logError(`Market data service test failed: ${error}`);
  }
}

// Test 5: Integration Test - Cache + Rate Limiting
async function testIntegration() {
  log("\n=== Testing Integration (Cache + Rate Limiting) ===", colors.blue);

  try {
    // Clear cache and rate limits
    cacheService.clear();
    rateLimiter.clearAll();

    logInfo("Making first request (should hit API)...");
    const start1 = Date.now();
    try {
      await marketDataService.getSymbolData("TSLA");
      const time1 = Date.now() - start1;
      logSuccess(`First request completed in ${time1}ms`);
    } catch (error) {
      logWarning(`First request failed (expected without API access)`);
    }

    logInfo("Making second request (should hit cache)...");
    const start2 = Date.now();
    try {
      await marketDataService.getSymbolData("TSLA");
      const time2 = Date.now() - start2;
      logSuccess(`Second request completed in ${time2}ms (cached)`);

      if (time2 < 10) {
        logSuccess("Cache is significantly faster than API call");
      }
    } catch (error) {
      logWarning(`Second request failed`);
    }

    // Show final stats
    const cacheStats = cacheService.getStats();
    const rateLimitStats = rateLimiter.getStats();

    logInfo(`\nFinal Stats:`);
    logInfo(`  Cache entries: ${cacheStats.size}`);
    logInfo(`  Rate limit endpoints tracked: ${Object.keys(rateLimitStats).length}`);
  } catch (error) {
    logError(`Integration test failed: ${error}`);
  }
}

// Run all tests
async function runAllTests() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Market Data Infrastructure Test Suite", colors.blue);
  log("=".repeat(60), colors.blue);

  await testCacheService();
  await testRateLimiter();
  await testRetryBackoff();
  await testMarketDataService();
  await testIntegration();

  log("\n" + "=".repeat(60), colors.blue);
  log("Test Suite Complete", colors.blue);
  log("=".repeat(60) + "\n", colors.blue);

  logInfo(
    "Note: API tests may fail without proper API access. This is expected."
  );
  logInfo("Core infrastructure (cache, rate limiting, retry) should pass.");
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error}`);
  process.exit(1);
});
