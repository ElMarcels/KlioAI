import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import TicketDetailManager from "./ticket-detail-manager";

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

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        include: {
          sender: { select: { id: true, name: true, email: true, image: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ticket Detail</h1>
        <p className="text-muted-foreground mt-1">View and respond to support ticket</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">{ticket.subject}</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadge[ticket.status] ?? statusBadge.OPEN}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority</span>
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${priorityBadge[ticket.priority] ?? priorityBadge.MEDIUM}`}>
                  {ticket.priority}
                </span>
              </div>
              {ticket.category && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span>{ticket.category}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User</span>
                <span>{ticket.user.name || ticket.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
          </div>

          <TicketDetailManager ticketId={ticket.id} currentStatus={ticket.status} />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Messages ({ticket.messages.length})</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isAdmin ? "flex-row-reverse" : ""}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.isAdmin ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                }`}>
                  {msg.sender.name?.[0] ?? msg.sender.email[0].toUpperCase()}
                </div>
                <div className={`max-w-[70%] ${msg.isAdmin ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.sender.name || msg.sender.email}</span>
                    {msg.isAdmin && (
                      <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
                        ADMIN
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className={`rounded-lg px-4 py-2 text-sm ${
                    msg.isAdmin ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {ticket.messages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No messages yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
