import { Webhooks } from "@polar-sh/nextjs";
import { markEntryPaidFromOrder } from "@/lib/entries";

export const dynamic = "force-dynamic";

// The secret is read directly (not via the throwing env getter) so that a
// missing value degrades to signature-verification failures at request time
// rather than crashing `next build`.
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderPaid: async ({ data }) => {
    const entryId = data.metadata?.entry_id;
    if (typeof entryId !== "string" || entryId.length === 0) return;
    await markEntryPaidFromOrder({
      entryId,
      orderId: data.id,
      customerId: data.customerId ?? null,
      amountCents: data.netAmount,
    });
  },
});
