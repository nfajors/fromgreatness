import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));

// Gate premium content behind a valid subscription. A subscription counts as
// valid if its status is "active" (or in grace as "past_due") and it hasn't
// expired. Admins bypass. Enforcement is skipped only if Stripe isn't
// configured at all (so the app remains usable before billing is set up).
const requireActiveSubscription = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: ErrorMessages.unauthenticated });
  }
  if (ctx.user.role === "admin") {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  // Lazy imports to avoid a cycle with the db layer at module load.
  const { getDb } = await import("./queries/connection");
  const { subscriptions } = await import("@db/schema");
  const { eq } = await import("drizzle-orm");
  const { stripeEnabled } = await import("./lib/env");

  // Before Stripe is configured, don't lock anyone out.
  if (!stripeEnabled) {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  const sub = await getDb().query.subscriptions.findFirst({
    where: eq(subscriptions.parentId, ctx.user.id),
  });
  const valid =
    sub &&
    (sub.status === "active" || sub.status === "past_due") &&
    sub.expiresAt > new Date();

  if (!valid) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "An active subscription is required to access this feature.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const subscribedQuery = authedQuery.use(requireActiveSubscription);
