/**
 * GET /api/trial/eligibility
 * Checks if the current device is eligible for a trial.
 * Requirements: 21.1, 21.12
 */

import { NextRequest, NextResponse } from "next/server";
import { parseTrialIdentity } from "@/lib/trial-request-identity";
import { serverTrialManagementService } from "@/services/server-trial-management.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const identity = parseTrialIdentity(request, {});
    const eligible =
      await serverTrialManagementService.checkTrialEligibility(identity);

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
