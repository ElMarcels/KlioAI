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

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(modelId || "klio-core");

    if (!modelConfig) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI provider is not configured. Please contact support." },
        { status: 500 }
      );
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

    const historyMessages = conversationId
      ? await db.message.findMany({
          where: { conversationId: activeConversationId },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const allMessages =
      historyMessages.length > 0
        ? historyMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        : messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

    const modelIdForCallback = dbModel.id;
    const userIdForCallback = session.user.id;
    const modelIdStr = modelConfig.modelId;
    const convId = activeConversationId;

    await db.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    const result = streamText({
      model: getModel(modelConfig),
      system: modelConfig.systemPrompt,
      messages: allMessages,
      maxTokens: modelConfig.maxTokens,
      onError: async (error) => {
        console.error(
          `[Chat Error] Model: ${modelConfig.name}, Provider: ${modelConfig.provider}`,
          error
        );
      },
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
    const message =
      error instanceof Error ? error.message : "Failed to process chat";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
