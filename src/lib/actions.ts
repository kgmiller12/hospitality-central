"use server";

import bcrypt from "bcryptjs";
import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, users, posts, likes, comments, friendships, messages, jobs, news } from "@/db";
import { createSession, destroySession, requireUser } from "./auth";
import { CATEGORIES, US_STATES } from "./constants";

export type FormState = { error?: string } | undefined;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (fd: FormData, key: string) => str(fd, key) || null;
const category = (fd: FormData) => {
  const c = str(fd, "category");
  return (CATEGORIES as readonly string[]).includes(c) ? c : null;
};

// ---------- Accounts ----------

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const accountType = str(fd, "accountType") === "company" ? "company" : "individual";
  const attended = str(fd, "attended") === "yes";
  const school = attended ? optional(fd, "school") : null;
  const currentEmployer = accountType === "company" ? name : optional(fd, "currentEmployer");

  if (!name || !email || !password) return { error: "Please fill in your name, email and password." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (accountType === "individual" && attended && !school)
    return { error: "Please tell us which college or university you attended." };
  if (accountType === "individual" && !attended && !currentEmployer)
    return { error: "Please tell us where you currently work." };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { error: "An account with that email already exists. Try logging in." };

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      accountType,
      school,
      currentEmployer,
      currentJob: optional(fd, "currentJob"),
      contactEmail: email,
    })
    .returning();

  await createSession(user.id);
  redirect("/profile/edit?welcome=1");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  await createSession(user.id);
  const next = str(fd, "next");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/feed");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function updateProfile(fd: FormData) {
  const me = await requireUser();
  const interests = fd
    .getAll("interests")
    .map(String)
    .filter((c) => (CATEGORIES as readonly string[]).includes(c));
  await db
    .update(users)
    .set({
      name: str(fd, "name") || me.name,
      avatar: optional(fd, "avatar"),
      headline: optional(fd, "headline"),
      bio: optional(fd, "bio"),
      school: optional(fd, "school"),
      currentJob: optional(fd, "currentJob"),
      currentEmployer: optional(fd, "currentEmployer"),
      experience: optional(fd, "experience"),
      certifications: optional(fd, "certifications"),
      location: optional(fd, "location"),
      contactEmail: optional(fd, "contactEmail"),
      phone: optional(fd, "phone"),
      linkedin: optional(fd, "linkedin"),
      interests: interests.join(",") || null,
    })
    .where(eq(users.id, me.id));
  revalidatePath("/", "layout");
  redirect(`/profile/${me.id}`);
}

// ---------- Posts ----------

export async function createPost(fd: FormData) {
  const me = await requireUser();
  const content = str(fd, "content");
  if (!content) return;
  await db.insert(posts).values({
    authorId: me.id,
    content: content.slice(0, 3000),
    image: optional(fd, "image"),
    category: category(fd),
  });
  revalidatePath("/", "layout");
}

export async function deletePost(postId: number) {
  const me = await requireUser();
  await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.authorId, me.id)));
  revalidatePath("/", "layout");
}

export async function toggleLike(postId: number) {
  const me = await requireUser();
  const where = and(eq(likes.postId, postId), eq(likes.userId, me.id));
  const [existing] = await db.select().from(likes).where(where);
  if (existing) await db.delete(likes).where(where);
  else await db.insert(likes).values({ postId, userId: me.id });
  revalidatePath("/", "layout");
}

export async function addComment(postId: number, fd: FormData) {
  const me = await requireUser();
  const content = str(fd, "content");
  if (!content) return;
  await db.insert(comments).values({ postId, authorId: me.id, content: content.slice(0, 1000) });
  revalidatePath("/", "layout");
}

// ---------- Friends ----------

function pairWhere(a: number, b: number) {
  return or(
    and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)),
    and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a)),
  );
}

export async function sendFriendRequest(userId: number) {
  const me = await requireUser();
  if (userId === me.id) return;
  const [existing] = await db.select().from(friendships).where(pairWhere(me.id, userId));
  if (existing) {
    // If they already asked us, sending a request back accepts it.
    if (existing.status === "pending" && existing.addresseeId === me.id) {
      await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, existing.id));
    }
  } else {
    await db.insert(friendships).values({ requesterId: me.id, addresseeId: userId });
  }
  revalidatePath("/", "layout");
}

export async function acceptFriendRequest(userId: number) {
  const me = await requireUser();
  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, me.id)));
  revalidatePath("/", "layout");
}

export async function removeFriend(userId: number) {
  const me = await requireUser();
  await db.delete(friendships).where(pairWhere(me.id, userId));
  revalidatePath("/", "layout");
}

// ---------- Messages (premium) ----------

export async function sendMessage(recipientId: number, fd: FormData) {
  const me = await requireUser();
  if (!me.isPremium) redirect("/upgrade");
  const content = str(fd, "content");
  if (!content || recipientId === me.id) return;
  await db.insert(messages).values({ senderId: me.id, recipientId, content: content.slice(0, 2000) });
  revalidatePath(`/messages/${recipientId}`);
}

// ---------- Jobs ----------

async function geocode(city: string, state: string) {
  try {
    const q = new URLSearchParams({ city, state, country: "USA", format: "json", limit: "1" });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`, {
      headers: { "User-Agent": "HospitalityCentral/1.0 (student project)" },
      signal: AbortSignal.timeout(4000),
    });
    const [hit] = (await res.json()) as { lat: string; lon: string }[];
    if (hit) return { lat: Number(hit.lat), lng: Number(hit.lon) };
  } catch {
    // Fall back to the middle of the state below.
  }
  const s = US_STATES[state];
  return s ? { lat: s.lat, lng: s.lng } : { lat: null, lng: null };
}

export async function createJob(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const title = str(fd, "title");
  const company = str(fd, "company");
  const description = str(fd, "description");
  const city = str(fd, "city");
  const state = str(fd, "state").toUpperCase();
  const applyUrl = str(fd, "applyUrl");
  const cat = category(fd);
  if (!title || !company || !description || !city || !state || !applyUrl || !cat)
    return { error: "Please fill in every field." };
  if (!US_STATES[state]) return { error: "Please choose a US state." };
  if (!/^https?:\/\//i.test(applyUrl)) return { error: "The application link must start with http:// or https://" };

  const coords = await geocode(city, state);
  await db.insert(jobs).values({
    posterId: me.id,
    title,
    company,
    description,
    category: cat,
    city,
    state,
    applyUrl,
    ...coords,
  });
  revalidatePath("/jobs");
  redirect("/jobs");
}

export async function deleteJob(jobId: number) {
  const me = await requireUser();
  await db.delete(jobs).where(and(eq(jobs.id, jobId), eq(jobs.posterId, me.id)));
  revalidatePath("/jobs");
}

// ---------- News ----------

export async function createNews(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  if (me.accountType !== "company") return { error: "Only company accounts can post news." };
  const title = str(fd, "title");
  const body = str(fd, "body");
  const sourceUrl = optional(fd, "sourceUrl");
  if (!title || !body) return { error: "Please add a headline and the story." };
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) return { error: "Links must start with http:// or https://" };
  await db.insert(news).values({
    authorId: me.id,
    title,
    body,
    image: optional(fd, "image"),
    company: me.currentEmployer || me.name,
    sourceUrl,
  });
  revalidatePath("/news");
  redirect("/news");
}
