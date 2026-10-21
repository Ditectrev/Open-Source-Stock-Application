/** Map Appwrite OAuth `error` query param (often JSON) to an auth_error code. */

export type OAuthProviderSlug = "google" | "apple";

export function appwriteOAuthErrorToAuthCode(
  errorParam: string | null,
  provider: OAuthProviderSlug = "google"
): string {
  const failed = `${provider}_oauth_failed`;
  if (!errorParam?.trim()) {
    return failed;
  }

  let message = errorParam;
  let type = "";

  try {
    const parsed = JSON.parse(errorParam) as {
      message?: string;
      type?: string;
    };
    message = parsed.message ?? errorParam;
    type = parsed.type ?? "";
  } catch {
    /* plain string */
  }

  if (provider === "google") {
    if (/client_secret is missing/i.test(message)) {
      return "google_client_secret_missing";
    }
    if (/invalid_client|client_id/i.test(message)) {
      return "google_oauth_invalid_client";
    }
    if (type === "user_oauth2_bad_request") {
      return "google_oauth_bad_request";
    }
    return failed;
  }

  if (
    type === "user_oauth2_bad_request" ||
    /invalid_client|client_id/i.test(message)
  ) {
    return "apple_oauth_bad_request";
  }

  return failed;
}
