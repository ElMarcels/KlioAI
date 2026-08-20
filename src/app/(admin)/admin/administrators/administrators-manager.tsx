"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Crown, Shield, ArrowDown, Search } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plan: string;
  createdAt: Date;
  _count: { conversations: number; supportTickets: number };
}

const roleBadge: Record<string, string> = {
  OWNER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
};

const planBadge: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground border-border",
  PRO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function AdministratorsManager({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const filtered = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  async function promoteUser() {
    setError("");
    setPromoting(true);
    try {
      const res = await fetch("/api/admin/users/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to promote user");
      } else {
        setEmail("");
        router.refresh();
      }
    } catch {
      setError("An error occurred");
    }
    setPromoting(false);
  }

  async function demoteUser(id: string) {
    if (!confirm("Demote this admin to USER?")) return;
    await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "USER" }),
    });
    router.refresh();
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Promote User to Admin</h3>
        <div className="flex gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={promoteUser}
            disabled={promoting || !email.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {promoting ? "Promoting..." : "Promote"}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">Administrators ({filtered.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Conversations</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Tickets</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin) => (
                <tr key={admin.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{admin.name || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadge[admin.role] ?? ""}`}>
                      {admin.role === "OWNER" && <Crown className="h-3 w-3 mr-1" />}
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${planBadge[admin.plan] ?? planBadge.FREE}`}>
                      {admin.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{admin._count.conversations}</td>
                  <td className="px-6 py-4 text-muted-foreground">{admin._count.supportTickets}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(admin.createdAt)}</td>
                  <td className="px-6 py-4">
                    {admin.role === "ADMIN" && (
                      <button
                        onClick={() => demoteUser(admin.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 text-xs"
                      >
                        <ArrowDown className="h-3 w-3" />
                        Demote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">No administrators found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
