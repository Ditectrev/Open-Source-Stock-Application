/**
 * GET /api/trial/status
 * Returns current trial session status.
 * Requirements: 21.1, 21.12
 */

import { NextRequest, NextResponse } from "next/server";
import { parseTrialIdentity } from "@/lib/trial-request-identity";
import { serverTrialManagementService } from "@/services/server-trial-management.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const identity = parseTrialIdentity(request, {});
    const status = await serverTrialManagementService.getTrialStatus(identity);

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
