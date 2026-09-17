"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  DNA_BODY,
  DNA_CAPTION,
  DNA_HEADING,
  DNA_SUBHEADING,
} from "@/lib/design-dna";
import {
  FOOTER_CONTACT,
  FOOTER_RESOURCES,
  FOOTER_SOCIAL,
  FOOTER_TOOLS,
} from "@/lib/footer-content";
import { SITE_NAME } from "@/lib/site-seo";

const footerLinkClass =
  "inline-block italic uppercase tracking-wide text-stone-300 transition-colors hover:text-stone-50";

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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-8 border-t border-stone-800 bg-stone-950 text-stone-300 sm:mt-12"
      aria-label="Site footer"
      data-testid="site-footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 xl:max-w-[1400px]">
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
            className="flex flex-col items-start lg:col-span-3 lg:col-start-10 lg:items-end"
            data-testid="footer-tools"
          >
            <h3 className={`mb-3 ${DNA_HEADING} text-stone-50`}>Tools</h3>
            <div className="flex flex-col items-start gap-3 lg:items-end">
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
            <h3 className={`mb-3 ${DNA_HEADING} text-stone-50`}>Resources</h3>
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
            className="flex flex-wrap items-center gap-4 lg:col-span-4 lg:col-start-9 lg:justify-end"
            data-testid="footer-social"
          >
            {FOOTER_SOCIAL.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${DNA_CAPTION} font-medium uppercase tracking-wide text-stone-300 transition-colors hover:text-stone-50`}
                aria-label={item.label}
              >
                {item.label}
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
