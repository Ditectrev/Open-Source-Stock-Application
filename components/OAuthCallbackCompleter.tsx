"use client";

/**
 * Appwrite may put userId/secret in the query or hash; we POST them to the server
 * to set appwrite_session. Shared by Google and Apple callback pages.
 */

import { useEffect } from "react";
import {
  appwriteOAuthErrorToAuthCode,
  type OAuthProviderSlug,
} from "@/lib/auth/parse-oauth-callback-error";

function collectOAuthParams(): URLSearchParams {
  const merged = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  if (hash.length > 1) {
    new URLSearchParams(hash.slice(1)).forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
}

export function OAuthCallbackCompleter({
  provider,
}: {
  provider: OAuthProviderSlug;
}) {
  const failedCode = `${provider}_oauth_failed`;
  const message = "Signing you in…";

  useEffect(() => {
    const params = collectOAuthParams();

    const providerError = params.get("error");
    if (providerError) {
      const code = appwriteOAuthErrorToAuthCode(providerError, provider);
      window.location.replace(`/?auth_error=${encodeURIComponent(code)}`);
      return;
    }

    if (params.get("failure")) {
      window.location.replace(`/?auth_error=${failedCode}`);
      return;
    }

    const userId = params.get("userId");
    const secret = params.get("secret");

    if (!userId || !secret) {
      window.location.replace("/?auth_error=missing_credentials");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/oauth/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId, secret }),
        });

        if (cancelled) return;

        if (res.ok) {
          window.location.replace("/?auth_success=true");
          return;
        }

        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        const code = data.error?.trim() || "oauth_session_failed";
        window.location.replace(`/?auth_error=${encodeURIComponent(code)}`);
      } catch {
        if (!cancelled) {
          window.location.replace("/?auth_error=server_error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [failedCode, provider]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p>
    </div>
  );
}
