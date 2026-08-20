import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Shield, AlertTriangle, Users } from "lucide-react";

const actionBadge: Record<string, string> = {
  LOGIN: "bg-green-500/10 text-green-500 border-green-500/20",
  LOGOUT: "bg-muted text-muted-foreground border-border",
  REGISTER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SECURITY_EVENT: "bg-red-500/10 text-red-500 border-red-500/20",
  ADMIN_ACTION: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default async function AdminSecurityPage() {
  const [
    recentSecurityEvents,
    failedLogins,
    activeSessions,
    totalSessions,
  ] = await Promise.all([
    db.auditLog.findMany({
      where: {
        action: { in: ["SECURITY_EVENT", "ADMIN_ACTION", "LOGIN", "LOGOUT"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.auditLog.findMany({
      where: {
        action: "SECURITY_EVENT",
        details: { path: ["type"], equals: "failed_login" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.session.findMany({
      where: { expires: { gt: new Date() } },
      orderBy: { expires: "desc" },
      take: 50,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    }),
    db.session.count({ where: { expires: { gt: new Date() } } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground mt-1">Monitor security events and active sessions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Sessions</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{totalSessions}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Failed Logins (24h)</span>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{failedLogins.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Security Events</span>
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{recentSecurityEvents.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Active Sessions ({activeSessions.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">User</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Session Token</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => (
                <tr key={session.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{session.user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{session.user.role}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                    {session.sessionToken.slice(0, 16)}...
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(session.expires)}</td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No active sessions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Security Events ({recentSecurityEvents.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Action</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">User ID</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Details</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">IP</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSecurityEvents.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${actionBadge[event.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{event.userId ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                    {event.details ? JSON.stringify(event.details) : "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{event.ip ?? "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(event.createdAt)}</td>
                </tr>
              ))}
              {recentSecurityEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No security events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
