import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { requireUserSession } from "@/app/proxy";
import { User, LogOut } from "lucide-react";
import Link from "next/link";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUserSession();

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20">
      {/* Student App Bar */}
      <header className="sticky top-6 z-30 w-full bg-background/90 backdrop-blur-md border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold truncate leading-tight">
              {session.fullName}
            </div>
            <div className="text-[10px] text-muted-foreground truncate leading-tight">
              {session.faculty}
            </div>
          </div>
        </div>

        <Link
          href="/login"
          title="Сменить аккаунт / Выйти"
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 flex flex-col">{children}</main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
