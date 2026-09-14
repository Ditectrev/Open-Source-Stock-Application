import type { Metadata } from "next";
import { Ibarra_Real_Nova, Merriweather } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { gtmBootstrapHtml, normalizeGtmId } from "@/lib/gtm";
import { buildRootMetadata } from "@/lib/site-seo";
import "./globals.css";
import { Providers } from "./providers";

const headingFont = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const bodyFont = Ibarra_Real_Nova({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = normalizeGtmId(process.env.NEXT_PUBLIC_GTM_ID);

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Preconnect to external API domains for faster data fetching */}
        <link rel="preconnect" href="https://production.dataviz.cnn.io" />
        <link rel="preconnect" href="https://query1.finance.yahoo.com" />
        <link rel="dns-prefetch" href="https://production.dataviz.cnn.io" />
        <link rel="dns-prefetch" href="https://query1.finance.yahoo.com" />
      </head>
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        <JsonLd />
        {gtmId ? (
          <script
            id="gtm-script"
            dangerouslySetInnerHTML={{ __html: gtmBootstrapHtml(gtmId) }}
          />
        ) : null}
        {gtmId ? (
          <noscript>
            <iframe
              title="gtm"
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
