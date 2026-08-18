"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  modelId: string;
  conversationId?: string;
}

export function ChatWindow({ modelId, conversationId }: ChatWindowProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: { modelId, conversationId },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Start a conversation
            </h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything. I&apos;m here to help with your tasks.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages.length > 0 && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-primary px-4 py-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
