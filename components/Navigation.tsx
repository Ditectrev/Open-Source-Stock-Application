"use client";

import {
  DNA_LABEL,
  DNA_NAV_BAR,
  DNA_NAV_BRAND_TAGLINE,
  DNA_NAV_DIVIDER,
  DNA_NAV_LINK_ACTIVE,
  DNA_NAV_LINK_IDLE,
  DNA_NAV_LOGO_RULE,
  DNA_NAV_MOBILE,
  DNA_NAV_WORDMARK,
  DNA_NAV_WORDMARK_MOBILE,
} from "@/lib/design-dna";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { MAIN_NAV, pathnameToNavId } from "@/lib/nav-routes";
import {
  SITE_NAME,
  SITE_NAV_MOBILE_LABEL,
  SITE_SHORT_NAME,
} from "@/lib/site-seo";
import { HOME_SEGMENTED_NAV } from "@/lib/home-ui";

export interface NavigationProps {
  /** Override active section (e.g. tests); default: derived from URL */
  activeSection?: string;
}

export function Navigation({
  activeSection: activeSectionProp,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsPendingMessage, setNewsPendingMessage] = useState<string | null>(
    null
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeSection = activeSectionProp ?? pathnameToNavId(pathname ?? "/");
  const selectedSymbol = searchParams.get("symbol")?.trim() ?? "";
  const showDesktopSearch =
    (pathname ?? "/") !== "/" || Boolean(selectedSymbol);

  useEffect(() => {
    setNewsPendingMessage(null);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!newsPendingMessage) return;
    const timeout = setTimeout(() => setNewsPendingMessage(null), 2000);
    return () => clearTimeout(timeout);
  }, [newsPendingMessage]);

  useEffect(() => {
    if (!(pathname ?? "").startsWith("/news")) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      const element =
        target instanceof Element
          ? target
          : target instanceof Node
            ? target.parentElement
            : null;
      const href = element?.closest("a")?.getAttribute("href") ?? null;
      const message = pendingMessageForNewsHref(href);
      if (message) setNewsPendingMessage(message);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  const handleSymbolSelect = (symbol: string) => {
    router.push(`/?symbol=${encodeURIComponent(symbol)}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`overflow-visible backdrop-blur ${DNA_NAV_BAR}`}
        data-nav-archetype="terminal"
        aria-label="Main navigation"
        data-testid="navigation"
        data-active-section={activeSection}
        data-news-listen={
          (pathname ?? "").startsWith("/news") ? "true" : undefined
        }
      >
        <div className="mx-auto max-w-7xl px-4 xl:max-w-[1400px] sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4 overflow-visible">
            <Link
              href="/"
              className="flex shrink-0 items-center text-stone-900 dark:text-stone-100"
              aria-label={`${SITE_NAME} home`}
            >
              <span className={`leading-tight ${DNA_NAV_LOGO_RULE}`}>
                <span className={`hidden sm:inline ${DNA_NAV_WORDMARK}`}>
                  {SITE_SHORT_NAME}
                </span>
                <span className={`sm:hidden ${DNA_NAV_WORDMARK_MOBILE}`}>
                  {SITE_NAV_MOBILE_LABEL}
                </span>
                <span className={`hidden sm:block ${DNA_NAV_BRAND_TAGLINE}`}>
                  Markets · AI
                </span>
              </span>
            </Link>

            <div
              className={`hidden items-center gap-1 md:flex ${HOME_SEGMENTED_NAV}`}
            >
              {MAIN_NAV.map((link, index) => (
                <Fragment key={link.id}>
                  {index > 0 ? (
                    <span className={DNA_NAV_DIVIDER} aria-hidden />
                  ) : null}
                  <Link
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 transition-colors ${DNA_LABEL} ${
                      activeSection === link.id
                        ? DNA_NAV_LINK_ACTIVE
                        : DNA_NAV_LINK_IDLE
                    }`}
                    aria-current={
                      activeSection === link.id ? "page" : undefined
                    }
                  >
                    {link.label}
                  </Link>
                </Fragment>
              ))}
            </div>

            {showDesktopSearch ? (
              <div className="hidden max-w-sm flex-1 md:block">
                <SearchBar
                  placeholder="Search stocks by symbol (e.g., AAPL, TSLA, MSFT)..."
                  onSelect={handleSymbolSelect}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="hidden flex-1 md:block" />
            )}

            <div className="relative z-[10060] flex shrink-0 items-center gap-2">
              <UserProfileMenu />
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-md p-2 text-stone-700 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-600 dark:text-stone-200 dark:hover:bg-stone-800 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="border-t border-stone-200 dark:border-stone-700 md:hidden"
          >
            <div className="px-4 py-3">
              <SearchBar
                placeholder="Search symbols..."
                onSelect={handleSymbolSelect}
              />
            </div>
            <div className="space-y-1 px-2 pb-3">
              {MAIN_NAV.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full rounded-md px-3 py-2 text-left transition-colors ${DNA_NAV_MOBILE} ${
                    activeSection === link.id
                      ? DNA_NAV_LINK_ACTIVE
                      : DNA_NAV_LINK_IDLE
                  }`}
                  aria-current={activeSection === link.id ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      {newsPendingMessage ? (
        <div
          className="fixed inset-0 z-[10040] flex items-center justify-center bg-stone-50/80 dark:bg-stone-950/80"
          data-testid="news-loading-overlay"
        >
          <div
            className="flex flex-col items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label={newsPendingMessage}
          >
            <div className="loading-spinner loading-spinner--md" aria-hidden>
              <div className="loading-spinner__arc" />
              <div className="loading-spinner__arc" />
              <div className="loading-spinner__arc" />
            </div>
            <p className={`mt-3 ${DNA_LABEL}`}>{newsPendingMessage}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

function pendingMessageForNewsHref(href: string | null): string | null {
  if (!href || href.startsWith("http") || href.startsWith("mailto:")) {
    return null;
  }
  if (href.startsWith("/news/rss")) return null;
  if (href.startsWith("/news/")) return "Loading story...";
  if (href.startsWith("/news")) return "Loading headlines...";
  return null;
}
