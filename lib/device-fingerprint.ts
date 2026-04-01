/**
 * Device Fingerprint Utility
 * Generates a unique fingerprint from browser characteristics.
 * Used to track trial sessions and prevent abuse.
 * Requirements: 21.3, 21.4
 */

interface BrowserCharacteristics {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  colorDepth: number;
  plugins: string;
  canvasFingerprint: string;
}

/**
 * Collect browser characteristics for fingerprinting.
 */
function collectCharacteristics(): BrowserCharacteristics {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const screen = typeof window !== "undefined" ? window.screen : null;

  return {
    userAgent: nav?.userAgent ?? "unknown",
    screenResolution: screen ? `${screen.width}x${screen.height}` : "unknown",
    timezone:
      Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone ?? "unknown",
    language: nav?.language ?? "unknown",
    platform: nav?.platform ?? "unknown",
    colorDepth: screen?.colorDepth ?? 0,
    plugins: getPluginList(nav),
    canvasFingerprint: getCanvasFingerprint(),
  };
}

function getPluginList(nav: Navigator | null): string {
  if (!nav?.plugins) return "";
  const names: string[] = [];
  for (let i = 0; i < nav.plugins.length; i++) {
    names.push(nav.plugins[i].name);
  }
  return names.sort().join(",");
}

function getCanvasFingerprint(): string {
  try {
    if (typeof document === "undefined") return "no-canvas";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-ctx";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("fingerprint", 2, 15);
    return canvas.toDataURL();
  } catch {
    return "canvas-error";
  }
}

/**
 * Simple hash function (djb2) for generating a fingerprint string.
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generate a unique device fingerprint from browser characteristics.
 * Returns a deterministic hash string.
 */
export function generateDeviceFingerprint(): string {
  const chars = collectCharacteristics();
  const raw = [
    chars.userAgent,
    chars.screenResolution,
    chars.timezone,
    chars.language,
    chars.platform,
    String(chars.colorDepth),
    chars.plugins,
    chars.canvasFingerprint,
  ].join("|");
  return hashString(raw);
}

/**
 * Get the individual browser characteristics (useful for storage).
 */
export function getBrowserCharacteristics() {
  const chars = collectCharacteristics();
  return {
    userAgent: chars.userAgent,
    screenResolution: chars.screenResolution,
    timezone: chars.timezone,
  };
}
