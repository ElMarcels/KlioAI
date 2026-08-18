"use client";

import { PRICING_PLANS } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, CreditCard } from "lucide-react";

export default function BillingPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payments
        </p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Plan
            </h3>
            <p className="text-2xl font-bold mt-1 capitalize">
              Klio {(session?.user?.plan || "free").toLowerCase()}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan) => (
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
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                plan.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
