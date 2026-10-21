import { describe, it, expect, afterEach } from "vitest";
import { describeAuthQueryError } from "../auth-query-messages";

describe("describeAuthQueryError", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  });

  it("explains Apple HTTPS requirement", () => {
    expect(describeAuthQueryError("apple_https_required")).toMatch(/HTTPS/);
    expect(describeAuthQueryError("apple_sign_in_unavailable")).toMatch(
      /HTTPS/
    );
  });

  it("explains Apple Appwrite provider misconfiguration", () => {
    expect(describeAuthQueryError("apple_oauth_bad_request")).toMatch(
      /Services ID/
    );
  });

  it("mentions Apple callback on production hostname mismatch", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://theopenstock.com";
    const message = describeAuthQueryError(
      "oauth_redirect_not_whitelisted",
      "theopenstock.com"
    );
    expect(message).toContain("/auth/callback/apple");
    expect(message).toContain("/auth/callback/google");
  });
});
