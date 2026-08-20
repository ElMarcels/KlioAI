import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
