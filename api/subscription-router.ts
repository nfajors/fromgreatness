import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";
import { stripeEnabled } from "./lib/env";
import {
  createCheckoutSession,
  createBillingPortalSession,
  getStripe,
} from "./lib/stripe";

export const subscriptionRouter = createRouter({
  // Current user's subscription (derived from session, not client input)
  get: authedQuery.query(async ({ ctx }) => {
    return getDb().query.subscriptions.findFirst({
      where: eq(subscriptions.parentId, ctx.user.id),
    });
  }),

  // Whether Stripe checkout is available in this deployment
  status: authedQuery.query(() => ({ stripeEnabled })),

  // ─── Start a Stripe Checkout session for the chosen plan ───
  createCheckout: authedQuery
    .input(
      z.object({
        plan: z.enum(["annual", "monthly"]).default("annual"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!stripeEnabled) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Payments are not configured yet. Add Stripe keys to enable checkout.",
        });
      }
      const { url, sessionId } = await createCheckoutSession({
        parentId: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        plan: input.plan,
      });
      return { url, sessionId };
    }),

  // ─── Open Stripe Billing Portal (manage/cancel/update card) ───
  billingPortal: authedQuery.mutation(async ({ ctx }) => {
    if (!stripeEnabled) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Billing management is not available.",
      });
    }
    if (!ctx.user.stripeCustomerId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No billing account found. Subscribe first.",
      });
    }
    const url = await createBillingPortalSession(ctx.user.stripeCustomerId);
    return { url };
  }),

  // ─── Manual subscription record (sponsored / admin-granted memberships) ───
  createSponsored: authedQuery
    .input(
      z.object({
        amount: z.number().default(0),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const expiresAt =
        input.expiresAt ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const existing = await getDb().query.subscriptions.findFirst({
        where: eq(subscriptions.parentId, ctx.user.id),
      });

      if (existing) {
        await getDb()
          .update(subscriptions)
          .set({
            plan: "sponsored",
            amount: input.amount.toString(),
            expiresAt,
            status: "active",
          })
          .where(eq(subscriptions.id, existing.id));
      } else {
        await getDb().insert(subscriptions).values({
          parentId: ctx.user.id,
          plan: "sponsored",
          amount: input.amount.toString(),
          status: "active",
          expiresAt,
        });
      }

      return getDb().query.subscriptions.findFirst({
        where: eq(subscriptions.parentId, ctx.user.id),
      });
    }),

  cancel: authedQuery.mutation(async ({ ctx }) => {
    const sub = await getDb().query.subscriptions.findFirst({
      where: eq(subscriptions.parentId, ctx.user.id),
    });

    // If Stripe is configured and we have the Stripe subscription id, cancel
    // at period end THERE — the webhook is the source of truth and will update
    // our DB. This prevents the "cancelled locally but still charged" bug.
    if (stripeEnabled && sub?.stripeSubscriptionId) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        await getDb()
          .update(subscriptions)
          .set({ autoRenew: false })
          .where(eq(subscriptions.parentId, ctx.user.id));
        return { success: true, cancelsAtPeriodEnd: true };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "We couldn't cancel your subscription with our payment provider. Please use the Billing Portal or contact support.",
        });
      }
    }

    // No Stripe subscription on file (e.g. legacy/comped account): flip locally.
    await getDb()
      .update(subscriptions)
      .set({ status: "cancelled", cancelledAt: new Date(), autoRenew: false })
      .where(eq(subscriptions.parentId, ctx.user.id));
    return { success: true, cancelsAtPeriodEnd: false };
  }),

  updateAutoRenew: authedQuery
    .input(z.object({ autoRenew: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(subscriptions)
        .set({ autoRenew: input.autoRenew })
        .where(eq(subscriptions.parentId, ctx.user.id));
      return { success: true };
    }),
});
