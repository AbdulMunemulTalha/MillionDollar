// Money helpers. All amounts are integer cents to avoid floating-point drift.

/** Minimum payment to get listed at all: $10. */
export const MIN_ENTRY_CENTS = 1000;

/** To seize #1 you must pay at least this much MORE than the current king: $1. */
export const TOP_INCREMENT_CENTS = 100;

/** Format integer cents as USD, e.g. 1050 -> "$10.50". */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Parse a user-entered dollar string ("10", "10.50", "$10", "1,000") to
 * integer cents. Returns null when the input is not a valid money amount.
 */
export function parseUsdToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return Number.isFinite(cents) ? cents : null;
}
