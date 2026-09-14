import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MentionedStocks } from "@/components/MentionedStocks";
import { NewsLinkedText } from "@/components/NewsLinkedText";
import { NewsArticleView } from "@/components/NewsArticleView";

const MCD_ARTICLE = {
  id: "abc",
  slug: "yh-abc",
  title: "McDonald's same-store sales rise",
  summary: "McDonald's beat estimates while Starbucks lagged.",
  source: "Reuters",
  sourceUrl: "https://example.com/mcd-story",
  publishedAt: "2024-01-15T12:00:00.000Z",
  mentionedSymbols: ["MCD", "SBUX"],
};

describe("MentionedStocks", () => {
  it("links tickers to the quote page", () => {
    render(<MentionedStocks symbols={["MCD"]} />);
    expect(
      screen.getByRole("heading", { name: "Mentioned stocks in this article" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /MCD/ })).toHaveAttribute(
      "href",
      "/?symbol=MCD"
    );
  });
});

describe("NewsLinkedText", () => {
  it("hyperlinks company names in article copy", () => {
    render(
      <NewsLinkedText text="McDonald's beat estimates." symbols={["MCD"]} />
    );
    expect(screen.getByRole("link", { name: /McDonald/i })).toHaveAttribute(
      "href",
      "/?symbol=MCD"
    );
  });
});

describe("NewsArticleView", () => {
  it("renders the article and Bloomberg-style mentioned stocks", () => {
    render(<NewsArticleView article={MCD_ARTICLE} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /McDonald's same-store sales rise/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Research this headline" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cite Reuters as the reporter/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The Open Stock is a news aggregator/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mentioned stocks in this article" })
    ).toBeInTheDocument();
    const mentioned = screen.getByTestId("mentioned-stocks");
    expect(
      within(mentioned).getByRole("link", { name: /MCD/ })
    ).toHaveAttribute("href", "/?symbol=MCD");
    expect(
      within(mentioned).getByRole("link", { name: /SBUX/ })
    ).toHaveAttribute("href", "/?symbol=SBUX");
    expect(
      screen.getByRole("link", { name: "Read full story" })
    ).toHaveAttribute("href", "https://example.com/mcd-story");
    expect(screen.queryByRole("img")).toBeNull();
  });
});
