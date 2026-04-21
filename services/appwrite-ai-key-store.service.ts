import { createHash, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { ID, Query } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";
import { assertAppwriteAIEnv } from "@/lib/appwrite-ai-env";
import { getAppwriteServerEnv } from "@/lib/appwrite-server-env";
import type { BYOKProvider, APIKeyValidationResult } from "@/services/api-key-manager.service";

type AIKeyDocument = {
  $id: string;
  userId: string;
  provider: BYOKProvider;
  encryptedKey: string;
  iv: string;
  lastValidatedAt?: string;
  $createdAt: string;
};

const VALIDATION_ENDPOINTS: Record<BYOKProvider, string> = {
  OPENAI: "https://api.openai.com/v1/models",
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/models",
  MISTRAL: "https://api.mistral.ai/v1/models",
  DEEPSEEK: "https://api.deepseek.com/v1/models",
};

function getEncryptionKeyBuffer(): Buffer {
  const { apiKey, projectId } = getAppwriteServerEnv();
  const secret = `${apiKey}:${projectId}:byok:v1`;
  return createHash("sha256").update(secret).digest();
}

function encryptValue(plaintext: string): { encryptedKey: string; iv: string } {
  const iv = randomBytes(12);
  const key = getEncryptionKeyBuffer();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encryptedKey: Buffer.concat([ciphertext, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

function decryptValue(encryptedKey: string, iv: string): string {
  const raw = Buffer.from(encryptedKey, "base64");
  const ivBuffer = Buffer.from(iv, "base64");
  const key = getEncryptionKeyBuffer();
  const ciphertext = raw.subarray(0, raw.length - 16);
  const tag = raw.subarray(raw.length - 16);

  const decipher = createDecipheriv("aes-256-gcm", key, ivBuffer);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

export class AppwriteAIKeyStoreService {
  async getPreferredProvider(userId: string): Promise<BYOKProvider | null> {
    const rows = await this.listStoredKeyInfo(userId);
    return rows[0]?.provider ?? null;
  }

  private async findDocByUserProvider(
    userId: string,
    provider: BYOKProvider
  ): Promise<AIKeyDocument | null> {
    const { databaseId, keysCollectionId } = assertAppwriteAIEnv();
    const { databases } = createServerClient();
    const result = (await databases.listDocuments(databaseId, keysCollectionId, [
      Query.equal("userId", userId),
      Query.equal("provider", provider),
      Query.limit(1),
    ])) as unknown as { documents: AIKeyDocument[] };
    return result.documents[0] ?? null;
  }

  async listStoredKeyInfo(userId: string): Promise<
    Array<{
      provider: BYOKProvider;
      addedAt: Date;
      lastValidated?: Date;
    }>
  > {
    const { databaseId, keysCollectionId } = assertAppwriteAIEnv();
    const { databases } = createServerClient();
    const result = (await databases.listDocuments(databaseId, keysCollectionId, [
      Query.equal("userId", userId),
      Query.limit(100),
    ])) as unknown as { documents: AIKeyDocument[] };

    return result.documents.map((doc) => ({
      provider: doc.provider,
      addedAt: new Date(doc.$createdAt),
      lastValidated: doc.lastValidatedAt
        ? new Date(doc.lastValidatedAt)
        : undefined,
    }));
  }

  async getDecryptedKey(
    userId: string,
    provider: BYOKProvider
  ): Promise<string | null> {
    const doc = await this.findDocByUserProvider(userId, provider);
    if (!doc) return null;
    return decryptValue(doc.encryptedKey, doc.iv);
  }

  async removeKey(userId: string, provider: BYOKProvider): Promise<void> {
    const { databaseId, keysCollectionId } = assertAppwriteAIEnv();
    const { databases } = createServerClient();
    const doc = await this.findDocByUserProvider(userId, provider);
    if (!doc) return;
    await databases.deleteDocument(databaseId, keysCollectionId, doc.$id);
  }

  async validateKey(
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    const endpoint = VALIDATION_ENDPOINTS[provider];
    try {
      if (provider === "GEMINI") {
        const url = new URL(endpoint);
        url.searchParams.set("key", apiKey);
        const response = await fetch(url.toString(), {
          method: "GET",
          signal: AbortSignal.timeout(10000),
        });
        return this.interpretValidationStatus(provider, response.status);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      });
      return this.interpretValidationStatus(provider, response.status);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        valid: false,
        error: `Could not reach ${provider} to validate key: ${message}`,
      };
    }
  }

  async validateAndStore(
    userId: string,
    provider: BYOKProvider,
    apiKey: string
  ): Promise<APIKeyValidationResult> {
    const validation = await this.validateKey(provider, apiKey);
    if (!validation.valid) {
      return validation;
    }
    await this.storeKey(userId, provider, apiKey);
    return { valid: true };
  }

  private async storeKey(
    userId: string,
    provider: BYOKProvider,
    apiKey: string
  ): Promise<void> {
    const { databaseId, keysCollectionId } = assertAppwriteAIEnv();
    const { databases } = createServerClient();
    const encrypted = encryptValue(apiKey);
    const existing = await this.findDocByUserProvider(userId, provider);
    const payload = {
      userId,
      provider,
      encryptedKey: encrypted.encryptedKey,
      iv: encrypted.iv,
      lastValidatedAt: new Date().toISOString(),
    };

    if (existing) {
      await databases.updateDocument(
        databaseId,
        keysCollectionId,
        existing.$id,
        payload
      );
      return;
    }

    await databases.createDocument(
      databaseId,
      keysCollectionId,
      ID.unique(),
      payload
    );
  }

  private interpretValidationStatus(
    provider: BYOKProvider,
    status: number
  ): APIKeyValidationResult {
    if (status === 200 || status === 429) return { valid: true };
    if (status === 401 || status === 403) {
      return { valid: false, error: "Invalid API key - authentication failed" };
    }
    return {
      valid: false,
      error: `Unexpected response from ${provider}: HTTP ${status}`,
    };
  }
}

export const appwriteAIKeyStoreService = new AppwriteAIKeyStoreService();
