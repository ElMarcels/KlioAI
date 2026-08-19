"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Clock,
  Tag,
  AlertTriangle,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING: "Waiting",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-500",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500",
  WAITING: "bg-orange-500/10 text-orange-500",
  RESOLVED: "bg-green-500/10 text-green-500",
  CLOSED: "bg-muted text-muted-foreground",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-blue-500/10 text-blue-500",
  HIGH: "bg-orange-500/10 text-orange-500",
  URGENT: "bg-red-500/10 text-red-500",
};

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/tickets/${params.id}`);
      if (res.status === 404) {
        router.push("/support");
        return;
      }
      if (res.ok) {
        setTicket(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setError("");
    setSending(true);

    try {
      const res = await fetch(`/api/support/tickets/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        return;
      }

      const message = await res.json();
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, message] } : prev
      );
      setReply("");
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/support/tickets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="rounded-xl border border-border bg-card p-12">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground text-sm mt-3">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const statuses = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/support"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Created {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
              {ticket.category && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {ticket.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                Updated {new Date(ticket.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.MEDIUM}`}
            >
              {ticket.priority === "URGENT" && (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {ticket.priority.charAt(0) +
                ticket.priority.slice(1).toLowerCase()}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[ticket.status] || STATUS_COLORS.OPEN}`}
            >
              {STATUS_LABELS[ticket.status] || ticket.status}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Change Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    ticket.status === s
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">
            Messages ({ticket.messages.length})
          </h2>
        </div>

        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
          {ticket.messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No messages yet.
            </div>
          ) : (
            ticket.messages.map((message) => (
              <div key={message.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.isAdmin
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.isAdmin ? (
                      <Shield className="h-4 w-4" />
                    ) : message.sender.image ? (
                      <img
                        src={message.sender.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.sender.name || "User"}
                      </span>
                      {message.isAdmin && (
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          Staff
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== "CLOSED" && (
          <div className="p-4 border-t border-border">
            <form onSubmit={handleReply} className="flex gap-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                disabled={sending}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
