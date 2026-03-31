"use client";

/**
 * AuthPrompt Component
 * Modal dialog for user authentication with Apple SSO, Google SSO, and Email OTP.
 * Requirements: 1.6, 21.13
 */

import { useState, useCallback } from "react";

export type AuthView = "providers" | "email";

export interface AuthPromptProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the user dismisses the modal */
  onClose: () => void;
  /** Called when Apple sign-in is selected */
  onAppleSignIn: () => void;
  /** Called when Google sign-in is selected */
  onGoogleSignIn: () => void;
  /** Called when the user submits their email for OTP */
  onEmailSubmit: (email: string) => void;
  /** External error message to display (Req 1.6) */
  error?: string | null;
  /** Whether an auth action is in progress */
  loading?: boolean;
}

export function AuthPrompt({
  open,
  onClose,
  onAppleSignIn,
  onGoogleSignIn,
  onEmailSubmit,
  error,
  loading = false,
}: AuthPromptProps) {
  const [view, setView] = useState<AuthView>("providers");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setEmailError(null);

      const trimmed = email.trim();
      if (!trimmed) {
        setEmailError("Please enter your email address.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setEmailError("Please enter a valid email address.");
        return;
      }

      onEmailSubmit(trimmed);
    },
    [email, onEmailSubmit]
  );

  if (!open) return null;

  const displayError = error || emailError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
      data-testid="auth-prompt"
    >
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
          data-testid="auth-close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
          Sign in to continue
        </h2>

        {/* Error display (Req 1.6) */}
        {displayError && (
          <div
            className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
            aria-live="assertive"
            data-testid="auth-error"
          >
            {displayError}
          </div>
        )}

        {view === "providers" ? (
          <div className="space-y-3">
            {/* Apple SSO */}
            <button
              type="button"
              onClick={onAppleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              data-testid="auth-apple"
            >
              <AppleIcon />
              Continue with Apple
            </button>

            {/* Google SSO */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              data-testid="auth-google"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
            </div>

            {/* Email OTP */}
            <button
              type="button"
              onClick={() => setView("email")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              data-testid="auth-email-btn"
            >
              <EmailIcon />
              Continue with Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setView("providers");
                setEmailError(null);
              }}
              className="mb-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              data-testid="auth-back"
            >
              ← Back
            </button>

            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              data-testid="auth-email-input"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              data-testid="auth-email-submit"
            >
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>
        )}

        {loading && (
          <p
            className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            Please wait…
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline SVG icons                                                    */
/* ------------------------------------------------------------------ */

function AppleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
