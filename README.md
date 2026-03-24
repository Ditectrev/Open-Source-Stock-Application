# Open Source Stock Application

A free, open source stock market application for individual long-term investors. Track stocks, analyze technical indicators, view financial statements, forecasts, seasonal patterns, and economic calendars — all in one place.

Built with Next.js, TypeScript, and Tailwind CSS. Self-hostable on Vercel.

## Why This Stock App?

Most stock market tools are either expensive, cluttered with ads, or locked behind paywalls. This open source stock application gives you:

- Real-time stock quotes and market data
- Interactive charts with technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- Financial statements: income, balance sheet, cash flow
- Analyst forecasts and price targets
- Seasonal performance heatmaps
- Economic calendar with country flags and day-grouped events
- Sector performance overview
- World markets at a glance
- Fear & Greed index
- Dark mode support
- Mobile-friendly responsive design

No paywall for core features. No tracking. Just a clean stock analysis tool you can run yourself.

## Screenshots

<!-- Add screenshots here -->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Runtime | Bun (or Node.js 18+) |
| Styling | Tailwind CSS |
| Auth | Appwrite |
| Database | Appwrite |
| Market Data | Yahoo Finance, FairEconomy |
| Deployment | Vercel |
| Testing | Vitest, Playwright |

## Getting Started

### Prerequisites

- Bun 1.0+ (or Node.js 18+)
- Appwrite account and project (for auth)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/stock-exchange-app.git
cd stock-exchange-app

# Install dependencies
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project ID |
| `APPWRITE_API_KEY` | Appwrite server-side API key |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `YAHOO_FINANCE_API_URL` | Yahoo Finance API base URL | `https://query1.finance.yahoo.com` |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds | `300` |
| `RATE_LIMIT_MAX_REQUESTS` | Max API requests per window | `100` |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate limit window in seconds | `60` |
| `LOG_LEVEL` | Logging level | `info` |

See `.env.example` for the full list.

## Project Structure

```
├── app/            # Next.js App Router pages and API routes
├── components/     # React components
├── lib/            # Utilities, caching, rate limiting
├── services/       # API service layer
├── types/          # TypeScript types
├── e2e/            # Playwright end-to-end tests
└── public/         # Static assets
```

## Features in Detail

### Stock Analysis
Search any stock symbol and get a multi-tab view: Overview, Financials, Technical Indicators, Forecasts, and Seasonal patterns.

### Economic Calendar
Live economic events grouped by day with country flags, importance filters, and date range selection. Data sourced from FairEconomy (ForexFactory feed).

### Technical Indicators
SMA, EMA, RSI, MACD, and Bollinger Bands overlaid on interactive price charts.

### Sector Performance
Track all major market sectors with performance metrics and visual indicators.

### World Markets
Global market indices overview showing real-time performance across regions.

## Scripts

```bash
bun dev              # Development server
bun run build        # Production build
bun start            # Production server
bun run lint         # ESLint
bun run format       # Prettier
bun run test         # Unit tests (Vitest)
bun run test:e2e     # E2E tests (Playwright)
```

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## Keywords

open source stock app, free stock market application, stock analysis tool, stock portfolio tracker, technical indicators, economic calendar, Next.js stock app, self-hosted stock platform, stock market dashboard, financial analysis tool

## License

Private - All rights reserved
