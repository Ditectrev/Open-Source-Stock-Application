/**
 * Starts Apple OAuth: redirects browser to Appwrite (then Apple).
 */

import { NextRequest, NextResponse } from "next/server";
import { AppwriteException, OAuthProvider } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";
import { getAppwriteServerEnv } from "@/lib/appwrite-server-env";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  const appwrite = getAppwriteServerEnv();
  if (!appwrite.endpoint || !appwrite.projectId || !appwrite.apiKey) {
    logger.warn("Apple OAuth: Appwrite not fully configured");
    return NextResponse.redirect(
      new URL("/?auth_error=appwrite_not_configured", request.url)
    );
  }

  const success = `${origin}/api/auth/callback/apple`;
  const failure = `${origin}/?auth_error=apple_oauth_failed`;

  try {
    const { account } = createServerClient();
    const url = await account.createOAuth2Token(
      OAuthProvider.Apple,
      success,
      failure
    );
    return NextResponse.redirect(url);
  } catch (err) {
    logger.error(
      "Apple OAuth start failed",
      err instanceof Error ? err : new Error(String(err))
    );
    const isInvalidRedirect =
      err instanceof AppwriteException &&
      /invalid redirect/i.test(err.message);
    return NextResponse.redirect(
      new URL(
        isInvalidRedirect
          ? "/?auth_error=oauth_redirect_not_whitelisted"
          : "/?auth_error=oauth_start_failed",
        request.url
      )
    );
  }
}
