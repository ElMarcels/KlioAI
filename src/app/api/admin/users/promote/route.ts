import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (error) {
    console.error("Promote user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
