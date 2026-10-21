import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

describe("GET /api/auth/oauth/apple", () => {
  it("rejects localhost before talking to Appwrite", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/oauth/apple"
    );
    const response = await GET(request);
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("location")).toContain(
      "auth_error=apple_https_required"
    );
  });

  it("rejects HTTP on a public hostname", async () => {
    const request = new NextRequest(
      "http://theopenstock.com/api/auth/oauth/apple"
    );
    const response = await GET(request);
    expect(response.headers.get("location")).toContain(
      "auth_error=apple_https_required"
    );
  });
});
