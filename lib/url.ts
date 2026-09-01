// Pure URL helpers — safe to import on both client and server (no side effects).

/**
 * Turn user input into a usable http(s) URL string, or null if it can't be one.
 * Accepts protocol-less input ("trycomp.ai" -> "https://trycomp.ai") so people
 * can paste a bare domain like on the reference site.
 */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    // Must look like a real domain (has a dot, e.g. "example.com").
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Identity used to dedupe entries: the lowercased hostname without a leading
 * "www.". Two bids for the same domain are the same product, so re-bidding
 * raises the existing entry instead of adding a duplicate row.
 */
export function hostnameKey(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h.startsWith("www.") ? h.slice(4) : h;
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Display name shown on the board, derived from a URL, e.g. "trycomp.ai". */
export function deriveName(url: string): string {
  return hostnameKey(url);
}
