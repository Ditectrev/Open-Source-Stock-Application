# Testing Guide - Market Data Infrastructure

This guide explains how to test the market data infrastructure that was implemented in Task 5.

## What Was Implemented

### Core Infrastructure
- **Caching Layer** (`lib/cache.ts`) - In-memory cache with TTL-based expiration
- **Rate Limiter** (`lib/rate-limiter.ts`) - Tracks API usage and enforces limits
- **Retry Logic** (`lib/retry.ts`) - Exponential backoff with jitter (1s, 2s, 4s, 8s)

### API Integrations
- **CNN Dataviz API** (`services/cnn-api.service.ts`) - Fear & Greed Index, World Markets, Economic Calendar
- **Yahoo Finance API** (`services/yahoo-finance.service.ts`) - Symbol quotes, Historical data, Financials

### Market Data Service
- **MarketDataService** (`services/market-data.service.ts`) - Orchestrates all data fetching with caching and rate limiting

### API Routes (9 endpoints)
1. `GET /api/market/symbol/[symbol]` - Current symbol data
2. `GET /api/market/historical/[symbol]?range=1Y` - Historical prices
3. `GET /api/market/indicators/[symbol]` - Technical indicators
4. `GET /api/market/forecast/[symbol]` - Analyst forecasts
5. `GET /api/market/seasonal/[symbol]` - Seasonal patterns
6. `GET /api/market/financials/[symbol]` - Financial statements
7. `GET /api/market/fear-greed` - Fear & Greed Index
8. `GET /api/market/world-markets` - Global market indices
9. `GET /api/market/sectors` - Sector performance

## Testing Methods

### Method 1: Quick Verification Test (Recommended First)

This test verifies that all files exist and TypeScript compiles without errors:

```bash
node scripts/quick-test.mjs
```

**Expected Output:**
- ✓ All infrastructure files created
- ✓ TypeScript types are valid
- ✓ No compilation errors

### Method 2: Infrastructure Unit Tests

Test the core infrastructure components (cache, rate limiter, retry logic):

```bash
# If you have bun installed:
bun run test:market-data

# Or with tsx:
npx tsx scripts/test-market-data.ts
```

**What This Tests:**
- Cache set/get operations
- Cache expiration
- Cache invalidation
- Rate limit checking
- Rate limit recording
- Retry with exponential backoff
- Max retry limits
- Integration between cache and rate limiting

**Expected Results:**
- ✓ Cache operations should pass
- ✓ Rate limiting should pass
- ✓ Retry logic should pass
- ⚠ API calls may fail (expected without external API access)

### Method 3: API Endpoint Tests (Requires Dev Server)

Test the actual API endpoints:

**Step 1: Start the development server**
```bash
# If you have bun:
bun run dev

# Or with npm:
npm run dev
```

**Step 2: Run the API tests**

In a new terminal:
```bash
./scripts/test-api-endpoints.sh
```

Or test individual endpoints manually:
```bash
# Test symbol data
curl http://localhost:3000/api/market/symbol/AAPL | jq

# Test historical data
curl "http://localhost:3000/api/market/historical/AAPL?range=1M" | jq

# Test technical indicators
curl http://localhost:3000/api/market/indicators/AAPL | jq

# Test Fear & Greed Index
curl http://localhost:3000/api/market/fear-greed | jq
```

### Method 4: Browser Testing

1. Start the dev server: `npm run dev` or `bun run dev`
2. Open your browser and navigate to:
   - http://localhost:3000/api/market/symbol/AAPL
   - http://localhost:3000/api/market/historical/AAPL?range=1M
   - http://localhost:3000/api/market/fear-greed

## Expected Behavior

### Successful Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Common Issues and Solutions

### Issue: External API calls fail

**Symptoms:**
- API endpoints return errors
- "Failed to fetch" messages in logs

**Cause:**
- Yahoo Finance and CNN APIs may not be accessible without proper configuration
- CORS issues in development
- Rate limiting from external APIs

**Solution:**
- This is expected in local development
- The infrastructure (cache, rate limiting, retry) still works correctly
- For production, you'll need:
  - Valid API keys (if required)
  - Proper CORS configuration
  - Consider using API proxies or alternatives

### Issue: TypeScript compilation errors

**Symptoms:**
- `npx tsc --noEmit` shows errors
- Build fails

**Solution:**
```bash
# Check for errors
npx tsc --noEmit

# If errors exist, they should be in the error output
# Most common: missing type definitions
npm install --save-dev @types/node
```

### Issue: Cache not working

**Symptoms:**
- Every request hits the external API
- No performance improvement on repeated requests

**Solution:**
- Check cache TTL configuration in `.env.local`
- Verify `CACHE_TTL_SECONDS` is set (default: 300)
- Check logs for cache hit/miss messages

### Issue: Rate limiting too aggressive

**Symptoms:**
- Requests blocked too quickly
- "Rate limit exceeded" errors

**Solution:**
- Adjust rate limit settings in `.env.local`:
  ```
  RATE_LIMIT_MAX_REQUESTS=100
  RATE_LIMIT_WINDOW_SECONDS=60
  ```

## Performance Expectations

### Cache Performance
- **First request**: ~500-2000ms (external API call)
- **Cached request**: <10ms (in-memory cache)
- **Cache hit rate**: Should be >80% for repeated requests

### Rate Limiting
- **Default limit**: 100 requests per 60 seconds per endpoint
- **Warning threshold**: 80% of limit (80 requests)
- **Behavior when limited**: Serves stale cache if available

### Retry Logic
- **Max attempts**: 3
- **Delays**: 1s, 2s, 4s (with jitter)
- **Total max time**: ~8 seconds for all retries

## Monitoring and Debugging

### Enable Debug Logging

Set in `.env.local`:
```
LOG_LEVEL=debug
```

### Check Cache Stats

The cache service provides stats:
```typescript
import { cacheService } from '@/lib/cache';
const stats = cacheService.getStats();
console.log(stats); // { size: 10, keys: [...] }
```

### Check Rate Limit Stats

The rate limiter provides stats:
```typescript
import { rateLimiter } from '@/lib/rate-limiter';
const stats = rateLimiter.getStats();
console.log(stats); // { endpoint: { count, remaining, resetIn } }
```

## Next Steps

After verifying the infrastructure works:

1. **Implement Frontend Components** (Task 6)
   - Chart components to visualize the data
   - Symbol search interface
   - Data display components

2. **Add Property-Based Tests** (Optional tasks 5.2, 5.4, 5.6, 5.8, 5.9)
   - Install fast-check: `npm install --save-dev fast-check`
   - Implement property tests for caching, rate limiting, etc.

3. **Production Considerations**
   - Replace in-memory cache with Vercel KV or Redis
   - Add proper API authentication
   - Implement monitoring and alerting
   - Set up error tracking (Sentry, etc.)

## Questions?

If you encounter issues not covered here:
1. Check the logs in the terminal
2. Verify environment variables in `.env.local`
3. Ensure all dependencies are installed: `npm install`
4. Check TypeScript compilation: `npx tsc --noEmit`
