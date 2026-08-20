"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  displayName: string;
}

interface PlanData {
  id: string;
  name: string;
  type: string;
  price: unknown;
  messageLimit: number;
  tokenLimit: number;
  isActive: boolean;
}

export default function SettingsForm({
  models,
  plans,
}: {
  models: ModelOption[];
  plans: PlanData[];
}) {
  const [appName, setAppName] = useState("KlioAI");
  const [appDescription, setAppDescription] = useState(
    "Access specialized AI models for every task."
  );
  const [defaultModel, setDefaultModel] = useState(models[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName, appDescription, defaultModel }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">General</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Application Name</label>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              className="w-full h-24 rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Default Model</label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Plans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Type</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Price</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Message Limit</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Token Limit</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{plan.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{plan.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">${Number(plan.price)}/mo</td>
                  <td className="px-6 py-4 text-muted-foreground">{plan.messageLimit.toLocaleString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{plan.tokenLimit.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                      plan.isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No plans configured.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Registered Models ({models.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Internal Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{m.displayName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{m.name}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{m.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
