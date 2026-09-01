import Link from "next/link";
import { Crown, Plus } from "./icons";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-foreground bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground"
            aria-hidden="true"
          >
            <Crown className="h-5 w-5" />
          </span>
          <span className="font-display text-lg leading-none tracking-tight sm:text-xl">
            MILLION<span className="text-primary">DOLLAR</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#board"
            className="hidden font-display text-sm uppercase tracking-wide underline-offset-4 hover:underline sm:inline"
          >
            Leaderboard
          </Link>
          <Link href="/#bid" className="btn btn-primary text-sm">
            <Plus className="h-4 w-4" />
            Join the board
          </Link>
        </nav>
      </div>
    </header>
  );
}
