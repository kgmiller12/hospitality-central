import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users, posts } from "@/db";
import { requireUser } from "@/lib/auth";
import { getFriendStatuses, getPosts } from "@/lib/queries";
import { schoolSlug } from "@/lib/constants";
import Avatar from "@/components/Avatar";
import FriendButton from "@/components/FriendButton";
import MessageButton from "@/components/MessageButton";
import PostCard from "@/components/PostCard";
import PostComposer from "@/components/PostComposer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="mb-2 font-semibold text-navy">{title}</h2>
      {children}
    </div>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) notFound();

  const isMe = me.id === user.id;
  const canSeeContact = isMe || me.isPremium;
  const [statuses, userPosts] = await Promise.all([getFriendStatuses(me.id), getPosts(me.id, eq(posts.authorId, user.id))]);
  const status = statuses.get(user.id) ?? "none";

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="card overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-navy to-navy-light" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="rounded-full ring-4 ring-white">
              <Avatar name={user.name} src={user.avatar} size={104} />
            </div>
            <div className="flex gap-2">
              {isMe ? (
                <Link href="/profile/edit" className="btn-primary">Edit profile</Link>
              ) : (
                <>
                  <FriendButton userId={user.id} status={status} />
                  <MessageButton userId={user.id} premium={me.isPremium} />
                </>
              )}
            </div>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-navy">
            {user.name}
            {user.accountType === "company" && <span className="ml-2 align-middle text-xs font-sans font-semibold text-gold uppercase">Company</span>}
            {user.isPremium && <span className="ml-2 align-middle text-xs font-sans font-semibold text-gold">★ Premium</span>}
          </h1>
          {user.headline && <p className="text-stone-700">{user.headline}</p>}
          <p className="mt-1 text-sm text-stone-500">
            {[user.currentJob && user.currentEmployer ? `${user.currentJob} at ${user.currentEmployer}` : user.currentJob || user.currentEmployer, user.location]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {user.school && (
            <Link href={`/schools/${schoolSlug(user.school)}`} className="mt-2 inline-block text-sm font-medium text-navy hover:underline">
              🎓 {user.school}
            </Link>
          )}
          {user.interests && (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.interests.split(",").map((i) => <span key={i} className="chip border-stone-300">{i}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5">
          {user.bio && <Section title="About"><p className="whitespace-pre-wrap text-sm">{user.bio}</p></Section>}
          {user.experience && <Section title="Previous experience"><p className="whitespace-pre-wrap text-sm">{user.experience}</p></Section>}
          <h2 className="font-serif text-xl font-bold text-navy">Updates & accomplishments</h2>
          {isMe && <PostComposer school={me.school} />}
          {userPosts.length === 0 ? (
            <p className="card text-sm text-stone-500">No updates yet.</p>
          ) : (
            userPosts.map((p) => <PostCard key={p.id} post={p} viewerId={me.id} />)
          )}
        </div>
        <div className="space-y-5">
          <Section title="Contact information">
            {canSeeContact ? (
              <ul className="space-y-1 text-sm break-words">
                {user.contactEmail && <li>✉️ <a href={`mailto:${user.contactEmail}`} className="underline">{user.contactEmail}</a></li>}
                {user.phone && <li>📞 {user.phone}</li>}
                {user.linkedin && <li>🔗 <a href={user.linkedin} className="underline" target="_blank" rel="noreferrer">LinkedIn</a></li>}
                {!user.contactEmail && !user.phone && !user.linkedin && <li className="text-stone-500">No contact info added.</li>}
              </ul>
            ) : (
              <div className="text-sm">
                <div className="space-y-1 blur-[3px] select-none" aria-hidden>
                  <p>✉️ hidden@example.com</p>
                  <p>📞 (555) 000-0000</p>
                </div>
                <p className="mt-3 text-stone-600">Contact info is visible to Premium members.</p>
                <Link href="/upgrade" className="btn-gold mt-2 w-full">Unlock for $6.50/mo</Link>
              </div>
            )}
          </Section>
          {user.currentJob && (
            <Section title="Current job">
              <p className="text-sm">{user.currentJob}{user.currentEmployer && <> at <b>{user.currentEmployer}</b></>}</p>
            </Section>
          )}
          {user.certifications && <Section title="Certifications"><p className="whitespace-pre-wrap text-sm">{user.certifications}</p></Section>}
        </div>
      </div>
    </div>
  );
}
