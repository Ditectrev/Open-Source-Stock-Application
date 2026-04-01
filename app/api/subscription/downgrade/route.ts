/**
 * PUT /api/subscription/downgrade
 * Downgrades the user to a lower tier, effective at end of billing period.
 * Requirements: 22.27
 */

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription.service";
import { logger } from "@/lib/logger";
import { PricingTier } from "@/types";

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { newTier } = body as { newTier: PricingTier };

    if (!newTier) {
      return NextResponse.json(
        {
          success: false,
          error: "newTier is required",
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const result = await subscriptionService.downgradeTier(userId, newTier);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.subscription,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to downgrade subscription", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to downgrade subscription",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
