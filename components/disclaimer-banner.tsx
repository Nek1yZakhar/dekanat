"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState<boolean>(true); // Start true to prevent flash

  useEffect(() => {
    // Check if inside iframe or embedded mode
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const isEmbedded =
        searchParams.get("embed") === "1" ||
        searchParams.get("platform") === "max" ||
        window.self !== window.top;

      if (isEmbedded) {
        setDismissed(true);
        return;
      }

      const isDismissed = sessionStorage.getItem("dekanat_disclaimer_dismissed") === "true";
      setDismissed(isDismissed);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("dekanat_disclaimer_dismissed", "true");
    } catch {
      // Ignore storage errors in restricted iframes
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Дисклеймер концепта"
      className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 px-3 py-1.5 text-xs text-slate-100 flex items-center justify-between gap-2 shadow-sm"
    >
      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span className="truncate font-medium text-xs text-slate-200">
          Концепт для конкурса. Не является официальным сервисом ИГУ
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative group">
          <Link
            href="/max-preview"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors active:scale-95 cursor-pointer"
            aria-label="Открыть интерактивный симулятор платформы MAX"
          >
            <svg
              className="w-3.5 h-3.5 text-white shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 4h3.5l4.5 7.5L16.5 4H20v16h-3.5V9.5L12 17l-4.5-7.5V20H4V4z" />
            </svg>
            <span>Оболочка MAX</span>
          </Link>

          <div
            role="tooltip"
            className="hidden sm:block absolute top-full right-0 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-slate-100 text-[11px] font-medium shadow-xl border border-slate-700/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50"
          >
            Интерактивный симулятор мобильного супер-аппа MAX (Госуслуги)
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Скрыть предупреждение на время сессии"
          aria-label="Скрыть дисклеймер"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
