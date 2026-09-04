import { formatUsd } from "@/lib/money";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { timeAgo } from "@/lib/time";
import type { Entry } from "@/lib/ranking";
import { hostnameKey } from "@/lib/url";
import { Crown, ArrowUpRight } from "./icons";

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
  const name = entry.title ?? entry.name;
  const blurb = entry.description ?? entry.tagline;
  const logo =
    entry.logoUrl ??
    `https://www.google.com/s2/favicons?domain=${hostnameKey(entry.url)}&sz=64`;

  return (
    <li className="rise" style={{ animationDelay: `${index * 40}ms` }}>
      <a
        href={`/go/${entry.id}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${name} (opens in a new tab)`}
        className={`card-brutal group flex items-center gap-3 p-3 no-underline transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-4 sm:p-4 ${
          isKing ? "bg-primary/[0.06] ring-1 ring-primary/25" : ""
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
          src={logo}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          style={
            entry.brandColor ? { backgroundColor: entry.brandColor } : undefined
          }
          className={`hidden h-10 w-10 shrink-0 rounded-xl border border-border object-contain p-1.5 sm:block ${
            entry.brandColor ? "" : "bg-card"
          }`}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold">
            {name}
          </p>
          {blurb ? (
            <p className="truncate text-sm text-muted-foreground">{blurb}</p>
          ) : null}
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="tabular font-semibold text-foreground">
              {entry.clicks.toLocaleString()}
            </span>{" "}
            {entry.clicks === 1 ? "Click" : "Clicks"}
          </p>
        </div>

        {PAYMENTS_ENABLED ? (
          <div className="shrink-0 text-right">
            <span className="block font-display text-base font-bold tabular sm:text-lg">
              {formatUsd(entry.amountCents)}
            </span>
            {when ? (
              <span className="block text-xs text-muted-foreground">
                {when}
              </span>
            ) : null}
          </div>
        ) : when ? (
          <div className="shrink-0 text-right">
            <span className="block text-xs text-muted-foreground">{when}</span>
          </div>
        ) : null}

        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-[var(--shadow-soft)] transition group-hover:text-primary"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>
    </li>
  );
}
