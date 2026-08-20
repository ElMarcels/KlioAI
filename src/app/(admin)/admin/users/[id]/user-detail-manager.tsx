"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Ban, CheckCircle } from "lucide-react";

export default function UserDetailManager({
  userId,
  currentRole,
  currentPlan,
}: {
  userId: string;
  currentRole: string;
  currentPlan: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [plan, setPlan] = useState(currentPlan);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveChanges() {
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, plan }),
    });

    if (res.ok) {
      setMessage("Changes saved");
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to save");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={currentRole === "OWNER"}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        >
          <option value="USER">USER</option>
          <option value="MODERATOR">MODERATOR</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OWNER">OWNER</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Plan</label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
      </div>

      <button
        onClick={saveChanges}
        disabled={saving}
        className="w-full px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {message && (
        <p className={`text-sm text-center ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
