import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const statusBadge: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-500 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  WAITING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  RESOLVED: "bg-muted text-muted-foreground border-border",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

const priorityBadge: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function AdminSupportPage() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">
          Manage support tickets
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Tickets ({tickets.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">User</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Subject</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Priority</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Messages</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Created</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{ticket.user.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadge[ticket.status] ?? statusBadge.OPEN}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority] ?? priorityBadge.MEDIUM}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{ticket._count.messages}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(ticket.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/support/${ticket.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No support tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
