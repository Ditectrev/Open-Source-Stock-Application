import type { NextRequest } from "next/server";

export type BrowserOAuthProvider = "google" | "apple";

/** True for local dev hosts — OAuth must use the live origin, not NEXT_PUBLIC_SITE_URL. */
export function isLocalDevHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

/**
 * Apple Sign-In requires HTTPS on a public hostname (no localhost / private LAN / HTTP).
 * Same constraint as Practice-Tests-Exams-Platform lib/appwrite/auth.ts.
 */
export function isAppleOAuthHostAllowed(
  hostname: string,
  protocol: string
): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (isLocalDevHostname(host)) return false;
  if (host.startsWith("192.168.") || host.startsWith("10.")) return false;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
  const scheme = protocol.endsWith(":") ? protocol : `${protocol}:`;
  return scheme === "https:";
}

/** Canonical site origin from NEXT_PUBLIC_SITE_URL, if set at build time. */
export function getConfiguredSiteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const href =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`;
    return new URL(href.replace(/\/$/, "")).origin;
  } catch {
    return null;
  }
}

/**
 * Origin used for Appwrite OAuth success/failure URLs.
 * On localhost, always uses the request origin (ignores NEXT_PUBLIC_SITE_URL).
 * In production, prefers NEXT_PUBLIC_SITE_URL so apex vs www matches Appwrite.
 */
export function getOAuthRedirectOrigin(request: NextRequest): string {
  const requestOrigin = new URL(request.url).origin;
  const { hostname } = new URL(request.url);
  if (isLocalDevHostname(hostname)) {
    return requestOrigin;
  }
  return getConfiguredSiteOrigin() ?? requestOrigin;
}

/** OAuth return URL — client page reads query/hash and completes session on the server. */
export function getOAuthCallbackUrl(
  origin: string,
  provider: BrowserOAuthProvider
): string {
  return `${origin}/auth/callback/${provider}`;
}

export function getOAuthRedirectUrls(
  request: NextRequest,
  provider: BrowserOAuthProvider
): {
  origin: string;
  success: string;
  failure: string;
} {
  const origin = getOAuthRedirectOrigin(request);
  const callback = getOAuthCallbackUrl(origin, provider);
  return {
    origin,
    success: callback,
    failure: callback,
  };
}

export function getGoogleOAuthCallbackUrl(origin: string): string {
  return getOAuthCallbackUrl(origin, "google");
}

export function getGoogleOAuthRedirectUrls(request: NextRequest) {
  return getOAuthRedirectUrls(request, "google");
}

export function getAppleOAuthCallbackUrl(origin: string): string {
  return getOAuthCallbackUrl(origin, "apple");
}

export function getAppleOAuthRedirectUrls(request: NextRequest) {
  return getOAuthRedirectUrls(request, "apple");
}

/** Browser OAuth: on localhost use the page origin; in prod prefer NEXT_PUBLIC_SITE_URL. */
export function getBrowserOAuthRedirectOrigin(): string | null {
  if (typeof window === "undefined") return null;
  if (isLocalDevHostname(window.location.hostname)) {
    return window.location.origin;
  }
  return getConfiguredSiteOrigin() ?? window.location.origin;
}
