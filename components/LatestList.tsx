import Link from "next/link";
import type { Entry } from "@/lib/ranking";
import { formatUsd } from "@/lib/money";
import { hostnameKey } from "@/lib/url";
import { ArrowUpRight } from "./icons";

export function LatestList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.slice(0, 6).map((entry, i) => (
        <li key={entry.id} className="rise" style={{ animationDelay: `${i * 40}ms` }}>
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
                  className="h-6 w-6 shrink-0 border border-foreground bg-card object-contain p-0.5"
                />
                <span className="min-w-0 flex-1 truncate font-display text-lg">
                  {entry.name}
                </span>
              </div>
              <span className="shrink-0 border-2 border-foreground px-2 py-0.5 font-display text-xs tabular">
                {formatUsd(entry.amountCents)}
              </span>
            </div>
            {entry.tagline ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {entry.tagline}
              </p>
            ) : null}
            <Link
              href={`/go/${entry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 font-display text-sm uppercase tracking-wide text-primary underline-offset-4 hover:underline"
              aria-label={`Visit ${entry.name} (opens in a new tab)`}
            >
              Visit
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
