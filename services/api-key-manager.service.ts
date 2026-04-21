/**
 * API Key Manager Service
 * Browser client for server-side BYOK key management APIs.
 * Requirements: 22.12, 22.13, 22.14, 22.15
 */
import type { AIProvider } from "@/types";

export type BYOKProvider = Extract<
  AIProvider,
  "OPENAI" | "GEMINI" | "MISTRAL" | "DEEPSEEK"
>;

export interface StoredAPIKey {
  provider: BYOKProvider;
  addedAt: Date;
  lastValidated?: Date;
}

export interface APIKeyValidationResult {
  valid: boolean;
  error?: string;
}

export class APIKeyManagerService {
  async validateAndStore(
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    try {
      const response = await fetch("/api/ai/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !data.success) {
        return { valid: false, error: data.error ?? "Failed to store API key" };
      }
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Failed to store API key",
      };
    }
  }

  async removeKey(provider: BYOKProvider): Promise<void> {
    await fetch(`/api/ai/keys/${provider}`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async getStoredKeyInfo(provider: BYOKProvider): Promise<StoredAPIKey | null> {
    const all = await this.listStoredKeyInfo();
    return all.find((x) => x.provider === provider) ?? null;
  }

  async listStoredKeyInfo(): Promise<StoredAPIKey[]> {
    const response = await fetch("/api/ai/keys", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) return [];
    const data = (await response.json().catch(() => ({}))) as {
      data?: Array<{ provider: BYOKProvider; addedAt: string; lastValidated?: string }>;
    };
    const rows = data.data ?? [];
    return rows.map((row) => ({
      provider: row.provider,
      addedAt: new Date(row.addedAt),
      lastValidated: row.lastValidated ? new Date(row.lastValidated) : undefined,
    }));
  }

  async getKey(_provider: BYOKProvider): Promise<string | null> {
    // BYOK keys are now server-managed and never returned to the browser.
    return null;
  }

  async validateKey(
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    return this.validateAndStore(provider, apiKey);
  }

  getStoredProviders(): BYOKProvider[] {
    return [];
  }
}

export const apiKeyManagerService = new APIKeyManagerService();
