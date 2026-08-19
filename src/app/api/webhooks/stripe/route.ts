import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const existingEvent = await db.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  try {
    await db.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        payload: event.data.object as any,
      },
    });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const priceId = subscription.items.data[0]?.price.id;

  await db.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: session.customer as string,
      plan: priceId?.includes("enterprise") ? "ENTERPRISE" : "PRO",
      subscriptionStatus: "ACTIVE",
    },
  });

  await db.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: "ACTIVE",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: "ACTIVE",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) return;

  const statusMap: Record<string, any> = {
    active: "ACTIVE",
    canceled: "CANCELED",
    past_due: "PAST_DUE",
    incomplete: "INCOMPLETE",
    trialing: "TRIALING",
    unpaid: "UNPAID",
  };

  const newStatus = statusMap[subscription.status] || "NONE";

  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: newStatus,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  await db.user.update({
    where: { id: dbSubscription.userId },
    data: { subscriptionStatus: newStatus },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "CANCELED" },
  });

  await db.user.update({
    where: { id: dbSubscription.userId },
    data: {
      plan: "FREE",
      subscriptionStatus: "CANCELED",
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripe = getStripe();
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  await db.payment.create({
    data: {
      userId: dbSubscription.userId,
      stripePaymentId: invoice.payment_intent as string,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: "succeeded",
      description: `Invoice for ${invoice.period_start} - ${invoice.period_end}`,
    },
  });
}
