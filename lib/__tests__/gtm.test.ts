import { describe, expect, it } from "vitest";
import { gtmBootstrapHtml, normalizeGtmId } from "@/lib/gtm";

describe("normalizeGtmId", () => {
  it("accepts canonical container IDs", () => {
    expect(normalizeGtmId("gtm-abc123")).toBe("GTM-ABC123");
  });

  it("rejects empty or unsafe values", () => {
    expect(normalizeGtmId("")).toBeNull();
    expect(normalizeGtmId("GTM-ABC');alert(1);//")).toBeNull();
    expect(normalizeGtmId("UA-123")).toBeNull();
  });

  it("embeds only the validated id in the bootstrap snippet", () => {
    const html = gtmBootstrapHtml("GTM-ABC123");
    expect(html).toContain("'GTM-ABC123'");
    expect(html).toContain("googletagmanager.com/gtm.js");
  });
});
