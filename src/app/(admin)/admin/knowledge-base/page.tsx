import { db } from "@/lib/db";
import KnowledgeBaseManager from "./knowledge-base-manager";

export default async function AdminKnowledgeBasePage() {
  const articles = await db.knowledgeBase.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">Manage help articles and documentation</p>
      </div>

      <KnowledgeBaseManager articles={articles} />
    </div>
  );
}
