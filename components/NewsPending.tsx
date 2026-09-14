"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function pendingMessageForHref(href: string | null): string | null {
  if (!href || href.startsWith("http") || href.startsWith("mailto:")) {
    return null;
  }
  if (href.startsWith("/news/rss")) return null;
  if (href.startsWith("/news/")) return "Loading story...";
  if (href.startsWith("/news")) return "Loading headlines...";
  return null;
}

function isModifiedClick(event: MouseEvent<HTMLDivElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function NewsPendingScope({
  resetKey,
  children,
}: {
  resetKey: string;
  children: ReactNode;
}) {
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  useEffect(() => {
    setPendingMessage(null);
  }, [resetKey]);

  return (
    <div
      aria-busy={pendingMessage != null}
      onClickCapture={(event) => {
        if (isModifiedClick(event)) return;
        const target = event.target;
        const element =
          target instanceof Element
            ? target
            : target instanceof Node
              ? target.parentElement
              : null;
        const href = element?.closest("a")?.getAttribute("href") ?? null;
        const message = pendingMessageForHref(href);
        if (message) setPendingMessage(message);
      }}
    >
      {children}
      {pendingMessage ? (
        <div
          className="fixed inset-0 z-[10040] flex items-center justify-center bg-stone-50/80 dark:bg-stone-950/80"
          data-testid="news-loading-overlay"
        >
          <LoadingSpinner size="md" message={pendingMessage} showMessage />
        </div>
      ) : null}
    </div>
  );
}
