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
    if ("status" in body) {
      data.status = body.status;
      if (body.status === "ACTIVE" && !body.publishedAt) {
        data.publishedAt = new Date();
      }
    }
    if ("priority" in body) data.priority = body.priority;

    const announcement = await db.announcement.update({
      where: { id },
      data,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Update announcement error:", error);
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
    await db.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
