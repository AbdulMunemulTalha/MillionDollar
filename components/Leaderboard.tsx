import Link from "next/link";
import type { Board } from "@/lib/ranking";
import { formatUsd } from "@/lib/money";
import { EntryRow } from "./EntryRow";
import { Plus } from "./icons";

function EmptyBoard({ minEntryCents }: { minEntryCents: number }) {
  return (
    <div className="card-brutal flex flex-col items-start gap-4 p-6 sm:p-8">
      <p className="font-display text-2xl sm:text-3xl">The board is empty.</p>
      <p className="max-w-prose text-muted-foreground">
        No one has claimed a spot yet. Be the first name on the MillionDollar
        board for as little as {formatUsd(minEntryCents)}.
      </p>
      <Link href="/#bid" className="btn btn-accent">
        <Plus className="h-4 w-4" />
        Claim the first spot
      </Link>
    </div>
  );
}

export function Leaderboard({ board }: { board: Board }) {
  if (board.ranked.length === 0) {
    return <EmptyBoard minEntryCents={board.minEntryCents} />;
  }
  return (
    <ol className="flex flex-col gap-3">
      {board.ranked.map((entry, i) => (
        <EntryRow
          key={entry.id}
          entry={entry}
          rank={i + 1}
          isKing={i === 0 && board.king !== null}
          index={i}
        />
      ))}
    </ol>
  );
}
