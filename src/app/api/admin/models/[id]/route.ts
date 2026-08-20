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

    if ("isActive" in body) data.isActive = body.isActive;
    if ("config" in body) data.config = body.config;

    const model = await db.model.update({
      where: { id },
      data,
    });

    return NextResponse.json(model);
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
