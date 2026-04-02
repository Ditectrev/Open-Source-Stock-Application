/**
 * API Key Manager Service
 * Securely stores and manages user-provided API keys for the BYOK tier.
 * Keys are encrypted before storage and decrypted on retrieval.
 * Requirements: 22.12, 22.13, 22.14, 22.15
 */

import { logger } from "@/lib/logger";
import type { AIProvider } from "@/types";

export type BYOKProvider = Extract<
  AIProvider,
  "OPENAI" | "GEMINI" | "MISTRAL" | "DEEPSEEK"
>;

export interface StoredAPIKey {
  provider: BYOKProvider;
  encryptedKey: string;
  iv: string;
  addedAt: Date;
  lastValidated?: Date;
  isValid?: boolean;
}

export interface APIKeyValidationResult {
  valid: boolean;
  error?: string;
}

// Storage key prefix in localStorage
const STORAGE_PREFIX = "byok_key_";

// Validation endpoint map — each provider has a lightweight endpoint to test the key
const VALIDATION_ENDPOINTS: Record<BYOKProvider, string> = {
  OPENAI: "https://api.openai.com/v1/models",
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/models",
  MISTRAL: "https://api.mistral.ai/v1/models",
  DEEPSEEK: "https://api.deepseek.com/v1/models",
};

export class APIKeyManagerService {
  private encryptionKey: CryptoKey | null = null;

  /**
   * Derives an AES-GCM encryption key from a device-specific secret.
   * Uses the Web Crypto API — no external dependencies.
   * Requirement: 22.13
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) return this.encryptionKey;

    // Derive a stable key from a device-specific value stored in localStorage
    let secret = localStorage.getItem("byok_device_secret");
    if (!secret) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      secret = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      localStorage.setItem("byok_device_secret", secret);
    }

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("stock-exchange-byok-salt"),
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return this.encryptionKey;
  }

  /**
   * Encrypts a plaintext API key using AES-GCM.
   * Requirement: 22.13
   */
  async encrypt(
    plaintext: string
  ): Promise<{ encryptedKey: string; iv: string }> {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    return {
      encryptedKey: Buffer.from(ciphertext).toString("base64"),
      iv: Buffer.from(iv).toString("base64"),
    };
  }

  /**
   * Decrypts a stored API key.
   * Requirement: 22.13
   */
  async decrypt(encryptedKey: string, iv: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const ciphertext = Buffer.from(encryptedKey, "base64");
    const ivBytes = Buffer.from(iv, "base64");

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  }

  /**
   * Stores an API key for a provider after encrypting it.
   * Requirement: 22.13
   */
  async storeKey(provider: BYOKProvider, apiKey: string): Promise<void> {
    const { encryptedKey, iv } = await this.encrypt(apiKey);

    const stored: StoredAPIKey = {
      provider,
      encryptedKey,
      iv,
      addedAt: new Date(),
    };

    localStorage.setItem(
      `${STORAGE_PREFIX}${provider}`,
      JSON.stringify(stored)
    );

    logger.info("API key stored for provider", { provider });
  }

  /**
   * Retrieves and decrypts the stored API key for a provider.
   * Returns null if no key is stored.
   * Requirement: 22.13
   */
  async getKey(provider: BYOKProvider): Promise<string | null> {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
    if (!raw) return null;

    try {
      const stored: StoredAPIKey = JSON.parse(raw);
      return await this.decrypt(stored.encryptedKey, stored.iv);
    } catch (error) {
      logger.error("Failed to decrypt API key", error as Error, { provider });
      return null;
    }
  }

  /**
   * Removes the stored API key for a provider.
   */
  removeKey(provider: BYOKProvider): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
    logger.info("API key removed for provider", { provider });
  }

  /**
   * Returns metadata about stored keys (without decrypting them).
   */
  getStoredKeyInfo(provider: BYOKProvider): StoredAPIKey | null {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
    if (!raw) return null;
    try {
      const stored = JSON.parse(raw) as StoredAPIKey;
      return {
        ...stored,
        addedAt: new Date(stored.addedAt),
        lastValidated: stored.lastValidated
          ? new Date(stored.lastValidated)
          : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Returns which providers have keys stored.
   */
  getStoredProviders(): BYOKProvider[] {
    const providers: BYOKProvider[] = [
      "OPENAI",
      "GEMINI",
      "MISTRAL",
      "DEEPSEEK",
    ];
    return providers.filter(
      (p) => localStorage.getItem(`${STORAGE_PREFIX}${p}`) !== null
    );
  }

  /**
   * Validates an API key with the corresponding AI provider.
   * Requirement: 22.14
   */
  async validateKey(
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    const endpoint = VALIDATION_ENDPOINTS[provider];

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Each provider uses a different auth header format
      if (provider === "OPENAI" || provider === "DEEPSEEK") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      } else if (provider === "GEMINI") {
        // Gemini uses a query param — append to URL
        const url = new URL(endpoint);
        url.searchParams.set("key", apiKey);
        const response = await fetch(url.toString(), {
          method: "GET",
          signal: AbortSignal.timeout(10000),
        });
        return this.interpretValidationResponse(provider, response.status);
      } else if (provider === "MISTRAL") {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      });

      return this.interpretValidationResponse(provider, response.status);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn("API key validation request failed", {
        provider,
        error: message,
      });
      return {
        valid: false,
        error: `Could not reach ${provider} to validate key: ${message}`,
      };
    }
  }

  private interpretValidationResponse(
    provider: BYOKProvider,
    status: number
  ): APIKeyValidationResult {
    if (status === 200) {
      logger.info("API key validated successfully", { provider });
      return { valid: true };
    }
    if (status === 401 || status === 403) {
      return { valid: false, error: "Invalid API key — authentication failed" };
    }
    if (status === 429) {
      // Rate limited but key is valid
      logger.info("API key valid (rate limited during validation)", {
        provider,
      });
      return { valid: true };
    }
    return {
      valid: false,
      error: `Unexpected response from ${provider}: HTTP ${status}`,
    };
  }

  /**
   * Validates and stores an API key in one step.
   * Rejects invalid keys before storing.
   * Requirement: 22.14
   */
  async validateAndStore(
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    const validation = await this.validateKey(provider, apiKey);

    if (!validation.valid) {
      return validation;
    }

    await this.storeKey(provider, apiKey);

    // Update validation timestamp
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
    if (raw) {
      const stored = JSON.parse(raw) as StoredAPIKey;
      stored.lastValidated = new Date();
      stored.isValid = true;
      localStorage.setItem(
        `${STORAGE_PREFIX}${provider}`,
        JSON.stringify(stored)
      );
    }

    return { valid: true };
  }
}

export const apiKeyManagerService = new APIKeyManagerService();
