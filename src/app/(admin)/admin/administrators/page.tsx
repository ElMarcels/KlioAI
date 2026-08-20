import { db } from "@/lib/db";
import AdministratorsManager from "./administrators-manager";

export default async function AdminAdministratorsPage() {
  const admins = await db.user.findMany({
    where: { role: { in: ["ADMIN", "OWNER"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      createdAt: true,
      _count: { select: { conversations: true, supportTickets: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administrators</h1>
        <p className="text-muted-foreground mt-1">Manage admin and owner accounts</p>
      </div>

      <AdministratorsManager admins={admins} />
    </div>
  );
}
