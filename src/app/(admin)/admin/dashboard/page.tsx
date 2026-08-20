import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Users,
  CreditCard,
  MessageSquare,
  DollarSign,
  Crown,
} from "lucide-react";

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

const paymentStatusBadge: Record<string, string> = {
  succeeded: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "usd",
  }).format(amount / 100);
}

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    activeSubscriptions,
    totalMessages,
    revenueAgg,
    recentUsers,
    recentPayments,
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "ACTIVE" } }),
    db.message.count(),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "succeeded" },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Active Subscriptions", value: activeSubscriptions.toLocaleString(), icon: CreditCard, color: "text-green-500" },
    { label: "Total Messages", value: totalMessages.toLocaleString(), icon: MessageSquare, color: "text-purple-500" },
    { label: "Revenue", value: formatCurrency(Number(revenueAgg._sum.amount) || 0), icon: DollarSign, color: "text-amber-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Role</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadge[user.role] ?? roleBadge.USER}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${planBadge[user.plan] ?? planBadge.FREE}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">User</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{payment.user.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{payment.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(Number(payment.amount))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${paymentStatusBadge[payment.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No payments yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
