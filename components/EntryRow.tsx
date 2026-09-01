import Link from "next/link";
import { formatUsd } from "@/lib/money";
import { timeAgo } from "@/lib/time";
import type { Entry } from "@/lib/ranking";
import { hostnameKey } from "@/lib/url";
import { Crown, ArrowUpRight, CursorClick } from "./icons";

export function EntryRow({
  entry,
  rank,
  isKing = false,
  index = 0,
}: {
  entry: Entry;
  rank: number;
  isKing?: boolean;
  index?: number;
}) {
  const when = timeAgo(entry.paidAt ?? entry.createdAt);

  return (
    <li className="rise" style={{ animationDelay: `${index * 40}ms` }}>
      <div
        className={`card-brutal flex items-center gap-3 p-3 sm:gap-4 sm:p-4 ${
          isKing ? "bg-accent ring-1 ring-primary/30" : ""
        }`}
      >
        <div className="flex w-7 shrink-0 justify-center sm:w-8">
          {isKing ? (
            <Crown className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          ) : (
            <span className="font-display text-lg font-bold tabular text-muted-foreground sm:text-xl">
              {rank}
            </span>
          )}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostnameKey(entry.url)}&sz=64`}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="hidden h-10 w-10 shrink-0 rounded-xl border border-border bg-card object-contain p-1.5 sm:block"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold">
            {entry.name}
          </p>
          {entry.tagline ? (
            <p className="truncate text-sm text-muted-foreground">
              {entry.tagline}
            </p>
          ) : null}
        </div>

        <div className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground sm:flex">
          <CursorClick className="h-4 w-4" />
          <span className="tabular">{entry.clicks.toLocaleString()}</span>
        </div>

        <div className="shrink-0 text-right">
          <span className="block font-display text-base font-bold tabular sm:text-lg">
            {formatUsd(entry.amountCents)}
          </span>
          {when ? (
            <span className="block text-xs text-muted-foreground">{when}</span>
          ) : null}
        </div>

        <Link
          href={`/go/${entry.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-px hover:text-primary hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label={`Visit ${entry.name} (opens in a new tab)`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}
