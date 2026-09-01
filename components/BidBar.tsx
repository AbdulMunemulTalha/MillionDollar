"use client";

import { useState } from "react";
import { formatUsd, parseUsdToCents } from "@/lib/money";
import { normalizeUrl } from "@/lib/url";
import { Bolt, Plus } from "./icons";

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
    <div className="card-brutal bg-card p-5 sm:p-7">
      {/* Headline amount + steppers */}
      <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
        Claim #1 for
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => stepAmount(-100)}
          className="btn h-11 w-11 shrink-0 p-0 text-xl"
          aria-label="Decrease amount by $1"
        >
          –
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center border-2 border-foreground bg-muted px-3 py-2">
          <span className="font-display text-3xl sm:text-4xl" aria-hidden="true">
            $
          </span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-label="Amount in US dollars to claim #1"
            className="w-full min-w-0 bg-transparent text-center font-display text-3xl outline-none focus-visible:outline-none sm:text-4xl"
          />
        </div>
        <button
          type="button"
          onClick={() => stepAmount(100)}
          className="btn h-11 w-11 shrink-0 p-0 text-xl"
          aria-label="Increase amount by $1"
        >
          +
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Your amount sets your rank. Pay {formatUsd(requiredTopCents)} or more to
        take the crown now — pay less and you still land on the board by clicks.
      </p>

      {/* URL */}
      <div className="mt-5">
        <label htmlFor="bid-url" className="sr-only">
          Your product URL
        </label>
        <input
          id="bid-url"
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourproduct.com"
          aria-invalid={!!error}
          aria-describedby={error ? "bid-error" : undefined}
          className="input-brutal"
          onKeyDown={(e) => {
            if (e.key === "Enter") go("claim");
          }}
        />
      </div>

      {error ? (
        <p
          id="bid-error"
          role="alert"
          className="mt-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => go("claim")}
          disabled={busy !== null}
          className="btn btn-accent text-base"
        >
          {busy === "claim" ? (
            "Redirecting…"
          ) : (
            <>
              <Bolt className="h-5 w-5" />
              Claim #1 · {formatUsd(claimCents)}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => go("list")}
          disabled={busy !== null}
          className="btn btn-primary text-base"
        >
          {busy === "list" ? (
            "Redirecting…"
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Get listed · {formatUsd(minEntryCents)}
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        You&apos;ll pay securely on Polar. Already listed? Enter the same URL and
        raise your bid to climb back up.
      </p>
    </div>
  );
}
