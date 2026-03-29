import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CalendarNavigation,
  CalendarType,
} from "@/components/CalendarNavigation";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

describe("CalendarNavigation", () => {
  const defaultProps = {
    activeCalendar: "economic" as CalendarType,
    onCalendarChange: vi.fn(),
  };

  it("renders all four calendar tabs", () => {
    render(<CalendarNavigation {...defaultProps} />);
    expect(screen.getByTestId("calendar-tab-economic")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-tab-earnings")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-tab-dividends")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-tab-ipos")).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", () => {
    render(<CalendarNavigation {...defaultProps} />);
    expect(screen.getByTestId("calendar-tab-economic")).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("calendar-tab-earnings")).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onCalendarChange when a tab is clicked", () => {
    const onChange = vi.fn();
    render(
      <CalendarNavigation
        activeCalendar="economic"
        onCalendarChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId("calendar-tab-dividends"));
    expect(onChange).toHaveBeenCalledWith("dividends");
  });

  it("renders with tablist role for accessibility", () => {
    render(<CalendarNavigation {...defaultProps} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("switches active styling when activeCalendar changes", () => {
    const { rerender } = render(<CalendarNavigation {...defaultProps} />);
    expect(screen.getByTestId("calendar-tab-economic")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    rerender(
      <CalendarNavigation
        activeCalendar="ipos"
        onCalendarChange={defaultProps.onCalendarChange}
      />
    );
    expect(screen.getByTestId("calendar-tab-economic")).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByTestId("calendar-tab-ipos")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
