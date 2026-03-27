/**
 * LoadingSpinner Component Tests
 * Tests for rendering, size variants, message display, and accessibility.
 *
 * Requirements: 14.1
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeDefined();
    expect(spinner.getAttribute("role")).toBe("status");
  });

  it("should have accessible label defaulting to 'Loading'", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner.getAttribute("aria-label")).toBe("Loading");
    expect(screen.getByText("Loading")).toBeDefined(); // sr-only text
  });

  it("should display a custom message below the spinner", () => {
    render(<LoadingSpinner message="Fetching data..." />);
    const messages = screen.getAllByText("Fetching data...");
    expect(messages.length).toBe(2); // visible <p> + sr-only <span>
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner.getAttribute("aria-label")).toBe("Fetching data...");
  });

  it("should render small size variant", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinnerCircle = container.querySelector(".animate-spin");
    expect(spinnerCircle?.classList.contains("h-5")).toBe(true);
    expect(spinnerCircle?.classList.contains("w-5")).toBe(true);
  });

  it("should render medium size variant (default)", () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerCircle = container.querySelector(".animate-spin");
    expect(spinnerCircle?.classList.contains("h-8")).toBe(true);
    expect(spinnerCircle?.classList.contains("w-8")).toBe(true);
  });

  it("should render large size variant", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinnerCircle = container.querySelector(".animate-spin");
    expect(spinnerCircle?.classList.contains("h-12")).toBe(true);
    expect(spinnerCircle?.classList.contains("w-12")).toBe(true);
  });

  it("should apply additional className", () => {
    render(<LoadingSpinner className="py-8" />);
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner.classList.contains("py-8")).toBe(true);
  });

  it("should include sr-only text for screen readers", () => {
    render(<LoadingSpinner message="Loading chart" />);
    const srOnly = screen.getByText("Loading chart", {
      selector: ".sr-only",
    });
    expect(srOnly).toBeDefined();
  });

  it("should not render message paragraph when no message provided", () => {
    const { container } = render(<LoadingSpinner />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });
});
