"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { requireUser } from "./auth";
import { appUrl, PREMIUM_CENTS, stripe } from "./stripe";

export async function startCheckout() {
  const me = await requireUser();
  if (me.isPremium) redirect("/upgrade");
  if (!stripe) redirect("/upgrade?error=stripe");

  let customerId = me.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: me.email, name: me.name, metadata: { userId: String(me.id) } });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, me.id));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: String(me.id),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PREMIUM_CENTS,
          recurring: { interval: "month" },
          product_data: {
            name: "Hospitality Central Premium",
            description: "Message any member and see contact information on every profile.",
          },
        },
      },
    ],
    allow_promotion_codes: true,
    success_url: `${appUrl()}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/upgrade?canceled=1`,
  });
  redirect(session.url!);
}

export async function openBillingPortal() {
  const me = await requireUser();
  if (!stripe || !me.stripeCustomerId) redirect("/upgrade");
  const portal = await stripe.billingPortal.sessions.create({
    customer: me.stripeCustomerId,
    return_url: `${appUrl()}/upgrade`,
  });
  redirect(portal.url);
}
