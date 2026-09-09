import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLatestGitHubTag, GITHUB_REPO } from "@/lib/github-latest-tag";
import { normalizeReleaseTag } from "@/lib/release-tag";
import packageJson from "../../package.json";

describe("normalizeReleaseTag", () => {
  it("strips a leading v and ignores blank values", () => {
    expect(normalizeReleaseTag("v0.69.0")).toBe("0.69.0");
    expect(normalizeReleaseTag("0.69.0")).toBe("0.69.0");
    expect(normalizeReleaseTag("  v1.2.3  ")).toBe("1.2.3");
    expect(normalizeReleaseTag("")).toBe(packageJson.version);
    expect(normalizeReleaseTag(undefined)).toBe(packageJson.version);
  });
});

describe("fetchLatestGitHubTag", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the latest GitHub release tag", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tag_name: "v0.69.0" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchLatestGitHubTag()).resolves.toBe("0.69.0");
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain(
      `/repos/${GITHUB_REPO}/releases/latest`
    );
  });

  it("falls back to the newest git tag when releases/latest fails", async () => {
    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes("/releases/latest")) {
        return { ok: false, status: 404, json: async () => ({}) };
      }
      return {
        ok: true,
        json: async () => [{ name: "v0.69.0" }],
      };
    });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(fetchLatestGitHubTag()).resolves.toBe("0.69.0");
    expect(String(fetchSpy.mock.calls[1]?.[0])).toContain(
      `/repos/${GITHUB_REPO}/tags`
    );
  });

  it("falls back to package.json when GitHub is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    await expect(fetchLatestGitHubTag()).resolves.toBe(packageJson.version);
  });
});
