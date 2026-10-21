"use client";

import { OAuthCallbackCompleter } from "@/components/OAuthCallbackCompleter";

/** Google OAuth return handler (browser). */
export default function GoogleOAuthCallbackPage() {
  return <OAuthCallbackCompleter provider="google" />;
}
