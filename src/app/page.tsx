import Link from "next/link";
import { PREMIUM_PRICE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";

const features = [
  { icon: "🤝", title: "Connect with hospitality pros", text: "Share wins, comment, like, and add friends who work in hotels, restaurants and beyond." },
  { icon: "✨", title: "AI Connection Matchmaker", text: "Our AI reads your profile and recommends the people most worth meeting, with a ready-to-send intro." },
  { icon: "🗺️", title: "Hospitality-only job board", text: "Get first access to new openings and browse them on a map of the US, filtered by department." },
  { icon: "🎓", title: "School & alumni pages", text: "Every post you make also appears on your school's page, so students and alumni stay connected." },
  { icon: "📰", title: "Industry news", text: "Hotels, restaurant groups and hospitality companies post updates on their properties and teams." },
  { icon: "💬", title: "Direct messages", text: "Premium members can message anyone and see contact information on every profile." },
];

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-widest text-gold uppercase">For hospitality professionals</p>
            <h1 className="font-serif text-4xl leading-tight font-bold md:text-5xl">
              The network built for the people who make hospitality happen.
            </h1>
            <p className="mt-5 text-lg text-stone-300">
              Hospitality Central brings hotel, restaurant and event professionals together to make connections, keep up with industry news, and find their next job. No noise from other industries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link href="/feed" className="btn-gold px-6 py-3 text-base">Go to your feed</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn-gold px-6 py-3 text-base">Create your free account</Link>
                  <Link href="/login" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">Log in</Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="space-y-3">
              {[
                ["Maria S.", "Director of Rooms", "Proud of our front office team for a 94% guest satisfaction score!"],
                ["James C.", "Executive Chef", "Launched our fall menu with 80% local produce."],
                ["Priya P.", "Sales Manager", "Closed a 400-room-night conference group!"],
              ].map(([n, r, t]) => (
                <div key={n} className="rounded-xl bg-white p-4 text-stone-800">
                  <p className="text-sm font-semibold">{n} <span className="font-normal text-stone-500">· {r}</span></p>
                  <p className="mt-1 text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-serif text-3xl font-bold text-navy">Everything your hospitality career needs, in one place</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-8">
        <h2 className="text-center font-serif text-3xl font-bold text-navy">Simple pricing</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="mt-1 text-3xl font-bold text-navy">$0</p>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              <li>✓ Your professional profile</li>
              <li>✓ Post, like, comment and add friends</li>
              <li>✓ AI Connection Matchmaker</li>
              <li>✓ Job board with map, school pages, news</li>
            </ul>
          </div>
          <div className="card border-2 border-gold">
            <h3 className="text-lg font-semibold">Premium</h3>
            <p className="mt-1 text-3xl font-bold text-navy">{PREMIUM_PRICE}<span className="text-base font-normal text-stone-500"> / month</span></p>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              <li>✓ Everything in Free</li>
              <li>✓ <b>Direct message</b> any member</li>
              <li>✓ <b>See contact information</b> on every profile</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <Link href={user ? "/upgrade" : "/signup"} className="btn-gold mt-5 w-full">Get Premium</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
