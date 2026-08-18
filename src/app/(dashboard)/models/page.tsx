"use client";

import { motion } from "framer-motion";
import { KLIO_MODELS } from "@/lib/constants";
import Link from "next/link";
import {
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  Code2,
  GraduationCap,
  PenTool,
  Search,
  Eye,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function ModelsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Models</h1>
        <p className="text-muted-foreground mt-1">
          Explore all available KlioAI models
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {KLIO_MODELS.map((model) => {
          const Icon = iconMap[model.icon] || Bot;
          return (
            <motion.div key={model.id} variants={item}>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      model.tier === "FREE"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-purple-500/10 text-purple-500"
                    }`}
                  >
                    {model.tier}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mt-4">{model.name}</h3>
                <p className="text-muted-foreground mt-2">
                  {model.description}
                </p>
                <Link
                  href={`/chat?model=${model.id}`}
                  className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
                >
                  Start chatting
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
