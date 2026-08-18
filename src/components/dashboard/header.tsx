"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { Bell, Search } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(session?.user?.name)}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {session?.user?.plan?.toLowerCase() || "free"} plan
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
