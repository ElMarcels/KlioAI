import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await db.conversation.findMany({
      where: { userId: session.user.id },
      include: {
        model: { select: { name: true, displayName: true } },
        folder: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, modelId, folderId } = await req.json();

    if (!modelId || typeof modelId !== "string") {
      return NextResponse.json(
        { error: "modelId is required" },
        { status: 400 }
      );
    }

    const dbModel = await db.model.findFirst({
      where: { name: modelId },
    });

    if (!dbModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      );
    }

    const conversation = await db.conversation.create({
      data: {
        userId: session.user.id,
        modelId: dbModel.id,
        title: title || "New conversation",
        folderId: folderId || null,
      },
      include: {
        model: { select: { name: true, displayName: true } },
        folder: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
