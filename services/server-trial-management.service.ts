import { ID, Query } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";
import { assertAppwriteTrialEnv } from "@/lib/appwrite-trial-env";
import { env } from "@/lib/env";
import type { TrialSession, TrialStatus } from "@/types";

export interface TrialIdentity {
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  ipAddress?: string;
}

type TrialSessionDocument = {
  $id: string;
  fingerprint: string;
  ipAddress?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  $createdAt: string;
};

export class ServerTrialManagementService {
  private readonly durationMs: number;

  constructor() {
    this.durationMs = env.trial.durationMinutes * 60 * 1000;
  }

  async startTrial(identity: TrialIdentity): Promise<TrialSession> {
    if (!identity.fingerprint) {
      throw new Error("Missing trial fingerprint.");
    }
    const eligible = await this.checkTrialEligibility(identity);
    if (!eligible) {
      throw new Error("Trial already used on this device.");
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + this.durationMs);
    const { databaseId, sessionsCollectionId } = assertAppwriteTrialEnv();
    const { databases } = createServerClient();

    const created = (await databases.createDocument(
      databaseId,
      sessionsCollectionId,
      ID.unique(),
      {
        fingerprint: identity.fingerprint,
        ipAddress: identity.ipAddress ?? "",
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        isActive: true,
        userAgent: identity.userAgent,
        screenResolution: identity.screenResolution,
        timezone: identity.timezone,
      }
    )) as unknown as TrialSessionDocument;

    return this.toTrialSession(created);
  }

  async getTrialStatus(identity: TrialIdentity): Promise<TrialStatus> {
    const session = await this.getLatestSession(identity);
    if (!session) {
      return { isActive: false, remainingSeconds: 0, hasUsedTrial: false };
    }

    const now = Date.now();
    const endMs = new Date(session.endTime).getTime();
    const remainingSeconds = Math.max(0, Math.floor((endMs - now) / 1000));
    const isActive = session.isActive && remainingSeconds > 0;

    if (!isActive && session.isActive) {
      await this.updateSessionActiveFlag(session.$id, false);
    }

    return {
      isActive,
      remainingSeconds,
      hasUsedTrial: true,
    };
  }

  async endTrial(identity: TrialIdentity): Promise<void> {
    const session = await this.getLatestSession(identity);
    if (!session || !session.isActive) return;
    await this.updateSessionActiveFlag(session.$id, false);
  }

  async checkTrialEligibility(identity: TrialIdentity): Promise<boolean> {
    if (!identity.fingerprint) return false;
    const session = await this.getLatestSession(identity);
    return !session;
  }

  private async getLatestSession(
    identity: TrialIdentity
  ): Promise<TrialSessionDocument | null> {
    const { databaseId, sessionsCollectionId } = assertAppwriteTrialEnv();
    const { databases } = createServerClient();

    const fingerprintQueries = [
      Query.equal("fingerprint", identity.fingerprint),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ];

    const fingerprintResult = (await databases.listDocuments(
      databaseId,
      sessionsCollectionId,
      fingerprintQueries
    )) as unknown as { documents: TrialSessionDocument[] };
    if (fingerprintResult.documents.length > 0) {
      return fingerprintResult.documents[0];
    }

    if (!identity.ipAddress) {
      return null;
    }

    const ipResult = (await databases.listDocuments(
      databaseId,
      sessionsCollectionId,
      [
        Query.equal("ipAddress", identity.ipAddress),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    )) as unknown as { documents: TrialSessionDocument[] };
    return ipResult.documents[0] ?? null;
  }

  private async updateSessionActiveFlag(
    documentId: string,
    isActive: boolean
  ): Promise<void> {
    const { databaseId, sessionsCollectionId } = assertAppwriteTrialEnv();
    const { databases } = createServerClient();
    await databases.updateDocument(
      databaseId,
      sessionsCollectionId,
      documentId,
      {
        isActive,
      }
    );
  }

  private toTrialSession(doc: TrialSessionDocument): TrialSession {
    return {
      id: doc.$id,
      deviceFingerprint: doc.fingerprint,
      ipAddress: doc.ipAddress || undefined,
      startTime: new Date(doc.startTime),
      endTime: new Date(doc.endTime),
      isActive: doc.isActive,
      userAgent: doc.userAgent,
      screenResolution: doc.screenResolution,
      timezone: doc.timezone,
      createdAt: new Date(doc.$createdAt),
    };
  }
}

export const serverTrialManagementService = new ServerTrialManagementService();
