/**
 * Runs database migrations and makes sure the demo account exists.
 * Safe to run on every deploy.
 *
 *   npm run db:setup
 */
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { eq, like } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { mkdirSync } from "node:fs";
import * as schema from "../src/db/schema";

const { users, posts } = schema;

export const DEMO_EMAIL = "demo@demo.com";
export const DEMO_PASSWORD = "password123!";

async function main() {
  let pglite: PGlite | null = null;
  let db: ReturnType<typeof drizzleNeon<typeof schema>>;

  if (process.env.DATABASE_URL) {
    console.log("Using Neon database");
    db = drizzleNeon(neon(process.env.DATABASE_URL), { schema });
    await migrateNeon(db, { migrationsFolder: "./drizzle" });
  } else {
    console.log("No DATABASE_URL set, using local PGlite database in .data/");
    mkdirSync(".data", { recursive: true });
    pglite = new PGlite(".data/pglite");
    const local = drizzlePglite(pglite, { schema });
    await migratePglite(local, { migrationsFolder: "./drizzle" });
    db = local as unknown as typeof db;
  }

  const [existingDemo] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  if (existingDemo) {
    // Keep the demo login working and premium no matter what happened to it.
    await db
      .update(users)
      .set({ passwordHash: demoHash, isPremium: true })
      .where(eq(users.id, existingDemo.id));
    console.log("Demo account verified");
  } else {
    await seed(db, demoHash);
    console.log("Created demo account");
  }
  await removeSampleData(db);

  await pglite?.close();
}

async function seed(db: ReturnType<typeof drizzleNeon<typeof schema>>, demoHash: string) {
  await db.insert(users).values({
    email: DEMO_EMAIL,
    passwordHash: demoHash,
    name: "Demo User",
    headline: "Front Office Supervisor exploring hotel management",
    bio: "Hospitality student and front office supervisor who loves creating great guest experiences.",
    school: "Penn State University",
    currentJob: "Front Office Supervisor",
    currentEmployer: "Nittany Lion Inn",
    experience: "Front Desk Agent, Hilltop Resort (2023-2024)\nServer, Allen Street Grill (2022-2023)",
    certifications: "ServSafe Food Handler\nCertified Guest Service Professional (CGSP)",
    interests: "Hotels,Rooms,Managers",
    location: "State College, PA",
    contactEmail: DEMO_EMAIL,
    phone: "(555) 010-2030",
    isPremium: true,
  });
}

const SAMPLE_DEMO_POST = "Promoted to Front Office Supervisor! Grateful for my mentors at the Nittany Lion Inn.";

// Earlier versions seeded fictional members (and one demo post) so the app didn't look empty.
// Remove them now that real people are joining; their posts, jobs, news, likes, comments,
// friendships and messages are deleted along with them.
async function removeSampleData(db: ReturnType<typeof drizzleNeon<typeof schema>>) {
  const removed = await db
    .delete(users)
    .where(like(users.email, "sample.%@example.com"))
    .returning({ id: users.id });
  await db.delete(posts).where(eq(posts.content, SAMPLE_DEMO_POST));
  if (removed.length) console.log(`Removed ${removed.length} sample members`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
