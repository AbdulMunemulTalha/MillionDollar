import { getBoardSafe } from "@/lib/board";
import { getVisitorStats } from "@/lib/datafast";
import { Leaderboard } from "@/components/Leaderboard";
import { LatestList } from "@/components/LatestList";
import { BidBar } from "@/components/BidBar";

export const dynamic = "force-dynamic";

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
        <div className="mx-auto max-w-xl px-4 pb-12 pt-12 text-center sm:pt-16">
          <LiveStats
            live={visitors.live}
            total={visitors.total}
            products={ranked.length}
          />
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Pay your way to <span className="text-primary">#1</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            No ads, no gatekeepers, no revenue share. Just outbid the
            competition to reach the top. Will you take the crown when this board
            goes viral?
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
        <section className="mx-auto max-w-3xl px-4 pt-2 pb-8 sm:px-6">
          <SectionHeading title="Latest submissions" />
          <LatestList entries={latest} />
        </section>
      ) : null}

      {/* THE BOARD */}
      <section id="board" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <SectionHeading
          title="The board"
          subtitle="#1 is the top payer. Everyone else climbs by clicks."
        />
        <Leaderboard board={board} />
      </section>
    </>
  );
}
