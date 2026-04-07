"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LazySection } from "@/components/LazySection";

const CalendarHub = dynamic(
  () => import("@/components/CalendarHub").then((m) => m.CalendarHub),
  {
    loading: () => <LoadingSpinner size="md" message="Loading calendars..." />,
    ssr: false,
  }
);

export default function CalendarsPage() {
  const router = useRouter();

  return (
    <LazySection className="mt-6 sm:mt-8 lg:mt-10">
      <CalendarHub
        onSymbolClick={(symbol) =>
          router.push(`/?symbol=${encodeURIComponent(symbol)}`)
        }
      />
    </LazySection>
  );
}
