import { db } from "@/lib/db";
import SettingsForm from "./settings-form";

export default async function AdminSettingsPage() {
  const models = await db.model.findMany({
    select: { id: true, name: true, displayName: true },
    orderBy: { displayOrder: "asc" },
  });

  const plans = await db.plan.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration and settings</p>
      </div>

      <SettingsForm models={models} plans={plans} />
    </div>
  );
}
