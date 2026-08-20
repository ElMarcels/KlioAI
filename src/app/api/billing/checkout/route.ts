import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPaypalClientId,
  getPaypalClientSecret,
  getPaypalApiBase,
} from "@/lib/paypal";
import { APP_URL } from "@/lib/constants";

async function getAccessToken(): Promise<string> {
  const base = getPaypalApiBase();
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${getPaypalClientId()}:${getPaypalClientSecret()}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("Failed to obtain PayPal access token");
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { planId } = await req.json();

    if (!planId || (planId !== "PRO" && planId !== "ENTERPRISE")) {
      return NextResponse.json(
        { error: "Valid plan ID is required (PRO or ENTERPRISE)" },
        { status: 400 }
      );
    }

    const paypalPlanId =
      planId === "PRO"
        ? process.env.PAYPAL_PRO_PLAN_ID
        : process.env.PAYPAL_ENTERPRISE_PLAN_ID;

    if (!paypalPlanId) {
      return NextResponse.json(
        { error: "PayPal plan not configured" },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken();
    const base = getPaypalApiBase();

    const subscriptionRes = await fetch(`${base}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: paypalPlanId,
        subscriber: {
          name: {
            given_name: session.user.name || "User",
            surname: " ",
          },
          email_address: session.user.email,
        },
        application_context: {
          brand_name: "KlioAI",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${APP_URL}/billing?success=true`,
          cancel_url: `${APP_URL}/billing?canceled=true`,
        },
        custom_id: session.user.id,
      }),
    });

    if (!subscriptionRes.ok) {
      const error = await subscriptionRes.text();
      console.error("PayPal subscription creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create PayPal subscription" },
        { status: 500 }
      );
    }

    const subscription = await subscriptionRes.json();

    const approvalLink = subscription.links?.find(
      (link: { rel: string; href: string }) => link.rel === "approve"
    );

    if (!approvalLink) {
      return NextResponse.json(
        { error: "No approval link found" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: approvalLink.href });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
