import { NextRequest, NextResponse } from "next/server";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { createFreeEntry } from "@/lib/entries";
import { freeSubmitSchema } from "@/lib/validation";
import { normalizeUrl, deriveName } from "@/lib/url";

// Free listing endpoint (payments disabled). Runs fresh; no caching.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // When payments are back on, listing goes through Polar checkout instead —
  // this free path is closed so it can't be used to bypass paying.
  if (PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = freeSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Accept a bare domain and normalize; reject anything that isn't a real URL.
  const url = normalizeUrl(parsed.data.url);
  if (!url) {
    return NextResponse.json(
      { error: "Enter a valid product URL, e.g. yourproduct.com" },
      { status: 400 },
    );
  }
  const name = deriveName(url);

  try {
    const { id } = await createFreeEntry({
      name,
      url,
      submitterName: parsed.data.name,
      email: parsed.data.email,
    });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Free entry creation failed:", err);
    return NextResponse.json(
      { error: "Could not add your product. Please try again." },
      { status: 500 },
    );
  }
}
