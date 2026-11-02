import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { getFriendStatuses, getPosts } from "@/lib/queries";
import Avatar from "@/components/Avatar";
import FriendButton from "@/components/FriendButton";
import PostCard from "@/components/PostCard";
import PostComposer from "@/components/PostComposer";

export default async function SchoolPage({ params }: { params: Promise<{ school: string }> }) {
  const me = await requireUser();
  const school = decodeURIComponent((await params).school);
  const [members, statuses, feed] = await Promise.all([
    db.select().from(users).where(eq(users.school, school)),
    getFriendStatuses(me.id),
    // Posts appear here automatically because they're matched on the author's school.
    getPosts(me.id, eq(users.school, school)),
  ]);
  const mine = me.school === school;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        <div>
          <Link href="/schools?all=1" className="text-sm text-stone-500 hover:underline">← All schools</Link>
          <h1 className="font-serif text-3xl font-bold text-navy">🎓 {school}</h1>
          <p className="text-stone-600">Updates from students and alumni, whether or not you&apos;re connected yet.</p>
        </div>
        {mine && <PostComposer school={school} />}
        {feed.length === 0 ? (
          <p className="card text-stone-500">No posts from this school yet.</p>
        ) : (
          feed.map((p) => <PostCard key={p.id} post={p} viewerId={me.id} />)
        )}
      </div>
      <aside className="card h-fit">
        <h2 className="mb-3 font-semibold text-navy">Students & alumni ({members.length})</h2>
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <Avatar name={m.name} src={m.avatar} size={32} />
              <Link href={`/profile/${m.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{m.name}</Link>
              <FriendButton userId={m.id} status={statuses.get(m.id) ?? "none"} small />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
