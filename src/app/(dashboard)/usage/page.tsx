import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BarChart3, MessageSquare, Zap, Clock } from "lucide-react";

export default async function UsagePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>Please log in to view usage.</div>;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageRecords = await db.usageRecord.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    include: { model: true },
    orderBy: { createdAt: "desc" },
  });

  const totalMessages = usageRecords.length;
  const totalTokens = usageRecords.reduce((sum, r) => sum + r.tokens, 0);
  const avgTokens =
    totalMessages > 0 ? Math.round(totalTokens / totalMessages) : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayRecords = usageRecords.filter(
    (r) => r.createdAt >= todayStart
  );
  const messagesToday = todayRecords.length;
  const tokensToday = todayRecords.reduce((sum, r) => sum + r.tokens, 0);

  const stats = [
    {
      label: "Messages Today",
      value: messagesToday.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      label: "Tokens Today",
      value: tokensToday.toLocaleString(),
      icon: Zap,
      color: "text-purple-500",
    },
    {
      label: "Total Messages (30d)",
      value: totalMessages.toLocaleString(),
      icon: BarChart3,
      color: "text-green-500",
    },
    {
      label: "Avg Tokens/Message",
      value: avgTokens.toLocaleString(),
      icon: Clock,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Usage</h1>
        <p className="text-muted-foreground mt-1">
          Track your API usage and token consumption
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Usage</h3>
        {usageRecords.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No usage data yet. Start chatting to see your usage statistics.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Model
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    Tokens
                  </th>
                </tr>
              </thead>
              <tbody>
                {usageRecords.slice(0, 50).map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 px-2">
                      {record.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {record.model.displayName}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {record.tokens.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
