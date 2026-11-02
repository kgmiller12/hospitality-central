import { requireUser } from "@/lib/auth";
import { openBillingPortal, startCheckout } from "@/lib/billing-actions";
import SubmitButton from "@/components/SubmitButton";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>;
}) {
  const me = await requireUser();
  const { canceled, error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="card border-2 border-gold text-center">
        <p className="text-sm font-semibold tracking-widest text-gold uppercase">Premium</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-navy">
          {me.isPremium ? "You're a Premium member ★" : "Unlock direct connections"}
        </h1>
        <p className="mt-3 text-4xl font-bold text-navy">$6.50<span className="text-base font-normal text-stone-500"> / month</span></p>
        <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
          <li>💬 Direct message any member</li>
          <li>📇 See contact information on every profile</li>
          <li>★ Premium badge on your profile</li>
          <li>↩️ Cancel anytime</li>
        </ul>

        {canceled && <p className="mt-5 text-sm text-stone-500">Checkout canceled. You haven&apos;t been charged.</p>}
        {error === "stripe" && <p className="mt-5 text-sm text-red-600">Payments aren&apos;t configured yet (missing STRIPE_SECRET_KEY).</p>}

        {me.isPremium ? (
          me.stripeCustomerId ? (
            <form action={openBillingPortal} className="mt-6">
              <SubmitButton className="btn-outline w-full" pendingText="Opening…">Manage subscription</SubmitButton>
            </form>
          ) : (
            <p className="mt-6 text-sm text-stone-500">Premium access is included with this account.</p>
          )
        ) : (
          <form action={startCheckout} className="mt-6">
            <SubmitButton className="btn-gold w-full py-3 text-base" pendingText="Opening secure checkout…">
              Upgrade with Stripe
            </SubmitButton>
            <p className="mt-2 text-xs text-stone-500">Secure payment by Stripe. Have a promo code? Enter it at checkout.</p>
          </form>
        )}
      </div>
    </div>
  );
}
