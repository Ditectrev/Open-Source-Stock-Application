/**
 * PUT /api/subscription/upgrade
 * Upgrades the user to a higher pricing tier. Takes effect immediately.
 * Requirements: 22.24, 22.26
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
    const { newTier, paymentMethod } = body as {
      newTier: PricingTier;
      paymentMethod?: string;
    };

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

    const result = await subscriptionService.upgradeTier(
      userId,
      newTier,
      paymentMethod
    );

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
    logger.error("Failed to upgrade subscription", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upgrade subscription",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
