import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, jobs } from "@/db";
import { requireUser } from "@/lib/auth";
import { deleteJob } from "@/lib/actions";
import { US_STATES } from "@/lib/constants";
import { isRecent, timeAgo } from "@/lib/format";
import CategoryFilter from "@/components/CategoryFilter";
import JobsMapLoader from "@/components/JobsMapLoader";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; state?: string }>;
}) {
  const me = await requireUser();
  const { category, q, state } = await searchParams;

  const filters = [];
  if (category) filters.push(eq(jobs.category, category));
  if (state) filters.push(eq(jobs.state, state));
  if (q) filters.push(or(ilike(jobs.title, `%${q}%`), ilike(jobs.company, `%${q}%`), ilike(jobs.description, `%${q}%`), ilike(jobs.city, `%${q}%`)));
  const list = await db.select().from(jobs).where(filters.length ? and(...filters) : undefined).orderBy(desc(jobs.createdAt));
  const mapJobs = list.filter((j) => j.lat != null && j.lng != null).map((j) => ({ ...j, lat: j.lat!, lng: j.lng! }));

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Hospitality jobs</h1>
          <p className="text-stone-600">First access to new hotel, restaurant and hospitality openings across the US.</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ Post a job</Link>
      </div>

      <form className="flex flex-wrap gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <input name="q" defaultValue={q} placeholder="Search title, property, city…" className="input max-w-sm flex-1" />
        <select name="state" defaultValue={state ?? ""} className="input w-auto">
          <option value="">All states</option>
          {Object.entries(US_STATES).map(([code, s]) => <option key={code} value={code}>{s.name}</option>)}
        </select>
        <button className="btn-outline">Search</button>
      </form>
      <CategoryFilter basePath="/jobs" active={category} params={{ q, state }} />

      <JobsMapLoader jobs={mapJobs} />

      <p className="text-sm text-stone-500">{list.length} {list.length === 1 ? "opening" : "openings"}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((j) => (
          <div key={j.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-navy">{j.title}</h2>
                <p className="text-sm font-medium">{j.company}</p>
                <p className="text-sm text-stone-500">📍 {j.city}, {j.state} · {timeAgo(j.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="chip border-gold bg-gold-light text-navy">{j.category}</span>
                {isRecent(j.createdAt) && <span className="chip border-green-600 bg-green-50 text-green-700">New</span>}
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-stone-700">{j.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <a href={j.applyUrl} target="_blank" rel="noreferrer" className="btn-primary">Apply →</a>
              {j.posterId === me.id && (
                <form action={deleteJob.bind(null, j.id)}>
                  <button className="text-xs text-stone-400 hover:text-red-600">Remove listing</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <p className="card text-center text-stone-500">No jobs match those filters yet.</p>}
    </div>
  );
}
