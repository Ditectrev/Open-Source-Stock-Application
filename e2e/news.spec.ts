import { test, expect } from "./fixtures";

test.describe("News", () => {
  test("hub lists stock news in the first HTML response", async ({ page }) => {
    await page.goto("/news");
    await expect(
      page.getByRole("heading", { level: 1, name: "Stock market news" })
    ).toBeVisible();
    const story = page.locator('[data-testid="news-hub"] h2 a').first();
    await expect(story).toBeVisible({ timeout: 15_000 });
    await expect(story).toHaveAttribute("href", /\/news\//);
    expect(
      await page.locator('script[type="application/ld+json"]').count()
    ).toBeGreaterThan(0);
    const next = page.getByRole("link", { name: "Next" });
    if ((await next.count()) > 0) {
      await next.click();
      await expect(page).toHaveURL(/page=2/);
      await expect(
        page.locator('[data-testid="news-hub"] h2 a').first()
      ).toBeVisible();
    }
  });

  test("article page is server-rendered with mentioned tickers when present", async ({
    page,
  }) => {
    await page.goto("/news");
    const story = page.locator('[data-testid="news-hub"] h2 a').first();
    await expect(story).toBeVisible({ timeout: 15_000 });
    await story.click();
    await expect(page).toHaveURL(/\/news\/.+/, { timeout: 15_000 });
    const article = page.getByTestId("news-article");
    await expect(article.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      article.getByRole("heading", { name: "Research this headline" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Read full story" })
    ).toBeVisible();

    const mentioned = page.getByTestId("mentioned-stocks");
    if ((await mentioned.count()) > 0) {
      const ticker = mentioned.getByRole("link").first();
      await ticker.click();
      await expect(page).toHaveURL(/\?symbol=/, { timeout: 15_000 });
    }
  });
});
