import Link from "next/link";
import {
  displayNameForSymbol,
  symbolQuotePath,
  type NewsArticle,
} from "@/lib/news";
import {
  DNA_CAPTION,
  DNA_HEADING,
  DNA_INSTRUMENT_PANEL,
} from "@/lib/design-dna";

export function MentionedStocks({
  symbols,
  heading = "Mentioned stocks in this article",
  compact = false,
}: {
  symbols: NewsArticle["mentionedSymbols"];
  heading?: string;
  compact?: boolean;
}) {
  if (symbols.length === 0) return null;

  const list = (
    <ul
      className={compact ? "flex flex-wrap gap-2" : "mt-4 flex flex-wrap gap-2"}
    >
      {symbols.map((symbol) => {
        const name = displayNameForSymbol(symbol);
        const href = symbolQuotePath(symbol);
        return (
          <li key={symbol}>
            <Link
              href={href}
              className="inline-flex items-baseline gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              <span className="font-mono text-sm font-semibold text-stone-900 dark:text-stone-50">
                {symbol}
              </span>
              {!compact && name ? (
                <span className={DNA_CAPTION}>{name}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (compact) {
    return (
      <div aria-label={heading} data-testid="mentioned-stocks">
        {list}
      </div>
    );
  }

  return (
    <section
      className={DNA_INSTRUMENT_PANEL}
      aria-labelledby="mentioned-stocks-heading"
      data-testid="mentioned-stocks"
    >
      <h2 id="mentioned-stocks-heading" className={DNA_HEADING}>
        {heading}
      </h2>
      {list}
    </section>
  );
}
