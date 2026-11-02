import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, users } from "@/db";
import { stripe } from "@/lib/stripe";

// Stripe calls this URL when a subscription starts, changes or ends.
export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe is not configured", { status: 500 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") ?? "",
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.client_reference_id) {
        await db
          .update(users)
          .set({ isPremium: true, stripeSubscriptionId: String(session.subscription), stripeCustomerId: String(session.customer) })
          .where(eq(users.id, Number(session.client_reference_id)));
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const active = sub.status === "active" || sub.status === "trialing";
      await db
        .update(users)
        .set({ isPremium: active })
        .where(eq(users.stripeCustomerId, String(sub.customer)));
      break;
    }
  }
  return Response.json({ received: true });
}
