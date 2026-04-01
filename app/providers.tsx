"use client";

import { ThemeProvider } from "@/lib/theme-context";
import { TrialProvider } from "@/components/TrialProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TrialProvider>{children}</TrialProvider>
    </ThemeProvider>
  );
}
