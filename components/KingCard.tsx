import Link from "next/link";
import type { Entry } from "@/lib/ranking";
import { formatUsd } from "@/lib/money";
import { Crown, ArrowUpRight, Bolt } from "./icons";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-2xl leading-none tabular sm:text-3xl">{value}</span>
      <span className="text-xs uppercase tracking-wide opacity-70">{label}</span>
    </span>
  );
}

export function KingCard({
  king,
  requiredTopCents,
}: {
  king: Entry;
  requiredTopCents: number;
}) {
  return (
    <div className="card-brutal bg-accent text-accent-foreground">
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <span className="inline-flex w-fit items-center gap-2 border-2 border-foreground bg-card px-3 py-1 font-display text-xs uppercase tracking-widest text-card-foreground">
          <Crown className="h-4 w-4" />
          Reigning #1
        </span>

        <div>
          <h2 className="font-display text-3xl leading-none [overflow-wrap:anywhere] sm:text-5xl">
            {king.name}
          </h2>
          {king.tagline ? (
            <p className="mt-3 max-w-prose text-sm sm:text-base">
              {king.tagline}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-3 font-display">
          <Stat label="Paid to reign" value={formatUsd(king.amountCents)} />
          <Stat label="Clicks" value={king.clicks.toLocaleString()} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/go/${king.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            aria-label={`Visit ${king.name} (opens in a new tab)`}
          >
            Visit site
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#bid"
            className="btn bg-card text-card-foreground"
          >
            <Bolt className="h-4 w-4" />
            Dethrone for {formatUsd(requiredTopCents)}
          </Link>
        </div>
      </div>
    </div>
  );
}
