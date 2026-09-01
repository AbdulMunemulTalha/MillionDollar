import "server-only";
import { getPaidEntries } from "./entries";
import { buildBoard, type Board } from "./ranking";

/**
 * Load the leaderboard, tolerating a not-yet-configured backend. When env vars
 * are missing (fresh clone before .env.local is filled), we return an empty
 * board and `configured: false` so pages can render a helpful setup notice
 * instead of crashing.
 */
export async function getBoardSafe(): Promise<{
  board: Board;
  configured: boolean;
}> {
  try {
    const entries = await getPaidEntries();
    return { board: buildBoard(entries), configured: true };
  } catch {
    return { board: buildBoard([]), configured: false };
  }
}
