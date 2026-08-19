import { auth } from "@/auth";
import { getModelConfig } from "@/ai/models";
import { getModel } from "@/ai/providers";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, modelId, conversationId } = await req.json();

    const modelConfig = getModelConfig(modelId || "klio-core");

    if (!modelConfig) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const dbModel = await db.model.upsert({
      where: { name: modelConfig.name },
      update: {},
      create: {
        name: modelConfig.name,
        displayName: modelConfig.name,
        provider: modelConfig.provider,
        modelId: modelConfig.modelId,
        maxTokens: modelConfig.maxTokens,
      },
    });

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const firstUserMessage = messages.find(
        (m: { role: string }) => m.role === "user"
      );
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 100)
        : "New conversation";

      const conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          modelId: dbModel.id,
          title,
        },
      });

      activeConversationId = conversation.id;
    }

    const lastUserMessage = messages[messages.length - 1];
    await db.message.create({
      data: {
        conversationId: activeConversationId,
        role: "user",
        content: lastUserMessage.content,
        tokenCount: Math.ceil(lastUserMessage.content.length / 4),
      },
    });

    const modelIdForCallback = dbModel.id;
    const userIdForCallback = session.user.id;
    const modelIdStr = modelConfig.modelId;
    const convId = activeConversationId;

    const result = streamText({
      model: getModel(modelConfig),
      system: modelConfig.systemPrompt,
      messages,
      maxTokens: modelConfig.maxTokens,
      onFinish: async ({ text }) => {
        await db.message.create({
          data: {
            conversationId: convId,
            role: "assistant",
            content: text,
            tokenCount: Math.ceil(text.length / 4),
            model: modelIdStr,
          },
        });

        await db.usageRecord.create({
          data: {
            userId: userIdForCallback,
            modelId: modelIdForCallback,
            tokens: Math.ceil(text.length / 4),
            type: "chat",
          },
        });
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "X-Conversation-Id": convId,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
