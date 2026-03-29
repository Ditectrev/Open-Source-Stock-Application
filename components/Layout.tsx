"use client";

import { Navigation, NavigationProps } from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export interface LayoutProps {
  children: React.ReactNode;
  /** Props forwarded to the Navigation component */
  navigationProps?: NavigationProps;
  /** Optional trial banner slot rendered below the nav */
  trialBanner?: React.ReactNode;
}

export function Layout({ children, navigationProps, trialBanner }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation {...navigationProps} />
      {trialBanner && (
        <div role="status" aria-live="polite">
          {trialBanner}
        </div>
      )}
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
