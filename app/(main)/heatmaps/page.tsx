"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LazySection } from "@/components/LazySection";

const HeatmapHub = dynamic(
  () => import("@/components/HeatmapHub").then((m) => m.HeatmapHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading heatmaps..." />,
    ssr: false,
  }
);

export default function HeatmapsPage() {
  const router = useRouter();

  return (
    <LazySection className="mt-6 sm:mt-8 lg:mt-10">
      <HeatmapHub
        refreshInterval={60000}
        onSymbolClick={(symbol) =>
          router.push(`/?symbol=${encodeURIComponent(symbol)}`)
        }
      />
    </LazySection>
  );
}
