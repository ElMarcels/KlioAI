"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Save } from "lucide-react";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"] as const;

export default function TicketDetailManager({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [message, setMessage] = useState("");

  async function changeStatus() {
    setSavingStatus(true);
    const res = await fetch(`/api/admin/support/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage("Status updated");
      router.refresh();
    }
    setSavingStatus(false);
  }

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);

    const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply.trim() }),
    });

    if (res.ok) {
      setReply("");
      router.refresh();
    }
    setSending(false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Change Status</h3>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={changeStatus}
            disabled={savingStatus || status === currentStatus}
            className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
        {message && <p className="text-xs text-green-500 mt-2">{message}</p>}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Reply as Admin</h3>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          className="w-full h-32 rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
        />
        <button
          onClick={sendReply}
          disabled={sending || !reply.trim()}
          className="w-full px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}
