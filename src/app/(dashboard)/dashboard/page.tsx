"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { KLIO_MODELS } from "@/lib/constants";
import {
  MessageSquare,
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
  Zap,
  BarChart3,
  CreditCard,
} from "lucide-react";
import { useTranslation } from "@/components/shared/language-provider";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
};

function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "dashboard.goodMorning";
  if (hour < 18) return "dashboard.goodAfternoon";
  return "dashboard.goodEvening";
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold">
          {t(getGreetingKey())}, {session?.user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t("dashboard.howCanKlioHelp")}
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
        >
          <MessageSquare className="h-4 w-4" />
          {t("dashboard.startNewChat")}
        </Link>
      </motion.div>

      <motion.div
        variants={item}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {t("dashboard.yourPlan")}
            </h3>
            <p className="text-2xl font-bold mt-1 capitalize">
              Klio {(session?.user?.plan || "free").toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">{t("dashboard.active")}</span>
          </div>
        </div>
        {session?.user?.plan === "FREE" && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            <Zap className="h-4 w-4" />
            {t("dashboard.upgradeToPro")}
          </Link>
        )}
      </motion.div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t("dashboard.availableModels")}</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {KLIO_MODELS.map((model) => {
            const Icon = iconMap[model.icon] || Bot;
            return (
              <motion.div key={model.id} variants={item}>
                <Link
                  href={`/chat?model=${model.id}`}
                  className="block rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        model.tier === "FREE"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {model.tier}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t("dashboard.quickActions")}</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: t("dashboard.askKlio"), icon: MessageSquare, href: "/chat" },
            { label: t("dashboard.browseModels"), icon: Bot, href: "/models" },
            { label: t("dashboard.viewUsage"), icon: BarChart3, href: "/usage" },
            { label: t("dashboard.billing"), icon: CreditCard, href: "/billing" },
          ].map((action) => (
            <motion.div key={action.label} variants={item}>
              <Link
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
