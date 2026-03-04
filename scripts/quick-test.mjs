/**
 * Quick test to verify the market data infrastructure
 * Run with: node scripts/quick-test.mjs
 */

console.log('\n=== Quick Market Data Infrastructure Test ===\n');

// Test 1: Check if files exist
import { existsSync } from 'fs';

const files = [
  'lib/cache.ts',
  'lib/rate-limiter.ts',
  'lib/retry.ts',
  'services/market-data.service.ts',
  'services/cnn-api.service.ts',
  'services/yahoo-finance.service.ts',
  'app/api/market/symbol/[symbol]/route.ts',
  'app/api/market/historical/[symbol]/route.ts',
  'app/api/market/indicators/[symbol]/route.ts',
  'app/api/market/forecast/[symbol]/route.ts',
  'app/api/market/seasonal/[symbol]/route.ts',
  'app/api/market/financials/[symbol]/route.ts',
  'app/api/market/fear-greed/route.ts',
  'app/api/market/world-markets/route.ts',
  'app/api/market/sectors/route.ts',
];

console.log('✓ Checking if all required files exist...\n');

let allExist = true;
files.forEach(file => {
  const exists = existsSync(file);
  const status = exists ? '✓' : '✗';
  const color = exists ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${file}`);
  if (!exists) allExist = false;
});

if (allExist) {
  console.log('\n\x1b[32m✓ All files created successfully!\x1b[0m');
} else {
  console.log('\n\x1b[31m✗ Some files are missing\x1b[0m');
  process.exit(1);
}

// Test 2: Check TypeScript compilation
console.log('\n✓ Checking TypeScript compilation...\n');
import { execSync } from 'child_process';

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('\x1b[32m✓ TypeScript compilation successful!\x1b[0m');
} catch (error) {
  console.log('\x1b[31m✗ TypeScript compilation failed\x1b[0m');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Test 3: Summary
console.log('\n=== Test Summary ===\n');
console.log('\x1b[32m✓ All infrastructure files created\x1b[0m');
console.log('\x1b[32m✓ TypeScript types are valid\x1b[0m');
console.log('\x1b[32m✓ No compilation errors\x1b[0m');

console.log('\n\x1b[36mNext steps:\x1b[0m');
console.log('1. Start the dev server: npm run dev (or bun run dev)');
console.log('2. Test API endpoints: ./scripts/test-api-endpoints.sh');
console.log('3. Or test manually: curl http://localhost:3000/api/market/symbol/AAPL\n');

console.log('\x1b[33mNote: API tests will fail without proper external API access.\x1b[0m');
console.log('\x1b[33mThis is expected in a local development environment.\x1b[0m\n');
