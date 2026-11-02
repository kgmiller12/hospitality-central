import Link from "next/link";
import { desc, eq, inArray, or } from "drizzle-orm";
import { db, messages, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";

export default async function MessagesPage() {
  const me = await requireUser();
  const rows = await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, me.id), eq(messages.recipientId, me.id)))
    .orderBy(desc(messages.createdAt));

  // Latest message per conversation partner.
  const latest = new Map<number, (typeof rows)[number]>();
  for (const m of rows) {
    const other = m.senderId === me.id ? m.recipientId : m.senderId;
    if (!latest.has(other)) latest.set(other, m);
  }
  const partners = latest.size
    ? await db.select().from(users).where(inArray(users.id, [...latest.keys()]))
    : [];
  const byId = new Map(partners.map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-5 font-serif text-3xl font-bold text-navy">Messages</h1>
      {!me.isPremium && (
        <div className="card mb-5 border-gold bg-gold-light">
          <p className="font-semibold text-navy">🔒 Messaging is a Premium feature</p>
          <p className="text-sm text-stone-700">You can read messages sent to you, but you need Premium ($6.50/month) to send messages.</p>
          <Link href="/upgrade" className="btn-primary mt-3">Upgrade to Premium</Link>
        </div>
      )}
      {latest.size === 0 ? (
        <p className="card text-stone-500">
          No conversations yet. Find someone on the <Link href="/recommended" className="text-navy underline">Recommended</Link> page and say hello.
        </p>
      ) : (
        <ul className="card divide-y divide-stone-100 p-0">
          {[...latest].map(([otherId, m]) => {
            const other = byId.get(otherId);
            if (!other) return null;
            const unread = m.recipientId === me.id && !m.read;
            return (
              <li key={otherId}>
                <Link href={`/messages/${otherId}`} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50">
                  <Avatar name={other.name} src={other.avatar} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-navy ${unread ? "font-bold" : "font-semibold"}`}>{other.name}</p>
                    <p className={`truncate text-sm ${unread ? "text-stone-900" : "text-stone-500"}`}>
                      {m.senderId === me.id && "You: "}{m.content}
                    </p>
                  </div>
                  <span className="text-xs text-stone-400">{timeAgo(m.createdAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
