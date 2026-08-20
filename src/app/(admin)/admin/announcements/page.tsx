import { db } from "@/lib/db";
import AnnouncementsManager from "./announcements-manager";

export default async function AdminAnnouncementsPage() {
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground mt-1">Manage platform announcements</p>
      </div>

      <AnnouncementsManager announcements={announcements} />
    </div>
  );
}
