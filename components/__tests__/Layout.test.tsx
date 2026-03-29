import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Layout } from "@/components/Layout";

// Mock Navigation to keep Layout tests focused
vi.mock("@/components/Navigation", () => ({
  Navigation: (props: Record<string, unknown>) => (
    <nav data-testid="navigation" data-active={props.activeSection}>
      Navigation
    </nav>
  ),
}));

vi.mock("@/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe("Layout", () => {
  it("renders navigation, main content area, and children", () => {
    render(
      <Layout>
        <div>Page content</div>
      </Layout>
    );

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders trial banner when provided", () => {
    render(
      <Layout trialBanner={<div>Trial expires in 10:00</div>}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText("Trial expires in 10:00")).toBeInTheDocument();
  });

  it("does not render trial banner slot when not provided", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("wraps children in ErrorBoundary", () => {
    render(
      <Layout>
        <div>Protected content</div>
      </Layout>
    );

    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("forwards navigation props", () => {
    render(
      <Layout navigationProps={{ activeSection: "sectors" }}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId("navigation")).toHaveAttribute(
      "data-active",
      "sectors"
    );
  });
});
