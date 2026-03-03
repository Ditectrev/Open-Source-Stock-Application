import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Exchange Application",
  description: "Comprehensive web platform for individual long-term investors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
