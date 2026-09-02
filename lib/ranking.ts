import { MIN_ENTRY_CENTS, TOP_INCREMENT_CENTS } from "./money";
import { hostnameKey } from "./url";

export type Entry = {
  id: string;
  name: string;
  url: string;
  tagline: string | null;
  /** Title scraped from the site on payment (falls back to `name`). */
  title: string | null;
  /** Short description scraped from the site (falls back to `tagline`). */
  description: string | null;
  /** Logo/preview image scraped from the site (falls back to a favicon). */
  logoUrl: string | null;
  /** Dark background for the logo tile when the logo is too pale for white. */
  brandColor: string | null;
  amountCents: number;
  clicks: number;
  paidAt: string | null;
  createdAt: string;
};

/**
 * The king is the single highest-paying entry. Ties break toward whoever paid
 * first. Because the king is DERIVED from immutable paid amounts (never a
 * stored/mutated flag), ranking is race-free: two people paying at once simply
 * both land in the list and the larger amount wins deterministically.
 */
export function deriveKing(entries: Entry[]): Entry | null {
  let king: Entry | null = null;
  for (const e of entries) {
    if (king === null) {
      king = e;
      continue;
    }
    if (e.amountCents > king.amountCents) {
      king = e;
    } else if (e.amountCents === king.amountCents) {
      const eTime = e.paidAt ? Date.parse(e.paidAt) : Infinity;
      const kTime = king.paidAt ? Date.parse(king.paidAt) : Infinity;
      if (eTime < kTime) king = e;
    }
  }
  return king;
}

/** Cents the next challenger must pay to seize #1 right now. */
export function requiredTopCents(king: Entry | null): number {
  if (!king) return MIN_ENTRY_CENTS;
  return king.amountCents + TOP_INCREMENT_CENTS;
}

function byClicksThenEarliest(a: Entry, b: Entry): number {
  if (b.clicks !== a.clicks) return b.clicks - a.clicks;
  const at = a.paidAt ? Date.parse(a.paidAt) : Infinity;
  const bt = b.paidAt ? Date.parse(b.paidAt) : Infinity;
  return at - bt;
}

function byNewestPaid(a: Entry, b: Entry): number {
  const at = a.paidAt ? Date.parse(a.paidAt) : 0;
  const bt = b.paidAt ? Date.parse(b.paidAt) : 0;
  return bt - at;
}

export type Board = {
  king: Entry | null;
  /** Everyone except the king, ordered by clicks desc then earliest paid. */
  contenders: Entry[];
  /** king first, then contenders — the full ordered leaderboard. */
  ranked: Entry[];
  /** All entries, newest paid first. */
  latest: Entry[];
  /** Cents needed to claim #1 right now. */
  requiredTopCents: number;
  /** Cents needed to simply get listed. */
  minEntryCents: number;
};

export function buildBoard(entries: Entry[]): Board {
  const deduped = dedupeByUrl(entries);
  const king = deriveKing(deduped);
  const contenders = deduped
    .filter((e) => e.id !== king?.id)
    .sort(byClicksThenEarliest);
  const ranked = king ? [king, ...contenders] : contenders;
  const latest = [...deduped].sort(byNewestPaid);
  return {
    king,
    contenders,
    ranked,
    latest,
    requiredTopCents: requiredTopCents(king),
    minEntryCents: MIN_ENTRY_CENTS,
  };
}

/**
 * Collapse entries that point at the same product (same hostname) into one row.
 * This is what makes "enter the same URL and up your bid" work: the highest
 * amount wins the visible row (earliest paid breaks ties) and clicks from every
 * bid for that product are summed onto it.
 */
function dedupeByUrl(entries: Entry[]): Entry[] {
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const key = hostnameKey(e.url);
    const group = groups.get(key);
    if (group) group.push(e);
    else groups.set(key, [e]);
  }

  const result: Entry[] = [];
  for (const group of groups.values()) {
    let winner = group[0];
    let clicks = 0;
    for (const e of group) {
      clicks += e.clicks;
      if (e.amountCents > winner.amountCents) {
        winner = e;
      } else if (e.amountCents === winner.amountCents) {
        const et = e.paidAt ? Date.parse(e.paidAt) : Infinity;
        const wt = winner.paidAt ? Date.parse(winner.paidAt) : Infinity;
        if (et < wt) winner = e;
      }
    }
    result.push({ ...winner, clicks });
  }
  return result;
}
