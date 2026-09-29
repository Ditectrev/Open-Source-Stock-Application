import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import {
  COPYRIGHTS_DOCUMENT,
  PRIVACY_DOCUMENT,
  TERMS_DOCUMENT,
} from "@/lib/legal-content";

describe("LegalDocumentPage", () => {
  it("renders copyrights sections", () => {
    render(<LegalDocumentPage document={COPYRIGHTS_DOCUMENT} />);
    expect(screen.getByTestId("copyrights-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Copyrights" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Content" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Licensing" })
    ).toBeInTheDocument();
  });

  it("renders privacy contact details", () => {
    render(<LegalDocumentPage document={PRIVACY_DOCUMENT} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy & Security" })
    ).toBeInTheDocument();
    const mailLinks = screen.getAllByRole("link", {
      name: "contact@ditectrev.com",
    });
    expect(mailLinks.length).toBeGreaterThan(0);
    for (const link of mailLinks) {
      expect(link).toHaveAttribute("href", "mailto:contact@ditectrev.com");
    }
  });

  it("highlights the not-advice disclaimer on terms", () => {
    render(<LegalDocumentPage document={TERMS_DOCUMENT} />);
    expect(screen.getByTestId("not-advice-callout")).toHaveTextContent(
      /not legal, tax, accounting, or investment advice/i
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Disclaimers" })
    ).toBeInTheDocument();
  });
});
