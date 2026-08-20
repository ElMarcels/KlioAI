"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { ModelSelector } from "@/components/chat/model-selector";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialModel = searchParams.get("model") || "klio-core";
  const initialConv = searchParams.get("conversation") || null;

  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(initialConv);
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = useCallback(
    (modelId?: string) => {
      const model = modelId || selectedModel;
      if (modelId) setSelectedModel(modelId);
      setActiveConversationId(null);
      setChatKey((k) => k + 1);
      router.replace(`/chat?model=${model}`);
    },
    [selectedModel, router]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      setChatKey((k) => k + 1);
    },
    []
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      if (modelId !== selectedModel) {
        setSelectedModel(modelId);
        handleNewChat(modelId);
      }
    },
    [selectedModel, handleNewChat]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => handleNewChat()}
        currentModelId={selectedModel}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-3">
          <ModelSelector selected={selectedModel} onSelect={handleModelChange} />
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatWindow
            key={chatKey}
            modelId={selectedModel}
            conversationId={activeConversationId}
            onConversationCreated={(id: string) => setActiveConversationId(id)}
          />
        </div>
      </div>
    </div>
  );
}
