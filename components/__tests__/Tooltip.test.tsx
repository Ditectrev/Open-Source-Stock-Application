import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "@/components/Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children without tooltip initially", () => {
    render(
      <Tooltip content="Helpful info">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter after delay", async () => {
    render(
      <Tooltip content="Helpful info" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    await userEvent.hover(screen.getByText("Hover me"));
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful info");
  });

  it("hides tooltip on mouse leave", async () => {
    render(
      <Tooltip content="Helpful info" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    await userEvent.hover(screen.getByText("Hover me"));
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await userEvent.unhover(screen.getByText("Hover me"));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus for keyboard accessibility", async () => {
    render(
      <Tooltip content="Focus info" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    );

    const trigger = screen
      .getByText("Focus me")
      .closest("[tabindex]") as HTMLElement;
    act(() => {
      trigger.focus();
    });
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByRole("tooltip")).toHaveTextContent("Focus info");
  });

  it("sets aria-describedby when tooltip is visible", async () => {
    render(
      <Tooltip content="Described" delay={0}>
        <button>Target</button>
      </Tooltip>
    );

    await userEvent.hover(screen.getByText("Target"));
    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole("tooltip");
    const trigger = screen
      .getByText("Target")
      .closest("[aria-describedby]") as HTMLElement;
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("renders in different positions", async () => {
    const { rerender } = render(
      <Tooltip content="Top" position="top" delay={0}>
        <span>T</span>
      </Tooltip>
    );

    await userEvent.hover(screen.getByText("T"));
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole("tooltip").className).toContain("bottom-full");

    rerender(
      <Tooltip content="Bottom" position="bottom" delay={0}>
        <span>T</span>
      </Tooltip>
    );
    expect(screen.getByRole("tooltip").className).toContain("top-full");
  });
});
