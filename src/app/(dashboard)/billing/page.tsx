import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PRICING_PLANS } from "@/lib/constants";
import { Check, CreditCard } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const currentPlan = user?.plan || "FREE";
  const subscription = user?.subscriptions[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payments
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Plan
            </h3>
            <p className="text-2xl font-bold mt-1">
              KlioAI {currentPlan.toLowerCase()}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  currentPlan === "FREE"
                    ? "bg-muted text-muted-foreground"
                    : currentPlan === "PRO"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                }`}
              >
                {subscription?.status || "NONE"}
              </span>
            </div>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.type;

          return (
            <div
              key={plan.name}
              className={`rounded-xl border bg-card p-6 ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-medium text-primary mb-2">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full rounded-lg py-2.5 text-sm font-medium text-center border border-border bg-muted">
                  Current Plan
                </div>
              ) : plan.type === "FREE" ? (
                <button className="w-full rounded-lg py-2.5 text-sm font-medium border border-border hover:bg-muted transition-colors">
                  {plan.cta}
                </button>
              ) : (
                <CheckoutButton planType={plan.type} popular={plan.popular} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
