import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ticket = await db.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    if (ticket.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "Cannot reply to a closed ticket" },
        { status: 400 }
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const message = await db.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: session.user.id,
        content: content.trim(),
        isAdmin,
      },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
      },
    });

    if (ticket.status === "OPEN" && !isAdmin) {
      await db.supportTicket.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
