import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if ("role" in body) {
      const validRoles = ["OWNER", "ADMIN", "MODERATOR", "USER"];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const target = await db.user.findUnique({ where: { id } });
      if (!target) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (target.role === "OWNER" && session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Cannot change owner role" }, { status: 403 });
      }

      data.role = body.role;
    }

    if ("plan" in body) {
      const validPlans = ["FREE", "PRO", "ENTERPRISE"];
      if (!validPlans.includes(body.plan)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      data.plan = body.plan;
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, plan: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
