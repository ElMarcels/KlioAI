"use client";

import { BarChart3, MessageSquare, Zap, Clock } from "lucide-react";
import { useTranslation } from "@/components/shared/language-provider";

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  BarChart3,
  Zap,
  Clock,
};

interface StatItem {
  key: string;
  value: string;
  icon: string;
  color: string;
}

interface UsageRecord {
  id: string;
  createdAt: string;
  modelDisplayName: string;
  tokens: number;
}

interface UsageContentProps {
  stats: StatItem[];
  usageRecords: UsageRecord[];
}

export function UsageContent({ stats, usageRecords }: UsageContentProps) {
  const { t } = useTranslation();

  const isLoggedIn = stats.length > 0;

  if (!isLoggedIn) {
    return <div className="max-w-5xl mx-auto space-y-8"><p>{t("usage.pleaseLogin")}</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("usage.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("usage.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] || MessageSquare;
          return (
            <div
              key={stat.key}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t(`usage.${stat.key}`)}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">{t("usage.recentUsage")}</h3>
        {usageRecords.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("usage.noUsageData")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    {t("usage.date")}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    {t("usage.model")}
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    {t("usage.tokens")}
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
                      {new Date(record.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {record.modelDisplayName}
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
