import packageJson from "../package.json";
import { normalizeReleaseTag } from "@/lib/release-tag";

export const GITHUB_REPO = "Ditectrev/Open-Source-Stock-Application";

const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "TheOpenStock/1.0",
} as const;

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: GITHUB_API_HEADERS,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Latest published GitHub release tag, falling back to the newest git tag,
 * then package.json. Source of truth for the footer version.
 */
export async function fetchLatestGitHubTag(): Promise<string> {
  try {
    const release = (await fetchJson(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
    )) as { tag_name?: string };
    if (release.tag_name) {
      return normalizeReleaseTag(release.tag_name);
    }
  } catch {
    // Fall through to the tags endpoint (tags can exist without a GitHub Release).
  }

  try {
    const tags = (await fetchJson(
      `https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=1`
    )) as Array<{ name?: string }>;
    if (Array.isArray(tags) && tags[0]?.name) {
      return normalizeReleaseTag(tags[0].name);
    }
  } catch {
    // Fall through to package.json.
  }

  return packageJson.version;
}
