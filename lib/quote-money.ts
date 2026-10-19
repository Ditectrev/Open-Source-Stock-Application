/**
 * Quote prices use the listing currency (EUR, JPY, GBP, …).
 * Yahoo quotes some markets in minor units (`GBp` is London pence).
 */

const MINOR_UNIT_SUFFIX: Record<string, string> = {
  GBp: "p",
  GBX: "p",
};

/** Market cap and financial statements are in the major currency, not pence. */
const MINOR_UNIT_MAJOR: Record<string, string> = {
  GBp: "GBP",
  GBX: "GBP",
  ZAc: "ZAR",
  ILA: "ILS",
};

export function quoteCurrency(currency?: string | null): string {
  const code = currency?.trim();
  return code || "USD";
}

/** Pence and other minor-unit quotes report financials in the major currency. */
export function quoteMajorCurrency(currency?: string | null): string {
  const code = quoteCurrency(currency);
  return MINOR_UNIT_MAJOR[code] ?? code;
}

export function formatQuotePrice(
  value: number,
  currency?: string | null
): string {
  const code = quoteCurrency(currency);
  const suffix = MINOR_UNIT_SUFFIX[code];
  if (suffix) {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}${suffix}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)} ${code}`;
  }
}

/** Signed change. Zero keeps a leading plus, matching the quote header. */
export function formatQuoteChange(
  value: number,
  currency?: string | null
): string {
  const formatted = formatQuotePrice(Math.abs(value), currency);
  if (value < 0) return `-${formatted}`;
  return `+${formatted}`;
}

export function formatQuoteCompact(
  value: number,
  currency?: string | null
): string {
  const code =
    MINOR_UNIT_MAJOR[quoteCurrency(currency)] ?? quoteCurrency(currency);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      notation: "compact",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return formatQuotePrice(value, currency);
  }
}
