"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";

interface ModelData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  provider: string;
  modelId: string;
  maxTokens: number;
  tier: string;
  isActive: boolean;
  config: Record<string, unknown>;
}

const tierBadge: Record<string, string> = {
  FREE: "bg-green-500/10 text-green-500 border-green-500/20",
  PRO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function ModelsManager({ models }: { models: ModelData[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    router.refresh();
  }

  function startEdit(model: ModelData) {
    setEditingId(model.id);
    const cfg = model.config as Record<string, unknown>;
    setSystemPrompt((cfg.systemPrompt as string) ?? "");
  }

  async function saveSystemPrompt() {
    if (!editingId) return;
    setSaving(true);
    await fetch(`/api/admin/models/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: { systemPrompt },
      }),
    });
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Models ({models.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Provider</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Model ID</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Tier</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Max Tokens</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Active</th>
                <th className="text-left px-6 py-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{model.displayName}</p>
                      <p className="text-xs text-muted-foreground">{model.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{model.provider}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{model.modelId}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tierBadge[model.tier] ?? tierBadge.FREE}`}>
                      {model.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{model.maxTokens.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(model.id, model.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        model.isActive ? "bg-green-500" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          model.isActive ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => startEdit(model)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit Prompt
                    </button>
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No models found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border bg-card w-full max-w-2xl mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Edit System Prompt</h3>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-64 rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter system prompt..."
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSystemPrompt}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
