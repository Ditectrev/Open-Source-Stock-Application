import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarDateRangePicker } from "@/components/CalendarDateRangePicker";

vi.mock("@/lib/theme-context", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayStr = toDateString(new Date());

describe("CalendarDateRangePicker", () => {
  const defaultProps = {
    startDate: todayStr,
    endDate: "",
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  };

  it("renders start and end date inputs", () => {
    render(<CalendarDateRangePicker {...defaultProps} />);
    expect(screen.getByTestId("start-date")).toBeInTheDocument();
    expect(screen.getByTestId("end-date")).toBeInTheDocument();
  });

  it("renders a Today button", () => {
    render(<CalendarDateRangePicker {...defaultProps} />);
    expect(screen.getByTestId("today-button")).toBeInTheDocument();
  });

  it("calls onStartDateChange and onEndDateChange when Today is clicked", () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    render(
      <CalendarDateRangePicker
        startDate="2025-01-01"
        endDate="2025-12-31"
        onStartDateChange={onStart}
        onEndDateChange={onEnd}
      />
    );
    fireEvent.click(screen.getByTestId("today-button"));
    expect(onStart).toHaveBeenCalledWith(todayStr);
    expect(onEnd).toHaveBeenCalledWith("");
  });

  it("calls onStartDateChange when start date input changes", () => {
    const onStart = vi.fn();
    render(
      <CalendarDateRangePicker
        {...defaultProps}
        onStartDateChange={onStart}
      />
    );
    fireEvent.change(screen.getByTestId("start-date"), {
      target: { value: "2025-06-01" },
    });
    expect(onStart).toHaveBeenCalledWith("2025-06-01");
  });

  it("calls onEndDateChange when end date input changes", () => {
    const onEnd = vi.fn();
    render(
      <CalendarDateRangePicker
        {...defaultProps}
        onEndDateChange={onEnd}
      />
    );
    fireEvent.change(screen.getByTestId("end-date"), {
      target: { value: "2025-12-31" },
    });
    expect(onEnd).toHaveBeenCalledWith("2025-12-31");
  });

  it("uses custom idPrefix for input ids", () => {
    const { container } = render(
      <CalendarDateRangePicker {...defaultProps} idPrefix="test" />
    );
    expect(container.querySelector("#test-start-date")).toBeInTheDocument();
    expect(container.querySelector("#test-end-date")).toBeInTheDocument();
  });
});
