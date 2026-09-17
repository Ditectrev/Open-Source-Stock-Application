"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DNA_BODY, DNA_HEADING, DNA_SUBHEADING } from "@/lib/design-dna";
import {
  FOOTER_CONTACT,
  FOOTER_RESOURCES,
  FOOTER_SOCIAL,
  FOOTER_TOOLS,
  type FooterSocialId,
} from "@/lib/footer-content";
import { SITE_NAME } from "@/lib/site-seo";

const GitHubButton = dynamic(() => import("react-github-btn"), { ssr: false });

const footerLinkClass =
  "inline-block italic text-stone-300 transition-colors hover:text-stone-50";

const footerHeadingClass = `${DNA_HEADING} text-stone-50 uppercase tracking-wide`;

function ContactIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-stone-400"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function FooterSocialIcon({ id }: { id: FooterSocialId }) {
  const className = "h-6 w-6 fill-current";

  switch (id) {
    case "discord":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.287a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.095.246.193.373.287a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.073c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "medium":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.291 19.497h2.039L6.486 3.24H4.298l13.312 17.41z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
  }
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showGitHubStar, setShowGitHubStar] = useState(false);

  useEffect(() => {
    setShowGitHubStar(true);
  }, []);

  return (
    <footer
      className="mt-8 border-t border-stone-800 bg-stone-950 text-stone-300 sm:mt-12"
      aria-label="Site footer"
      data-testid="site-footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 xl:max-w-[1400px]">
        <div className="mb-8 flex h-[30px] items-center justify-center">
          {showGitHubStar ? (
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
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <address className="not-italic lg:col-span-5">
            <Link
              href="/"
              className={`mb-4 inline-block ${DNA_SUBHEADING} text-stone-50 hover:text-white`}
            >
              {SITE_NAME}
            </Link>
            <div className={`space-y-2 ${DNA_BODY}`}>
              <p>
                <ContactIcon>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </ContactIcon>
                {FOOTER_CONTACT.address}
              </p>
              <p>
                <ContactIcon>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.2 2.22z" />
                  </svg>
                </ContactIcon>
                <a
                  href={`tel:${FOOTER_CONTACT.phone.replace(/\s+/g, "")}`}
                  className="hover:text-stone-50"
                >
                  {FOOTER_CONTACT.phone}
                </a>
              </p>
              <p>
                <ContactIcon>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </ContactIcon>
                <a
                  href={`mailto:${FOOTER_CONTACT.email}`}
                  className="normal-case hover:text-stone-50"
                >
                  {FOOTER_CONTACT.email}
                </a>
              </p>
              <p>
                <ContactIcon>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </ContactIcon>
                {FOOTER_CONTACT.taxId}
              </p>
            </div>
          </address>

          <nav
            aria-label="Tools"
            className="flex flex-col items-center text-center lg:col-span-3 lg:col-start-10"
            data-testid="footer-tools"
          >
            <h3 className={`mb-3 ${footerHeadingClass}`}>Tools</h3>
            <div className="flex flex-col items-center gap-3">
              {FOOTER_TOOLS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={footerLinkClass}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav
            aria-label="Resources"
            className="flex flex-col items-start lg:col-span-5"
            data-testid="footer-resources"
          >
            <h3 className={`mb-3 ${footerHeadingClass}`}>Resources</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {FOOTER_RESOURCES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={footerLinkClass}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav
            aria-label="Social media"
            className="flex flex-wrap items-center gap-5 lg:col-span-4 lg:col-start-9 lg:justify-end"
            data-testid="footer-social"
          >
            {FOOTER_SOCIAL.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-300 transition-colors hover:text-stone-50"
                aria-label={item.label}
              >
                <FooterSocialIcon id={item.id} />
              </a>
            ))}
          </nav>

          <div
            className="flex justify-center lg:col-span-12"
            data-testid="footer-copyright"
          >
            <p className={DNA_BODY}>
              © {currentYear} {SITE_NAME}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
