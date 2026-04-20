import { NextRequest } from "next/server";
import type { TrialIdentity } from "@/services/server-trial-management.service";

type PartialIdentityInput = {
  fingerprint?: string;
  userAgent?: string;
  screenResolution?: string;
  timezone?: string;
  /** Public IP (or client-side fallback id) from browser — same idea as Practice-Tests-Exams-Platform useSecureTrial getUserIP. */
  ipAddress?: string;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function extractIpAddress(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  return cf || undefined;
}

export function parseTrialIdentity(
  request: NextRequest,
  input: PartialIdentityInput
): TrialIdentity {
  const fingerprint =
    normalize(input.fingerprint) ||
    normalize(request.headers.get("x-trial-fingerprint"));
  const userAgent =
    normalize(input.userAgent) ||
    normalize(request.headers.get("user-agent")) ||
    "unknown";
  const screenResolution =
    normalize(input.screenResolution) ||
    normalize(request.headers.get("x-trial-screen-resolution")) ||
    "unknown";
  const timezone =
    normalize(input.timezone) ||
    normalize(request.headers.get("x-trial-timezone")) ||
    "unknown";

  if (!fingerprint) {
    throw new Error("Missing trial fingerprint in request.");
  }

  const clientIp =
    normalize(input.ipAddress) ||
    normalize(request.headers.get("x-trial-client-ip"));
  const serverIp = extractIpAddress(request);

  return {
    fingerprint,
    userAgent,
    screenResolution,
    timezone,
    ipAddress: clientIp || serverIp,
  };
}
