import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  succeeded: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">
          View all payment transactions
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Payments ({payments.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">User</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Currency</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{payment.user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{payment.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(Number(payment.amount), payment.currency)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground uppercase">{payment.currency}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadge[payment.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
