import { ID, Query } from "node-appwrite";
import { createServerClient } from "@/lib/appwrite";
import { assertAppwriteSubscriptionEnv } from "@/lib/appwrite-subscription-env";
import type { PricingTier } from "@/types";

export type StoredSubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

type SubscriptionDocument = {
  $id: string;
  userId: string;
  tier: PricingTier;
  status: StoredSubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  $updatedAt: string;
};

export type SubscriptionRecord = {
  id: string;
  userId: string;
  tier: PricingTier;
  status: StoredSubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
};

function toRecord(doc: SubscriptionDocument): SubscriptionRecord {
  return {
    id: doc.$id,
    userId: doc.userId,
    tier: doc.tier,
    status: doc.status,
    stripeCustomerId: doc.stripeCustomerId,
    stripeSubscriptionId: doc.stripeSubscriptionId,
    stripePriceId: doc.stripePriceId,
    currentPeriodStart: doc.currentPeriodStart,
    currentPeriodEnd: doc.currentPeriodEnd,
    cancelAtPeriodEnd: doc.cancelAtPeriodEnd === true,
  };
}

export class SubscriptionStoreService {
  private getClient() {
    const { databaseId, subscriptionsCollectionId } =
      assertAppwriteSubscriptionEnv();
    const { databases } = createServerClient();
    return { databases, databaseId, subscriptionsCollectionId };
  }

  async getMostRecentForUser(
    userId: string
  ): Promise<SubscriptionRecord | null> {
    const { databases, databaseId, subscriptionsCollectionId } =
      this.getClient();
    const result = (await databases.listDocuments(
      databaseId,
      subscriptionsCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    )) as unknown as { documents: SubscriptionDocument[] };

    const doc = result.documents[0];
    return doc ? toRecord(doc) : null;
  }

  async upsertByStripeSubscriptionId(
    stripeSubscriptionId: string,
    payload: Omit<SubscriptionRecord, "id">
  ): Promise<void> {
    const { databases, databaseId, subscriptionsCollectionId } =
      this.getClient();
    const existing = (await databases.listDocuments(
      databaseId,
      subscriptionsCollectionId,
      [
        Query.equal("stripeSubscriptionId", stripeSubscriptionId),
        Query.limit(1),
      ]
    )) as unknown as { documents: SubscriptionDocument[] };

    const data = {
      userId: payload.userId,
      tier: payload.tier,
      status: payload.status,
      stripeCustomerId: payload.stripeCustomerId ?? "",
      stripeSubscriptionId: payload.stripeSubscriptionId ?? "",
      stripePriceId: payload.stripePriceId ?? "",
      currentPeriodStart: payload.currentPeriodStart ?? null,
      currentPeriodEnd: payload.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
    };

    if (existing.documents.length > 0) {
      await databases.updateDocument(
        databaseId,
        subscriptionsCollectionId,
        existing.documents[0].$id,
        data
      );
      return;
    }

    await databases.createDocument(
      databaseId,
      subscriptionsCollectionId,
      ID.unique(),
      data
    );
  }

  async getByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionRecord | null> {
    const { databases, databaseId, subscriptionsCollectionId } =
      this.getClient();
    const result = (await databases.listDocuments(
      databaseId,
      subscriptionsCollectionId,
      [
        Query.equal("stripeSubscriptionId", stripeSubscriptionId),
        Query.limit(1),
      ]
    )) as unknown as { documents: SubscriptionDocument[] };
    const doc = result.documents[0];
    return doc ? toRecord(doc) : null;
  }

  async getByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<SubscriptionRecord | null> {
    const { databases, databaseId, subscriptionsCollectionId } =
      this.getClient();
    const result = (await databases.listDocuments(
      databaseId,
      subscriptionsCollectionId,
      [
        Query.equal("stripeCustomerId", stripeCustomerId),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    )) as unknown as { documents: SubscriptionDocument[] };
    const doc = result.documents[0];
    return doc ? toRecord(doc) : null;
  }
}

export const subscriptionStoreService = new SubscriptionStoreService();
