"use client";

import { motion } from "framer-motion";
import { BarChart3, MessageSquare, Zap, Clock } from "lucide-react";

export default function UsagePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Usage</h1>
        <p className="text-muted-foreground mt-1">
          Track your API usage and token consumption
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Messages Today",
            value: "0",
            icon: MessageSquare,
            color: "text-blue-500",
          },
          {
            label: "Tokens Today",
            value: "0",
            icon: Zap,
            color: "text-purple-500",
          },
          {
            label: "Total Messages",
            value: "0",
            icon: BarChart3,
            color: "text-green-500",
          },
          {
            label: "Avg Response Time",
            value: "--",
            icon: Clock,
            color: "text-amber-500",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Usage History</h3>
        <p className="text-muted-foreground text-sm">
          No usage data yet. Start chatting to see your usage statistics.
        </p>
      </div>
    </div>
  );
}
