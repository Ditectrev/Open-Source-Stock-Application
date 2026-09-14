import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsHub } from "@/components/NewsHub";

const ARTICLES = [
  {
    id: "abc",
    slug: "yh-abc",
    title: "McDonald's same-store sales rise",
    summary: "The burger chain beat estimates.",
    source: "Reuters",
    sourceUrl: "https://example.com/mcd-story",
    publishedAt: "2024-01-15T12:00:00.000Z",
    mentionedSymbols: ["MCD"],
  },
];

describe("NewsHub", () => {
  it("lists headlines without loading article bodies", () => {
    render(<NewsHub articles={ARTICLES} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Stock market news",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "McDonald's same-store sales rise" })
    ).toHaveAttribute("href", "/news/yh-abc");
    expect(screen.queryByText("The burger chain beat estimates.")).toBeNull();
    expect(screen.queryByRole("link", { name: /MCD/ })).toBeNull();
    expect(screen.getByRole("link", { name: "RSS" })).toHaveAttribute(
      "href",
      "/news/rss.xml"
    );
  });

  it("labels a symbol-filtered hub", () => {
    render(<NewsHub articles={ARTICLES} symbolFilter="MCD" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "MCD stock news" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "All market news" })
    ).toHaveAttribute("href", "/news");
    expect(screen.getByRole("link", { name: "RSS" })).toHaveAttribute(
      "href",
      "/news/rss.xml"
    );
  });

  it("paginates headlines", () => {
    render(<NewsHub articles={ARTICLES} page={1} totalPages={2} />);
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/news?page=2"
    );
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });
});
