"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  Loader2,
  Trash2,
  ExternalLink,
  FileText,
} from "lucide-react";
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

const SUGGESTIONS = [
  "Как сдать пересдачу?",
  "Кому положена стипендия?",
  "Как оформить академотпуск?",
  "Срок готовности справки?",
  "Как получить красный диплом?",
];

/**
 * Formats Markdown text into clean React elements without raw asterisks (**).
 * Detects bold, bullets, and links to portal sections.
 */
function MarkdownRenderer({ content }: { content: string }) {
  const paragraphs = content.split("\n\n");

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        const innerText = part.slice(2, -2);
        if (innerText.includes("Заявки") || innerText.includes("Заявка")) {
          return (
            <Link
              key={index}
              href="/requests"
              className="inline-flex items-center gap-0.5 text-primary font-bold hover:underline"
            >
              <span>{innerText}</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </Link>
          );
        }
        return (
          <strong key={index} className="font-semibold text-foreground">
            {innerText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split("\n");
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                    <span className="text-primary font-bold">•</span>
                    <span>{renderInline(trimmed.slice(2))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.)\s(.*)$/);
                if (match) {
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                      <span className="text-primary font-semibold font-mono">{match[1]}</span>
                      <span>{renderInline(match[2])}</span>
                    </div>
                  );
                }
              }
              return <p key={lIdx}>{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

interface AiClientViewProps {
  userId: string;
  studentName: string;
}

export function AiClientView({ userId, studentName }: AiClientViewProps) {
  const storageKey = `dekanat_ai_chat_history_${userId}`;

  const defaultGreeting: ChatMessage = {
    id: "m0",
    role: "assistant",
    content: `Здравствуйте, ${studentName}! Я официальный AI-ассистент цифрового деканата ИГУ. Отвечаю на любые вопросы по учебному процессу, расписанию пар, правилам пересдач, стипендиям, академическим отпускам и выдаче справок строго на основе нормативных регламентов университета.`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from user-scoped localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setIsClientLoaded(true);
          return;
        }
      }
      setMessages([defaultGreeting]);
    } catch {
      setMessages([defaultGreeting]);
    } finally {
      setIsClientLoaded(true);
    }
  }, [storageKey, studentName]);

  // Save chat history to user-scoped localStorage on update
  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore storage write errors
    }
  }, [messages, isClientLoaded, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClearHistory = () => {
    setMessages([defaultGreeting]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors
    }
  };

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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Извините, сервис регламентов временно недоступен. Пожалуйста, обратитесь в деканат лично или оформите обращение онлайн в разделе «Заявки».",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-2 shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">AI Ассистент деканата</h1>
            <p className="text-[11px] text-muted-foreground">
              Консультации строго по официальным регламентам ИГУ
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
            title="Очистить историю диалога"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </Button>
        )}
      </div>

      {/* Chat Messages List (Natural document flow) */}
      <div className="flex-1 space-y-3 pb-3">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={cn("flex gap-2 max-w-[94%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs",
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-card-foreground rounded-tl-sm shadow-xs"
                  )}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}
                </div>

                {/* Sources & Citations Box */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60 text-[11px] space-y-1.5">
                    <div className="font-semibold text-foreground flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 text-primary">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Источники регламентов ИГУ:</span>
                      </span>
                      <Link
                        href="/requests"
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Заказать справку</span>
                      </Link>
                    </div>
                    {m.sources.map((s, idx) => (
                      <div key={idx} className="text-muted-foreground leading-snug">
                        <span className="font-semibold text-foreground">{s.article}:</span>{" "}
                        <span>{s.content}</span>
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
              <span>Поиск по нормативным регламентам ИГУ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions & Input Bar Sticky at bottom */}
      <div className="sticky bottom-16 md:bottom-0 z-20 bg-background/95 backdrop-blur-md pt-2 pb-1 border-t border-border -mx-4 px-4 mt-auto">
        {/* Quick Suggestions Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg border border-border bg-card text-[11px] text-muted-foreground whitespace-nowrap hover:bg-muted hover:text-foreground active:scale-95 transition-all select-none cursor-pointer shadow-2xs"
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
          className="flex gap-1.5"
        >
          <Input
            placeholder="Спросите о пересдачах, стипендии, справках..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="text-xs h-10 bg-background"
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !input.trim()}
            className="h-10 px-3 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
