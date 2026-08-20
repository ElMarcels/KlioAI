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
    const { role } = await req.json();

    const validRoles = ["ADMIN", "MODERATOR", "USER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    if (session.user.role === "ADMIN" && role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot promote to admin" }, { status: 403 });
    }

    const updated = await db.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
