import { NextRequest, NextResponse } from "next/server";
import { getEntryForClick, incrementClick } from "@/lib/entries";

export const dynamic = "force-dynamic";

// Requests that browsers / frameworks fire speculatively — Next.js <Link>
// prefetch, <link rel="prefetch">, Chrome Speculation Rules, Firefox/Safari
// link prefetch — must NOT be counted as clicks. Only a real navigation
// (the user actually clicking a card) should bump the counter. These
// speculative requests are identified by well-known request headers.
function isSpeculative(req: NextRequest): boolean {
  const h = req.headers;
  const secPurpose = (h.get("sec-purpose") ?? "").toLowerCase();
  const purpose = (
    h.get("purpose") ??
    h.get("x-purpose") ??
    h.get("x-moz") ??
    ""
  ).toLowerCase();
  return (
    h.get("next-router-prefetch") === "1" ||
    h.get("x-middleware-prefetch") === "1" ||
    secPurpose.includes("prefetch") ||
    secPurpose.includes("prerender") ||
    purpose === "prefetch" ||
    purpose === "preview"
  );
}

// Click tracker: /go/<id> counts a visit for a paid entry, then redirects to
// the entry's destination URL. Unknown or unpaid ids fall back to the board.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const entry = await getEntryForClick(id);
  if (!entry) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  // Only a genuine click counts; skip speculative prefetch/prerender hits.
  if (!isSpeculative(req)) {
    await incrementClick(id);
  }
  return NextResponse.redirect(entry.url, 302);
}
