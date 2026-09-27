import { describe, expect, it } from "vitest";
import {
  GLOSSARY_CATEGORIES,
  glossaryCategories,
  glossaryTermSlug,
} from "@/lib/glossary-content";

describe("glossary-content", () => {
  it("exposes stock, ETF, and crypto categories", () => {
    const ids = glossaryCategories().map((c) => c.id);
    expect(ids).toContain("stocks");
    expect(ids).toContain("etfs");
    expect(ids).toContain("crypto");
  });

  it("includes at least one term per category", () => {
    for (const category of GLOSSARY_CATEGORIES) {
      expect(category.terms.length).toBeGreaterThan(0);
      for (const term of category.terms) {
        expect(term.term.trim().length).toBeGreaterThan(0);
        expect(term.definition.trim().length).toBeGreaterThan(20);
      }
    }
  });

  it("slugifies terms for in-page anchors", () => {
    expect(glossaryTermSlug("Earnings per share (EPS)")).toBe(
      "earnings-per-share-eps"
    );
    expect(glossaryTermSlug("24/7 market")).toBe("24-7-market");
  });
});
