import Link from "next/link";
import { formatUsd } from "@/lib/money";
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
  return (
    <li className="rise" style={{ animationDelay: `${index * 40}ms` }}>
      <div
        className={`card-brutal flex items-center gap-3 p-3 sm:gap-4 sm:p-4 ${
          isKing ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <div className="flex w-9 shrink-0 items-center justify-center sm:w-12">
          {isKing ? (
            <Crown className="h-7 w-7 sm:h-9 sm:w-9" />
          ) : (
            <span className="font-display text-2xl tabular sm:text-3xl">
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
          className="hidden h-10 w-10 shrink-0 border-2 border-foreground bg-card object-contain p-1.5 sm:block"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base sm:text-lg">
            {entry.name}
          </p>
          {entry.tagline ? (
            <p
              className={`truncate text-sm ${
                isKing ? "opacity-80" : "text-muted-foreground"
              }`}
            >
              {entry.tagline}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <span className="flex items-center justify-end gap-1 font-display text-sm sm:text-base">
            <CursorClick className="h-4 w-4" />
            <span className="tabular">{entry.clicks.toLocaleString()}</span>
          </span>
          <span className="hidden text-xs uppercase tracking-wide opacity-70 sm:block">
            clicks
          </span>
        </div>

        <div className="shrink-0 text-right">
          <span className="block font-display text-sm tabular sm:text-base">
            {formatUsd(entry.amountCents)}
          </span>
          <span className="hidden text-xs uppercase tracking-wide opacity-70 sm:block">
            paid
          </span>
        </div>

        <Link
          href={`/go/${entry.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn shrink-0 px-3 py-2 text-xs ${
            isKing ? "btn-secondary" : "btn-primary"
          }`}
          aria-label={`Visit ${entry.name} (opens in a new tab)`}
        >
          <span className="hidden sm:inline">Visit</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}
