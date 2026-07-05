import Stripe from "stripe";
import { env } from "./env";
import { getDb } from "../queries/connection";
import { subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";
import { setUserStripeCustomerId, findUserById } from "../queries/users";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY).");
  }
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey);
  }
  return _stripe;
}

const PRICE_BY_PLAN: Record<"annual" | "monthly", () => string> = {
  annual: () => env.stripePriceAnnual,
  monthly: () => env.stripePriceMonthly,
};

/**
 * Create (or reuse) a Stripe customer for a parent and start a Checkout
 * Session for the chosen subscription plan. Returns the hosted Checkout URL.
 */
export async function createCheckoutSession(opts: {
  parentId: number;
  email: string | null;
  name: string | null;
  plan: "annual" | "monthly";
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const priceId = PRICE_BY_PLAN[opts.plan]();
  if (!priceId) {
    throw new Error(
      `No Stripe price configured for the "${opts.plan}" plan. Set STRIPE_PRICE_${opts.plan.toUpperCase()}.`,
    );
  }

  // Reuse an existing Stripe customer if we have one on file.
  const user = await findUserById(opts.parentId);
  let customerId = user?.stripeCustomerId ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: opts.email ?? undefined,
      name: opts.name ?? undefined,
      metadata: { parentId: String(opts.parentId) },
    });
    customerId = customer.id;
    await setUserStripeCustomerId(opts.parentId, customerId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.appUrl}/#/parent-dashboard?checkout=success`,
    cancel_url: `${env.appUrl}/#/settings?checkout=cancelled`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { parentId: String(opts.parentId), plan: opts.plan },
    },
    metadata: { parentId: String(opts.parentId), plan: opts.plan },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }
  return { url: session.url, sessionId: session.id };
}

/**
 * Create a Billing Portal session so a customer can manage/cancel their plan.
 */
export async function createBillingPortalSession(
  customerId: string,
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.appUrl}/#/settings`,
  });
  return session.url;
}

/**
 * Verify and process a Stripe webhook event. Keeps our subscriptions table in
 * sync with the source of truth in Stripe.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string,
): Promise<void> {
  const stripe = getStripe();
  if (!env.stripeWebhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const parentId = Number(session.metadata?.parentId);
      const plan = (session.metadata?.plan as "annual" | "monthly") ?? "annual";
      if (!parentId) break;

      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const custId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      await upsertSubscription({
        parentId,
        plan,
        status: "active",
        stripeSubscriptionId: subId,
        stripeCustomerId: custId,
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const parentId = Number(sub.metadata?.parentId);
      if (!parentId) break;

      const status = mapStripeStatus(sub.status);
      const periodEnd = (sub as unknown as { current_period_end?: number })
        .current_period_end;

      await getDb()
        .update(subscriptions)
        .set({
          status,
          stripeSubscriptionId: sub.id,
          autoRenew: !sub.cancel_at_period_end,
          ...(periodEnd
            ? { expiresAt: new Date(periodEnd * 1000) }
            : {}),
          ...(sub.status === "canceled" ? { cancelledAt: new Date() } : {}),
        })
        .where(eq(subscriptions.parentId, parentId));
      break;
    }

    default:
      // Ignore other event types.
      break;
  }
}

function mapStripeStatus(
  s: Stripe.Subscription.Status,
): "incomplete" | "active" | "cancelled" | "expired" | "past_due" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "incomplete_expired":
      return "expired";
    default:
      return "incomplete";
  }
}

async function upsertSubscription(data: {
  parentId: number;
  plan: "annual" | "monthly";
  status: "active";
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}) {
  const amount = data.plan === "annual" ? "75.00" : "9.99";
  const expiresAt = new Date(
    Date.now() +
      (data.plan === "annual" ? 365 : 31) * 24 * 60 * 60 * 1000,
  );

  const existing = await getDb().query.subscriptions.findFirst({
    where: eq(subscriptions.parentId, data.parentId),
  });

  if (existing) {
    await getDb()
      .update(subscriptions)
      .set({
        plan: data.plan,
        status: data.status,
        amount,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        expiresAt,
        cancelledAt: null,
      })
      .where(eq(subscriptions.id, existing.id));
    return;
  }

  await getDb().insert(subscriptions).values({
    parentId: data.parentId,
    plan: data.plan,
    status: data.status,
    amount,
    stripeSubscriptionId: data.stripeSubscriptionId,
    stripeCustomerId: data.stripeCustomerId,
    expiresAt,
  });
}
