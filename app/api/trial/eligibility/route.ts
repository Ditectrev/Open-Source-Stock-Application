/**
 * GET /api/trial/eligibility
 * Checks if the current device is eligible for a trial.
 * Requirements: 21.1, 21.12
 */

import { NextResponse } from "next/server";
import { trialManagementService } from "@/services/trial-management.service";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const eligible = await trialManagementService.checkTrialEligibility();

    return NextResponse.json({
      success: true,
      data: { eligible },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to check trial eligibility", error as Error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check trial eligibility",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
