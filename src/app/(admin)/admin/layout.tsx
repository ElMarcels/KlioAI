"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Bot,
  HeadphonesIcon,
  BarChart3,
  FileText,
  Shield,
  BookOpen,
  Megaphone,
  Crown,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { signOut } from "next-auth/react";

const iconMap = {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Bot,
  HeadphonesIcon,
  BarChart3,
  FileText,
  Shield,
  BookOpen,
  Megaphone,
  Crown,
  Settings,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-border bg-card sticky top-0">
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span>Back to App</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-8">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
