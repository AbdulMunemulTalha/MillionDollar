import Link from "next/link";
import type { ReactNode } from "react";
import { getBoardSafe } from "@/lib/board";
import { getVisitorStats } from "@/lib/datafast";
import { formatUsd, TOP_INCREMENT_CENTS } from "@/lib/money";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { Leaderboard } from "@/components/Leaderboard";
import { LatestList } from "@/components/LatestList";
import { BidBar } from "@/components/BidBar";
import { Dollar, CursorClick, Bolt, Plus } from "@/components/icons";

export const dynamic = "force-dynamic";

function Step({
  icon,
  n,
  title,
  body,
}: {
  icon: ReactNode;
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card-brutal flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
          {icon}
        </span>
        <span className="font-display text-3xl font-bold text-muted-foreground/30">
          {n}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function LiveStats({
  live,
  total,
  products,
}: {
  live: number | null;
  total: number | null;
  products: number;
}) {
  // Prefer real DataFast visitor numbers; fall back to product count when
  // analytics isn't configured yet, so the pill is never empty.
  const parts: string[] = [];
  if (live !== null) {
    parts.push(`${live.toLocaleString()} online now`);
  }
  if (total !== null) {
    parts.push(`${total.toLocaleString()} visitors`);
  }
  if (parts.length === 0) {
    parts.push(
      products > 0
        ? `${products} ${products === 1 ? "product" : "products"} listed`
        : "be the first to claim a spot",
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
      <span
        className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500"
        aria-hidden="true"
      />
      <span className="font-semibold text-foreground">Live</span>
      <span className="tabular">· {parts.join(" · ")}</span>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 px-1">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

function ConfigNotice() {
  return (
    <div className="card-brutal mx-auto mt-8 max-w-md p-4 text-left text-sm">
      <p className="font-display font-semibold">Backend not configured yet</p>
      <p className="mt-1 text-muted-foreground">
        Add your Supabase and Polar keys to{" "}
        <code className="rounded bg-muted px-1 py-0.5">.env.local</code>, run{" "}
        <code className="rounded bg-muted px-1 py-0.5">npm run setup:polar</code>
        , then restart the dev server. The board fills in automatically.
      </p>
    </div>
  );
}

export default async function HomePage() {
  const [{ board, configured }, visitors] = await Promise.all([
    getBoardSafe(),
    getVisitorStats(),
  ]);
  const { minEntryCents, requiredTopCents, latest, ranked } = board;

  return (
    <>
      {/* HERO */}
      <section id="bid" className="grid-bg">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-5 text-center sm:pt-7">
          <LiveStats
            live={visitors.live}
            total={visitors.total}
            products={ranked.length}
          />
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            No ads, no API, just climb and dethrone your competition by clicks.{" "}
            <span className="font-semibold text-primary">
              Will you take the #1 crown when this site goes viral?
            </span>
          </p>
          <div className="mt-8">
            <BidBar
              minEntryCents={minEntryCents}
              requiredTopCents={requiredTopCents}
            />
          </div>
          {!configured ? <ConfigNotice /> : null}
        </div>
      </section>

      {/* LATEST SUBMISSIONS */}
      {latest.length > 0 ? (
        <section className="mx-auto max-w-4xl px-4 pt-2 pb-8">
          <h2 className="mb-3 px-1 font-display text-base font-bold tracking-tight text-muted-foreground sm:text-lg">
            Latest submissions
          </h2>
          <LatestList entries={latest} />
        </section>
      ) : null}

      {/* THE BOARD */}
      <section id="board" className="mx-auto max-w-4xl px-4 pb-16">
        <SectionHeading
          title="The board"
          subtitle={
            PAYMENTS_ENABLED
              ? "#1 is the top payer. Everyone else climbs by clicks."
              : "Ranked by clicks. The most-clicked product wears the crown."
          }
        />
        <Leaderboard board={board} />
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <SectionHeading title="How it works" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Step
              icon={<Dollar className="h-5 w-5" />}
              n="01"
              title={PAYMENTS_ENABLED ? "Pay to enter" : "Add your product"}
              body={
                PAYMENTS_ENABLED
                  ? `Put down ${formatUsd(minEntryCents)} to claim your spot and land in Latest submissions.`
                  : "Drop your link and land on the board free. No payment, no account."
              }
            />
            <Step
              icon={<CursorClick className="h-5 w-5" />}
              n="02"
              title="Climb by clicks"
              body={
                PAYMENTS_ENABLED
                  ? "Everyone below #1 is ranked by visits to their link. Share it, earn clicks, rise up the board."
                  : "Every product is ranked by visits to its link. Share yours, earn clicks, rise up the board."
              }
            />
            <Step
              icon={<Bolt className="h-5 w-5" />}
              n="03"
              title={PAYMENTS_ENABLED ? "Seize the crown" : "Wear the crown"}
              body={
                PAYMENTS_ENABLED
                  ? `Don't want to wait? Pay ${formatUsd(TOP_INCREMENT_CENTS)} more than the current #1 to take the top spot instantly.`
                  : "The most-clicked product takes #1 and wears the crown. Keep the clicks coming to hold the top spot."
              }
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="card-brutal bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to make your mark?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
            {PAYMENTS_ENABLED
              ? `Your name, your link, your rank. Starting at ${formatUsd(minEntryCents)}.`
              : "Your name, your link, your rank. Free to join."}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/#bid"
              className="btn bg-card text-base text-card-foreground"
            >
              <Plus className="h-5 w-5" />
              Join the board
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
