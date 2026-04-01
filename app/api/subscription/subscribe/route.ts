/**
 * POST /api/subscription/subscribe
 * Creates a new subscription for the authenticated user.
 * Requirements: 22.8, 22.17
 */

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription.service";
import { logger } from "@/lib/logger";
import { PricingTier } from "@/types";

export async function POST(request: NextRequest) {
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
    const { tier, paymentMethod } = body as {
      tier: PricingTier;
      paymentMethod?: string;
    };

    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          error: "tier is required",
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const result = await subscriptionService.subscribeTier(
      userId,
      tier,
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
    logger.error("Failed to create subscription", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create subscription",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
