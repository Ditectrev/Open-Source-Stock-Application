"use client";

/**
 * TrialBanner Component
 * Displays trial status, remaining time, and authentication options when expired.
 * Integrates TrialTimer and AuthPrompt.
 * Requirements: 21.12, 21.13
 */

import { useState, useCallback, useEffect } from "react";
import { TrialTimer } from "@/components/TrialTimer";
import { AuthPrompt } from "@/components/AuthPrompt";
import { trialManagementService } from "@/services/trial-management.service";

export interface TrialBannerProps {
  /** Called when user successfully authenticates */
  onAuthenticated?: () => void;
}

export function TrialBanner({ onAuthenticated }: TrialBannerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Auto-start trial if this is a first-time visitor
      const status = trialManagementService.getTrialStatus();
      if (!status.isActive && !status.hasUsedTrial) {
        try {
          await trialManagementService.startTrial();
        } catch {
          // Already used or storage unavailable — fall through to show auth
        }
      }

      // Read final status after potential startTrial()
      const finalStatus = trialManagementService.getTrialStatus();
      setRemainingSeconds(finalStatus.remainingSeconds);
      setIsActive(finalStatus.isActive);

      if (!finalStatus.isActive && finalStatus.hasUsedTrial) {
        setShowAuth(true);
      }
      setInitialized(true);
    };

    init();
  }, []);

  const handleExpired = useCallback(() => {
    setIsActive(false);
    trialManagementService.endTrial();
    setShowAuth(true);
  }, []);

  const handleAuthClose = useCallback(() => {
    setShowAuth(false);
  }, []);

  const handleAppleSignIn = useCallback(() => {
    onAuthenticated?.();
  }, [onAuthenticated]);

  const handleGoogleSignIn = useCallback(() => {
    onAuthenticated?.();
  }, [onAuthenticated]);

  const handleEmailSubmit = useCallback(
    (_email: string) => {
      onAuthenticated?.();
    },
    [onAuthenticated]
  );

  if (!initialized) return null;

  return (
    <>
      {isActive && (
        <div
          className="flex items-center justify-between border-b border-yellow-200 bg-yellow-50 px-4 py-2 dark:border-yellow-800 dark:bg-yellow-900/30"
          role="status"
          aria-label="Trial session active"
          data-testid="trial-banner"
        >
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Trial session
          </span>
          <div className="flex items-center gap-3">
            <TrialTimer
              remainingSeconds={remainingSeconds}
              onExpired={handleExpired}
            />
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              data-testid="trial-sign-in-btn"
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {!isActive && showAuth && (
        <div
          className="flex items-center justify-center border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/30"
          role="alert"
          data-testid="trial-expired-banner"
        >
          <span className="text-sm text-red-700 dark:text-red-300">
            Trial expired.{" "}
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="font-medium underline hover:no-underline"
              data-testid="trial-expired-sign-in"
            >
              Sign in
            </button>{" "}
            to continue.
          </span>
        </div>
      )}

      <AuthPrompt
        open={showAuth}
        onClose={handleAuthClose}
        onAppleSignIn={handleAppleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSubmit={handleEmailSubmit}
      />
    </>
  );
}
