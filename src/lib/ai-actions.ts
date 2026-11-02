"use server";

import { requireUser } from "./auth";
import { aiMatches, type Candidate } from "./matching";
import { getFriendStatuses, type FriendStatus } from "./queries";

export async function getAiMatches(): Promise<
  { matches: (Candidate & { status: FriendStatus })[] } | { error: string }
> {
  const me = await requireUser();
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "The AI Matchmaker isn't configured yet (missing ANTHROPIC_API_KEY)." };
  }
  try {
    const [matches, statuses] = await Promise.all([aiMatches(me), getFriendStatuses(me.id)]);
    return { matches: matches.map((m) => ({ ...m, status: statuses.get(m.id) ?? "none" })) };
  } catch (err) {
    console.error("AI matchmaker failed", err);
    return { error: "The AI Matchmaker is busy right now. Please try again in a moment." };
  }
}
