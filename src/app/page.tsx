import Link from "next/link";
import { SITE, KLIO_MODELS, PRICING_PLANS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold gradient-text">KlioAI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">{SITE.name}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
            {SITE.tagline}
          </p>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            {SITE.description}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start for Free
            </Link>
            <Link
              href="#models"
              className="rounded-lg border border-border px-8 py-3 text-lg font-medium hover:bg-muted transition-colors"
            >
              Explore Models
            </Link>
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Specialized AI Models
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the right model for every task
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KLIO_MODELS.map((model) => (
              <div
                key={model.id}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center mb-4`}
                >
                  <span className="text-white font-bold text-lg">
                    {model.name.split(" ")[1]?.[0] || "K"}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{model.name}</h3>
                <p className="text-muted-foreground">{model.description}</p>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      model.tier === "FREE"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-purple-500/10 text-purple-500"
                    }`}
                  >
                    {model.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border bg-card p-8 ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10 relative"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-primary shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-bold gradient-text">KlioAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KlioAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
