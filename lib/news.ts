import { normalizeMarketSymbol } from "@/lib/market-symbol";

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  mentionedSymbols: string[];
};

export type NewsTextSegment =
  | { type: "text"; text: string }
  | { type: "link"; text: string; symbol: string };

/** Company names (and common spellings) → ticker, longest aliases first. */
export const COMPANY_TICKER_ALIASES: ReadonlyArray<readonly [string, string]> =
  [
    ["Bank of America", "BAC"],
    ["McDonald’s", "MCD"],
    ["McDonald's", "MCD"],
    ["Johnson & Johnson", "JNJ"],
    ["Procter & Gamble", "PG"],
    ["Goldman Sachs", "GS"],
    ["General Electric", "GE"],
    ["General Motors", "GM"],
    ["American Express", "AXP"],
    ["UnitedHealth", "UNH"],
    ["Caterpillar", "CAT"],
    ["Home Depot", "HD"],
    ["Lockheed Martin", "LMT"],
    ["Philip Morris", "PM"],
    ["Morgan Stanley", "MS"],
    ["Charles Schwab", "SCHW"],
    ["Berkshire Hathaway", "BRK.B"],
    ["McDonalds", "MCD"],
    ["McDonald", "MCD"],
    ["Starbucks", "SBUX"],
    ["Microsoft", "MSFT"],
    ["Alphabet", "GOOGL"],
    ["NVIDIA", "NVDA"],
    ["Nvidia", "NVDA"],
    ["Amazon", "AMZN"],
    ["Meta Platforms", "META"],
    ["Facebook", "META"],
    ["Netflix", "NFLX"],
    ["Tesla", "TSLA"],
    ["Costco", "COST"],
    ["Walmart", "WMT"],
    ["Chevron", "CVX"],
    ["ExxonMobil", "XOM"],
    ["Exxon", "XOM"],
    ["JPMorgan", "JPM"],
    ["J.P. Morgan", "JPM"],
    ["JP Morgan", "JPM"],
    ["Coca-Cola", "KO"],
    ["Coca Cola", "KO"],
    ["PepsiCo", "PEP"],
    ["Pepsi", "PEP"],
    ["Intel", "INTC"],
    ["AMD", "AMD"],
    ["Apple", "AAPL"],
    ["Boeing", "BA"],
    ["Nike", "NKE"],
    ["Disney", "DIS"],
    ["Adobe", "ADBE"],
    ["Oracle", "ORCL"],
    ["Salesforce", "CRM"],
    ["Cisco", "CSCO"],
    ["IBM", "IBM"],
    ["Visa", "V"],
    ["Mastercard", "MA"],
    ["PayPal", "PYPL"],
    ["Uber", "UBER"],
    ["Airbnb", "ABNB"],
    ["Palantir", "PLTR"],
    ["Broadcom", "AVGO"],
    ["Qualcomm", "QCOM"],
    ["Pfizer", "PFE"],
    ["Merck", "MRK"],
    ["AbbVie", "ABBV"],
    ["Eli Lilly", "LLY"],
    ["Moderna", "MRNA"],
    ["Verizon", "VZ"],
    ["AT&T", "T"],
    ["T-Mobile", "TMUS"],
    ["Comcast", "CMCSA"],
    ["Ford Motor", "F"],
  ];

const TICKER_DENYLIST = new Set([
  "CEO",
  "CFO",
  "CTO",
  "COO",
  "IPO",
  "ETF",
  "ETFS",
  "GDP",
  "CPI",
  "PCE",
  "SEC",
  "FDA",
  "FTC",
  "DOJ",
  "FED",
  "FOMC",
  "NYSE",
  "NASDAQ",
  "AMEX",
  "EPS",
  "PEG",
  "YOY",
  "QOQ",
  "USD",
  "EUR",
  "GBP",
  "AI",
  "EV",
  "USA",
  "US",
  "UK",
  "EU",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "FY",
  "YTD",
  "ATH",
  "ATM",
  "INC",
  "LTD",
  "PLC",
  "THE",
  "AND",
  "FOR",
  "NEWS",
]);

export function symbolQuotePath(symbol: string): string {
  return `/?symbol=${encodeURIComponent(symbol)}`;
}

export function newsArticlePath(slug: string): string {
  return `/news/${encodeURIComponent(slug)}`;
}

const NEWS_SLUG_MAX = 80;
const NEWS_SOURCE_SUFFIX =
  /\s+[-–—]\s+(reuters|cnbc|bloomberg|yahoo finance|associated press|marketwatch|barron'?s|financial times|wsj|ap|afp)\s*$/i;

export function slugifyNewsHeadline(title: string): string {
  const withoutSource = title.replace(NEWS_SOURCE_SUFFIX, "");
  const slug = withoutSource
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "story";
  if (slug.length <= NEWS_SLUG_MAX) return slug;
  const cut = slug.slice(0, NEWS_SLUG_MAX);
  const lastHyphen = cut.lastIndexOf("-");
  return (lastHyphen > 24 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/g, "");
}

export function uniquifyNewsSlug(
  base: string,
  used: Set<string>,
  uniqueKey: string
): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const suffix =
    uniqueKey
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(-8) || "story";
  const room = Math.max(12, NEWS_SLUG_MAX - suffix.length - 1);
  let candidate = `${base.slice(0, room)}-${suffix}`.replace(/^-+|-+$/g, "");
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base.slice(0, Math.max(12, NEWS_SLUG_MAX - String(n).length - 1))}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

export function withUniqueNewsSlugs(articles: NewsArticle[]): NewsArticle[] {
  const used = new Set<string>();
  return articles.map((article) => {
    const slug = uniquifyNewsSlug(
      slugifyNewsHeadline(article.title),
      used,
      article.id
    );
    return slug === article.slug ? article : { ...article, slug };
  });
}

export const NEWS_HUB_PAGE_SIZE = 10;

export function parseNewsPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function newsHubPath(symbol?: string | null, page = 1): string {
  const params = new URLSearchParams();
  if (symbol) params.set("symbol", symbol);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}

export function paginateNewsArticles<T>(
  items: T[],
  page: number,
  pageSize = NEWS_HUB_PAGE_SIZE
): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
} {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) {
    return { page: 1, pageSize, total: 0, totalPages: 1, items: [] };
  }
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}

/** Other live-feed stories, preferring shared mentioned tickers. */
export function pickRelatedNewsArticles(
  article: Pick<NewsArticle, "slug" | "mentionedSymbols">,
  feed: NewsArticle[],
  limit = 6
): NewsArticle[] {
  const symbols = new Set(article.mentionedSymbols);
  const others = feed.filter((item) => item.slug !== article.slug);
  const overlapping = others.filter((item) =>
    item.mentionedSymbols.some((symbol) => symbols.has(symbol))
  );
  const rest = others.filter(
    (item) => !item.mentionedSymbols.some((symbol) => symbols.has(symbol))
  );
  return [...overlapping, ...rest].slice(0, limit);
}

/** Original desk copy so article pages are not a one-line wire reprint. */
export function newsDeskCopy(article: NewsArticle, siteName: string): string[] {
  const paragraphs = [
    `${siteName} is not the publisher. Market-data APIs only send the headline and a short ${article.source} summary — not the full story. This page exists so DIY investors can jump from names in the wire to free charts, financials, and forecasts.`,
  ];
  if (article.mentionedSymbols.length > 0) {
    const named = article.mentionedSymbols
      .map((symbol) => {
        const name = displayNameForSymbol(symbol);
        return name ? `${name} (${symbol})` : symbol;
      })
      .join(", ");
    paragraphs.push(
      `Tickers named here: ${named}. Open a quote on ${siteName} for the latest price, technicals, and statements — then read the full ${article.source} piece at the publisher.`
    );
  } else {
    paragraphs.push(
      `No listed US ticker was detected in this headline. Search from the home page if you want a chart for a name in the ${article.source} story.`
    );
  }
  return paragraphs;
}

export function isRedundantNewsSummary(
  title: string,
  summary: string
): boolean {
  const normalize = (value: string) =>
    value
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[“”"']/g, "")
      .trim()
      .toLowerCase();
  const headline = normalize(title);
  const blurb = normalize(summary);
  if (!blurb) return true;
  if (blurb === headline) return true;
  const headlineWithoutSource = headline.replace(/\s+[-–—]\s+.+$/, "");
  return (
    blurb === headlineWithoutSource ||
    headline.startsWith(blurb) ||
    blurb.startsWith(headlineWithoutSource)
  );
}

export function newsSlugFromId(source: "yh" | "fh", id: string): string {
  const cleaned = id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${source}-${cleaned || "story"}`;
}

export function formatNewsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function acceptTicker(symbol: string | null): symbol is string {
  return Boolean(symbol) && !TICKER_DENYLIST.has(symbol as string);
}

/** Parse Finnhub `related` strings or Yahoo `relatedTickers` arrays. */
export function normalizeRelatedTickers(input: unknown): string[] {
  const raw: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") raw.push(item);
    }
  } else if (typeof input === "string" && input.trim()) {
    raw.push(...input.split(/[,;]/));
  }

  const out = new Set<string>();
  for (const item of raw) {
    const trimmed = item.trim();
    if (trimmed.startsWith("^")) continue;
    const cleaned = trimmed.replace(/^[^A-Za-z0-9]+/, "");
    const candidate = cleaned.split(":").pop() ?? "";
    const normalized = normalizeMarketSymbol(candidate);
    if (acceptTicker(normalized)) out.add(normalized);
  }
  return [...out];
}

function symbolsFromDollarOrParens(text: string): string[] {
  const found = new Set<string>();
  const pattern =
    /\$([A-Za-z][A-Za-z0-9.-]{0,11})\b|\(([A-Za-z][A-Za-z0-9.-]{0,11})\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const raw = match[1] ?? match[2] ?? "";
    const normalized = normalizeMarketSymbol(raw);
    if (acceptTicker(normalized)) found.add(normalized);
  }
  return [...found];
}

function symbolsFromCompanyAliases(text: string): string[] {
  const found = new Set<string>();
  for (const [alias, ticker] of COMPANY_TICKER_ALIASES) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^A-Za-z])${escaped}(?:$|[^A-Za-z])`, "i");
    if (re.test(text) && acceptTicker(ticker)) found.add(ticker);
  }
  return [...found];
}

export function extractMentionedSymbols(
  text: string,
  related: unknown = []
): string[] {
  const combined = new Set<string>([
    ...normalizeRelatedTickers(related),
    ...symbolsFromDollarOrParens(text),
    ...symbolsFromCompanyAliases(text),
  ]);
  return [...combined].sort();
}

export function displayNameForSymbol(symbol: string): string | null {
  const upper = symbol.toUpperCase();
  for (const [alias, ticker] of COMPANY_TICKER_ALIASES) {
    if (ticker === upper && alias.length > 3 && !alias.endsWith(" ")) {
      return alias;
    }
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type LinkTerm = { regex: RegExp; symbol: string; length: number };

function buildLinkTerms(symbols: string[]): LinkTerm[] {
  const symbolSet = new Set(
    symbols
      .map((item) => normalizeMarketSymbol(item))
      .filter((item): item is string => acceptTicker(item))
  );
  const terms: LinkTerm[] = [];

  for (const [alias, ticker] of COMPANY_TICKER_ALIASES) {
    if (!symbolSet.has(ticker)) continue;
    terms.push({
      regex: new RegExp(escapeRegExp(alias), "i"),
      symbol: ticker,
      length: alias.length,
    });
  }

  for (const symbol of symbolSet) {
    terms.push({
      regex: new RegExp(`\\$${escapeRegExp(symbol)}\\b`, "i"),
      symbol,
      length: symbol.length + 1,
    });
    terms.push({
      regex: new RegExp(`\\b${escapeRegExp(symbol)}\\b`),
      symbol,
      length: symbol.length,
    });
  }

  return terms.sort((a, b) => b.length - a.length);
}

/**
 * Split headline/summary text so mentioned company names and tickers can be
 * wrapped as quote links (`/?symbol=MCD`).
 */
export function newsLinkSegments(
  text: string,
  symbols: string[]
): NewsTextSegment[] {
  if (!text) return [];
  const terms = buildLinkTerms(symbols);
  if (terms.length === 0) return [{ type: "text", text }];

  const segments: NewsTextSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIndex = -1;
    let earliestLength = 0;
    let earliestSymbol = "";
    let earliestText = "";

    for (const term of terms) {
      const match = remaining.match(term.regex);
      if (!match || match.index == null) continue;
      const isEarlier =
        earliestIndex < 0 ||
        match.index < earliestIndex ||
        (match.index === earliestIndex && match[0].length > earliestLength);
      if (isEarlier) {
        earliestIndex = match.index;
        earliestLength = match[0].length;
        earliestSymbol = term.symbol;
        earliestText = match[0];
      }
    }

    if (earliestIndex < 0) {
      segments.push({ type: "text", text: remaining });
      break;
    }

    if (earliestIndex > 0) {
      segments.push({ type: "text", text: remaining.slice(0, earliestIndex) });
    }
    segments.push({
      type: "link",
      text: earliestText,
      symbol: earliestSymbol,
    });
    remaining = remaining.slice(earliestIndex + earliestLength);
  }

  return segments;
}

export function toIsoFromUnixSeconds(value: unknown): string {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return new Date(0).toISOString();
  }
  const millis = numeric > 1e12 ? numeric : numeric * 1000;
  return new Date(millis).toISOString();
}

export function buildNewsArticle(input: {
  sourcePrefix: "yh" | "fh";
  id: string;
  title: string;
  summary?: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  related?: unknown;
}): NewsArticle | null {
  const title = input.title.trim();
  const sourceUrl = input.sourceUrl.trim();
  if (!title || !sourceUrl.startsWith("http") || !input.id.trim()) {
    return null;
  }
  const summary = (input.summary ?? "").trim();
  return {
    id: input.id.trim(),
    slug: slugifyNewsHeadline(title),
    title,
    summary,
    source: input.source.trim() || "Market news",
    sourceUrl,
    publishedAt: input.publishedAt,
    mentionedSymbols: extractMentionedSymbols(
      `${title}\n${summary}`,
      input.related
    ),
  };
}
