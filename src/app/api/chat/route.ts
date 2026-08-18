import { auth } from "@/auth";
import { streamChat } from "@/ai/providers";
import { getModelConfig } from "@/ai/models";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, modelId } = await req.json();

    const modelConfig = getModelConfig(modelId || "klio-core");

    if (!modelConfig) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const result = await streamChat(modelConfig, messages);

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
