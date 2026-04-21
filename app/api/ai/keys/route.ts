import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { subscriptionService } from "@/services/subscription.service";
import { appwriteAIKeyStoreService } from "@/services/appwrite-ai-key-store.service";
import type { BYOKProvider } from "@/services/api-key-manager.service";

function isBYOKProvider(value: string): value is BYOKProvider {
  return ["OPENAI", "GEMINI", "MISTRAL", "DEEPSEEK"].includes(value);
}

async function getAuthorizedBYOKUser(request: NextRequest): Promise<
  | { userId: string }
  | { response: NextResponse }
> {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return {
      response: NextResponse.json(
        { success: false, error: "Authentication required", timestamp: new Date() },
        { status: 401 }
      ),
    };
  }

  const tier = await subscriptionService.getCurrentTier(auth.id);
  if (tier !== "BYOK") {
    return {
      response: NextResponse.json(
        { success: false, error: "BYOK tier required", timestamp: new Date() },
        { status: 403 }
      ),
    };
  }

  return { userId: auth.id };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedBYOKUser(request);
  if ("response" in auth) return auth.response;

  const rows = await appwriteAIKeyStoreService.listStoredKeyInfo(auth.userId);
  return NextResponse.json({
    success: true,
    data: rows.map((r) => ({
      provider: r.provider,
      addedAt: r.addedAt,
      lastValidated: r.lastValidated,
    })),
    timestamp: new Date(),
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedBYOKUser(request);
  if ("response" in auth) return auth.response;

  const body = (await request.json()) as { provider?: string; apiKey?: string };
  const provider = body.provider?.trim().toUpperCase() ?? "";
  const apiKey = body.apiKey?.trim() ?? "";

  if (!isBYOKProvider(provider) || !apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "provider and apiKey are required",
        timestamp: new Date(),
      },
      { status: 400 }
    );
  }

  const result = await appwriteAIKeyStoreService.validateAndStore(
    auth.userId,
    provider,
    apiKey
  );
  if (!result.valid) {
    return NextResponse.json(
      {
        success: false,
        error: result.error ?? "Invalid API key",
        timestamp: new Date(),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { provider },
    timestamp: new Date(),
  });
}
