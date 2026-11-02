import Link from "next/link";

export const metadata = { title: "About the creator · Hospitality Central" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold tracking-widest text-gold uppercase">About the creator</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-navy">Hi, I&apos;m Katelyn Miller.</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-stone-700">
        <p>
          I&apos;m a hospitality student at <b>Penn State University</b>. Throughout my classes, internships and jobs, I&apos;ve learned that
          hospitality runs on relationships. The right connection can lead to a mentor, a promotion, or your next great job.
        </p>
        <p>
          But the places where professionals usually network are crowded with every other industry. I wanted to build a platform
          <b> just for hospitality professionals</b>: somewhere hotel, restaurant and event people can connect, celebrate each other&apos;s
          wins, and share news about the industry they love.
        </p>
        <p>
          Hospitality Central is my answer. Whether you&apos;re a student looking for your first internship, an alum reconnecting with your
          program, or a manager hiring your next team, this app is here to <b>make connections easier in the hospitality world</b>.
        </p>
      </div>
      <div className="card mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["🤝", "Connect", "Meet people who understand your work."],
          ["📰", "Stay current", "News from the companies shaping hospitality."],
          ["🚀", "Grow", "Jobs, mentors and alumni in one place."],
        ].map(([i, t, d]) => (
          <div key={t}>
            <div className="text-2xl">{i}</div>
            <p className="font-semibold text-navy">{t}</p>
            <p className="text-sm text-stone-600">{d}</p>
          </div>
        ))}
      </div>
      <Link href="/signup" className="btn-gold mt-8 px-6 py-3 text-base">Join Hospitality Central</Link>
    </div>
  );
}
