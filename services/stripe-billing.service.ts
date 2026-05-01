import Stripe from "stripe";
import type { PricingTier } from "@/types";
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
  getStripePriceByTier,
  getTierByStripePriceId,
} from "@/lib/stripe-billing-env";
import { subscriptionStoreService } from "@/services/subscription-store.service";
import type { StoredSubscriptionStatus } from "@/services/subscription-store.service";

type PaidTier = Exclude<PricingTier, "FREE">;

type SyncPayload = {
  userId: string;
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
};

const VALID_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "canceled",
  "past_due",
  "unpaid",
  "incomplete",
  "incomplete_expired",
] as const);

function normalizeSubscriptionStatus(value: string): StoredSubscriptionStatus {
  return VALID_SUBSCRIPTION_STATUSES.has(value as StoredSubscriptionStatus)
    ? (value as StoredSubscriptionStatus)
    : "canceled";
}

function requireStripeClient(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  return new Stripe(key);
}

function toIsoFromUnix(timestamp?: number): string | undefined {
  if (!timestamp || Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp * 1000).toISOString();
}

function getPeriodBounds(subscription: Stripe.Subscription): {
  start?: number;
  end?: number;
} {
  const subAny = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    items?: { data?: Array<{ current_period_start?: number; current_period_end?: number }> };
  };
  return {
    start:
      subAny.current_period_start ?? subAny.items?.data?.[0]?.current_period_start,
    end: subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end,
  };
}

export class StripeBillingService {
  createCheckoutSession(args: {
    tier: PaidTier;
    userId: string;
    email?: string;
    baseUrl: string;
  }) {
    const stripe = requireStripeClient();
    const priceId = getStripePriceByTier(args.tier);
    if (!priceId) {
      throw new Error(`Missing Stripe price for tier ${args.tier}.`);
    }

    return stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          appUserId: args.userId,
          targetTier: args.tier,
        },
      },
      success_url: `${args.baseUrl}/pricing?success=1`,
      cancel_url: `${args.baseUrl}/pricing?canceled=1`,
      customer_email: args.email,
      metadata: {
        appUserId: args.userId,
        targetTier: args.tier,
        stripePriceId: priceId,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });
  }

  async cancelActiveSubscription(userId: string): Promise<boolean> {
    const stripe = requireStripeClient();
    const current = await subscriptionStoreService.getMostRecentForUser(userId);
    if (!current?.stripeSubscriptionId) return false;

    await stripe.subscriptions.update(current.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    return true;
  }

  async createBillingPortalSession(args: {
    userId: string;
    baseUrl: string;
  }): Promise<{ url: string }> {
    const stripe = requireStripeClient();
    const current = await subscriptionStoreService.getMostRecentForUser(args.userId);
    const customerId = current?.stripeCustomerId?.trim();
    if (!customerId) {
      throw new Error("No Stripe customer found for this user.");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${args.baseUrl}/pricing`,
    });
    if (!session.url) {
      throw new Error("Failed to create billing portal session.");
    }
    return { url: session.url };
  }

  constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
    const stripe = requireStripeClient();
    const webhookSecret = getStripeWebhookSecret();
    if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  async syncFromCheckoutCompleted(session: Stripe.Checkout.Session) {
    const stripe = requireStripeClient();
    const userId = session.metadata?.appUserId;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : "";
    const customerId = typeof session.customer === "string" ? session.customer : "";
    const priceId = session.metadata?.stripePriceId ?? "";
    if (!userId || !subscriptionId) return;

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (customerId) {
      await stripe.customers.update(customerId, {
        metadata: { appUserId: userId },
      });
    }
    const bounds = getPeriodBounds(sub);
    await this.writeSubscriptionRecord({
      userId,
      subscriptionId,
      customerId,
      priceId:
        priceId || sub.items.data[0]?.price?.id || session.metadata?.stripePriceId || "",
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodStart: bounds.start,
      currentPeriodEnd: bounds.end,
    });
  }

  async syncFromSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : "";
    const priceId = subscription.items.data[0]?.price?.id ?? "";
    const userId = await this.resolveUserIdFromSubscription(subscription);
    if (!userId) return;
    const bounds = getPeriodBounds(subscription);

    await this.writeSubscriptionRecord({
      userId,
      subscriptionId: subscription.id,
      customerId,
      priceId,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: bounds.start,
      currentPeriodEnd: bounds.end,
    });
  }

  async syncFromSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = await this.resolveUserIdFromSubscription(subscription);
    if (!userId) return;
    const priceId = subscription.items.data[0]?.price?.id ?? "";
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : "";
    const bounds = getPeriodBounds(subscription);
    await this.writeSubscriptionRecord({
      userId,
      subscriptionId: subscription.id,
      customerId,
      priceId,
      status: "canceled",
      cancelAtPeriodEnd: false,
      currentPeriodStart: bounds.start,
      currentPeriodEnd: bounds.end,
    });
  }

  private async resolveUserIdFromSubscription(
    subscription: Stripe.Subscription
  ): Promise<string | null> {
    const subscriptionId = subscription.id;
    const record =
      await subscriptionStoreService.getByStripeSubscriptionId(subscriptionId);
    if (record?.userId) return record.userId;

    const metadataUserId = subscription.metadata?.appUserId?.trim();
    if (metadataUserId) return metadataUserId;

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
    if (customerId) {
      const byCustomer =
        await subscriptionStoreService.getByStripeCustomerId(customerId);
      if (byCustomer?.userId) return byCustomer.userId;

      const stripe = requireStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      if (!("deleted" in customer) || customer.deleted !== true) {
        const customerMetadataUserId = customer.metadata?.appUserId?.trim();
        if (customerMetadataUserId) return customerMetadataUserId;
      }
    }
    return null;
  }

  private async writeSubscriptionRecord(payload: SyncPayload): Promise<void> {
    await subscriptionStoreService.upsertByStripeSubscriptionId(
      payload.subscriptionId,
      {
        userId: payload.userId,
        tier: getTierByStripePriceId(payload.priceId),
        status: normalizeSubscriptionStatus(payload.status),
        stripeCustomerId: payload.customerId,
        stripeSubscriptionId: payload.subscriptionId,
        stripePriceId: payload.priceId,
        currentPeriodStart: toIsoFromUnix(payload.currentPeriodStart),
        currentPeriodEnd: toIsoFromUnix(payload.currentPeriodEnd),
        cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
      }
    );
  }
}

export const stripeBillingService = new StripeBillingService();
