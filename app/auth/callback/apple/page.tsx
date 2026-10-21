"use client";

import { OAuthCallbackCompleter } from "@/components/OAuthCallbackCompleter";

/** Apple OAuth return handler (browser). */
export default function AppleOAuthCallbackPage() {
  return <OAuthCallbackCompleter provider="apple" />;
}
