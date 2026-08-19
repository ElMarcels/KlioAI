import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELED: "bg-red-500/10 text-red-500 border-red-500/20",
  PAST_DUE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  INCOMPLETE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  TRIALING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  UNPAID: "bg-red-500/10 text-red-500 border-red-500/20",
  NONE: "bg-muted text-muted-foreground border-border",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Manage all subscriptions
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Subscriptions ({subscriptions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">User</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Period End</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{sub.user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadge[sub.status] ?? statusBadge.NONE}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{sub.stripePriceId ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {sub.stripeCurrentPeriodEnd ? formatDate(sub.stripeCurrentPeriodEnd) : "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No subscriptions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
