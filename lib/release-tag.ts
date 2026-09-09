import packageJson from "../package.json";

export function normalizeReleaseTag(tag: string | undefined | null): string {
  const trimmed = String(tag ?? "").trim();
  if (!trimmed) return packageJson.version;
  return trimmed.replace(/^v/i, "");
}
