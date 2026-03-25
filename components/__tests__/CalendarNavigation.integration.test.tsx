/**
 * Calendar Navigation Integration Tests
 * Tests calendar type switching, date range selection, and symbol navigation
 * across the CalendarHub integration surface.
 *
 * Requirements: 24.2, 24.22, 24.24
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalendarHub } from "@/components/CalendarHub";
import { EarningsEvent, DividendEvent } from "@/types";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ theme: "light", resolvedTheme: "light", setTheme: vi.fn() }),
}));

const now = new Date();
const daysFromNow = (d: number) =>
  new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const mockEarnings: EarningsEvent[] = [
  {
    id: "e1",
    symbol: "AAPL",
    companyName: "Apple Inc.",
    date: daysFromNow(1),
    epsEstimate: 1.43,
  },
  {
    id: "e2",
    symbol: "MSFT",
    companyName: "Microsoft Corp.",
    date: daysFromNow(2),
    epsEstimate: 2.82,
  },
];

const mockDividends: DividendEvent[] = [
  {
    id: "d1",
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    amount: 1.19,
    exDividendDate: daysFromNow(1),
    paymentDate: daysFromNow(15),
    yield: 2.8,
    frequency: "quarterly",
  },
];

const emptyApiResponse = {
  ok: true,
  json: async () => ({ success: true, data: [] }),
};

const earningsApiResponse = {
  ok: true,
  json: async () => ({ success: true, data: mockEarnings }),
};

const dividendsApiResponse = {
  ok: true,
  json: async () => ({ success: true, data: mockDividends }),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default: return empty data for all calendar fetches
  global.fetch = vi.fn((url: string | URL | Request) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    if (urlStr.includes("/api/calendar/earnings")) {
      return Promise.resolve(earningsApiResponse);
    }
    if (urlStr.includes("/api/calendar/dividends")) {
      return Promise.resolve(dividendsApiResponse);
    }
    return Promise.resolve(emptyApiResponse);
  }) as unknown as typeof fetch;
});

describe("Calendar Navigation Integration", () => {
  // --- Calendar type switching (Req 24.2) ---

  describe("calendar type switching", () => {
    it("defaults to economic calendar tab", () => {
      render(<CalendarHub />);
      expect(
        screen.getByTestId("calendar-tab-economic")
      ).toHaveAttribute("aria-selected", "true");
    });

    it("switches from economic to earnings calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      expect(
        screen.getByTestId("calendar-tab-earnings")
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByTestId("calendar-tab-economic")
      ).toHaveAttribute("aria-selected", "false");

      await waitFor(() => {
        expect(screen.getByTestId("earnings-calendar")).toBeInTheDocument();
      });
    });

    it("switches from economic to dividends calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-dividends"));

      expect(
        screen.getByTestId("calendar-tab-dividends")
      ).toHaveAttribute("aria-selected", "true");

      await waitFor(() => {
        expect(screen.getByTestId("dividend-calendar")).toBeInTheDocument();
      });
    });

    it("switches from economic to IPOs calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-ipos"));

      expect(
        screen.getByTestId("calendar-tab-ipos")
      ).toHaveAttribute("aria-selected", "true");

      await waitFor(() => {
        expect(screen.getByTestId("ipo-calendar")).toBeInTheDocument();
      });
    });

    it("cycles through all calendar types sequentially", async () => {
      render(<CalendarHub />);

      // economic → earnings
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));
      await waitFor(() => {
        expect(screen.getByTestId("earnings-calendar")).toBeInTheDocument();
      });

      // earnings → dividends
      fireEvent.click(screen.getByTestId("calendar-tab-dividends"));
      await waitFor(() => {
        expect(screen.getByTestId("dividend-calendar")).toBeInTheDocument();
      });

      // dividends → ipos
      fireEvent.click(screen.getByTestId("calendar-tab-ipos"));
      await waitFor(() => {
        expect(screen.getByTestId("ipo-calendar")).toBeInTheDocument();
      });

      // ipos → economic
      fireEvent.click(screen.getByTestId("calendar-tab-economic"));
      await waitFor(() => {
        expect(screen.getByTestId("economic-calendar")).toBeInTheDocument();
      });
    });

    it("only renders one calendar panel at a time", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByTestId("earnings-calendar")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("economic-calendar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("dividend-calendar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ipo-calendar")).not.toBeInTheDocument();
    });
  });

  // --- Date range selection (Req 24.22) ---

  describe("date range selection", () => {
    it("renders date range picker in earnings calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(
          screen.getByTestId("calendar-date-range-picker")
        ).toBeInTheDocument();
      });
    });

    it("renders date range picker in dividends calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-dividends"));

      await waitFor(() => {
        expect(
          screen.getByTestId("calendar-date-range-picker")
        ).toBeInTheDocument();
      });
    });

    it("filters earnings events when date range is narrowed", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
        expect(screen.getByText("Microsoft Corp.")).toBeInTheDocument();
      });

      // Narrow to only the first event's date
      const targetDate = toDateString(daysFromNow(1));
      fireEvent.change(screen.getByTestId("start-date"), {
        target: { value: targetDate },
      });
      fireEvent.change(screen.getByTestId("end-date"), {
        target: { value: targetDate },
      });

      expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
      expect(screen.queryByText("Microsoft Corp.")).not.toBeInTheDocument();
    });

    it("Today button resets date range in earnings calendar", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByTestId("today-button")).toBeInTheDocument();
      });

      // Set a custom range first
      fireEvent.change(screen.getByTestId("start-date"), {
        target: { value: "2020-01-01" },
      });
      fireEvent.change(screen.getByTestId("end-date"), {
        target: { value: "2020-12-31" },
      });

      // Click Today to reset
      fireEvent.click(screen.getByTestId("today-button"));

      const todayStr = toDateString(new Date());
      expect(screen.getByTestId("start-date")).toHaveValue(todayStr);
    });
  });

  // --- Symbol navigation (Req 24.24) ---

  describe("symbol navigation", () => {
    it("calls onSymbolClick when clicking a symbol in earnings calendar", async () => {
      const onSymbolClick = vi.fn();
      render(<CalendarHub onSymbolClick={onSymbolClick} />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("symbol-e1"));
      expect(onSymbolClick).toHaveBeenCalledWith("AAPL");
    });

    it("calls onSymbolClick when clicking a symbol in dividends calendar", async () => {
      const onSymbolClick = vi.fn();
      render(<CalendarHub onSymbolClick={onSymbolClick} />);
      fireEvent.click(screen.getByTestId("calendar-tab-dividends"));

      await waitFor(() => {
        expect(screen.getByText("JNJ")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("symbol-d1"));
      expect(onSymbolClick).toHaveBeenCalledWith("JNJ");
    });

    it("does not throw when onSymbolClick is not provided", async () => {
      render(<CalendarHub />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
      });

      // Should not throw
      expect(() => {
        fireEvent.click(screen.getByTestId("symbol-e1"));
      }).not.toThrow();
    });

    it("passes correct symbol for each entry in earnings calendar", async () => {
      const onSymbolClick = vi.fn();
      render(<CalendarHub onSymbolClick={onSymbolClick} />);
      fireEvent.click(screen.getByTestId("calendar-tab-earnings"));

      await waitFor(() => {
        expect(screen.getByText("AAPL")).toBeInTheDocument();
        expect(screen.getByText("MSFT")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("symbol-e1"));
      expect(onSymbolClick).toHaveBeenCalledWith("AAPL");

      fireEvent.click(screen.getByTestId("symbol-e2"));
      expect(onSymbolClick).toHaveBeenCalledWith("MSFT");
    });
  });
});
