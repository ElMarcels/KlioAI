import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface PaypalEvent {
  id: string;
  event_type: string;
  resource: Record<string, any>;
}

export async function POST(req: Request) {
  const body: PaypalEvent = await req.json();

  if (!body.id || !body.event_type) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const existingEvent = await db.webhookEvent.findUnique({
    where: { stripeEventId: body.id },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  try {
    await db.webhookEvent.create({
      data: {
        stripeEventId: body.id,
        type: body.event_type,
        payload: body as any,
      },
    });

    switch (body.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleActivated(body.resource);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleCancelled(body.resource);
        break;
      case "BILLING.SUBSCRIPTION.FAILED":
        await handleFailed(body.resource);
        break;
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handleFailed(body.resource);
        break;
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptured(body.resource);
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

async function handleActivated(resource: Record<string, any>) {
  const userId = resource.custom_id;
  if (!userId) return;

  const subscriptionId = resource.id;
  const planId = resource.plan_id;

  const planType = planId === process.env.PAYPAL_ENTERPRISE_PLAN_ID
    ? "ENTERPRISE"
    : "PRO";

  await db.user.update({
    where: { id: userId },
    data: {
      plan: planType as any,
      subscriptionStatus: "ACTIVE",
    },
  });

  await db.subscription.upsert({
    where: { stripeSubscriptionId: subscriptionId },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: planId,
      status: "ACTIVE",
    },
    update: {
      stripePriceId: planId,
      status: "ACTIVE",
    },
  });
}

async function handleCancelled(resource: Record<string, any>) {
  const subscriptionId = resource.id;

  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
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

async function handleFailed(resource: Record<string, any>) {
  const subscriptionId = resource.id;

  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  await db.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "PAST_DUE" },
  });

  await db.user.update({
    where: { id: dbSubscription.userId },
    data: { subscriptionStatus: "PAST_DUE" },
  });
}

async function handlePaymentCaptured(resource: Record<string, any>) {
  const subscriptionId = resource.billing_info?.subscription_id;
  if (!subscriptionId) return;

  const dbSubscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  const amount = resource.amount
    ? parseFloat(resource.amount.total) || 0
    : 0;
  const currency = resource.amount?.currency_code?.toLowerCase() || "usd";

  await db.payment.create({
    data: {
      userId: dbSubscription.userId,
      stripePaymentId: resource.id || `paypal_${Date.now()}`,
      amount,
      currency,
      status: "succeeded",
      description: `PayPal payment capture`,
    },
  });
}
