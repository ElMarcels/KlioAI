import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await db.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Fetch tickets error:", error);
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
    const { subject, description, category, priority } = await req.json();

    if (!subject || typeof subject !== "string" || subject.length < 3) {
      return NextResponse.json(
        { error: "Subject must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const ticketPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

    const ticket = await db.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        description,
        category: category || null,
        priority: ticketPriority,
      },
    });

    await db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: session.user.id,
        content: description,
        isAdmin: false,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
