import { db } from "@/lib/db";
import { Users, MessageSquare, Coins, DollarSign } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [totalUsers, totalMessages, usageAgg, revenueAgg, usageByModel] = await Promise.all([
    db.user.count(),
    db.message.count(),
    db.usageRecord.aggregate({ _sum: { tokens: true } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
    db.usageRecord.groupBy({
      by: ["modelId"],
      _sum: { tokens: true },
      _count: { id: true },
      orderBy: { _sum: { tokens: "desc" } },
    }),
  ]);

  const models = await db.model.findMany();
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.displayName]));

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Total Messages", value: totalMessages.toLocaleString(), icon: MessageSquare, color: "text-purple-500" },
    { label: "Total Tokens", value: (usageAgg._sum.tokens ?? 0).toLocaleString(), icon: Coins, color: "text-green-500" },
    { label: "Total Revenue", value: `$${((Number(revenueAgg._sum.amount) || 0) / 100).toFixed(2)}`, icon: DollarSign, color: "text-amber-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide aggregate statistics
        </p>
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

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Usage by Model</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Model</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Total Tokens</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Requests</th>
              </tr>
            </thead>
            <tbody>
              {usageByModel.map((row) => (
                <tr key={row.modelId} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{modelMap[row.modelId] ?? row.modelId}</td>
                  <td className="px-6 py-4 text-muted-foreground">{(row._sum.tokens ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row._count.id.toLocaleString()}</td>
                </tr>
              ))}
              {usageByModel.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No usage data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
