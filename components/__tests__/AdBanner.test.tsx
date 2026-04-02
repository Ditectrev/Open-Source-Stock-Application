/**
 * Unit tests for AdBanner component
 * Tests ads show for Free tier and are hidden for paid tiers
 * Task 17.3 - Requirements: 22.5, 22.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdBanner } from "../AdBanner";
import { PricingTier } from "@/types";
import { AdPlacement } from "@/services/ads.service";

// Mock the ads service
vi.mock("@/services/ads.service", () => ({
  adsService: {
    shouldShowAds: vi.fn((tier: PricingTier) => tier === "FREE"),
    getAdConfig: vi.fn(() => ({
      placement: "banner-top",
      slotId: "top-banner-001",
      width: 728,
      height: 90,
    })),
    trackImpression: vi.fn(),
    trackClick: vi.fn(),
  },
  AdPlacement: {},
}));

const PAID_TIERS: PricingTier[] = ["ADS_FREE", "LOCAL", "BYOK", "HOSTED_AI"];
const TEST_PLACEMENT: AdPlacement = "banner-top";

describe("AdBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Free tier", () => {
    it("renders the ad unit for FREE tier", () => {
      render(<AdBanner placement={TEST_PLACEMENT} tier="FREE" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("displays the Advertisement label for FREE tier", () => {
      render(<AdBanner placement={TEST_PLACEMENT} tier="FREE" />);
      expect(screen.getByText("Advertisement")).toBeInTheDocument();
    });

    it("has correct aria-label for accessibility", () => {
      render(<AdBanner placement={TEST_PLACEMENT} tier="FREE" />);
      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "Advertisement"
      );
    });

    it("applies custom className when provided", () => {
      render(
        <AdBanner placement={TEST_PLACEMENT} tier="FREE" className="my-4" />
      );
      expect(screen.getByRole("complementary")).toHaveClass("my-4");
    });
  });

  describe("Paid tiers — ads hidden", () => {
    it.each(PAID_TIERS)(
      "renders nothing for %s tier (Requirement 22.7)",
      (tier) => {
        const { container } = render(
          <AdBanner placement={TEST_PLACEMENT} tier={tier} />
        );
        expect(container).toBeEmptyDOMElement();
      }
    );
  });

  describe("Ad placements", () => {
    const placements: AdPlacement[] = [
      "banner-top",
      "banner-bottom",
      "sidebar",
      "inline",
    ];

    it.each(placements)(
      "renders ad for FREE tier at %s placement",
      (placement) => {
        render(<AdBanner placement={placement} tier="FREE" />);
        expect(screen.getByRole("complementary")).toBeInTheDocument();
      }
    );

    it.each(placements)(
      "hides ad for ADS_FREE tier at %s placement",
      (placement) => {
        const { container } = render(
          <AdBanner placement={placement} tier="ADS_FREE" />
        );
        expect(container).toBeEmptyDOMElement();
      }
    );
  });
});
