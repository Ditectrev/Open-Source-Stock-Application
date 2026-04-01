/**
 * GET /api/subscription/current
 * Returns the current user's subscription tier.
 * Requirements: 22.8
 */

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          timestamp: new Date(),
        },
        { status: 401 }
      );
    }

    const tier = await subscriptionService.getCurrentTier(userId);

    return NextResponse.json({
      success: true,
      data: { tier },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to fetch current subscription", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch current subscription",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
