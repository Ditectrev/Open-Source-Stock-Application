import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigation } from "@/components/Navigation";

// Mock child components to keep tests focused
vi.mock("@/components/SearchBar", () => ({
  SearchBar: ({
    onSelect,
    placeholder,
  }: {
    onSelect?: (s: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="search-bar"
      placeholder={placeholder}
      onChange={(e) => onSelect?.(e.target.value)}
    />
  ),
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}));

describe("Navigation", () => {
  it("renders all nav links", () => {
    render(<Navigation />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Sectors")).toBeInTheDocument();
    expect(screen.getByText("Calendars")).toBeInTheDocument();
    expect(screen.getByText("Heatmaps")).toBeInTheDocument();
    expect(screen.getByText("Screener")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("highlights the active section", () => {
    render(<Navigation activeSection="sectors" />);
    const sectorsBtn = screen.getAllByText("Sectors")[0];
    expect(sectorsBtn).toHaveAttribute("aria-current", "page");
  });

  it("calls onSectionChange when a nav link is clicked", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    render(<Navigation onSectionChange={onSectionChange} />);

    await user.click(screen.getAllByText("Calendars")[0]);
    expect(onSectionChange).toHaveBeenCalledWith("calendars");
  });

  it("renders search bar", () => {
    render(<Navigation />);
    expect(screen.getAllByTestId("search-bar").length).toBeGreaterThan(0);
  });

  it("renders theme toggle", () => {
    render(<Navigation />);
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByLabelText("Toggle navigation menu");
    expect(screen.queryByText("mobile-nav-menu")).not.toBeInTheDocument();

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  it("has proper navigation landmark", () => {
    render(<Navigation />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Main navigation"
    );
  });
});
