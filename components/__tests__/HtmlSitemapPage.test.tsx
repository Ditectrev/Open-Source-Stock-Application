import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HtmlSitemapPage } from "@/components/HtmlSitemapPage";
import { FOOTER_RESOURCES, FOOTER_TOOLS } from "@/lib/footer-content";

describe("HtmlSitemapPage", () => {
  it("renders grouped links for tools and resources", () => {
    render(<HtmlSitemapPage />);
    expect(screen.getByTestId("sitemap-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Sitemap" })
    ).toBeInTheDocument();
    for (const item of [...FOOTER_TOOLS, ...FOOTER_RESOURCES]) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href
      );
    }
  });
});
