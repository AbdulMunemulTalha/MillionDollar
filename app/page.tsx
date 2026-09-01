import type { ReactNode } from "react";
import Link from "next/link";
import { getBoardSafe } from "@/lib/board";
import { formatUsd } from "@/lib/money";
import { KingCard } from "@/components/KingCard";
import { Leaderboard } from "@/components/Leaderboard";
import { LatestList } from "@/components/LatestList";
import { BidBar } from "@/components/BidBar";
import { Bolt, Plus, CursorClick, Dollar } from "@/components/icons";

export const dynamic = "force-dynamic";

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-1">
      <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

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
        <span className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
          {icon}
        </span>
        <span className="font-display text-3xl opacity-20">{n}</span>
      </div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function ConfigNotice() {
  return (
    <div className="card-brutal mt-8 max-w-2xl bg-card p-4 text-sm">
      <p className="font-display uppercase tracking-wide">
        Backend not configured yet
      </p>
      <p className="mt-1 text-muted-foreground">
        Add your Supabase and Polar keys to{" "}
        <code className="border border-foreground px-1">.env.local</code>, run{" "}
        <code className="border border-foreground px-1">npm run setup:polar</code>
        , then restart the dev server. The board fills in automatically.
      </p>
    </div>
  );
}

export default async function HomePage() {
  const { board, configured } = await getBoardSafe();
  const { king, requiredTopCents, minEntryCents, latest, ranked } = board;

  return (
    <>
      {/* HERO */}
      <section id="bid" className="grid-bg border-b-2 border-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 border-2 border-foreground bg-card px-3 py-1 font-display text-xs uppercase tracking-widest">
                The pay-to-win leaderboard
              </span>
              <h1 className="mt-5 font-display text-4xl leading-[0.95] sm:text-6xl">
                PAY YOUR WAY
                <br />
                <span className="text-primary">TO #1.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg">
                Drop your link, pick your price. Get on the board for{" "}
                {formatUsd(minEntryCents)} and climb by clicks — or pay{" "}
                {formatUsd(requiredTopCents)} to seize the crown right now.
              </p>
              {!configured ? <ConfigNotice /> : null}
            </div>
            <BidBar
              minEntryCents={minEntryCents}
              requiredTopCents={requiredTopCents}
            />
          </div>
        </div>
      </section>

      {/* REIGNING #1 */}
      {king ? (
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <KingCard king={king} requiredTopCents={requiredTopCents} />
        </section>
      ) : null}

      {/* BOARD */}
      <section id="board" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SectionHeading
          title="The board"
          subtitle={
            ranked.length > 0
              ? `${ranked.length} ranked · #1 is the top payer, everyone else ranks by clicks`
              : "#1 is the top payer, everyone else ranks by clicks"
          }
        />
        <Leaderboard board={board} />
      </section>

      {/* LATEST */}
      {latest.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <SectionHeading title="Latest arrivals" />
          <LatestList entries={latest} />
        </section>
      ) : null}

      {/* HOW IT WORKS */}
      <section className="border-y-2 border-foreground bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionHeading title="How it works" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Step
              icon={<Dollar className="h-5 w-5" />}
              n="01"
              title="Pay to enter"
              body={`Put down at least ${formatUsd(minEntryCents)} to claim your spot and land in Latest arrivals.`}
            />
            <Step
              icon={<CursorClick className="h-5 w-5" />}
              n="02"
              title="Climb by clicks"
              body="Everyone below #1 is ranked by visits to their link. Share it, earn clicks, rise up the board."
            />
            <Step
              icon={<Bolt className="h-5 w-5" />}
              n="03"
              title="Seize the crown"
              body="Don't want to wait? Pay $1 more than the current #1 to take the top spot instantly."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="card-brutal bg-primary p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="font-display text-3xl sm:text-4xl">
            Ready to make your mark?
          </h2>
          <p className="mx-auto mt-3 max-w-xl">
            Your name, your link, your rank. Starting at{" "}
            {formatUsd(minEntryCents)}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#bid" className="btn bg-card text-base text-card-foreground">
              <Plus className="h-5 w-5" />
              Join the board
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
