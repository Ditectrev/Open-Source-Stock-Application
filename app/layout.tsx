import type { Metadata } from "next";
import { Gloock, Ibarra_Real_Nova } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const headingFont = Gloock({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
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
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
