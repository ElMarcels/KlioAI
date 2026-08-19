"use client";

import { useState } from "react";

export function CheckoutButton({
  priceId,
  popular,
}: {
  priceId: string;
  popular?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
        popular
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border hover:bg-muted"
      } disabled:opacity-50`}
    >
      {loading ? "Redirecting..." : "Subscribe"}
    </button>
  );
}
