# Stock Exchange Application

A comprehensive web platform for individual long-term investors built with Next.js 14+, deployed on Vercel, integrating with Appwrite for authentication and database, and connecting to CNN dataviz and Yahoo Finance APIs for market data.

## Features

- Multi-provider authentication (Apple SSO, Google SSO, Email OTP)
- Real-time market data visualization with technical indicators
- Multiple analysis views: Overview, Financials, Technicals, Forecasts, Seasonals
- 15-minute trial with device fingerprinting and IP tracking
- Five pricing tiers: Free (with ads), Ads-free, Local (Ollama), BYOK, Hosted AI
- Advanced features: Sectors Hub, Economic/Earnings/Dividend/IPO Calendars, Heatmaps, Asset Screener

## Technology Stack

- **Frontend Framework**: Next.js 14+ with App Router
- **Runtime**: Bun (or Node.js)
- **Deployment Platform**: Vercel
- **Authentication**: Appwrite
- **Database**: Appwrite Database
- **Data Sources**: CNN dataviz API, Yahoo Finance API
- **Styling**: Tailwind CSS
- **State Management**: React Context API + SWR

## Getting Started

### Prerequisites

- Bun 1.0+ (or Node.js 18+)
- Appwrite account and project
- API access to CNN dataviz and Yahoo Finance

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite API endpoint | `https://cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your Appwrite project ID | `your_project_id` |
| `APPWRITE_API_KEY` | Appwrite API key for server-side operations | `your_api_key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CNN_DATAVIZ_API_URL` | CNN dataviz API base URL | `https://production.dataviz.cnn.io` |
| `YAHOO_FINANCE_API_URL` | Yahoo Finance API base URL | `https://query1.finance.yahoo.com` |
| `CACHE_TTL_SECONDS` | Cache time-to-live in seconds | `300` |
| `RATE_LIMIT_MAX_REQUESTS` | Max API requests per window | `100` |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate limit window in seconds | `60` |
| `TRIAL_DURATION_MINUTES` | Trial session duration | `15` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |

See `.env.example` for a complete list of configuration options.

## Project Structure

```
.
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility functions and configurations
├── services/               # API services and business logic
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Scripts

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## License

Private - All rights reserved
