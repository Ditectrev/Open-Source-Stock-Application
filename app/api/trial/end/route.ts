/**
 * POST /api/trial/end
 * Ends the current trial session.
 * Requirements: 21.1, 21.12
 */

import { NextResponse } from "next/server";
import { trialManagementService } from "@/services/trial-management.service";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    trialManagementService.endTrial();

    return NextResponse.json({
      success: true,
      data: { ended: true },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to end trial", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to end trial session",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
