/**
 * TrialBanner Component Tests
 * Tests for trial banner display, expiration prompt, and authentication flow trigger.
 * Requirements: 21.9, 21.12
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { TrialBanner, TrialBannerProps } from "../TrialBanner";

// Mock the trial management service
vi.mock("@/services/trial-management.service", () => ({
  trialManagementService: {
    getTrialStatus: vi.fn(),
    endTrial: vi.fn(),
  },
}));

const { postEmailOtpSendMock, postEmailOtpVerifyMock } = vi.hoisted(() => ({
  postEmailOtpSendMock: vi.fn(() =>
    Promise.resolve({ ok: true as const, userId: "test_user_id" })
  ),
  postEmailOtpVerifyMock: vi.fn(() =>
    Promise.resolve({ ok: true as const })
  ),
}));

vi.mock("@/lib/auth/trial-auth-navigation", () => ({
  postEmailOtpSend: postEmailOtpSendMock,
  postEmailOtpVerify: postEmailOtpVerifyMock,
}));

import { trialManagementService } from "@/services/trial-management.service";

const mockGetTrialStatus = trialManagementService.getTrialStatus as ReturnType<
  typeof vi.fn
>;
const mockEndTrial = trialManagementService.endTrial as ReturnType<
  typeof vi.fn
>;

function renderBanner(overrides: Partial<TrialBannerProps> = {}) {
  const props: TrialBannerProps = { ...overrides };
  return render(<TrialBanner {...props} />);
}

describe("TrialBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Active trial display ---

  it("should display trial banner when trial is active", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(screen.getByTestId("trial-banner")).toBeDefined();
    expect(screen.getByText("Trial session")).toBeDefined();
  });

  it("should display the countdown timer when active (Req 21.9)", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 300,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(screen.getByTestId("trial-timer")).toBeDefined();
    expect(screen.getByTestId("trial-timer-display").textContent).toBe("5:00");
  });

  it("should show sign-in button during active trial", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 900,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(screen.getByTestId("trial-sign-in-btn")).toBeDefined();
  });

  // --- Trial not active / no trial ---

  it("should not display banner when trial is inactive and not used", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: false,
      remainingSeconds: 0,
      hasUsedTrial: false,
    });

    renderBanner();
    expect(screen.queryByTestId("trial-banner")).toBeNull();
    expect(screen.queryByTestId("trial-expired-banner")).toBeNull();
  });

  // --- Expiration prompt (Req 21.12) ---

  it("should show expired banner when trial was used and is inactive", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: false,
      remainingSeconds: 0,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(screen.getByTestId("trial-expired-banner")).toBeDefined();
    expect(screen.getByText(/Trial expired/)).toBeDefined();
  });

  it("should show expired banner with sign-in link after timer expires", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 2,
      hasUsedTrial: true,
    });

    renderBanner();

    // Advance past expiration
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId("trial-expired-banner")).toBeDefined();
    expect(screen.getByTestId("trial-expired-sign-in")).toBeDefined();
  });

  it("should call endTrial on the service when timer expires", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 1,
      hasUsedTrial: true,
    });

    renderBanner();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockEndTrial).toHaveBeenCalled();
  });

  // --- Authentication flow trigger ---

  it("should open auth prompt when sign-in button is clicked during trial", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));

    expect(screen.getByTestId("auth-prompt")).toBeDefined();
  });

  it("should open auth prompt when expired sign-in link is clicked", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: false,
      remainingSeconds: 0,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-expired-sign-in"));

    expect(screen.getByTestId("auth-prompt")).toBeDefined();
  });

  it("should show auth prompt with all three providers", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));

    expect(screen.getByTestId("auth-apple")).toBeDefined();
    expect(screen.getByTestId("auth-google")).toBeDefined();
    expect(screen.getByTestId("auth-email-btn")).toBeDefined();
  });

  it("should close auth prompt when close button is clicked", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));
    expect(screen.getByTestId("auth-prompt")).toBeDefined();

    fireEvent.click(screen.getByTestId("auth-close"));
    expect(screen.queryByTestId("auth-prompt")).toBeNull();
  });

  // --- onAuthenticated callback ---

  it("should expose Apple OAuth link to the API starter route", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));
    expect(screen.getByTestId("auth-apple")).toHaveAttribute(
      "href",
      "/api/auth/oauth/apple"
    );
  });

  it("should expose Google OAuth link to the API starter route", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));
    expect(screen.getByTestId("auth-google")).toHaveAttribute(
      "href",
      "/api/auth/oauth/google"
    );
  });

  it("should call onAuthenticated after the email verification code is submitted", async () => {
    vi.useRealTimers();
    postEmailOtpSendMock.mockClear();
    postEmailOtpVerifyMock.mockClear();
    postEmailOtpSendMock.mockResolvedValueOnce({
      ok: true,
      userId: "uid_otp_test",
    });
    postEmailOtpVerifyMock.mockResolvedValueOnce({ ok: true });

    const onAuthenticated = vi.fn();
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner({ onAuthenticated });
    fireEvent.click(screen.getByTestId("trial-sign-in-btn"));
    fireEvent.click(screen.getByTestId("auth-email-btn"));
    fireEvent.change(screen.getByTestId("auth-email-input"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByTestId("auth-email-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-otp-input")).toBeDefined();
    });

    fireEvent.change(screen.getByTestId("auth-otp-input"), {
      target: { value: "512646" },
    });
    fireEvent.click(screen.getByTestId("auth-verify-submit"));

    await waitFor(() => {
      expect(onAuthenticated).toHaveBeenCalledOnce();
    });
    expect(postEmailOtpSendMock).toHaveBeenCalledWith("user@example.com");
    expect(postEmailOtpVerifyMock).toHaveBeenCalledWith(
      "uid_otp_test",
      "512646"
    );

    vi.useFakeTimers();
  });

  // --- Accessibility ---

  it("should have role=status on active trial banner", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: true,
      remainingSeconds: 600,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(screen.getByTestId("trial-banner").getAttribute("role")).toBe(
      "status"
    );
  });

  it("should have role=alert on expired banner", () => {
    mockGetTrialStatus.mockReturnValue({
      isActive: false,
      remainingSeconds: 0,
      hasUsedTrial: true,
    });

    renderBanner();
    expect(
      screen.getByTestId("trial-expired-banner").getAttribute("role")
    ).toBe("alert");
  });
});
