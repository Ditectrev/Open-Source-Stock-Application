"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LazySection } from "@/components/LazySection";

const ScreenerHub = dynamic(
  () => import("@/components/ScreenerHub").then((m) => m.ScreenerHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading screener..." />,
    ssr: false,
  }
);

export default function ScreenerPage() {
  const router = useRouter();

  return (
    <LazySection className="mt-6 sm:mt-8 lg:mt-10">
      <ScreenerHub
        onSymbolClick={(symbol) =>
          router.push(`/?symbol=${encodeURIComponent(symbol)}`)
        }
      />
    </LazySection>
  );
}
