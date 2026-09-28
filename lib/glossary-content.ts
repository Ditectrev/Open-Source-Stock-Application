/**
 * Stock, ETF, crypto, and market terms for the public glossary page.
 */

export type GlossaryTerm = {
  term: string;
  definition: string;
};

export type GlossaryCategory = {
  id: string;
  label: string;
  description: string;
  terms: readonly GlossaryTerm[];
};

export const GLOSSARY_CATEGORIES: readonly GlossaryCategory[] = [
  {
    id: "stocks",
    label: "Stocks & equities",
    description:
      "Core language for owning shares in public companies and reading quotes in The Open Stock.",
    terms: [
      {
        term: "Ticker symbol",
        definition:
          "A short code that identifies a listed company or security on an exchange (for example AAPL or MSFT). In The Open Stock you search by ticker to open charts, financials, forecasts, and seasonals for that symbol.",
      },
      {
        term: "Share (equity)",
        definition:
          "One unit of ownership in a corporation. When you buy a share, you own a slice of the business and may receive dividends or benefit if the share price rises—along with the risk of losses if it falls.",
      },
      {
        term: "Market capitalization",
        definition:
          "The total market value of a company's outstanding shares, usually calculated as share price × shares outstanding. It is a quick size label (large cap vs small cap), not a verdict on whether the stock is cheap or expensive.",
      },
      {
        term: "Dividend",
        definition:
          "Cash (or occasionally stock) that a company pays to shareholders, often on a quarterly schedule. Dividend yield compares the annual dividend to the current share price; use the dividend calendar in the app to track ex-dates and payments.",
      },
      {
        term: "Earnings per share (EPS)",
        definition:
          "Net profit divided by the number of shares outstanding. Rising EPS can support a higher share price, but quality matters—one-time charges, buybacks, and accounting choices all affect the number you see on an earnings calendar row.",
      },
      {
        term: "Price-to-earnings (P/E) ratio",
        definition:
          "Share price divided by EPS (trailing or forward). It expresses how many dollars investors pay per dollar of earnings. Compare P/E within the same sector and growth profile; a low P/E is not automatically a bargain.",
      },
      {
        term: "IPO (initial public offering)",
        definition:
          "The first sale of shares to the public, moving a company from private to listed. IPO calendars list upcoming deals; early trading can be volatile because there is limited price history and often heavy media attention.",
      },
      {
        term: "Bull market",
        definition:
          "A sustained period in which broad prices trend higher and optimism is common. Bull markets can last years; they still include sharp pullbacks, so long-term investors focus on allocation and fundamentals rather than trying to call every swing.",
      },
      {
        term: "Bear market",
        definition:
          "A sustained decline in broad market prices, often defined as a 20% drop from a recent peak. Bear markets test patience; diversification, cash reserves, and avoiding leveraged bets matter more than predicting the exact bottom.",
      },
      {
        term: "Sector",
        definition:
          "A group of companies in the same part of the economy (Technology, Healthcare, Energy, and so on). Sector hubs and heatmaps in The Open Stock help you see whether leadership is rotating between industries.",
      },
    ],
  },
  {
    id: "etfs",
    label: "ETFs & funds",
    description:
      "Basket products that trade like stocks but hold many underlying names.",
    terms: [
      {
        term: "ETF (exchange-traded fund)",
        definition:
          "A fund that holds a basket of assets (stocks, bonds, commodities, etc.) and trades on an exchange like a single ticker. ETFs offer diversified exposure with intraday liquidity; ETF heatmaps in the app color-code performance across popular funds.",
      },
      {
        term: "Index fund",
        definition:
          "A fund built to track a market index (such as the S&P 500) rather than beat it through stock picking. Many index funds are ETFs or mutual funds with low turnover and transparent holdings.",
      },
      {
        term: "Expense ratio",
        definition:
          "The annual fee charged by a fund, expressed as a percentage of assets. A 0.10% expense ratio means about $1 per year per $1,000 invested. Over decades, small fee differences compound into large dollar gaps.",
      },
      {
        term: "NAV (net asset value)",
        definition:
          "The per-share value of a fund's assets minus liabilities. For ETFs, market price can trade slightly above or below NAV during the day; authorized participants usually keep that gap narrow.",
      },
      {
        term: "Holdings",
        definition:
          "The individual securities inside a fund. Checking top holdings tells you what you actually own—two “technology” labels can have very different weight in mega-cap names vs smaller innovators.",
      },
      {
        term: "Liquidity",
        definition:
          "How easily an asset can be bought or sold without moving the price much. Large ETFs and major stocks tend to be liquid; thinly traded small caps and some crypto pairs can gap when volume is low.",
      },
    ],
  },
  {
    id: "crypto",
    label: "Cryptocurrency",
    description: "Digital assets and the vocabulary around blockchain markets.",
    terms: [
      {
        term: "Cryptocurrency",
        definition:
          "A digital asset secured by cryptography and typically recorded on a distributed ledger. Prices are highly volatile, regulation varies by country, and you should treat crypto as a separate risk bucket from long-term stock holdings.",
      },
      {
        term: "Blockchain",
        definition:
          "A shared ledger that records transactions in linked blocks. Public blockchains power assets like Bitcoin and Ethereum; not every crypto project needs its own chain, but the term describes the underlying record-keeping idea.",
      },
      {
        term: "Stablecoin",
        definition:
          "A crypto token designed to hold a steady value, often pegged to the U.S. dollar. Stablecoins are used for trading and transfers; pegs can break in stress events, so understand issuer reserves and redemption rules.",
      },
      {
        term: "Wallet (crypto)",
        definition:
          "Software or hardware that stores keys used to sign blockchain transactions. “Not your keys, not your coins” is a reminder that exchange balances are not the same as self-custody—The Open Stock shows market data, not wallet services.",
      },
      {
        term: "24/7 market",
        definition:
          "Unlike most stock exchanges, many crypto venues trade around the clock. That means gaps can appear when you compare crypto heatmaps to U.S. equity session charts.",
      },
      {
        term: "Market cap (crypto)",
        definition:
          "Price per coin × circulating supply. It ranks projects by size but does not measure security, adoption, or fair value; thin float and concentrated ownership can distort rankings.",
      },
    ],
  },
  {
    id: "analysis",
    label: "Charts, screeners & sentiment",
    description: "Terms tied to tools and indicators inside The Open Stock.",
    terms: [
      {
        term: "Screener",
        definition:
          "A filter that narrows thousands of symbols by rules you set (valuation, growth, technical signals, etc.). Presets save common setups; results are a starting list for research, not a buy list.",
      },
      {
        term: "Heatmap",
        definition:
          "A color grid where cell shade shows performance or another metric at a glance. Stock, ETF, and crypto heatmaps help you spot leaders and laggards without opening every chart individually.",
      },
      {
        term: "RSI (Relative Strength Index)",
        definition:
          "A momentum oscillator (typically 0–100) that compares recent gains to recent losses. Readings above 70 often signal overbought conditions and below 30 oversold—but trends can stay stretched in strong bull runs.",
      },
      {
        term: "MACD",
        definition:
          "Moving Average Convergence Divergence—a trend-following indicator built from two moving averages. Crossovers and histogram shifts are used to spot momentum changes; pair with price action rather than trading signals alone.",
      },
      {
        term: "Moving average",
        definition:
          "An average price over a window (50-day, 200-day, etc.) that smooths noise. The 200-day average is a common long-term trend filter; breaks above or below can matter more when volume confirms the move.",
      },
      {
        term: "Fear & Greed Index",
        definition:
          "CNN’s composite sentiment gauge from 0 (extreme fear) to 100 (extreme greed), mixing volatility, momentum, and survey data. It describes mood, not a timing tool—extreme readings can persist in real trends.",
      },
      {
        term: "Analyst price target",
        definition:
          "An estimate from a sell-side or independent analyst for where a stock could trade, often based on models and sector comps. Targets are opinions with wide error bands; consensus averages appear on forecast tabs.",
      },
      {
        term: "Seasonal pattern",
        definition:
          "Historical average performance by calendar month across many years. Seasonality shows tendencies, not guarantees—macro shocks and one-off years can overwhelm the average.",
      },
      {
        term: "Economic calendar",
        definition:
          "A schedule of macro releases (jobs, inflation, central bank decisions) that can move rates and risk appetite. Filter by country and importance to see what might affect your watchlist before the open.",
      },
      {
        term: "Earnings calendar",
        definition:
          "Upcoming quarterly reports with EPS estimates and, after release, actual results. Earnings are a catalyst for gaps and guidance changes; read them in context with the rest of the financials tab.",
      },
    ],
  },
] as const;

export function glossaryTermSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function glossaryCategories(): readonly GlossaryCategory[] {
  return GLOSSARY_CATEGORIES;
}
