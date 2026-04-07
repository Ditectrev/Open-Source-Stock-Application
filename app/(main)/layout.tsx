"use client";

import dynamic from "next/dynamic";
import { Navigation } from "@/components/Navigation";
import { AdBanner } from "@/components/AdBanner";
import { usePricingTier } from "@/lib/use-pricing-tier";

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => m.Footer),
  { ssr: false }
);

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pricingTier = usePricingTier();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="flex justify-center px-4 pt-3">
        <AdBanner placement="banner-top" tier={pricingTier} />
      </div>

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        {children}
      </div>

      <div className="flex justify-center px-4 pb-3">
        <AdBanner placement="banner-bottom" tier={pricingTier} />
      </div>

      <Footer />
    </div>
  );
}
