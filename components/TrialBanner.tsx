"use client";

/**
 * TrialBanner Component
 * Displays trial status, remaining time, and authentication options when expired.
 * Integrates TrialTimer and AuthPrompt.
 * Requirements: 21.12, 21.13
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { TrialTimer } from "@/components/TrialTimer";
import { AuthPrompt } from "@/components/AuthPrompt";
import { trialManagementService } from "@/services/trial-management.service";
import {
  postEmailOtpSend,
  postEmailOtpVerify,
} from "@/lib/auth/trial-auth-navigation";

export interface TrialBannerProps {
  /** Called when user successfully authenticates */
  onAuthenticated?: () => void;
}

export function TrialBanner({ onAuthenticated }: TrialBannerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);

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
    };

    init();
  }, []);

  const prevShowAuthRef = useRef(showAuth);
  useEffect(() => {
    const opening = showAuth && !prevShowAuthRef.current;
    prevShowAuthRef.current = showAuth;
    if (opening) {
      setAuthLoading(false);
      setAuthError(null);
      setAuthInfo(null);
    }
  }, [showAuth]);

  const handleExpired = useCallback(() => {
    setIsActive(false);
    trialManagementService.endTrial();
    setShowAuth(true);
  }, []);

  const handleAuthClose = useCallback(() => {
    setShowAuth(false);
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(false);
  }, []);

  const handleEmailSubmit = useCallback(async (email: string) => {
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(true);
    try {
      const result = await postEmailOtpSend(email);
      if (!result.ok) {
        const err =
          result.error ?? "Something went wrong. Please try again.";
        setAuthError(err);
        return { ok: false as const, error: err };
      }
      if (!result.userId) {
        const err = "Could not start verification. Please try again.";
        setAuthError(err);
        return { ok: false as const, error: err };
      }
      setAuthInfo(
        "We sent a verification email. Check your inbox (and spam) for the 6-digit code."
      );
      return { ok: true as const, userId: result.userId };
    } catch {
      setAuthError("Network error. Please try again.");
      return {
        ok: false as const,
        error: "Network error. Please try again.",
      };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleEmailVerify = useCallback(
    async (userId: string, secret: string) => {
      setAuthError(null);
      setAuthLoading(true);
      try {
        const result = await postEmailOtpVerify(userId, secret);
        if (!result.ok) {
          const err =
            result.error ?? "Invalid or expired code. Please try again.";
          setAuthError(err);
          return { ok: false as const, error: err };
        }
        setAuthInfo(null);
        onAuthenticated?.();
        setShowAuth(false);
        return { ok: true as const };
      } catch {
        setAuthError("Network error. Please try again.");
        return {
          ok: false as const,
          error: "Network error. Please try again.",
        };
      } finally {
        setAuthLoading(false);
      }
    },
    [onAuthenticated]
  );

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
        onEmailSubmit={handleEmailSubmit}
        onEmailVerify={handleEmailVerify}
        loading={authLoading}
        error={authError}
        infoMessage={authInfo}
      />
    </>
  );
}
