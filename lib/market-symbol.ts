/** US-style tickers: 1–12 chars, letters/digits, optional dots or hyphens. */
const MARKET_SYMBOL_PATTERN = /^[A-Z0-9][A-Z0-9.-]{0,11}$/;

/**
 * Next.js treats a dot in a dynamic `[symbol]` segment as a file extension, so
 * `SAP.DE` never reaches the route. This token keeps the suffix in the path.
 */
export const MARKET_SYMBOL_DOT_TOKEN = "__dot__";

const MARKET_SYMBOL_ROUTE =
  /^\/api\/market\/(?:symbol|historical|indicators|forecast|seasonal|financials|ai-prediction)\/([^/]+)(\/snapshot)?$/;

export function isValidMarketSymbol(symbol: string): boolean {
  return MARKET_SYMBOL_PATTERN.test(symbol);
}

/** Trim, uppercase, and reject empty or invalid symbols. */
export function normalizeMarketSymbol(
  input: string | null | undefined
): string | null {
  if (input == null) return null;
  const normalized = input.trim().toUpperCase();
  if (!normalized || !isValidMarketSymbol(normalized)) return null;
  return normalized;
}

/** Path segment safe for Next dynamic routes. Dots become {@link MARKET_SYMBOL_DOT_TOKEN}. */
export function marketSymbolPathSegment(symbol: string): string {
  const normalized = normalizeMarketSymbol(symbol) ?? symbol.trim();
  return encodeURIComponent(
    normalized.replaceAll(".", MARKET_SYMBOL_DOT_TOKEN)
  );
}

/** Undo {@link marketSymbolPathSegment} and any `%2E` encoding of a real dot. */
export function decodeMarketSymbolParam(raw: string): string {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }
  return value
    .replaceAll(MARKET_SYMBOL_DOT_TOKEN, ".")
    .replaceAll("%2E", ".")
    .replaceAll("%2e", ".");
}

export async function readMarketSymbolParam(
  params: Promise<{ symbol: string }>
): Promise<string | null> {
  const { symbol } = await params;
  if (!symbol) return null;
  return normalizeMarketSymbol(decodeMarketSymbolParam(symbol));
}

/**
 * Rewrite `/api/market/symbol/SAP.DE` to a path the dynamic route can match.
 * Returns null when the path is already safe.
 */
export function rewriteDottedMarketSymbolPath(pathname: string): string | null {
  const match = pathname.match(MARKET_SYMBOL_ROUTE);
  if (!match) return null;
  const symbol = match[1];
  const snapshot = match[2] ?? "";
  if (!symbol.includes(".") && !/%2e/i.test(symbol)) return null;
  const encoded = decodeMarketSymbolParam(symbol).replaceAll(
    ".",
    MARKET_SYMBOL_DOT_TOKEN
  );
  const head = pathname.slice(
    0,
    pathname.length - symbol.length - snapshot.length
  );
  return `${head}${encoded}${snapshot}`;
}
