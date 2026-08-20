import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if ("title" in body) data.title = body.title;
    if ("content" in body) data.content = body.content;
    if ("category" in body) data.category = body.category;
    if ("tags" in body) data.tags = body.tags;
    if ("isActive" in body) data.isActive = body.isActive;

    const article = await db.knowledgeBase.update({
      where: { id },
      data,
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Update knowledge base article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await db.knowledgeBase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete knowledge base article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
