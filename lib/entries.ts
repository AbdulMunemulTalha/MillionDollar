import "server-only";
import { createServiceClient } from "./supabase";
import { MIN_ENTRY_CENTS } from "./money";
import { fetchSiteMetadata } from "./metadata";
import type { Entry } from "./ranking";

type Row = {
  id: string;
  name: string;
  url: string;
  tagline: string | null;
  title: string | null;
  description: string | null;
  logo_url: string | null;
  brand_color: string | null;
  amount_cents: number;
  clicks: number;
  paid_at: string | null;
  created_at: string;
};

const SELECT =
  "id,name,url,tagline,title,description,logo_url,brand_color,amount_cents,clicks,paid_at,created_at";

function toEntry(r: Row): Entry {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    tagline: r.tagline,
    title: r.title,
    description: r.description,
    logoUrl: r.logo_url,
    brandColor: r.brand_color,
    amountCents: r.amount_cents,
    clicks: r.clicks,
    paidAt: r.paid_at,
    createdAt: r.created_at,
  };
}

/** All paid entries — the raw material for the leaderboard. */
export async function getPaidEntries(): Promise<Entry[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("entries")
    .select(SELECT)
    .eq("status", "paid");
  if (error) throw new Error(`Failed to load entries: ${error.message}`);
  return ((data as Row[] | null) ?? []).map(toEntry);
}

/** Resolve the destination URL for a click, only if the entry is paid. */
export async function getEntryForClick(
  id: string,
): Promise<{ url: string } | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("entries")
    .select("url,status")
    .eq("id", id)
    .maybeSingle();
  if (error || !data || data.status !== "paid") return null;
  return { url: data.url as string };
}

/** Atomically bump a paid entry's click count via the SQL function. */
export async function incrementClick(id: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("increment_click", { entry_id: id });
}

/** Create the row in `pending` state before sending the user to Polar. */
export async function createPendingEntry(input: {
  name: string;
  url: string;
  amountCents: number;
  tagline?: string | null;
  email?: string | null;
}): Promise<{ id: string }> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("entries")
    .insert({
      name: input.name,
      url: input.url,
      tagline: input.tagline ?? null,
      email: input.email ?? null,
      amount_cents: input.amountCents,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !data) {
    throw new Error(`Failed to create entry: ${error?.message ?? "unknown"}`);
  }
  return { id: data.id as string };
}

/** Link a Polar checkout id to a pending entry (best-effort). */
export async function attachCheckout(
  id: string,
  checkoutId: string,
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("entries")
    .update({ polar_checkout_id: checkoutId })
    .eq("id", id);
}

/**
 * Idempotently finalize an entry from a Polar `order.paid` webhook. The
 * `status = 'pending'` filter makes repeated deliveries no-ops. The ACTUAL
 * paid amount (netAmount) is recorded — this is what the leaderboard trusts,
 * so a tampered pay-what-you-want field can never buy an unearned rank.
 * Anything below the $10 minimum is recorded as `failed`.
 */
export async function markEntryPaidFromOrder(input: {
  entryId: string;
  orderId: string;
  customerId: string | null;
  amountCents: number;
}): Promise<void> {
  const supabase = createServiceClient();
  const paid = input.amountCents >= MIN_ENTRY_CENTS;

  // Read the still-pending row's URL so we can scrape its site. The
  // status filter keeps this a no-op on repeated (idempotent) deliveries.
  const { data: pending } = await supabase
    .from("entries")
    .select("url")
    .eq("id", input.entryId)
    .eq("status", "pending")
    .maybeSingle();
  if (!pending) return;

  // Only spend the network round-trip on entries that actually go live.
  const meta = paid
    ? await fetchSiteMetadata(pending.url as string)
    : { title: null, description: null, logoUrl: null, brandColor: null };

  await supabase
    .from("entries")
    .update({
      status: paid ? "paid" : "failed",
      amount_cents: input.amountCents,
      polar_order_id: input.orderId,
      polar_customer_id: input.customerId,
      paid_at: paid ? new Date().toISOString() : null,
      title: meta.title,
      description: meta.description,
      logo_url: meta.logoUrl,
      brand_color: meta.brandColor,
    })
    .eq("id", input.entryId)
    .eq("status", "pending");
}
