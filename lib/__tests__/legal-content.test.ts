import { describe, expect, it } from "vitest";
import { COMPANY_LEGAL, FOOTER_CONTACT } from "@/lib/footer-content";
import {
  COPYRIGHTS_DOCUMENT,
  LEGAL_DOCUMENTS,
  PRIVACY_DOCUMENT,
  TERMS_DOCUMENT,
  legalDocumentPlainText,
} from "@/lib/legal-content";

describe("legal-content", () => {
  it("covers the three footer legal documents", () => {
    expect(LEGAL_DOCUMENTS.map((doc) => doc.path)).toEqual([
      "/copyrights",
      "/privacy-and-security",
      "/terms-of-use",
    ]);
  });

  it("uses footer company details", () => {
    const privacy = legalDocumentPlainText(PRIVACY_DOCUMENT);
    const terms = legalDocumentPlainText(TERMS_DOCUMENT);
    expect(privacy).toContain(FOOTER_CONTACT.address);
    expect(privacy).toContain(FOOTER_CONTACT.email);
    expect(privacy).toContain(FOOTER_CONTACT.phone);
    expect(terms).toContain(COMPANY_LEGAL.legalName);
    expect(terms).toContain(COMPANY_LEGAL.vies);
    expect(terms).toContain(COMPANY_LEGAL.regon);
  });

  it("states that The Open Stock is not legal or investment advice", () => {
    const terms = legalDocumentPlainText(TERMS_DOCUMENT);
    expect(terms.toLowerCase()).toContain("not legal");
    expect(terms.toLowerCase()).toContain("investment advice");
    expect(terms.toLowerCase()).toContain("past performance");
  });

  it("does not copy agency-only claims", () => {
    const combined = LEGAL_DOCUMENTS.map(legalDocumentPlainText).join("\n");
    expect(combined.toLowerCase()).not.toContain("digital strategy");
    expect(combined.toLowerCase()).not.toContain("ui and ux mock");
    expect(combined.toLowerCase()).not.toContain("participating in courses");
    expect(combined.toLowerCase()).not.toContain("privacy shield");
    expect(combined.toLowerCase()).not.toContain("credit cards (last 3");
  });

  it("describes this product’s processors, not extra billing products", () => {
    const privacy = legalDocumentPlainText(PRIVACY_DOCUMENT);
    expect(privacy).toContain("Appwrite");
    expect(privacy).toContain("Stripe");
    expect(privacy.toLowerCase()).not.toContain("refund");
    expect(privacy.toLowerCase()).not.toContain("chargeback");
  });

  it("keeps copyrights distinct from third-party market data", () => {
    const copyrights = legalDocumentPlainText(COPYRIGHTS_DOCUMENT);
    expect(copyrights.toLowerCase()).toContain("ticker");
    expect(copyrights.toLowerCase()).toContain("all rights reserved");
  });
});
