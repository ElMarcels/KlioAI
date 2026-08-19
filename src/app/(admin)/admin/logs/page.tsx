import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

const actionBadge: Record<string, string> = {
  LOGIN: "bg-green-500/10 text-green-500 border-green-500/20",
  LOGOUT: "bg-muted text-muted-foreground border-border",
  REGISTER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SUBSCRIPTION_CHANGE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PAYMENT: "bg-green-500/10 text-green-500 border-green-500/20",
  MODEL_ACCESS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ADMIN_ACTION: "bg-red-500/10 text-red-500 border-red-500/20",
  SECURITY_EVENT: "bg-red-500/10 text-red-500 border-red-500/20",
  API_CALL: "bg-muted text-muted-foreground border-border",
};

export default async function AdminLogsPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Logs</h1>
        <p className="text-muted-foreground mt-1">
          Recent audit trail
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Audit Logs ({logs.length})</h3>
        </div>

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No audit logs yet.</p>
          </div>
        ) : (
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
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${actionBadge[log.action] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {log.userId ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{log.ip ?? "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
