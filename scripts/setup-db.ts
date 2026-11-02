/**
 * Runs database migrations and makes sure the demo account exists.
 * On a brand-new database it also adds sample members, posts, jobs and news
 * so the app doesn't look empty. Safe to run on every deploy.
 *
 *   npm run db:setup
 */
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { mkdirSync } from "node:fs";
import * as schema from "../src/db/schema";

const { users, posts, comments, likes, friendships, jobs, news } = schema;

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
    console.log("Seeded demo account and sample data");
  }

  await pglite?.close();
}

async function seed(db: ReturnType<typeof drizzleNeon<typeof schema>>, demoHash: string) {
  const sampleHash = await bcrypt.hash(crypto.randomUUID(), 10);

  const [demo] = await db
    .insert(users)
    .values({
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
    })
    .returning();

  const sample = await db
    .insert(users)
    .values([
      {
        email: "sample.maria@example.com",
        name: "Maria Santos",
        headline: "Director of Rooms | Penn State alum",
        bio: "Fifteen years in full-service hotels. Happy to mentor students interested in rooms division leadership.",
        school: "Penn State University",
        currentJob: "Director of Rooms",
        currentEmployer: "Harborview Grand Hotel",
        experience: "Front Office Manager, Lakeside Resort\nAssistant Front Office Manager, City Center Inn",
        certifications: "Certified Rooms Division Executive (CRDE)",
        interests: "Hotels,Rooms,Managers",
        location: "Philadelphia, PA",
        contactEmail: "maria.santos@example.com",
        phone: "(555) 010-1111",
      },
      {
        email: "sample.james@example.com",
        name: "James Carter",
        headline: "Executive Chef building sustainable menus",
        bio: "Culinary Institute grad. I run a farm-to-table kitchen and love talking food cost and team culture.",
        school: "Culinary Institute of America",
        currentJob: "Executive Chef",
        currentEmployer: "Copper Kettle Bistro",
        experience: "Sous Chef, Bluewater Seafood House\nLine Cook, The Oak Room",
        certifications: "ServSafe Manager\nCertified Executive Chef (CEC)",
        interests: "Restaurants,Food and Beverage,Managers",
        location: "Charleston, SC",
        contactEmail: "james.carter@example.com",
      },
      {
        email: "sample.priya@example.com",
        name: "Priya Patel",
        headline: "Hotel Sales Manager | Group & Events",
        bio: "I help hotels fill their group blocks. Ask me about breaking into hotel sales.",
        school: "Cornell University",
        currentJob: "Sales Manager",
        currentEmployer: "Summit Ridge Hotels",
        experience: "Sales Coordinator, Summit Ridge Hotels\nEvents Intern, Riverside Conference Center",
        certifications: "Certified Hospitality Sales Professional (CHSP)",
        interests: "Sales,Marketing,Hotels",
        location: "Chicago, IL",
        contactEmail: "priya.patel@example.com",
      },
      {
        email: "sample.tyler@example.com",
        name: "Tyler Nguyen",
        headline: "Penn State SHM student | F&B intern",
        bio: "Junior in Hospitality Management. Interning in food and beverage and looking for summer resort roles.",
        school: "Penn State University",
        currentJob: "Food & Beverage Intern",
        currentEmployer: "Mountain Laurel Resort",
        experience: "Barista, Webster's Cafe",
        certifications: "ServSafe Food Handler",
        interests: "Food and Beverage,Restaurants,Hotels",
        location: "State College, PA",
        contactEmail: "tyler.nguyen@example.com",
      },
      {
        email: "sample.alexis@example.com",
        name: "Alexis Johnson",
        headline: "Executive Housekeeper focused on team training",
        bio: "Housekeeping is the heartbeat of a hotel. I share training ideas and productivity tips.",
        school: "University of Nevada, Las Vegas",
        currentJob: "Executive Housekeeper",
        currentEmployer: "Desert Palms Resort & Casino",
        experience: "Housekeeping Manager, Silver Sands Hotel",
        certifications: "Certified Executive Housekeeper (CEH)",
        interests: "Housekeeping,Rooms,Managers",
        location: "Las Vegas, NV",
        contactEmail: "alexis.johnson@example.com",
      },
      {
        email: "sample.daniel@example.com",
        name: "Daniel Kim",
        headline: "Hotel Finance & Revenue Analyst",
        bio: "Numbers person in a people business. Revenue management, budgeting and owner reporting.",
        school: "University of Central Florida",
        currentJob: "Revenue Analyst",
        currentEmployer: "Coastal Hospitality Group",
        experience: "Night Auditor, Palm Bay Hotel",
        certifications: "Certified Hospitality Revenue Manager (CRME)",
        interests: "Finance,Hotels,Sales",
        location: "Orlando, FL",
        contactEmail: "daniel.kim@example.com",
      },
      {
        email: "sample.sofia@example.com",
        name: "Sofia Rossi",
        headline: "Restaurant Marketing Manager",
        bio: "I grow restaurant brands on social media and in the community.",
        school: "Johnson & Wales University",
        currentJob: "Marketing Manager",
        currentEmployer: "Bella Tavola Restaurant Group",
        experience: "Social Media Coordinator, Fork & Field",
        interests: "Marketing,Restaurants,Food and Beverage",
        location: "Providence, RI",
        contactEmail: "sofia.rossi@example.com",
      },
      {
        email: "sample.summit@example.com",
        name: "Summit Ridge Hotels",
        accountType: "company",
        headline: "A family of 24 upscale hotels across the US",
        bio: "Summit Ridge Hotels is a sample company account used to show company news and job postings.",
        currentEmployer: "Summit Ridge Hotels",
        interests: "Hotels,Sales,Managers",
        location: "Chicago, IL",
        contactEmail: "careers@example.com",
      },
    ].map((u) => ({ ...u, passwordHash: sampleHash })))
    .returning();

  const byName = Object.fromEntries(sample.map((u) => [u.name.split(" ")[0], u]));
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

  const insertedPosts = await db
    .insert(posts)
    .values([
      {
        authorId: byName.Maria.id,
        content: "Proud of our front office team for hitting a 94% guest satisfaction score this quarter! Recognition matters. Thank your teams today.",
        category: "Rooms",
        createdAt: hoursAgo(3),
      },
      {
        authorId: byName.James.id,
        content: "Launched our fall menu this week with 80% of produce sourced within 100 miles. Huge thanks to our local farmers and my incredible kitchen crew.",
        category: "Food and Beverage",
        createdAt: hoursAgo(7),
      },
      {
        authorId: byName.Tyler.id,
        content: "Just finished my first banquet shift running a 300-guest wedding. Exhausted but hooked. Any tips for an F&B intern looking to move into events?",
        category: "Food and Beverage",
        createdAt: hoursAgo(12),
      },
      {
        authorId: byName.Priya.id,
        content: "Closed my biggest group contract yet: a 400-room-night medical conference. Persistence pays off in hotel sales!",
        category: "Sales",
        createdAt: hoursAgo(20),
      },
      {
        authorId: byName.Alexis.id,
        content: "Rolled out a new room-attendant training program with peer mentors. Turnover is down 30% since spring.",
        category: "Housekeeping",
        createdAt: hoursAgo(30),
      },
      {
        authorId: byName.Daniel.id,
        content: "Earned my CRME certification today! Revenue management is such a fun mix of data and guest psychology.",
        category: "Finance",
        createdAt: hoursAgo(44),
      },
      {
        authorId: byName.Sofia.id,
        content: "Our restaurant group's Instagram just passed 50k followers. Storytelling about our staff beats any paid ad.",
        category: "Marketing",
        createdAt: hoursAgo(60),
      },
      {
        authorId: demo.id,
        content: "Promoted to Front Office Supervisor! Grateful for my mentors at the Nittany Lion Inn.",
        category: "Hotels",
        createdAt: hoursAgo(72),
      },
    ])
    .returning();

  await db.insert(comments).values([
    { postId: insertedPosts[2].id, authorId: byName.Maria.id, content: "Learn the BEO inside and out and always ask the captain what's next. Welcome to events!" },
    { postId: insertedPosts[7].id, authorId: byName.Tyler.id, content: "Congrats! Well deserved." },
    { postId: insertedPosts[0].id, authorId: demo.id, content: "Love this. Recognition makes such a difference at the desk." },
  ]);
  await db.insert(likes).values([
    { postId: insertedPosts[0].id, userId: demo.id },
    { postId: insertedPosts[0].id, userId: byName.Tyler.id },
    { postId: insertedPosts[1].id, userId: byName.Sofia.id },
    { postId: insertedPosts[7].id, userId: byName.Maria.id },
    { postId: insertedPosts[7].id, userId: byName.Tyler.id },
  ]);

  await db.insert(friendships).values([
    { requesterId: demo.id, addresseeId: byName.Tyler.id, status: "accepted" },
    { requesterId: byName.Priya.id, addresseeId: demo.id, status: "pending" },
  ]);

  const poster = byName.Summit.id;
  await db.insert(jobs).values([
    { posterId: poster, title: "Front Desk Agent", company: "Summit Ridge Hotel Chicago", description: "Welcome guests, manage check-in and check-out, and solve problems with a smile. Flexible shifts.", category: "Rooms", city: "Chicago", state: "IL", lat: 41.88, lng: -87.63, applyUrl: "https://example.com/careers/front-desk" },
    { posterId: poster, title: "Assistant General Manager", company: "Summit Ridge Hotel Denver", description: "Support the GM in all hotel operations, lead department heads, and drive guest satisfaction.", category: "Managers", city: "Denver", state: "CO", lat: 39.74, lng: -104.99, applyUrl: "https://example.com/careers/agm" },
    { posterId: poster, title: "Group Sales Manager", company: "Summit Ridge Hotel Nashville", description: "Prospect and close group business for a 300-room upscale hotel. Base plus commission.", category: "Sales", city: "Nashville", state: "TN", lat: 36.16, lng: -86.78, applyUrl: "https://example.com/careers/sales" },
    { posterId: byName.James.id, title: "Line Cook", company: "Copper Kettle Bistro", description: "Farm-to-table kitchen looking for a reliable line cook who loves fresh ingredients.", category: "Restaurants", city: "Charleston", state: "SC", lat: 32.78, lng: -79.93, applyUrl: "https://example.com/careers/line-cook" },
    { posterId: byName.Alexis.id, title: "Housekeeping Supervisor", company: "Desert Palms Resort & Casino", description: "Lead a team of room attendants, inspect rooms, and coordinate with the front desk.", category: "Housekeeping", city: "Las Vegas", state: "NV", lat: 36.17, lng: -115.14, applyUrl: "https://example.com/careers/hk-supervisor" },
    { posterId: byName.Daniel.id, title: "Hotel Staff Accountant", company: "Coastal Hospitality Group", description: "Daily revenue audit, AP/AR, and month-end close for a portfolio of resort hotels.", category: "Finance", city: "Orlando", state: "FL", lat: 28.54, lng: -81.38, applyUrl: "https://example.com/careers/accountant" },
    { posterId: byName.Sofia.id, title: "Social Media Coordinator", company: "Bella Tavola Restaurant Group", description: "Create content, manage our channels, and partner with chefs on storytelling.", category: "Marketing", city: "Providence", state: "RI", lat: 41.82, lng: -71.41, applyUrl: "https://example.com/careers/social" },
    { posterId: byName.James.id, title: "Banquet Server", company: "Harborview Grand Hotel", description: "Serve weddings, galas and conferences in our 20,000 sq ft ballroom.", category: "Food and Beverage", city: "Philadelphia", state: "PA", lat: 39.95, lng: -75.17, applyUrl: "https://example.com/careers/banquets" },
    { posterId: poster, title: "Summer Resort Internship", company: "Summit Ridge Lake Tahoe", description: "Rotate through rooms, F&B and recreation at a lakeside resort. Housing provided.", category: "Hotels", city: "South Lake Tahoe", state: "CA", lat: 38.94, lng: -119.98, applyUrl: "https://example.com/careers/intern" },
    { posterId: poster, title: "Restaurant General Manager", company: "Summit Ridge Seattle - Pike Kitchen", description: "Own P&L, hiring and guest experience for a 140-seat hotel restaurant.", category: "Managers", city: "Seattle", state: "WA", lat: 47.61, lng: -122.33, applyUrl: "https://example.com/careers/rgm" },
    { posterId: poster, title: "Night Auditor", company: "Summit Ridge Hotel Austin", description: "Balance the day's revenue, run reports and take care of overnight guests.", category: "Rooms", city: "Austin", state: "TX", lat: 30.27, lng: -97.74, applyUrl: "https://example.com/careers/night-audit" },
    { posterId: byName.Maria.id, title: "Guest Services Manager", company: "Harborview Grand Hotel", description: "Lead concierge and bell staff and design memorable guest moments.", category: "Hotels", city: "New York", state: "NY", lat: 40.71, lng: -74.01, applyUrl: "https://example.com/careers/guest-services" },
  ]);

  await db.insert(news).values([
    { authorId: poster, company: "Summit Ridge Hotels", title: "Summit Ridge opens its 25th hotel in Nashville", body: "Our newest property brings 300 rooms, a rooftop bar and 15,000 sq ft of event space to downtown Nashville. We are hiring across every department.", createdAt: hoursAgo(5) },
    { authorId: poster, company: "Summit Ridge Hotels", title: "Summit Ridge launches tuition support for hospitality students", body: "Team members enrolled in hospitality degree programs can now receive up to $5,000 per year in tuition support.", createdAt: hoursAgo(50) },
    { authorId: byName.Sofia.id, company: "Bella Tavola Restaurant Group", title: "Bella Tavola introduces a four-day work week pilot for managers", body: "Starting next month, salaried restaurant managers will pilot a four-day schedule to improve retention and wellbeing.", createdAt: hoursAgo(80) },
    { authorId: byName.James.id, company: "Copper Kettle Bistro", title: "Copper Kettle partners with 12 local farms", body: "The partnership guarantees year-round purchasing for local growers and fresher plates for guests.", createdAt: hoursAgo(120) },
  ]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
