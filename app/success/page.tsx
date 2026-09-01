import Link from "next/link";
import { Trophy } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const { checkout_id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="card-brutal bg-accent p-8 text-accent-foreground sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-foreground bg-card text-card-foreground">
          <Trophy className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-3xl sm:text-4xl">You&apos;re in!</h1>
        <p className="mx-auto mt-3 max-w-md">
          Payment received. We&apos;re confirming it now — your spot appears on
          the board within a few seconds.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/#board" className="btn bg-card text-card-foreground">
            See the board
          </Link>
          <Link href="/#bid" className="btn btn-secondary">
            Add another
          </Link>
        </div>
        {checkout_id ? (
          <p className="mt-6 text-xs opacity-70 [overflow-wrap:anywhere]">
            Ref: {checkout_id}
          </p>
        ) : null}
      </div>
    </div>
  );
}
