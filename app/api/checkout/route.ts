import { NextRequest, NextResponse } from "next/server";
import { createPolarClient } from "@/lib/polar";
import { serverEnv, publicEnv } from "@/lib/env";
import {
  getPaidEntries,
  createPendingEntry,
  attachCheckout,
} from "@/lib/entries";
import { buildBoard } from "@/lib/ranking";
import { submitSchema } from "@/lib/validation";
import { MIN_ENTRY_CENTS } from "@/lib/money";
import { normalizeUrl, deriveName } from "@/lib/url";

// Always run fresh: the required amount depends on live leaderboard state.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Accept a bare domain and normalize; reject anything that isn't a real URL.
  const url = normalizeUrl(input.url);
  if (!url) {
    return NextResponse.json(
      { error: "Enter a valid product URL, e.g. yourproduct.com" },
      { status: 400 },
    );
  }
  const name = deriveName(url);

  // Server-side floor: recompute from live paid entries, never trust client.
  const board = buildBoard(await getPaidEntries());
  const floor = input.claimTop ? board.requiredTopCents : MIN_ENTRY_CENTS;
  const amountCents = Math.max(input.amountCents, floor);

  const origin = req.nextUrl.origin || publicEnv.appUrl;

  // Create the pending row first so the checkout can reference it by id.
  const { id } = await createPendingEntry({ name, url, amountCents });

  try {
    const polar = createPolarClient();
    const checkout = await polar.checkouts.create({
      products: [serverEnv.polarProductId],
      amount: amountCents,
      metadata: { entry_id: id },
      successUrl: `${origin}/success?checkout_id={CHECKOUT_ID}`,
    });
    await attachCheckout(id, checkout.id);
    return NextResponse.json({ url: checkout.url, amountCents });
  } catch (err) {
    console.error("Polar checkout creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Check server configuration." },
      { status: 502 },
    );
  }
}
