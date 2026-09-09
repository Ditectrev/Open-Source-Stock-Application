/**
 * GET /api/version
 * Latest GitHub release tag for the footer (falls back to package.json).
 */

import { NextResponse } from "next/server";
import { fetchLatestGitHubTag } from "@/lib/github-latest-tag";
import { logger } from "@/lib/logger";

export const revalidate = 3600;

export async function GET() {
  try {
    const version = await fetchLatestGitHubTag();
    return NextResponse.json({
      success: true,
      version,
    });
  } catch (error) {
    logger.error("Failed to fetch latest GitHub tag", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "Could not load the latest version.",
      },
      { status: 500 }
    );
  }
}
