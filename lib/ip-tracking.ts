/**
 * IP Tracking Service
 * Retrieves user IP address with multiple provider fallbacks.
 * Falls back to localStorage, then device fingerprint + timestamp.
 * Requirements: 21.6, 21.7, 21.8
 */

import { env } from "@/lib/env";
import { generateDeviceFingerprint } from "@/lib/device-fingerprint";

const STORAGE_KEY = "trial_ip_identifier";

/**
 * Attempt to fetch IP from a single provider.
 */
async function fetchIP(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    // Different providers return IP in different fields
    return data.ip || data.query || null;
  } catch {
    return null;
  }
}

/**
 * Try multiple IP service providers in order.
 * Returns the IP string or null if all fail.
 */
async function fetchIPFromProviders(): Promise<string | null> {
  const providers = [
    env.ipServices.primary,
    env.ipServices.secondary,
    env.ipServices.tertiary,
  ];

  for (const url of providers) {
    const ip = await fetchIP(url);
    if (ip) return ip;
  }
  return null;
}

/**
 * Fallback: read identifier from localStorage.
 */
function getLocalStorageFallback(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Fallback: save identifier to localStorage.
 */
function setLocalStorageFallback(identifier: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, identifier);
    }
  } catch {
    // localStorage unavailable (e.g. incognito in some browsers)
  }
}

/**
 * Get a user identifier for trial tracking.
 * Priority: IP address → localStorage → device fingerprint + timestamp.
 */
export async function getUserIdentifier(): Promise<string> {
  // 1. Try IP services
  const ip = await fetchIPFromProviders();
  if (ip) {
    setLocalStorageFallback(ip);
    return ip;
  }

  // 2. Fallback to localStorage
  const stored = getLocalStorageFallback();
  if (stored) return stored;

  // 3. Final fallback: device fingerprint + timestamp
  const fingerprint = generateDeviceFingerprint();
  const identifier = `${fingerprint}-${Date.now()}`;
  setLocalStorageFallback(identifier);
  return identifier;
}
