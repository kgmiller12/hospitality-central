import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, news, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";

export default async function NewsPage() {
  const me = await requireUser();
  const items = await db
    .select({ item: news, author: { id: users.id, name: users.name, avatar: users.avatar } })
    .from(news)
    .innerJoin(users, eq(news.authorId, users.id))
    .orderBy(desc(news.createdAt));

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Hospitality news</h1>
          <p className="text-stone-600">Updates straight from hotels, restaurant groups and hospitality companies.</p>
        </div>
        {me.accountType === "company" && <Link href="/news/new" className="btn-primary">+ Post company news</Link>}
      </div>
      {me.accountType !== "company" && (
        <p className="text-sm text-stone-500">Represent a hospitality company? Create a company account to share news about your properties.</p>
      )}
      {items.map(({ item, author }) => (
        <article key={item.id} className="card">
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" className="mb-4 max-h-80 w-full rounded-lg object-cover" />
          )}
          <Link href={`/profile/${author.id}`} className="flex items-center gap-2 text-sm text-stone-500 hover:underline">
            <Avatar name={author.name} src={author.avatar} size={24} />
            {item.company || author.name} · {timeAgo(item.createdAt)}
          </Link>
          <h2 className="mt-2 font-serif text-xl font-bold text-navy">{item.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">{item.body}</p>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-navy underline">
              Read more →
            </a>
          )}
        </article>
      ))}
      {items.length === 0 && <p className="card text-stone-500">No news yet.</p>}
    </div>
  );
}
