import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { posts } from "@/db";
import { requireUser } from "@/lib/auth";
import { getFriends, getIncomingRequests, getPosts } from "@/lib/queries";
import CategoryFilter from "@/components/CategoryFilter";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import Avatar from "@/components/Avatar";
import FriendButton from "@/components/FriendButton";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; view?: string }>;
}) {
  const me = await requireUser();
  const { category, view } = await searchParams;
  const [friends, requests] = await Promise.all([getFriends(me.id), getIncomingRequests(me.id)]);

  const filters = [];
  if (category) filters.push(eq(posts.category, category));
  if (view === "friends") filters.push(inArray(posts.authorId, [me.id, ...friends.map((f) => f.id)]));
  const feed = await getPosts(me.id, filters.length ? and(...filters) : undefined);

  const tab = (v: string | undefined, label: string) => (
    <Link
      href={`/feed?${new URLSearchParams({ ...(v ? { view: v } : {}), ...(category ? { category } : {}) })}`}
      className={`border-b-2 px-1 pb-2 text-sm font-semibold ${view === v ? "border-gold text-navy" : "border-transparent text-stone-500"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        <h1 className="font-serif text-3xl font-bold text-navy">Connections</h1>
        <PostComposer school={me.school} />
        <div className="flex gap-5 border-b border-stone-200">
          {tab(undefined, "Everyone")}
          {tab("friends", "Friends only")}
        </div>
        <CategoryFilter basePath="/feed" active={category} params={{ view }} />
        {feed.length === 0 ? (
          <p className="card text-center text-stone-500">No posts here yet. Be the first to share something!</p>
        ) : (
          feed.map((p) => <PostCard key={p.id} post={p} viewerId={me.id} />)
        )}
      </div>

      <aside className="space-y-4">
        {requests.length > 0 && (
          <div className="card">
            <h2 className="mb-3 font-semibold text-navy">Friend requests</h2>
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <Avatar name={r.name} src={r.avatar} size={32} />
                  <Link href={`/profile/${r.id}`} className="flex-1 truncate text-sm font-medium hover:underline">{r.name}</Link>
                  <FriendButton userId={r.id} status="received" small />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="card">
          <h2 className="mb-3 font-semibold text-navy">My friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-sm text-stone-500">
              No friends yet. <Link href="/recommended" className="text-navy underline">Find people to connect with</Link>.
            </p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.id}>
                  <Link href={`/profile/${f.id}`} className="flex items-center gap-2 text-sm hover:underline">
                    <Avatar name={f.name} src={f.avatar} size={28} /> {f.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!me.isPremium && (
          <div className="card border-gold bg-gold-light">
            <p className="text-sm font-semibold text-navy">Want to message people directly?</p>
            <p className="mt-1 text-sm text-stone-700">Premium unlocks messaging and contact info for $10/month.</p>
            <Link href="/upgrade" className="btn-primary mt-3 w-full">Upgrade</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
