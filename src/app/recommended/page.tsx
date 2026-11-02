import { requireUser } from "@/lib/auth";
import { rankCandidates } from "@/lib/matching";
import { getFriendStatuses } from "@/lib/queries";
import AiMatches from "@/components/AiMatches";
import PersonCard from "@/components/PersonCard";

export default async function RecommendedPage() {
  const me = await requireUser();
  const [people, statuses] = await Promise.all([rankCandidates(me), getFriendStatuses(me.id)]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy">Recommended connections</h1>
        <p className="text-stone-600">People you may want to connect with, based on your profile and interests.</p>
      </div>
      <AiMatches premium={me.isPremium} />
      <div>
        <h2 className="mb-4 font-serif text-xl font-bold text-navy">People you may know</h2>
        {people.length === 0 ? (
          <p className="card text-stone-500">You&apos;re connected with everyone so far. Check back as more people join!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.slice(0, 24).map((p) => (
              <PersonCard key={p.id} person={p} status={statuses.get(p.id) ?? "none"} premium={me.isPremium} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
