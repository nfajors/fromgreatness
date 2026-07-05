# fromGreatness — Setup & What Changed

This app is a full-stack TypeScript application:

- **Frontend:** React 19 + Vite + Tailwind + shadcn/ui + framer-motion
- **Backend:** Hono + tRPC + Drizzle ORM (MySQL) + Stripe + Anthropic

It was delivered as a near-complete scaffold and then finished in four areas:
real authentication, Stripe payments, real AI content generation, and the
front-end wiring that connects them.

---

## 1. Quick start (local development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    → fill in DATABASE_URL at minimum. Stripe/Anthropic are optional locally
#      (the app degrades gracefully without them).

# 3. Create the database tables
npm run db:push        # pushes the schema directly (fast, for dev)
#    or, for tracked migrations:
#    npm run db:migrate

# 4. Run the dev server (frontend + API together on :3000)
npm run dev
```

Open http://localhost:3000.

### Production build

```bash
npm run build     # builds the frontend (dist/public) and the server (dist/boot.js)
npm run start     # NODE_ENV=production node dist/boot.js
```

In production `APP_SECRET` is **required** (it signs session cookies). Set a
long random value.

### Production domain

The live site is **https://fromgreatness.app**. In production set:

```
APP_URL=https://fromgreatness.app
```

This one variable drives every Stripe redirect (Checkout success/cancel and the
Billing Portal return). The Stripe webhook endpoint is then
`https://fromgreatness.app/api/stripe/webhook`.

---

## 2. What works without external keys

The app is designed to run even before you wire up Stripe and Anthropic:

| Feature | Without keys | With keys |
|---|---|---|
| Email/password sign-up & login | ✅ Works | ✅ Works |
| DNA raw-file upload & parsing | ✅ Works | ✅ Works |
| Gap analysis | ✅ Heritage-driven, deterministic | ✅ Same |
| Study-plan generation | ✅ Uses a built-in template library | ✅ Unique AI-authored modules |
| Checkout / subscription | ⚠️ Skipped; account proceeds to onboarding | ✅ Real Stripe Checkout |

---

## 3. Authentication (real, email + password)

Kimi OAuth has been replaced with standard email/password auth. Passwords are
hashed with Node's `scrypt` (salted, constant-time verify). Sessions are signed
JWTs stored in an httpOnly cookie.

tRPC procedures (in `api/auth-router.ts`):

- `auth.register({ name, email, password })` — creates the account and signs in
- `auth.login({ email, password })`
- `auth.logout()`
- `auth.me()` — current user
- `auth.changePassword({ currentPassword, newPassword })`

Kimi OAuth still exists and turns back on automatically **only** if you set
`KIMI_AUTH_URL` and `KIMI_OPEN_URL`. Otherwise it is fully bypassed.

To make a user an admin, set `OWNER_UNION_ID` to their email (or `email:<addr>`)
before they register.

---

## 4. Payments (Stripe)

### One-time Stripe setup

1. Create two **recurring** Prices in the Stripe Dashboard:
   - Annual — $75/year → copy the `price_...` id into `STRIPE_PRICE_ANNUAL`
   - Monthly — $9.99/month → `STRIPE_PRICE_MONTHLY` (optional)
2. Put your secret key in `STRIPE_SECRET_KEY`.
3. Set up the webhook so subscription status stays in sync:

   ```bash
   # local testing:
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
   ```

   In production, add a webhook endpoint pointing to
   `https://YOUR_DOMAIN/api/stripe/webhook` for the events
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`.

### Flow

- Registration Step 2 → `subscription.createCheckout` → redirect to Stripe
  Checkout → back to the parent dashboard.
- Settings → Subscription uses `subscription.billingPortal` (manage card,
  cancel, change plan) via Stripe's hosted Billing Portal.
- The webhook writes `active` / `cancelled` / `past_due` back to the
  `subscriptions` table.

`parentId` is always derived from the signed-in session — never trusted from the
client.

---

## 5. AI study-plan generation

`api/lib/ai-content.ts` calls the Anthropic Messages API to author a unique set
of modules per child, grounded in:

- the child's age,
- their self-reported identity,
- their confirmed heritage regions, and
- their personality-assessment traits.

It is invoked by `studyPlan.generate` (in `api/study-plan-router.ts`), which
**persists** the generated plans and modules to the database so they appear in
the app. The "Generate Full Study Plan" button on the Gap Analysis screen
triggers this.

If `ANTHROPIC_API_KEY` is missing or a call fails, it falls back to a built-in
template library so the user always gets a usable plan.

---

## 6. DNA upload — important note

Raw exports from 23andMe / AncestryDNA are **genotype files** (lists of SNPs).
They do **not** contain the "you are 45% West African" ancestry breakdown — that
is computed inside each company's own product against proprietary reference
panels and is not present in the downloadable raw file.

So the implemented flow is honest about this:

1. The parent uploads the real raw file.
2. The server parses & validates it (`api/lib/dna-parser.ts`): provider
   detection, SNP count, notable markers, mitochondrial/Y presence hints.
3. The parent **confirms heritage regions** (the divergence between assumed
   identity and heritage is the core of the product per the business plan).
4. Those confirmed regions drive the gap analysis and AI study plans.

### To get a true automated ancestry breakdown later, choose one:

- **Provider API integration** — integrate the consumer-genetics provider's
  OAuth API to read the user's already-computed ancestry. (Cleanest.)
- **Server-side admixture pipeline** — run an ADMIXTURE-style analysis against a
  reference panel. (Heavy; requires bioinformatics infrastructure.)

The parser is structured so either can be slotted in without changing the UI.

---

## 7. Database

Schema lives in `db/schema.ts`. New/changed columns added during this work:

- `users.passwordHash`, `users.authProvider`, `users.stripeCustomerId`
- `subscriptions.stripeCustomerId`, `subscriptions.stripeSubscriptionId`, and a
  widened `status` enum (`incomplete | active | cancelled | expired | past_due`)

A migration was generated in `db/migrations/`. Apply with `npm run db:migrate`
(or `npm run db:push` in dev).

---

## 8. Pricing

The $75/year annual plan from the business plan is the default and is wired
through registration, the landing page, and the subscription screen. A $9.99/mo
option and a `sponsored` (free, corporate-funded) plan type are also supported —
the latter matches the "percentage of memberships sponsored by corporate
partners" idea in the plan.
