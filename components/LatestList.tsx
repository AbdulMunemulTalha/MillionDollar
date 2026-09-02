import type { Entry } from "@/lib/ranking";
import { hostnameKey } from "@/lib/url";

export function LatestList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.slice(0, 6).map((entry, i) => {
        const name = entry.title ?? entry.name;
        const logo =
          entry.logoUrl ??
          `https://www.google.com/s2/favicons?domain=${hostnameKey(entry.url)}&sz=64`;
        return (
          <li
            key={entry.id}
            className="rise min-w-0"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <a
              href={`/go/${entry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${name} (opens in a new tab)`}
              className="card-brutal group flex h-full items-center gap-3 p-3 no-underline transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                style={
                  entry.brandColor
                    ? { backgroundColor: entry.brandColor }
                    : undefined
                }
                className={`h-10 w-10 shrink-0 rounded-xl border border-border object-contain p-1.5 ${
                  entry.brandColor ? "" : "bg-card"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold">
                  {name}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="tabular font-semibold text-foreground">
                    {entry.clicks.toLocaleString()}
                  </span>{" "}
                  {entry.clicks === 1 ? "Click" : "Clicks"}
                </p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
