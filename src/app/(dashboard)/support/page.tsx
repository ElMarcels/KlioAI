"use client";

import { motion } from "framer-motion";
import { HeadphonesIcon, Plus, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground mt-1">
            Get help with your account or report issues
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-12"
      >
        <div className="flex flex-col items-center text-center">
          <HeadphonesIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            If you need help, create a support ticket and our team will respond
            as soon as possible.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
