"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Bot, User, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceItem {
  article: string;
  content: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
  isFallback?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m0",
    role: "assistant",
    content:
      "Здравствуйте! Я официальный AI-ассистент деканата. Отвечаю на любые вопросы по учебному процессу, правилам пересдач, стипендиям, академическим отпускам и выдаче справок строго на основе регламентов университета.",
  },
];

const SUGGESTIONS = [
  "Как сдать пересдачу?",
  "Кому положена стипендия?",
  "Как оформить академотпуск?",
  "Срок готовности справки?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) throw new Error("Ошибка сервиса");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        sources: data.sources,
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Извините, сервис временно недоступен. Пожалуйста, обратитесь в деканат лично или подайте заявку в разделе «Заявки».",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-135px)]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">AI Ассистент деканата</h1>
            <p className="text-[11px] text-muted-foreground">
              Ответы со ссылками на статьи нормативных регламентов
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={cn("flex gap-2 max-w-[92%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs",
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>

              <div className="space-y-1.5">
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm"
                  )}
                >
                  {m.content}
                </div>

                {/* Sources & Citations Box */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 text-[11px] space-y-1">
                    <div className="font-semibold text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-primary" />
                      <span>Источник регламента:</span>
                    </div>
                    {m.sources.map((s, idx) => (
                      <div key={idx} className="text-muted-foreground">
                        <strong className="text-foreground">{s.article}:</strong> {s.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-xl bg-muted border border-border flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Поиск по регламентам университета...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex gap-1.5 overflow-x-auto py-2">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item)}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg border border-border bg-background text-[11px] text-muted-foreground whitespace-nowrap hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-1.5 pt-1"
      >
        <Input
          placeholder="Спросите о пересдачах, стипендии..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="text-xs h-10"
        />
        <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-10 px-3">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
