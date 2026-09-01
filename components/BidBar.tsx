"use client";

import { useState } from "react";
import { formatUsd, parseUsdToCents } from "@/lib/money";
import { normalizeUrl } from "@/lib/url";
import { Bolt, Globe } from "./icons";

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
    <div className="card-brutal mx-auto w-full max-w-md p-6 sm:p-7">
      {/* Headline amount + steppers */}
      <p className="text-center text-sm font-medium text-muted-foreground">
        Take over #1 for
      </p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => stepAmount(-100)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-2xl leading-none text-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label="Decrease amount by $1"
        >
          &minus;
        </button>
        <div className="flex min-w-0 items-center justify-center">
          <span
            className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl"
            aria-hidden="true"
          >
            $
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount in US dollars to claim #1"
            size={4}
            className="w-auto min-w-[2ch] max-w-[7ch] bg-transparent text-center font-display text-5xl font-extrabold tracking-tight outline-none [field-sizing:content] focus-visible:outline-none sm:text-6xl"
          />
        </div>
        <button
          type="button"
          onClick={() => stepAmount(100)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-2xl leading-none text-foreground shadow-[var(--shadow-soft)] transition hover:-translate-y-px hover:shadow-[var(--shadow-soft-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label="Increase amount by $1"
        >
          +
        </button>
      </div>
      <p className="mx-auto mt-3 max-w-xs text-center text-sm text-muted-foreground">
        Your amount sets your rank. Whole dollars, $1 at a time.{" "}
        {formatUsd(minEntryCents)} minimum to get listed.
      </p>

      {/* URL */}
      <div className="relative mt-5">
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
          className="input-brutal pl-11"
          onKeyDown={(e) => {
            if (e.key === "Enter") go("claim");
          }}
        />
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

      {/* Actions */}
      <button
        type="button"
        onClick={() => go("claim")}
        disabled={busy !== null}
        className="btn btn-primary mt-4 w-full py-3.5 text-base"
      >
        {busy === "claim" ? (
          "Redirecting…"
        ) : (
          <>
            <Bolt className="h-5 w-5" />
            Take over #1 · {formatUsd(claimCents)}
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => go("list")}
        disabled={busy !== null}
        className="btn mt-3 w-full py-3.5 text-base"
      >
        {busy === "list" ? "Redirecting…" : `Climb · ${formatUsd(minEntryCents)}`}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Secure checkout on Polar. Already listed? Enter the same URL and raise
        your bid to climb.
      </p>
    </div>
  );
}
