# Hospitality Central

The professional network built only for hospitality: connect with hotel and restaurant professionals, keep up with industry news, and find hospitality jobs. Created by Katelyn Miller (Penn State Hospitality Management).

**Stack:** Next.js (App Router) · Neon Postgres + Drizzle ORM · Stripe subscriptions · Claude API (Anthropic) · Vercel

## The 7 components

| # | Component | Where |
|---|-----------|-------|
| 1 | Personal profile (photo, bio, contact info hidden until Premium, school, experience, current job, certifications, accomplishment posts) | `/profile/[id]`, `/profile/edit` |
| 2 | Connections feed (posts, likes, comments, friend button, category filters, Premium messaging) | `/feed`, `/messages` |
| 3 | Recommended connections + **AI Connection Matchmaker** | `/recommended` |
| 4 | Hospitality job postings with US map and category filters | `/jobs`, `/jobs/new` |
| 5 | School & alumni pages (every post also shows on the author's school page) | `/schools`, `/schools/[school]` |
| 6 | Hospitality news (company accounts can post) | `/news`, `/news/new` |
| 7 | About the creator | `/about` |

Premium ($10/month via Stripe Checkout) unlocks direct messages and contact info.

## Demo account

`demo@demo.com` / `password123!` is created automatically by `npm run db:setup` (which runs before every `dev` and `build`). It always has Premium access and needs no email verification.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL`, a local database is stored in `.data/` and filled with sample members, posts, jobs and news. Delete `.data/` to start fresh.

Copy `.env.example` to `.env.local` and fill in keys to turn on the AI Matchmaker and Stripe locally.

## Environment variables

| Name | What it's for |
|------|---------------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Long random string used to sign login cookies (`openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | Powers the AI Connection Matchmaker |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` for testing, `sk_live_…` for real payments) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook below |
| `NEXT_PUBLIC_APP_URL` | Your public site URL, e.g. `https://hospitality-central.vercel.app` |

## Deploy (GitHub → Vercel → Neon → Stripe)

1. **GitHub:** create a new repository and push this folder to it.
2. **Vercel:** "Add New Project", import the repo. Before deploying, add the environment variables above.
3. **Neon:** in the Vercel project go to *Storage → Create → Neon* (or create a project at neon.tech) and copy the connection string into `DATABASE_URL`. The build runs migrations and creates the demo account automatically.
4. **Stripe:**
   - Put your secret key in `STRIPE_SECRET_KEY`.
   - *Developers → Webhooks → Add endpoint*: `https://YOUR-SITE/api/stripe/webhook`, events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
   - Turn on the *Customer portal* (Settings → Billing → Customer portal) so members can cancel.
5. Redeploy after changing environment variables.

### Proving a live $1 charge

Checkout accepts promotion codes. In **live mode**, create a coupon for **$9.00 off, once** and a promotion code for it (e.g. `ONEDOLLAR`). Sign up with a new account, click **Go Premium**, enter the code, and pay with your own card: the first charge is $1.00. Cancel afterwards from the Premium page ("Manage subscription").

## Database changes

Edit `src/db/schema.ts`, then run `npm run db:generate` to create a migration in `drizzle/`. It is applied on the next `dev` or `build`.

## Sample data

The sample members, posts, jobs and news (e.g. "Summit Ridge Hotels") are fictional and only added to an empty database. Remove them before a real launch.
