import "server-only";
import { ne } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { db, users, type User } from "@/db";
import { getFriendStatuses } from "./queries";

export type Candidate = Pick<
  User,
  "id" | "name" | "avatar" | "headline" | "school" | "currentJob" | "currentEmployer" | "interests" | "location" | "accountType"
> & { score: number; reason: string; intro?: string };

const interestList = (u: Pick<User, "interests">) => (u.interests ? u.interests.split(",") : []);
const state = (loc: string | null) => loc?.split(",").pop()?.trim().toUpperCase();

/** Fast rule-based ranking: shared school, interests, employer and state. */
export async function rankCandidates(me: User): Promise<Candidate[]> {
  const [others, statuses] = await Promise.all([
    db.select().from(users).where(ne(users.id, me.id)),
    getFriendStatuses(me.id),
  ]);
  const myInterests = new Set(interestList(me));

  return others
    .filter((u) => statuses.get(u.id) !== "friends")
    .map((u) => {
      const reasons: string[] = [];
      let score = 0;
      if (me.school && u.school === me.school) {
        score += 3;
        reasons.push(`Also part of ${u.school}`);
      }
      const shared = interestList(u).filter((i) => myInterests.has(i));
      if (shared.length) {
        score += shared.length * 2;
        reasons.push(`Shares your interest in ${shared.join(", ")}`);
      }
      if (me.currentEmployer && u.currentEmployer === me.currentEmployer) {
        score += 2;
        reasons.push(`Also works at ${u.currentEmployer}`);
      }
      if (state(me.location) && state(u.location) === state(me.location)) {
        score += 1;
        reasons.push("Works near you");
      }
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        headline: u.headline,
        school: u.school,
        currentJob: u.currentJob,
        currentEmployer: u.currentEmployer,
        interests: u.interests,
        location: u.location,
        accountType: u.accountType,
        score,
        reason: reasons.join(" · ") || "Active hospitality professional",
      };
    })
    .sort((a, b) => b.score - a.score);
}

const MatchSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number().describe("The candidate's id, copied exactly from the list"),
      reason: z.string().describe("One or two sentences, addressed to the user, on why this person is worth meeting"),
      intro: z.string().describe("A short, friendly first message the user could send this person"),
    }),
  ),
});

const profileText = (u: Partial<User>) =>
  JSON.stringify({
    name: u.name,
    type: u.accountType,
    headline: u.headline,
    job: u.currentJob,
    employer: u.currentEmployer,
    school: u.school,
    location: u.location,
    interests: u.interests,
    bio: u.bio,
    experience: u.experience,
    certifications: u.certifications,
  });

/**
 * AI Connection Matchmaker: Claude reads the user's profile and the best candidates
 * and picks the people most worth meeting, explaining why and drafting an intro.
 */
export async function aiMatches(me: User): Promise<Candidate[]> {
  const ranked = await rankCandidates(me);
  const pool = ranked.slice(0, 25);
  if (pool.length === 0) return [];

  const full = await db.select().from(users);
  const byId = new Map(full.map((u) => [u.id, u]));
  const candidates = pool.map((c) => `id ${c.id}: ${profileText(byId.get(c.id)!)}`).join("\n");

  const client = new Anthropic();
  const response = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low", format: zodOutputFormat(MatchSchema) },
    system:
      "You are the connection matchmaker for Hospitality Central, a professional network for hotel, restaurant and hospitality workers. " +
      "Recommend the people who would most help the user's hospitality career: mentors a step or two ahead in the same department, peers from the same school, " +
      "people at companies they could work for, or people with complementary skills. Be specific about what they have in common. " +
      "Write intros in a warm, professional first-person voice from the user, under 60 words, mentioning something concrete from the other person's profile.",
    messages: [
      {
        role: "user",
        content: `My profile:\n${profileText(me)}\n\nCandidates:\n${candidates}\n\nPick the 6 best people for me to connect with, best first.`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error("The AI could not produce recommendations right now.");
  }
  const poolById = new Map(pool.map((c) => [c.id, c]));
  return response.parsed_output.matches
    .filter((m) => poolById.has(m.id))
    .map((m) => ({ ...poolById.get(m.id)!, reason: m.reason, intro: m.intro }));
}
