"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const SectorHub = dynamic(
  () => import("@/components/SectorHub").then((m) => m.SectorHub),
  {
    loading: () => (
      <div style={{ minHeight: 300 }}>
        <LoadingSpinner size="md" message="Loading sectors..." />
      </div>
    ),
    ssr: false,
  }
);

export default function SectorsPage() {
  return (
    <div className="mt-6 sm:mt-8 lg:mt-10">
      <SectorHub />
    </div>
  );
}
