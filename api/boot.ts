import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env, kimiEnabled, stripeEnabled } from "./lib/env";
import { Paths } from "@contracts/constants";
import { handleStripeWebhook } from "./lib/stripe";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ─── Stripe webhook (must read the raw body; mount before body parsing helpers) ───
if (stripeEnabled) {
  app.post("/api/stripe/webhook", async (c) => {
    const signature = c.req.header("stripe-signature") ?? "";
    const rawBody = await c.req.text();
    try {
      await handleStripeWebhook(rawBody, signature);
      return c.json({ received: true });
    } catch (err) {
      console.error("[stripe] webhook error:", err);
      return c.json({ error: "Webhook handler failed" }, 400);
    }
  });
}

// ─── Legacy Kimi OAuth callback (only when configured) ───
if (kimiEnabled) {
  const { createOAuthCallbackHandler } = await import("./kimi/auth");
  app.get(Paths.oauthCallback, createOAuthCallbackHandler());
}

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
