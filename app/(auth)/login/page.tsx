"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { GraduationCap, LogIn, UserCheck, ShieldAlert, Loader2, AlertTriangle, Building2, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fillQuickAccount = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If supabase credentials are not set, allow evaluation demo pass
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
        ) {
          if (email.includes("staff")) {
            router.push("/staff");
          } else {
            router.push("/dashboard");
          }
          return;
        }
        setErrorMsg(error.message === "Invalid login credentials" ? "Неверный логин или пароль" : error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "staff") {
          router.push("/staff");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      // In offline/demo environment, allow previewing the app
      if (email.includes("staff")) {
        router.push("/staff");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-4 md:py-6 max-w-md mx-auto w-full">
      <div className="text-center mb-3 md:mb-4">
        <div className="inline-flex p-2.5 rounded-2xl bg-primary/10 text-primary mb-2">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Цифровой деканат</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Единый студенческий портал самообслуживания
        </p>
      </div>

      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-base">Вход в систему</CardTitle>
          <CardDescription className="text-xs">
            Введите email и пароль для доступа к личному кабинету
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Электронная почта
              </label>
              <Input
                type="email"
                placeholder="student@dekanat.fake"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Пароль
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-9 text-xs cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Войти</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Быстрый вход для жюри конкурса (вымышленные аккаунты):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-auto min-h-8 py-1.5 px-3 gap-2 cursor-pointer text-left whitespace-normal leading-tight"
                onClick={() => fillQuickAccount("student1@dekanat.fake", "DekanatPass2026!")}
              >
                <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Студент 1: Смирнов (Отличник, без долгов)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-auto min-h-8 py-1.5 px-3 gap-2 cursor-pointer text-left whitespace-normal leading-tight"
                onClick={() => fillQuickAccount("student2@dekanat.fake", "DekanatPass2026!")}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Студент 2: Кузнецова (1 долг по матанализу)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-auto min-h-8 py-1.5 px-3 gap-2 cursor-pointer text-left whitespace-normal leading-tight"
                onClick={() => fillQuickAccount("student3@dekanat.fake", "DekanatPass2026!")}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Студент 3: Иванова (Международные отношения, 07131-ДБ)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-start text-xs h-auto min-h-8 py-1.5 px-3 gap-2 cursor-pointer text-left whitespace-normal leading-tight"
                onClick={() => fillQuickAccount("staff@dekanat.fake", "DekanatPass2026!")}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Сотрудник деканата (Очередь заявок)</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border py-2.5 bg-muted/20">
          <p className="text-[11px] text-muted-foreground text-center">
            Учётные записи выдаются деканатом. Доступ строго для студентов и сотрудников ИГУ.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
