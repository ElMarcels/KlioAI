import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UsageContent } from "./usage-content";

export default async function UsagePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <UsageContent stats={[]} usageRecords={[]} />;
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
      key: "messagesToday",
      value: messagesToday.toLocaleString(),
      icon: "MessageSquare",
      color: "text-blue-500",
    },
    {
      key: "tokensToday",
      value: tokensToday.toLocaleString(),
      icon: "Zap",
      color: "text-purple-500",
    },
    {
      key: "totalMessages30d",
      value: totalMessages.toLocaleString(),
      icon: "BarChart3",
      color: "text-green-500",
    },
    {
      key: "avgTokensMessage",
      value: avgTokens.toLocaleString(),
      icon: "Clock",
      color: "text-amber-500",
    },
  ];

  return (
    <UsageContent
      stats={stats}
      usageRecords={usageRecords.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        modelDisplayName: r.model.displayName,
        tokens: r.tokens,
      }))}
    />
  );
}
