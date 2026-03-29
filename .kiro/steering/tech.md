# Tech Stack & Build

## Core Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 15 (App Router)             |
| Language      | TypeScript (strict mode)            |
| Runtime       | Bun (primary), Node.js 18+ (compat) |
| Styling       | Tailwind CSS 3, dark mode via class |
| Charts        | lightweight-charts v5               |
| Data Fetching | SWR for client, fetch for server    |
| Auth/DB       | Appwrite (node-appwrite)            |
| Deployment    | Vercel                              |

## Testing

| Type             | Tool                             |
| ---------------- | -------------------------------- |
| Unit/Integration | Vitest + Testing Library (jsdom) |
| Property-Based   | fast-check                       |
| E2E              | Playwright                       |

## Common Commands

```bash
bun dev                # Start dev server
bun run build          # Production build
bun run lint           # ESLint
bun run format         # Prettier format all files
bun run test           # Unit tests (Vitest, watch mode)
bun run test:coverage  # Unit tests with coverage
bun run test:e2e       # E2E tests (Playwright)
```

## Code Style

- Prettier: double quotes, semicolons, trailing commas (es5), 2-space indent, 80 char width
- ESLint: next/core-web-vitals + next/typescript, `@typescript-eslint/no-explicit-any` set to warn
- Path alias: `@/*` maps to project root (e.g., `@/lib/cache`, `@/components/SearchBar`)

## Key Libraries

- `swr` — client-side data fetching with caching
- `lightweight-charts` — TradingView charting library
- `node-appwrite` — Appwrite SDK for auth/database
- `fast-check` — property-based testing
- `react-github-btn` — GitHub star button
