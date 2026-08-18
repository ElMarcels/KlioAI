"use client";

import { ChatWindow } from "@/components/chat/chat-window";
import { ModelSelector } from "@/components/chat/model-selector";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "klio-core";
  const [selectedModel, setSelectedModel] = useState(initialModel);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Model selector */}
      <div className="border-b border-border px-4 py-3">
        <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow modelId={selectedModel} />
      </div>
    </div>
  );
}
