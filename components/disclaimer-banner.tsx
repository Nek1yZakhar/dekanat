import React from "react";
import { AlertCircle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside
      aria-label="Дисклеймер концепта"
      className="sticky top-0 z-50 w-full bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-center text-[11px] sm:text-xs font-medium text-amber-900 dark:text-amber-200 backdrop-blur-md flex items-center justify-center gap-1.5"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>Концепт для конкурса. Не является официальным сервисом ИГУ</span>
    </aside>
  );
}
