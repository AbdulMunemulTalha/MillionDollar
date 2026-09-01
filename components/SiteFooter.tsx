import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display uppercase tracking-wide">
          MILLIONDOLLAR
          <span className="ml-2 font-body font-normal normal-case text-muted-foreground">
            pay your way to #1
          </span>
        </p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <Link href="/#bid" className="underline-offset-4 hover:underline">
            Join
          </Link>
          <span
            className="border border-foreground px-2 py-0.5 font-display text-xs uppercase tracking-wide"
            title="Payments run through Polar's sandbox — no real charges."
          >
            Sandbox mode
          </span>
        </div>
      </div>
    </footer>
  );
}
