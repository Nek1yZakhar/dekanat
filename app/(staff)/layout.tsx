import React from "react";
import Link from "next/link";
import { Building2, LogOut } from "lucide-react";
import { requireStaffSession } from "@/app/proxy";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaffSession();

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-10">
      {/* Staff App Bar */}
      <header className="sticky top-0 z-30 w-full bg-background border-b border-border shadow-xs px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold leading-tight">Панель деканата</div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              Соколова Елена Павловна • Деканат (Модератор)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            title="Выйти"
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 flex flex-col">{children}</main>
    </div>
  );
}
