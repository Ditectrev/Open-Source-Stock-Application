"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { subscriptionService } from "@/services/subscription.service";

const PricingPage = dynamic(
  () => import("@/components/PricingPage").then((m) => m.PricingPage),
  {
    loading: () => <LoadingSpinner size="md" message="Loading pricing..." />,
    ssr: false,
  }
);

export default function PricingRoutePage() {
  return (
    <div className="mt-6 sm:mt-8 lg:mt-10">
      <PricingPage tiers={subscriptionService.getPricingTiers()} />
    </div>
  );
}
