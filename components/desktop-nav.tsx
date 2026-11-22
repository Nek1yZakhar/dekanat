"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/schedule", label: "Расписание", icon: Calendar },
  { href: "/grades", label: "Оценки", icon: GraduationCap },
  { href: "/requests", label: "Заявки", icon: FileText },
  { href: "/ai", label: "AI Деканат", icon: Sparkles },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all select-none cursor-pointer",
              isActive
                ? "bg-primary/10 text-primary font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-2"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
