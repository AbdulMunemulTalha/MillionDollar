import Link from "next/link";
import type { Board } from "@/lib/ranking";
import { formatUsd } from "@/lib/money";
import { EntryRow } from "./EntryRow";
import { Plus } from "./icons";

function EmptyBoard({ minEntryCents }: { minEntryCents: number }) {
  return (
    <div className="card-brutal flex flex-col items-center gap-4 p-8 text-center sm:p-10">
      <p className="font-display text-xl font-bold sm:text-2xl">
        The board is empty.
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        No one has claimed a spot yet. Be the first name on the MillionDollar
        board for as little as {formatUsd(minEntryCents)}.
      </p>
      <Link href="/#bid" className="btn btn-primary">
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
    <ol className="flex flex-col gap-2.5">
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
