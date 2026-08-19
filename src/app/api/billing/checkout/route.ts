import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/constants";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { priceId } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${APP_URL}/billing?success=true`,
      cancel_url: `${APP_URL}/billing?canceled=true`,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
