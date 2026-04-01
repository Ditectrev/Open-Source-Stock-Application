/**
 * POST /api/trial/start
 * Starts a new 15-minute trial session.
 * Requirements: 21.1, 21.12
 */

import { NextResponse } from "next/server";
import { trialManagementService } from "@/services/trial-management.service";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await trialManagementService.startTrial();

    return NextResponse.json({
      success: true,
      data: session,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to start trial", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to start trial session",
        timestamp: new Date(),
      },
      { status: 403 }
    );
  }
}
