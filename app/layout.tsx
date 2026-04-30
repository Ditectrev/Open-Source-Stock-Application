import type { Metadata } from "next";
import { Ibarra_Real_Nova, Merriweather } from "next/font/google";
import Script from "next/script";
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

export const metadata: Metadata = {
  title: "Stock Exchange Application",
  description: "Comprehensive web platform for individual long-term investors",
  other: {
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

  return (
    <html lang="en">
      <head>
        {gtmId ? (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
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
