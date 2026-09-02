import Link from "next/link";
import { Crown } from "./icons";

export function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2"
          aria-label="MillionDollar home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
            aria-hidden="true"
          >
            <Crown className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
            Million<span className="text-primary">Dollar</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
