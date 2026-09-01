import { NextRequest, NextResponse } from "next/server";
import { getEntryForClick, incrementClick } from "@/lib/entries";

export const dynamic = "force-dynamic";

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
  await incrementClick(id);
  return NextResponse.redirect(entry.url, 302);
}
