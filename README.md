# MillionDollar

A pay-to-win ranking board. Pay to get listed, climb by clicks, or skip the
line and **pay your way to #1**.

> This is an early **sketch** — the mechanics, data flow, and validation are
> real and wired end to end, but the visual design is a first pass meant to be
> restyled.

## How it works

- **Get listed** — pay at least **$10** to claim a spot. New entries show up in
  *Latest arrivals*.
- **Climb by clicks** — every visit to your link (`/go/:id`) counts. Everyone
  below #1 is ranked by clicks, most-clicked first.
- **Seize the crown** — don't want to wait for clicks? Pay at least **$1 more**
  than the current #1 to take the top spot instantly. If #1 paid $10, it costs
  $11 to dethrone them.

The **#1 spot is locked to the top payer** ("king"). The king is *derived* from
the highest paid amount (earliest payment breaks ties), so seizing #1 is
race-free — there's no counter to update, just a bigger payment on record.

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Payments  | [Polar](https://polar.sh) — pay-what-you-want product, dynamic checkout amount |
| Database  | Postgres via [Supabase](https://supabase.com) (project **MillionDollar**) |
| Validation| [Zod](https://zod.dev) on the server, mirrored on the client |
| Styling   | Tailwind CSS v4 (token-driven light/dark, brutalist sketch) |

## Project structure

```
app/
  page.tsx                     # Board: hero, king card, leaderboard, latest, how-it-works
  submit/page.tsx              # Submit / claim form (?mode=claim to seize #1)
  success/page.tsx             # Post-checkout landing
  api/checkout/route.ts        # Creates pending entry + dynamic Polar checkout
  api/webhooks/polar/route.ts  # onOrderPaid → marks entry paid
  go/[id]/route.ts             # Click tracker → increments clicks → 302 to entry URL
lib/
  env.ts                       # Lazy env getters (build doesn't need secrets)
  money.ts                     # cents helpers, formatUsd, parseUsdToCents, floors
  ranking.ts                   # deriveKing / requiredTopCents / buildBoard
  validation.ts                # Zod submit schema (shared shape)
  entries.ts                   # DB reads/writes (server-only)
  board.ts                     # getBoardSafe() — degrades gracefully if unconfigured
  supabase.ts / polar.ts       # Server-only client singletons
components/                    # Board UI + SubmitForm (client)
scripts/setup-polar.ts         # One-time: create the pay-what-you-want product
```

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project (this repo targets **MillionDollar**)
- A Polar account + organization (sandbox is fine to start)

### 1. Install

```bash
npm install
```

### 2. Database schema (Supabase)

The **MillionDollar** project already has the schema applied (migration
`create_entries_table`). To reproduce it on a fresh project, run this SQL in the
Supabase SQL editor:

```sql
create table public.entries (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 1 and 80),
  url               text not null check (char_length(url) between 3 and 2048),
  tagline           text check (char_length(tagline) <= 140),
  amount_cents      integer not null default 0 check (amount_cents >= 0),
  clicks            integer not null default 0 check (clicks >= 0),
  status            text not null default 'pending'
                      check (status in ('pending', 'paid', 'failed')),
  polar_checkout_id text,
  polar_order_id    text,
  polar_customer_id text,
  email             text,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

-- Public may only ever read PAID rows. All writes go through the service-role
-- key (server-side), which bypasses RLS.
alter table public.entries enable row level security;

create policy "public can read paid entries"
  on public.entries for select
  to public
  using (status = 'paid');

-- Atomic click increment; only paid entries can accrue clicks.
create or replace function public.increment_click(entry_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.entries
     set clicks = clicks + 1
   where id = entry_id and status = 'paid';
$$;
```

### 3. Environment

Copy the template and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (pre-filled for MillionDollar) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` secret. **Server-only — never expose to the browser.** |
| `POLAR_ACCESS_TOKEN` | Polar dashboard → Settings → create an organization access token |
| `POLAR_SERVER` | `sandbox` (default, no real charges) or `production` |
| `POLAR_ORGANIZATION_ID` | Polar org id (pre-filled) |
| `POLAR_PRODUCT_ID` | Printed by `npm run setup:polar` (next step) |
| `POLAR_WEBHOOK_SECRET` | Polar dashboard → Settings → Webhooks → signing secret |
| `NEXT_PUBLIC_APP_URL` | Public base URL used to build checkout redirect URLs (`http://localhost:3000` in dev) |

### 4. Create the Polar product

The dynamic checkout is built on one **pay-what-you-want** product (min $10).
Create it once (reuses an existing one if found):

```bash
npm run setup:polar
```

Paste the printed `POLAR_PRODUCT_ID=...` line into `.env.local`.

### 5. Configure the Polar webhook

In the Polar dashboard → Settings → Webhooks, add an endpoint pointing to:

```
<your public URL>/api/webhooks/polar
```

Subscribe to the **order.paid** event and copy the signing secret into
`POLAR_WEBHOOK_SECRET`. For local development, expose your machine with a tunnel
(e.g. `ngrok http 3000`) and use the tunnel URL — Polar can't reach
`localhost`.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Until Supabase and Polar
are configured, the board renders an empty state with a "backend not configured"
notice — nothing crashes.

## Payment & validation flow

1. The user fills the submit form (`components/SubmitForm.tsx`). The client
   computes the floor — `$10` to list, or `requiredTopCents` to claim #1 — and
   blocks submission below it.
2. `POST /api/checkout` re-validates with the **same Zod schema** server-side,
   **recomputes the floor from live board data**, and clamps the amount up to
   the floor (`Math.max`). The client value is never trusted. It creates a
   `pending` entry, then a Polar checkout for the exact dynamic amount.
3. The user pays on Polar's hosted checkout.
4. Polar calls `POST /api/webhooks/polar`. On `order.paid`, the entry is marked
   `paid` with the **actual amount charged** (`netAmount`) — the source of truth
   for ranking. The update is idempotent (only flips `pending` rows).
5. Ranking is derived on read: highest paid amount = #1, everyone else by clicks.

Because the required "seize #1" price is derived from paid amounts at request
time (both when rendering the form and when creating the checkout), two people
racing for #1 can't both underpay — the amount is validated against live data
on the server, and #1 is always simply whoever paid most.

## Scripts

```bash
npm run dev          # Start the dev server
npm run build        # Production build
npm run start        # Serve the production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run setup:polar  # Create/reuse the Polar pay-what-you-want product
```

## Going to production

- Set `POLAR_SERVER=production`, generate a **production** Polar access token,
  and re-run `npm run setup:polar` to create the product in the production org.
- Point `NEXT_PUBLIC_APP_URL` at your deployed URL and register the production
  webhook endpoint.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `POLAR_ACCESS_TOKEN` server-side only
  (never `NEXT_PUBLIC_`).
