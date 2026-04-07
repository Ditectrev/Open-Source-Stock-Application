import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { HomePageClient } from "./home-page-client";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" message="Loading..." />
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
