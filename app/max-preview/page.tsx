"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  ChevronLeft,
  MoreVertical,
  X,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Wifi,
  Battery,
  Sparkles,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MaxRobotLogo } from "@/components/max-logo";

export default function MaxPreviewPage() {
  const [deviceWidth, setDeviceWidth] = useState<number>(390); // 390px (iPhone) or 360px (Android)
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const deepLink = "https://max.ru/dekanat_bot?startapp=student1";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(deepLink);
    setCopiedLink(true);
    toast.success("Ссылка для MAX скопирована в буфер обмена");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReloadFrame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      toast.info("Оболочка MAX перезагружена");
    }
  };

  const handleNativeBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch {
        // Fallback
        iframeRef.current.src = `/${activeTab}?platform=max&embed=1`;
      }
    }
  };

  const handleNavigate = (path: string) => {
    setActiveTab(path);
    if (iframeRef.current) {
      iframeRef.current.src = `/${path}?platform=max&embed=1`;
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-4 sm:py-6 text-foreground">
      {/* Top Bar for Contest Evaluators */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-border mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Вернуться в основной интерфейс цифрового деканата"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Выйти в деканат</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Интерактивный симулятор MAX Mini App</span>
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-[10px]">
                  Оболочка супер-аппа
                </Badge>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Национальная платформа MAX (Госуслуги / супер-апп). Проверка мини-приложения в 1 клик.
            </p>
          </div>
        </div>

        {/* Action Controls for Evaluators */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="h-8 text-xs gap-1.5 border-border bg-card hover:bg-muted text-foreground"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Ссылка для MAX</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReloadFrame}
            className="h-8 text-xs gap-1.5 border-border bg-card hover:bg-muted text-foreground"
            title="Перезагрузить контейнер мини-приложения"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Перезагрузить</span>
          </Button>

          <a
            href="/dashboard?platform=max"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>На весь экран</span>
          </a>
        </div>
      </header>

      {/* Main Sandbox Area */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 mx-auto">
        {/* Authentic Smartphone Chassis */}
        <div
          className="relative flex flex-col shrink-0 bg-black rounded-[52px] p-3.5 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-700/50 transition-all duration-300 mx-auto lg:mx-0"
          style={{ width: "100%", maxWidth: `${deviceWidth}px`, height: "820px" }}
        >
          {/* Hardware Screen Bezel */}
          <div className="relative w-full h-full bg-slate-900 rounded-[40px] overflow-hidden flex flex-col border border-slate-800">
            {/* Dynamic Island / Hardware Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-end px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* Mobile OS Status Bar */}
            <div className="h-10 px-6 pt-1 flex items-center justify-between text-[11px] font-semibold text-white/90 shrink-0 z-40 bg-slate-900 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-white/80">
                <span className="text-[10px] font-mono">5G</span>
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* MAX Super-App Header Bar */}
            <header className="h-12 px-3 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0 z-40 text-white select-none">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={handleNativeBack}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors active:scale-95 cursor-pointer"
                  title="Системная кнопка Назад супер-аппа MAX"
                >
                  <ChevronLeft className="w-5 h-5 text-blue-400" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {/* Official Robot Max Logo */}
                    <MaxRobotLogo className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">Цифровой деканат ИГУ</span>
                    <span title="Государственная верификация" className="inline-flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate leading-none">
                    Мини-приложение • MAX
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReloadFrame}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Перезагрузить экран"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <Link
                  href="/dashboard"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Закрыть мини-приложение и вернуться в деканат"
                >
                  <X className="w-4 h-4" />
                </Link>
              </div>
            </header>

            {/* Embedded Live Portal Viewport (Single-Disclaimer Guarantee) */}
            <div className="flex-1 w-full relative bg-background overflow-hidden">
              <iframe
                ref={iframeRef}
                src="/dashboard?platform=max&embed=1"
                title="Цифровой деканат внутри MAX"
                className="w-full h-full border-0 select-auto"
              />
            </div>

            {/* iOS/Android Home Indicator Bar */}
            <div className="h-5 bg-background flex items-center justify-center shrink-0 z-40 select-none pb-safe">
              <div className="w-32 h-1 bg-slate-500/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Evaluation Notes for Contest Jury */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4 shrink-0 mx-auto lg:mx-0">
          {/* Quick Screen Switcher */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Быстрая навигация по экранам мини-аппа:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "dashboard", label: "Главная" },
                { id: "requests", label: "Заявки и справки" },
                { id: "schedule", label: "Расписание пар" },
                { id: "grades", label: "Зачетка и БРС" },
                { id: "ai", label: "AI Ассистент" },
                { id: "staff", label: "Синхронная очередь" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-medium text-left transition-all border select-none cursor-pointer",
                    activeTab === item.id
                      ? "bg-blue-600/20 text-blue-400 border-blue-500/40 font-semibold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Dimension Switcher */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Формат смартфона:</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeviceWidth(390)}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all border select-none cursor-pointer",
                  deviceWidth === 390
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                )}
              >
                iPhone (390×844)
              </button>
              <button
                type="button"
                onClick={() => setDeviceWidth(360)}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all border select-none cursor-pointer",
                  deviceWidth === 360
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                )}
              >
                Android (360×800)
              </button>
            </div>
          </div>

          {/* Architectural Notes for Evaluators */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Особенности интеграции с супер-аппом MAX:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-slate-400">
              <li>
                <strong className="text-slate-300">Нативный мост (MAX Bridge):</strong> клиентский модуль{" "}
                <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">lib/max-bridge.ts</code>{" "}
                слушает <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">window.MAXBridge</code>,
                вызывает <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">ready()</code> и{" "}
                <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">expand()</code>.
              </li>
              <li>
                <strong className="text-slate-300">Веб-симулятор для жюри:</strong> позволяет оценить нативный опыт
                супер-аппа без необходимости скачивания сторонних приложений и ожидания внешней модерации каталога.
              </li>
              <li>
                <strong className="text-slate-300">Системная кнопка «Назад»:</strong> перехватывает клик в шапке
                MAX и корректно перемещает по истории экранов Next.js App Router.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
