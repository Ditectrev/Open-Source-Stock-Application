import { describe, it, expect, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  getAppleOAuthRedirectUrls,
  getConfiguredSiteOrigin,
  getGoogleOAuthRedirectUrls,
  getOAuthRedirectOrigin,
  isAppleOAuthHostAllowed,
} from "../oauth-redirect-origin";

describe("oauth-redirect-origin", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("getConfiguredSiteOrigin parses NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com/";
    expect(getConfiguredSiteOrigin()).toBe("https://theopenstock.com");
  });

  it("getOAuthRedirectOrigin prefers configured site over request host", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const request = new NextRequest(
      "https://www.theopenstock.com/api/auth/oauth/google"
    );
    expect(getOAuthRedirectOrigin(request)).toBe("https://theopenstock.com");
  });

  it("getOAuthRedirectOrigin falls back to request when unset", () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/oauth/google"
    );
    expect(getOAuthRedirectOrigin(request)).toBe("http://localhost:3000");
  });

  it("getOAuthRedirectOrigin ignores NEXT_PUBLIC_SITE_URL on localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const request = new NextRequest(
      "http://localhost:3000/api/auth/oauth/google"
    );
    expect(getOAuthRedirectOrigin(request)).toBe("http://localhost:3000");
  });

  it("getGoogleOAuthRedirectUrls builds callback paths", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const request = new NextRequest(
      "https://www.theopenstock.com/api/auth/oauth/google"
    );
    const callback = "https://theopenstock.com/auth/callback/google";
    expect(getGoogleOAuthRedirectUrls(request)).toEqual({
      origin: "https://theopenstock.com",
      success: callback,
      failure: callback,
    });
  });

  it("getAppleOAuthRedirectUrls builds callback paths", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const request = new NextRequest(
      "https://www.theopenstock.com/api/auth/oauth/apple"
    );
    const callback = "https://theopenstock.com/auth/callback/apple";
    expect(getAppleOAuthRedirectUrls(request)).toEqual({
      origin: "https://theopenstock.com",
      success: callback,
      failure: callback,
    });
  });

  it("isAppleOAuthHostAllowed rejects localhost and HTTP", () => {
    expect(isAppleOAuthHostAllowed("localhost", "http:")).toBe(false);
    expect(isAppleOAuthHostAllowed("127.0.0.1", "https:")).toBe(false);
    expect(isAppleOAuthHostAllowed("192.168.1.10", "https:")).toBe(false);
    expect(isAppleOAuthHostAllowed("10.0.0.8", "https:")).toBe(false);
    expect(isAppleOAuthHostAllowed("172.16.0.2", "https:")).toBe(false);
    expect(isAppleOAuthHostAllowed("theopenstock.com", "http:")).toBe(false);
    expect(isAppleOAuthHostAllowed("theopenstock.com", "https:")).toBe(true);
    expect(isAppleOAuthHostAllowed("theopenstock.com", "https")).toBe(true);
  });
});
