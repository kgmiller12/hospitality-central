import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const me = await requireUser();
  const { session_id } = await searchParams;
  let ok = me.isPremium;

  // Confirm the payment directly with Stripe so access is instant, even before the webhook arrives.
  if (!ok && stripe && session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.client_reference_id === String(me.id) && session.status === "complete") {
      await db
        .update(users)
        .set({ isPremium: true, stripeSubscriptionId: String(session.subscription) })
        .where(eq(users.id, me.id));
      ok = true;
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="card">
        <div className="text-5xl">{ok ? "🎉" : "⏳"}</div>
        <h1 className="mt-3 font-serif text-3xl font-bold text-navy">{ok ? "Welcome to Premium!" : "Payment processing"}</h1>
        <p className="mt-2 text-stone-600">
          {ok
            ? "You can now message any member and see everyone's contact information."
            : "We haven't received confirmation from Stripe yet. Refresh in a moment."}
        </p>
        <Link href="/recommended" className="btn-primary mt-6">Find people to message</Link>
      </div>
    </div>
  );
}
