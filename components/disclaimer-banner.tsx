"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Smartphone, X } from "lucide-react";

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
      className="sticky top-0 z-50 w-full bg-amber-100 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-800 px-3 py-1.5 text-xs text-amber-950 dark:text-amber-100 backdrop-blur-md flex items-center justify-between gap-2 shadow-xs transition-all"
    >
      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
        <span className="truncate font-medium text-xs">
          Концепт для конкурса. Не является официальным сервисом ИГУ
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href="/max-preview"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Открыть интерактивный веб-симулятор национальной платформы MAX"
        >
          <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Оболочка MAX</span>
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md text-amber-900/70 hover:text-amber-950 dark:text-amber-200/70 dark:hover:text-amber-100 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition-colors"
          title="Скрыть предупреждение на время сессии"
          aria-label="Скрыть дисклеймер"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
