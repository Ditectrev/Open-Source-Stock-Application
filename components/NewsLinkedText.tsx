import Link from "next/link";
import { newsLinkSegments, symbolQuotePath } from "@/lib/news";

export function NewsLinkedText({
  text,
  symbols,
  className,
}: {
  text: string;
  symbols: string[];
  className?: string;
}) {
  const segments = newsLinkSegments(text, symbols);
  if (segments.length === 0) return null;

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <Link
            key={`${segment.symbol}-${index}`}
            href={symbolQuotePath(segment.symbol)}
            className="font-medium underline decoration-stone-400 underline-offset-2 hover:decoration-stone-700 dark:decoration-stone-500 dark:hover:decoration-stone-200"
          >
            {segment.text}
          </Link>
        ) : (
          <span key={`text-${index}`}>{segment.text}</span>
        )
      )}
    </span>
  );
}
