import "server-only";
import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { db, users, posts, likes, comments, friendships } from "@/db";

export type FeedPost = Awaited<ReturnType<typeof getPosts>>[number];

const authorFields = {
  id: users.id,
  name: users.name,
  avatar: users.avatar,
  headline: users.headline,
  school: users.school,
};

export async function getPosts(viewerId: number, filter?: SQL, limit = 50) {
  const rows = await db
    .select({ post: posts, author: authorFields })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(filter)
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.post.id);
  const [likeRows, commentRows] = await Promise.all([
    db.select().from(likes).where(inArray(likes.postId, ids)),
    db
      .select({ comment: comments, author: authorFields })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(inArray(comments.postId, ids))
      .orderBy(comments.createdAt),
  ]);

  return rows.map(({ post, author }) => {
    const postLikes = likeRows.filter((l) => l.postId === post.id);
    return {
      ...post,
      author,
      likeCount: postLikes.length,
      likedByMe: postLikes.some((l) => l.userId === viewerId),
      comments: commentRows.filter((c) => c.comment.postId === post.id),
    };
  });
}

export type FriendStatus = "none" | "friends" | "sent" | "received" | "self";

export async function getFriendStatuses(viewerId: number): Promise<Map<number, FriendStatus>> {
  const rows = await db
    .select()
    .from(friendships)
    .where(or(eq(friendships.requesterId, viewerId), eq(friendships.addresseeId, viewerId)));
  const map = new Map<number, FriendStatus>([[viewerId, "self"]]);
  for (const f of rows) {
    const other = f.requesterId === viewerId ? f.addresseeId : f.requesterId;
    map.set(other, f.status === "accepted" ? "friends" : f.requesterId === viewerId ? "sent" : "received");
  }
  return map;
}

export async function getFriends(userId: number) {
  const statuses = await getFriendStatuses(userId);
  const ids = [...statuses].filter(([, s]) => s === "friends").map(([id]) => id);
  if (ids.length === 0) return [];
  return db.select(authorFields).from(users).where(inArray(users.id, ids));
}

export async function getIncomingRequests(userId: number) {
  return db
    .select(authorFields)
    .from(friendships)
    .innerJoin(users, eq(friendships.requesterId, users.id))
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")));
}

export async function getSchools() {
  return db
    .select({ school: users.school, members: sql<number>`count(*)::int` })
    .from(users)
    .where(sql`${users.school} is not null`)
    .groupBy(users.school)
    .orderBy(desc(sql`count(*)`));
}
