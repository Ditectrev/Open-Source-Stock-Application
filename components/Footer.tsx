"use client";

import { DNA_BODY, DNA_BODY_SECONDARY, DNA_CAPTION } from "@/lib/design-dna";
import { normalizeReleaseTag } from "@/lib/release-tag";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import GitHubButton from "react-github-btn";
import packageJson from "../package.json";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [version, setVersion] = useState(packageJson.version);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/version")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { version?: string } | null) => {
        if (cancelled || !payload?.version) return;
        setVersion(normalizeReleaseTag(payload.version));
      })
      .catch(() => {
        // Keep package.json version when GitHub is unreachable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer
      className={`mt-8 border-t border-stone-200 bg-stone-100 py-4 sm:mt-12 sm:py-6 dark:border-stone-800 dark:bg-stone-950 ${DNA_BODY}`}
      aria-label="Site footer"
    >
      <div className="mb-3 flex items-center justify-center">
        <GitHubButton
          href="https://github.com/Ditectrev/Open-Source-Stock-Application"
          data-color-scheme="no-preference: dark; light: light; dark: dark;"
          data-icon="octicon-star"
          data-size="large"
          data-show-count="true"
          aria-label="Star Open Source Stock Application on GitHub"
        >
          Star
        </GitHubButton>
      </div>

      <p
        className={`mb-2 text-center ${DNA_CAPTION}`}
        data-testid="app-version"
      >
        v{version} (open alpha, might contain bugs)
      </p>

      <nav
        className={`mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 ${DNA_CAPTION}`}
        aria-label="Compare and product links"
      >
        <Link href="/compare" className="hover:underline">
          Compare
        </Link>
        <Link href="/screener" className="hover:underline">
          Screener
        </Link>
        <Link href="/pricing" className="hover:underline">
          Pricing
        </Link>
        <Link href="/compare/finviz" className="hover:underline">
          vs Finviz
        </Link>
        <Link href="/compare/openstock" className="hover:underline">
          OpenStock alternative
        </Link>
      </nav>

      <p className={`text-center ${DNA_BODY_SECONDARY}`}>
        © {currentYear} The Open Stock
      </p>
    </footer>
  );
}
