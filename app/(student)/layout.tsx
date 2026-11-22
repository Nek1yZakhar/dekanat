import React from "react";
import { redirect } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { RealtimeListener } from "@/components/realtime-listener";
import { requireUserSession } from "@/app/proxy";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUserSession();
  if (session.role === 'staff') {
    redirect('/staff');
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-6">
      <RealtimeListener userId={session.id} />
      {/* Student App Bar (Static in normal page flow to prevent sticky overlap) */}
      <header className="w-full bg-background border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate max-w-[160px] sm:max-w-[220px]">
            <div className="text-xs font-semibold truncate leading-tight">
              {session.fullName}
            </div>
            <div className="text-[10px] text-muted-foreground truncate leading-tight">
              {session.faculty}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <DesktopNav />

        <Link
          href="/login"
          title="Сменить аккаунт / Выйти"
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 flex items-center gap-1 text-xs"
        >
          <span className="hidden lg:inline text-[11px] text-muted-foreground">Выйти</span>
          <LogOut className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col">{children}</div>

      {/* Mobile Navigation (strictly < md) */}
      <MobileNav />
    </div>
  );
}
