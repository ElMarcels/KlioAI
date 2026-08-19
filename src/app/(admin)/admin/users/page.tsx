import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
  MODERATOR: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  USER: "bg-muted text-muted-foreground border-border",
};

const planBadge: Record<string, string> = {
  FREE: "bg-muted text-muted-foreground border-border",
  PRO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { subscriptions: true, conversations: true } },
      sessions: { orderBy: { expires: "desc" }, take: 1 },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered users
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Email</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Plan</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.name || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadge[user.role] ?? roleBadge.USER}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${planBadge[user.plan] ?? planBadge.FREE}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">{user.subscriptionStatus}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${user.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
