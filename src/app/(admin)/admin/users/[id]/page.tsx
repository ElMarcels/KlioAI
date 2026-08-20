import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import UserDetailManager from "./user-detail-manager";

const roleBadge: Record<string, string> = {
  OWNER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
  MODERATOR: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  USER: "bg-muted text-muted-foreground border-border",
};

const planBadge: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground border-border",
  PRO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const subStatusBadge: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELED: "bg-red-500/10 text-red-500 border-red-500/20",
  PAST_DUE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  NONE: "bg-muted text-muted-foreground border-border",
};

const paymentStatusBadge: Record<string, string> = {
  succeeded: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "usd" }).format(amount / 100);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" } },
      conversations: { orderBy: { createdAt: "desc" }, take: 10 },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { conversations: true, payments: true, supportTickets: true, apiKeys: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Detail</h1>
        <p className="text-muted-foreground mt-1">Manage user account and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold">
              {user.name?.[0] ?? user.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name || "No name"}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadge[user.role] ?? roleBadge.USER}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${planBadge[user.plan] ?? planBadge.FREE}`}>
                {user.plan}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subscription</span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${subStatusBadge[user.subscriptionStatus] ?? subStatusBadge.NONE}`}>
                {user.subscriptionStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversations</span>
              <span>{user._count.conversations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payments</span>
              <span>{user._count.payments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">API Keys</span>
              <span>{user._count.apiKeys}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <UserDetailManager userId={user.id} currentRole={user.role} currentPlan={user.plan} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Period End</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {user.subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${subStatusBadge[sub.status] ?? subStatusBadge.NONE}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {sub.stripeCurrentPeriodEnd ? formatDate(sub.stripeCurrentPeriodEnd) : "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                    </tr>
                  ))}
                  {user.subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No subscriptions.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Recent Payments ({user._count.payments})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{formatCurrency(Number(p.amount))}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${paymentStatusBadge[p.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                  {user.payments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No payments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Recent Conversations ({user._count.conversations})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Title</th>
                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {user.conversations.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{c.title || "Untitled"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                  {user.conversations.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">No conversations.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
