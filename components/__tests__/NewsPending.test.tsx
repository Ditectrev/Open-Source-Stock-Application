import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { NewsPendingScope } from "@/components/NewsPending";

describe("NewsPendingScope", () => {
  it("shows a loading overlay as soon as a news link is clicked", async () => {
    const user = userEvent.setup();
    render(
      <NewsPendingScope resetKey="/news">
        <Link href="/news?page=2">
          <span>Next</span>
        </Link>
      </NewsPendingScope>
    );

    expect(screen.queryByTestId("news-loading-overlay")).toBeNull();
    await user.click(screen.getByRole("link", { name: "Next" }));
    expect(screen.getByTestId("news-loading-overlay")).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Loading headlines..." })
    ).toBeInTheDocument();
  });
});
