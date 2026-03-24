# Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (metadata, Providers wrapper)
│   ├── page.tsx            # Home page (single-page app, client component)
│   ├── providers.tsx       # Client providers (ThemeProvider)
│   ├── globals.css         # Global styles / Tailwind directives
│   └── api/                # API route handlers
│       ├── market/         # Market data endpoints
│       │   ├── symbol/[symbol]/    # GET quote for a symbol
│       │   ├── historical/[symbol]/ # GET historical prices
│       │   ├── indicators/[symbol]/ # GET technical indicators
│       │   ├── forecast/[symbol]/   # GET analyst forecasts
│       │   ├── seasonal/[symbol]/   # GET seasonal patterns
│       │   ├── financials/[symbol]/ # GET financial statements
│       │   ├── search/              # GET symbol search
│       │   ├── fear-greed/          # GET Fear & Greed index
│       │   ├── world-markets/       # GET global indices
│       │   └── sectors/             # GET sector performance
│       └── calendar/
│           ├── economic/   # GET economic events
│           └── earnings/   # GET earnings calendar
├── components/             # React components
│   ├── index.ts            # Barrel file — central export point
│   ├── *.tsx               # Component files (PascalCase)
│   └── __tests__/          # Component unit tests
├── services/               # API service layer (singleton classes)
│   ├── market-data.service.ts      # Orchestrator: caching + rate limiting + delegation
│   ├── yahoo-finance.service.ts    # Yahoo Finance API client
│   ├── cnn-api.service.ts          # CNN Dataviz API client
│   └── trading-economics.service.ts # Trading Economics fallback
├── lib/                    # Shared utilities
│   ├── cache.ts            # In-memory TTL cache (singleton)
│   ├── rate-limiter.ts     # Per-endpoint rate limiter (singleton)
│   ├── retry.ts            # Exponential backoff retry utility
│   ├── logger.ts           # Structured JSON logger (singleton)
│   ├── env.ts              # Centralized config / env vars
│   ├── technical-indicators.ts # Indicator calculation functions
│   ├── seasonal-utils.ts   # Seasonal pattern helpers
│   └── theme-context.tsx   # Theme context provider
├── types/                  # Shared TypeScript interfaces
│   └── index.ts            # All type definitions
├── e2e/                    # Playwright E2E tests
├── middleware.ts            # Request/response logging middleware
└── scripts/                # Dev/test utility scripts
```

## Conventions

- API routes: `app/api/{domain}/{resource}/route.ts`, dynamic segments use `[param]` folders
- Services: class-based singletons exported as `const fooService = new FooService()`
- Lib utilities: singleton instances or pure functions, exported from individual files
- Components: PascalCase filenames, co-located tests in `__tests__/` directory
- Types: centralized in `types/index.ts`, imported via `@/types`
- All imports use the `@/` path alias
