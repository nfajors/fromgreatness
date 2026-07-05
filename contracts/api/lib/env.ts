import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // Core app
  appId: optional("APP_ID", "fromgreatness-local"),
  // APP_SECRET signs session JWTs. A weak default is provided for local dev only.
  appSecret:
    process.env.APP_SECRET ??
    (process.env.NODE_ENV === "production"
      ? required("APP_SECRET")
      : "dev-only-insecure-secret-change-me"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),

  // Public origin (used for Stripe redirect URLs)
  appUrl: optional("APP_URL", "http://localhost:3000"),

  // Stripe
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  stripePriceAnnual: optional("STRIPE_PRICE_ANNUAL"),
  stripePriceMonthly: optional("STRIPE_PRICE_MONTHLY"),

  // Anthropic (AI content generation)
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  anthropicModel: optional("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),

  // Legacy Kimi OAuth (optional; only used if configured)
  kimiAuthUrl: optional("KIMI_AUTH_URL"),
  kimiOpenUrl: optional("KIMI_OPEN_URL"),
  ownerUnionId: optional("OWNER_UNION_ID"),
};

export const stripeEnabled = !!env.stripeSecretKey;
export const aiEnabled = !!env.anthropicApiKey;
export const kimiEnabled = !!env.kimiAuthUrl && !!env.kimiOpenUrl;
