import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarHub } from "@/components/CalendarHub";

// Mock theme
vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

// Mock fetch for calendar data
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
  })
) as unknown as typeof fetch;

describe("CalendarHub", () => {
  it("renders the calendar hub with navigation", () => {
    render(<CalendarHub />);
    expect(screen.getByTestId("calendar-hub")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-navigation")).toBeInTheDocument();
  });

  it("defaults to economic calendar", () => {
    render(<CalendarHub />);
    expect(
      screen.getByTestId("calendar-tab-economic")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("switches to earnings calendar on tab click", async () => {
    render(<CalendarHub />);
    fireEvent.click(screen.getByTestId("calendar-tab-earnings"));
    expect(
      screen.getByTestId("calendar-tab-earnings")
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByTestId("calendar-tab-economic")
    ).toHaveAttribute("aria-selected", "false");
  });

  it("switches to dividends calendar on tab click", () => {
    render(<CalendarHub />);
    fireEvent.click(screen.getByTestId("calendar-tab-dividends"));
    expect(
      screen.getByTestId("calendar-tab-dividends")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("switches to IPOs calendar on tab click", () => {
    render(<CalendarHub />);
    fireEvent.click(screen.getByTestId("calendar-tab-ipos"));
    expect(
      screen.getByTestId("calendar-tab-ipos")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("accepts a defaultCalendar prop", () => {
    render(<CalendarHub defaultCalendar="ipos" />);
    expect(
      screen.getByTestId("calendar-tab-ipos")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("renders the Calendars heading", () => {
    render(<CalendarHub />);
    expect(screen.getByText("Calendars")).toBeInTheDocument();
  });
});
