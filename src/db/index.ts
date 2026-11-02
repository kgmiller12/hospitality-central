import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzleNeon<typeof schema>>;

// With DATABASE_URL set (Vercel + Neon) we talk to Neon over HTTP.
// Without it, a local PGlite database in .data/ is used so `npm run dev` works with zero setup.
function createDb(): DB {
  if (process.env.DATABASE_URL) {
    return drizzleNeon(neon(process.env.DATABASE_URL), { schema });
  }
  const client = new PGlite(".data/pglite");
  return drizzlePglite(client, { schema }) as unknown as DB;
}

const globalForDb = globalThis as unknown as { db?: DB };
export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export * from "./schema";
