/**
 * Starts Apple OAuth: redirects browser to Appwrite (then Apple).
 * Visible in Network as GET /api/auth/oauth/apple (same origin), then redirect chain.
 * Apple requires HTTPS on a registered public domain — localhost/HTTP cannot work.
 */

import { NextRequest, NextResponse } from "next/server";
import { AppwriteException, OAuthProvider } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";
import {
  getAppleOAuthRedirectUrls,
  isAppleOAuthHostAllowed,
} from "@/lib/auth/oauth-redirect-origin";
import { getAppwriteServerEnv } from "@/lib/appwrite-server-env";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  if (!isAppleOAuthHostAllowed(requestUrl.hostname, requestUrl.protocol)) {
    return NextResponse.redirect(
      new URL("/?auth_error=apple_https_required", request.url)
    );
  }

  const { origin, success, failure } = getAppleOAuthRedirectUrls(request);

  const appwrite = getAppwriteServerEnv();
  if (!appwrite.endpoint || !appwrite.projectId || !appwrite.apiKey) {
    logger.warn("Apple OAuth: Appwrite not fully configured");
    return NextResponse.redirect(
      new URL("/?auth_error=appwrite_not_configured", request.url)
    );
  }

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
      err instanceof AppwriteException && /invalid redirect/i.test(err.message);
    if (isInvalidRedirect) {
      logger.warn("Apple OAuth: redirect URLs not whitelisted in Appwrite", {
        origin,
        success,
        failure,
        projectId: appwrite.projectId,
        hint: "Add this hostname under Appwrite → Auth → Platforms (Web).",
      });
    }
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
