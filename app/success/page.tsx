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
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <div className="card-brutal bg-accent p-8 sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
          <Trophy className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold sm:text-3xl">
          You&apos;re in!
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          Payment received. We&apos;re confirming it now — your spot appears on
          the board within a few seconds.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/#board" className="btn btn-primary">
            See the board
          </Link>
          <Link href="/#bid" className="btn">
            Add another
          </Link>
        </div>
        {checkout_id ? (
          <p className="mt-6 text-xs text-muted-foreground [overflow-wrap:anywhere]">
            Ref: {checkout_id}
          </p>
        ) : null}
      </div>
    </div>
  );
}
