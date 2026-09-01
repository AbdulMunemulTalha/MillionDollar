import "server-only";

// DataFast analytics — server-side stats for the "Live" pill.
// The secret website API key (df_...) authenticates as a specific website, so
// no websiteId query param is needed. All values degrade to null when the key
// is unset or the API is unreachable, so the UI can fall back gracefully.

export type VisitorStats = {
  /** Visitors active in the last ~10 minutes (realtime), or null. */
  live: number | null;
  /** All-time total visitors (overview), or null. */
  total: number | null;
};

const BASE = "https://datafa.st/api/v1/analytics";

/** Pull `data[0].visitors` out of a DataFast response shape, defensively. */
function readVisitors(json: unknown): number | null {
  const value = (json as { data?: Array<{ visitors?: unknown }> })?.data?.[0]
    ?.visitors;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Fetch live + all-time visitor counts from DataFast. Returns { live: null,
 * total: null } when DATAFAST_API_KEY is missing or any request fails — never
 * throws, so the homepage renders regardless of analytics availability.
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  const key = process.env.DATAFAST_API_KEY;
  if (!key) return { live: null, total: null };

  const headers = { Authorization: `Bearer ${key}` };
  try {
    const [rt, ov] = await Promise.all([
      // Realtime ignores date ranges; overview with no dates is all-time.
      fetch(`${BASE}/realtime?fields=visitors`, {
        headers,
        next: { revalidate: 20 },
      }),
      fetch(`${BASE}/overview`, { headers, next: { revalidate: 120 } }),
    ]);
    const live = rt.ok ? readVisitors(await rt.json()) : null;
    const total = ov.ok ? readVisitors(await ov.json()) : null;
    return { live, total };
  } catch {
    return { live: null, total: null };
  }
}
