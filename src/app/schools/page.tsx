import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSchools } from "@/lib/queries";
import { schoolSlug } from "@/lib/constants";

export default async function SchoolsPage({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  const me = await requireUser();
  const { all } = await searchParams;
  if (me.school && !all) redirect(`/schools/${schoolSlug(me.school)}`);
  const schools = await getSchools();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-navy">School & alumni connections</h1>
      <p className="mb-6 text-stone-600">Browse updates from students and alumni of each hospitality program.</p>
      {!me.school && (
        <div className="card mb-5 border-gold bg-gold-light text-sm">
          Add your school on your <Link href="/profile/edit" className="font-semibold text-navy underline">profile</Link> to get your own alumni feed.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {schools.map((s) => (
          <Link key={s.school} href={`/schools/${schoolSlug(s.school!)}`} className="card flex items-center justify-between hover:border-navy">
            <span className="font-semibold text-navy">🎓 {s.school}</span>
            <span className="text-sm text-stone-500">{s.members} {s.members === 1 ? "member" : "members"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
