"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd, parseUsdToCents, TOP_INCREMENT_CENTS } from "@/lib/money";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { normalizeUrl } from "@/lib/url";
import { Globe, Plus } from "./icons";

type Action = "claim" | "list";

export function BidBar({
  minEntryCents,
  requiredTopCents,
}: {
  minEntryCents: number;
  requiredTopCents: number;
}) {
  // Free mode (payments disabled): a URL + one free "Add to the board" button.
  if (!PAYMENTS_ENABLED) {
    return <FreeBar />;
  }
  return <PaidBar minEntryCents={minEntryCents} requiredTopCents={requiredTopCents} />;
}

/**
 * Free listing UI. The "Climb" button opens a popup that collects the
 * submitter's name and email; "Continue climb" posts to /api/submit, then shows
 * an inline confirmation and refreshes the route so the new card appears in
 * Latest submissions / the board without a full navigation.
 */
function FreeBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Validate the URL up front; only open the popup once it's usable.
  function openModal() {
    setError(null);
    if (!normalizeUrl(url)) {
      setError("Enter a valid product URL, e.g. yourproduct.com");
      return;
    }
    setDone(false);
    setModalOpen(true);
  }

  function onSubmitted() {
    setModalOpen(false);
    setUrl("");
    setDone(true);
    // Pull the freshly-added card into the board without a hard reload.
    router.refresh();
  }

  return (
    <div className="mx-auto w-full">
      <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
        Climb #1 by Clicks
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
        Drop your link and land on the board for free. Share it, people clicks
        and visit, rise to the top. No payment, no catch.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="relative flex-1">
          <label htmlFor="free-url" className="sr-only">
            Your product URL
          </label>
          <Globe
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="free-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (done) setDone(false);
            }}
            placeholder="Your product URL"
            aria-invalid={!!error}
            aria-describedby={error ? "free-error" : undefined}
            className="input-brutal h-full pl-11"
            onKeyDown={(e) => {
              if (e.key === "Enter") openModal();
            }}
          />
        </div>
        <button
          type="button"
          onClick={openModal}
          className="btn btn-primary shrink-0 py-3.5 text-base"
        >
          <Plus className="h-5 w-5" />
          Climb
        </button>
      </div>

      {error ? (
        <p
          id="free-error"
          role="alert"
          className="mt-2 text-center text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : done ? (
        <p
          role="status"
          className="mt-2 text-center text-sm font-medium text-emerald-600"
        >
          You&apos;re on the board! Share your link to start climbing.
        </p>
      ) : null}

      {modalOpen ? (
        <ClimbModal
          url={normalizeUrl(url) ?? url}
          onClose={() => setModalOpen(false)}
          onSubmitted={onSubmitted}
        />
      ) : null}
    </div>
  );
}

/**
 * Popup collecting the submitter's name + email before listing their product.
 * "Continue climb" posts to /api/submit; on success the parent refreshes the
 * board. Closes on backdrop click or Escape.
 */
function ClimbModal({
  url,
  onClose,
  onSubmitted,
}: {
  url: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          name: name.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Could not add your product. Please try again.");
        setBusy(false);
        return;
      }
      onSubmitted();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="climb-modal-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/40 backdrop-blur-sm"
      />
      {/* Panel */}
      <div className="card-brutal relative z-10 w-full max-w-sm p-6 text-left">
        <h2
          id="climb-modal-title"
          className="font-display text-xl font-bold tracking-tight"
        >
          Almost there
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us who&apos;s climbing. We&apos;ll add your product to the board
          right after.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label
              htmlFor="climb-name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <input
              id="climb-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              autoComplete="name"
              className="input-brutal"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
          <div>
            <label
              htmlFor="climb-email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="climb-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="input-brutal"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn shrink-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="btn btn-primary shrink-0"
          >
            <Plus className="h-5 w-5" />
            {busy ? "Adding…" : "Continue climb"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaidBar({
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
