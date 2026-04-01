/**
 * DELETE /api/subscription/cancel
 * Cancels the user's subscription. Access maintained until billing period ends.
 * Requirements: 22.27
 */

import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

export async function DELETE(request: NextRequest) {
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

    const result = await subscriptionService.cancelSubscription(userId);

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
      data: {
        message:
          "Subscription cancelled. Access maintained until end of billing period.",
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Failed to cancel subscription", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel subscription",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
