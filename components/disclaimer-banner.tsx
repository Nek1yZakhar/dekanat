import React from "react";
import Link from "next/link";
import { AlertCircle, Smartphone } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      aria-label="Дисклеймер концепта"
      className="sticky top-0 z-50 w-full bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 backdrop-blur-md flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="truncate">Концепт для конкурса. Не является официальным сервисом ИГУ</span>
      </div>
      <Link
        href="/max-preview"
        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
        title="Открыть интерактивный веб-симулятор национальной платформы MAX"
      >
        <Smartphone className="w-3 h-3 text-primary shrink-0" />
        <span>Оболочка MAX</span>
      </Link>
    </aside>
  );
}
