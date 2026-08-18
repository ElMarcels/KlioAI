"use client";

import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Bot,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "0",
    change: "+0%",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "Active Subscriptions",
    value: "0",
    change: "+0%",
    icon: CreditCard,
    color: "text-green-500",
  },
  {
    label: "Total Messages",
    value: "0",
    change: "+0%",
    icon: MessageSquare,
    color: "text-purple-500",
  },
  {
    label: "Revenue",
    value: "$0",
    change: "+0%",
    icon: DollarSign,
    color: "text-amber-500",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-green-500 mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <p className="text-muted-foreground text-sm">No users yet.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          <p className="text-muted-foreground text-sm">No payments yet.</p>
        </div>
      </div>
    </div>
  );
}
