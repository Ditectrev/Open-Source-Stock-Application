/**
 * Home Page Unit Tests
 * Tests for component rendering and navigation links
 *
 * Requirements: 9.1, 10.1
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock theme context
vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/dynamic to render simple placeholders instead of lazy-loaded components
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: () => Promise<any>, opts?: any) => {
    const MockComponent = (props: any) => (
      <div data-testid="dynamic-component" />
    );
    MockComponent.displayName = "DynamicMock";
    return MockComponent;
  },
}));

// Mock child components to isolate home page testing
vi.mock("@/components/Navigation", () => ({
  Navigation: ({
    activeSection,
    onSectionChange,
    onSymbolSelect,
  }: {
    activeSection?: string;
    onSectionChange?: (section: string) => void;
    onSymbolSelect?: (symbol: string) => void;
  }) => (
    <nav data-testid="navigation" data-active-section={activeSection}>
      <button data-testid="nav-home" onClick={() => onSectionChange?.("home")}>
        Home
      </button>
      <button
        data-testid="nav-sectors"
        onClick={() => onSectionChange?.("sectors")}
      >
        Sectors
      </button>
      <button
        data-testid="nav-heatmaps"
        onClick={() => onSectionChange?.("heatmaps")}
      >
        Heatmaps
      </button>
      <button
        data-testid="nav-screener"
        onClick={() => onSectionChange?.("screener")}
      >
        Screener
      </button>
      <button
        data-testid="nav-calendars"
        onClick={() => onSectionChange?.("calendars")}
      >
        Calendars
      </button>
      <button
        data-testid="nav-select-symbol"
        onClick={() => onSymbolSelect?.("AAPL")}
      >
        Select AAPL
      </button>
    </nav>
  ),
}));

vi.mock("@/components/SymbolHeader", () => ({
  SymbolHeader: ({ symbolData }: any) => (
    <div data-testid="symbol-header">{symbolData?.name}</div>
  ),
}));

vi.mock("@/components/TabNavigation", () => ({
  TabNavigation: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => (
    <div data-testid="tab-navigation" data-active-tab={activeTab}>
      {["overview", "financials", "technicals", "forecasts", "seasonals"].map(
        (tab) => (
          <button
            key={tab}
            data-testid={`tab-${tab}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        )
      )}
    </div>
  ),
}));

vi.mock("@/components/LoadingSpinner", () => ({
  LoadingSpinner: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

// Mock react-github-btn
vi.mock("react-github-btn", () => ({
  __esModule: true,
  default: () => <span data-testid="github-button">Star</span>,
}));

// Mock package.json
vi.mock("../../package.json", () => ({
  __esModule: true,
  default: { version: "1.0.0" },
}));

// Mock IntersectionObserver as a proper class
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    // Immediately trigger as intersecting so LazySection renders children
    setTimeout(() => {
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();

// Mock fetch
global.fetch = vi.fn();

import Home from "../page";

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
    window.scrollTo = vi.fn();
  });

  describe("Component rendering", () => {
    it("renders the navigation component", () => {
      render(<Home />);
      expect(screen.getByTestId("navigation")).toBeInTheDocument();
    });

    it("renders the dashboard quick links (no symbol selected)", () => {
      render(<Home />);
      // Quick links appear alongside nav buttons, so use getAllByText
      expect(screen.getAllByText("Sectors").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Heatmaps").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Screener").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Calendars").length).toBeGreaterThanOrEqual(2);
    });

    it("renders quick link descriptions", () => {
      render(<Home />);
      expect(
        screen.getByText("Compare sector performance")
      ).toBeInTheDocument();
      expect(screen.getByText("Visual market overview")).toBeInTheDocument();
      expect(screen.getByText("Filter and find assets")).toBeInTheDocument();
      expect(
        screen.getByText("Earnings, dividends & IPOs")
      ).toBeInTheDocument();
    });

    it("renders section containers for dashboard sections", () => {
      render(<Home />);
      expect(document.getElementById("section-home")).toBeInTheDocument();
      expect(document.getElementById("section-sectors")).toBeInTheDocument();
      expect(document.getElementById("section-heatmaps")).toBeInTheDocument();
      expect(document.getElementById("section-screener")).toBeInTheDocument();
      expect(document.getElementById("section-calendars")).toBeInTheDocument();
    });

    it("does not render symbol detail view when no symbol is selected", () => {
      render(<Home />);
      expect(screen.queryByTestId("symbol-header")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tab-navigation")).not.toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    it("navigates to sectors section via navigation bar", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-sectors"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "sectors"
      );
    });

    it("navigates to heatmaps section via navigation bar", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-heatmaps"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "heatmaps"
      );
    });

    it("navigates to screener section via navigation bar", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-screener"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "screener"
      );
    });

    it("navigates to calendars section via navigation bar", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-calendars"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "calendars"
      );
    });

    it("returns to home when Home nav is clicked", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-sectors"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "sectors"
      );
      fireEvent.click(screen.getByTestId("nav-home"));
      expect(screen.getByTestId("navigation")).toHaveAttribute(
        "data-active-section",
        "home"
      );
    });

    it("scrolls to top when Home nav is clicked", () => {
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-home"));
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: "smooth",
      });
    });
  });

  describe("Symbol selection", () => {
    it("shows loading state when a symbol is selected", async () => {
      (global.fetch as any).mockImplementation(() => new Promise(() => {}));
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-select-symbol"));
      await waitFor(() => {
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      });
    });

    it("shows error state when symbol fetch fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      });
      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-select-symbol"));
      await waitFor(() => {
        expect(screen.getByText("Error Loading Symbol")).toBeInTheDocument();
      });
    });

    it("shows symbol detail view when data loads successfully", async () => {
      const mockSymbolData = {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 175.5,
        change: 2.3,
        changePercent: 1.33,
        marketCap: 2800000000000,
        volume: 55000000,
        fiftyTwoWeekHigh: 199.62,
        fiftyTwoWeekLow: 124.17,
        lastUpdated: new Date().toISOString(),
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockSymbolData }),
      });

      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-select-symbol"));

      await waitFor(() => {
        expect(screen.getByTestId("symbol-header")).toBeInTheDocument();
        expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
        expect(screen.getByTestId("tab-navigation")).toBeInTheDocument();
      });
    });

    it("has a Clear Selection button on error that returns to dashboard", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      });

      render(<Home />);
      fireEvent.click(screen.getByTestId("nav-select-symbol"));

      await waitFor(() => {
        expect(screen.getByText("Clear Selection")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Clear Selection"));

      await waitFor(() => {
        expect(
          screen.getByText("Compare sector performance")
        ).toBeInTheDocument();
      });
    });
  });
});
