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
        const name = entry.title ?? entry.name;
        const blurb = entry.description ?? entry.tagline;
        const logo =
          entry.logoUrl ??
          `https://www.google.com/s2/favicons?domain=${hostnameKey(entry.url)}&sz=64`;
        return (
          <li
            key={entry.id}
            className="rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <a
              href={`/go/${entry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${name} (opens in a new tab)`}
              className="card-brutal group flex h-full flex-col gap-1.5 p-3 no-underline transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt=""
                    width={20}
                    height={20}
                    loading="lazy"
                    className="h-5 w-5 shrink-0 rounded-md border border-border bg-card object-contain p-0.5"
                  />
                  <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
                    {name}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular">
                  {formatUsd(entry.amountCents)}
                </span>
              </div>
              {blurb ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {blurb}
                </p>
              ) : null}
              <div className="mt-auto flex items-center justify-between gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 group-hover:underline">
                  Visit
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                {when ? (
                  <span className="text-xs text-muted-foreground">{when}</span>
                ) : null}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
