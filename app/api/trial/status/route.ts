/**
 * GET /api/trial/status
 * Returns current trial session status.
 * Requirements: 21.1, 21.12
 */

import { NextResponse } from "next/server";
import { trialManagementService } from "@/services/trial-management.service";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const status = trialManagementService.getTrialStatus();

    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to get trial status", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get trial status",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
