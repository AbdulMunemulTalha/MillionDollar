// Money helpers. All amounts are integer cents to avoid floating-point drift.

/**
 * Fixed price to get listed / climb onto the board: $6.
 * Note: Polar/Stripe enforce a hard 0.50 USD minimum per charge.
 */
export const MIN_ENTRY_CENTS = 600;

/** To take over a rank you must pay at least this much MORE than it: $1. */
export const TOP_INCREMENT_CENTS = 100;

/**
 * Format integer cents as USD. Whole-dollar amounts drop the cents
 * (1000 -> "$10"), while fractional amounts keep them (1050 -> "$10.50").
 */
export function formatUsd(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
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
