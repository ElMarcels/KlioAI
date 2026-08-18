import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export type AIProviderName = "google" | "openai" | "anthropic";

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProviderName;
  modelId: string;
  maxTokens: number;
  systemPrompt: string;
}

function getGoogleProvider() {
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  });
}

function getOpenAIProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function getAnthropicProvider() {
  return createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export function getModel(config: ModelConfig) {
  switch (config.provider) {
    case "google":
      return getGoogleProvider()(config.modelId);
    case "openai":
      return getOpenAIProvider()(config.modelId);
    case "anthropic":
      return getAnthropicProvider()(config.modelId);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export async function streamChat(
  config: ModelConfig,
  messages: { role: "user" | "assistant" | "system"; content: string }[]
) {
  const model = getModel(config);

  const result = streamText({
    model,
    system: config.systemPrompt,
    messages,
    maxTokens: config.maxTokens,
  });

  return result;
}
