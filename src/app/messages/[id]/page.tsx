import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, or } from "drizzle-orm";
import { db, messages, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { sendMessage } from "@/lib/actions";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import SubmitButton from "@/components/SubmitButton";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser();
  const otherId = Number((await params).id);
  if (!Number.isInteger(otherId) || otherId === me.id) notFound();
  const [other] = await db.select().from(users).where(eq(users.id, otherId));
  if (!other) notFound();

  const thread = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, me.id), eq(messages.recipientId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.recipientId, me.id)),
      ),
    )
    .orderBy(asc(messages.createdAt));
  await db
    .update(messages)
    .set({ read: true })
    .where(and(eq(messages.senderId, otherId), eq(messages.recipientId, me.id)));

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8">
      <Link href="/messages" className="mb-3 text-sm text-stone-500 hover:underline">← All messages</Link>
      <div className="card flex items-center gap-3">
        <Avatar name={other.name} src={other.avatar} size={44} />
        <div>
          <Link href={`/profile/${other.id}`} className="font-semibold text-navy hover:underline">{other.name}</Link>
          <p className="text-sm text-stone-500">{other.headline}</p>
        </div>
      </div>

      <div className="my-4 space-y-3">
        {thread.length === 0 && <p className="py-8 text-center text-sm text-stone-500">Start the conversation with {other.name.split(" ")[0]}.</p>}
        {thread.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-navy text-white" : "bg-white ring-1 ring-stone-200"}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-stone-300" : "text-stone-400"}`}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {me.isPremium ? (
        <form action={sendMessage.bind(null, other.id)} className="card flex gap-2 p-3">
          <input name="content" className="input" placeholder={`Message ${other.name.split(" ")[0]}…`} required maxLength={2000} autoComplete="off" />
          <SubmitButton pendingText="Sending…">Send</SubmitButton>
        </form>
      ) : (
        <div className="card border-gold bg-gold-light text-center">
          <p className="font-semibold text-navy">🔒 Upgrade to Premium to send messages</p>
          <Link href="/upgrade" className="btn-primary mt-3">Upgrade for $10/month</Link>
        </div>
      )}
    </div>
  );
}
