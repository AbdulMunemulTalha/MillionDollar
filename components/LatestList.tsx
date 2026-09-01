import Link from "next/link";
import type { Entry } from "@/lib/ranking";
import { formatUsd } from "@/lib/money";
import { timeAgo } from "@/lib/time";
import { hostnameKey } from "@/lib/url";
import { ArrowUpRight } from "./icons";

export function LatestList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.slice(0, 6).map((entry, i) => {
        const when = timeAgo(entry.paidAt ?? entry.createdAt);
        return (
          <li
            key={entry.id}
            className="rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="card-brutal flex h-full flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${hostnameKey(entry.url)}&sz=64`}
                    alt=""
                    width={24}
                    height={24}
                    loading="lazy"
                    className="h-6 w-6 shrink-0 rounded-lg border border-border bg-card object-contain p-0.5"
                  />
                  <span className="min-w-0 flex-1 truncate font-display text-base font-semibold">
                    {entry.name}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular">
                  {formatUsd(entry.amountCents)}
                </span>
              </div>
              {entry.tagline ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {entry.tagline}
                </p>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <Link
                  href={`/go/${entry.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  aria-label={`Visit ${entry.name} (opens in a new tab)`}
                >
                  Visit
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {when ? (
                  <span className="text-xs text-muted-foreground">{when}</span>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
