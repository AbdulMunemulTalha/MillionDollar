"use client";

import { useState } from "react";
import { formatUsd, parseUsdToCents, TOP_INCREMENT_CENTS } from "@/lib/money";
import { normalizeUrl } from "@/lib/url";
import { Globe } from "./icons";

type Action = "claim" | "list";

export function BidBar({
  minEntryCents,
  requiredTopCents,
}: {
  minEntryCents: number;
  requiredTopCents: number;
}) {
  const [url, setUrl] = useState("");
  const [amount, setAmount] = useState((requiredTopCents / 100).toString());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);

  // The claim amount can never dip below the price to seize #1 right now.
  const parsedClaim = parseUsdToCents(amount);
  const claimCents =
    parsedClaim !== null && parsedClaim > requiredTopCents
      ? parsedClaim
      : requiredTopCents;

  function stepAmount(deltaCents: number) {
    const current = parseUsdToCents(amount) ?? requiredTopCents;
    const next = Math.max(requiredTopCents, current + deltaCents);
    setAmount((next / 100).toString());
  }

  async function go(action: Action) {
    setError(null);
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Enter a valid product URL, e.g. yourproduct.com");
      return;
    }
    const amountCents = action === "claim" ? claimCents : minEntryCents;

    setBusy(action);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalized,
          amountCents,
          claimTop: action === "claim",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Could not start checkout. Please try again.");
        setBusy(null);
        return;
      }
      // Straight to Polar's hosted checkout with the exact amount.
      window.location.assign(data.url as string);
    } catch {
      setError("Network error. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full">
      {/* Headline — the takeover amount lives inline and is set by the steppers. */}
      <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
        Climb #1 by Clicks
      </h1>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        <span>Or take over #1 for</span>
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => stepAmount(-100)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xl leading-none text-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Decrease amount by $1"
          >
            &minus;
          </button>
          <span className="flex items-baseline text-primary">
            <span className="text-4xl font-extrabold sm:text-5xl" aria-hidden="true">
              $
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Amount in US dollars to take over #1"
              size={4}
              className="w-auto min-w-[1ch] max-w-[6ch] bg-transparent text-center text-4xl font-extrabold tracking-tight outline-none [field-sizing:content] focus-visible:outline-none sm:text-5xl"
            />
          </span>
          <button
            type="button"
            onClick={() => stepAmount(100)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xl leading-none text-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Increase amount by $1"
          >
            +
          </button>
        </span>
      </div>

      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        Real users decide the rank. Drop your link, pick your price. Get on the
        board for {formatUsd(minEntryCents)} and climb by clicks, or pay{" "}
        {formatUsd(TOP_INCREMENT_CENTS)} more to take over the #1 crown right
        now.
      </p>

      {/* URL + actions on one row (stacks on mobile). Wide URL, compact buttons. */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <label htmlFor="bid-url" className="sr-only">
            Your product URL
          </label>
          <Globe
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="bid-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Your product URL"
            aria-invalid={!!error}
            aria-describedby={error ? "bid-error" : undefined}
            className="input-brutal h-full pl-11"
            onKeyDown={(e) => {
              if (e.key === "Enter") go("claim");
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => go("claim")}
          disabled={busy !== null}
          className="btn btn-primary shrink-0 py-3.5 text-base"
        >
          {busy === "claim"
            ? "Redirecting…"
            : `Take over #1 · ${formatUsd(claimCents)}`}
        </button>
        <button
          type="button"
          onClick={() => go("list")}
          disabled={busy !== null}
          className="btn shrink-0 py-3.5 text-base"
        >
          {busy === "list"
            ? "Redirecting…"
            : `Climb · ${formatUsd(minEntryCents)}`}
        </button>
      </div>

      {error ? (
        <p
          id="bid-error"
          role="alert"
          className="mt-2 text-center text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
