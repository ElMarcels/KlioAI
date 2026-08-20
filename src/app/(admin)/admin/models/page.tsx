import { db } from "@/lib/db";
import ModelsManager from "./models-manager";

const tierBadge: Record<string, string> = {
  FREE: "bg-green-500/10 text-green-500 border-green-500/20",
  PRO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ENTERPRISE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default async function AdminModelsPage() {
  const models = await db.model.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const serialized = models.map((m) => ({
    ...m,
    config: m.config as Record<string, unknown>,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Models</h1>
        <p className="text-muted-foreground mt-1">Manage AI models and configurations</p>
      </div>

      <ModelsManager models={serialized} />
    </div>
  );
}
