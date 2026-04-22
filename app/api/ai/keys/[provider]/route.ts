import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { subscriptionService } from "@/services/subscription.service";
import { appwriteAIKeyStoreService } from "@/services/appwrite-ai-key-store.service";
import type { BYOKProvider } from "@/services/api-key-manager.service";

function isBYOKProvider(value: string): value is BYOKProvider {
  return ["OPENAI", "GEMINI", "MISTRAL", "DEEPSEEK"].includes(value);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        timestamp: new Date(),
      },
      { status: 401 }
    );
  }

  const tier = await subscriptionService.getCurrentTier(auth.id);
  if (tier !== "BYOK") {
    return NextResponse.json(
      { success: false, error: "BYOK tier required", timestamp: new Date() },
      { status: 403 }
    );
  }

  const providerParam = (await params).provider.trim().toUpperCase();
  if (!isBYOKProvider(providerParam)) {
    return NextResponse.json(
      { success: false, error: "Invalid provider", timestamp: new Date() },
      { status: 400 }
    );
  }

  await appwriteAIKeyStoreService.removeKey(auth.id, providerParam);
  return NextResponse.json({
    success: true,
    data: { provider: providerParam },
    timestamp: new Date(),
  });
}
