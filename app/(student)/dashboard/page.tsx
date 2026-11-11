import React from "react";
import Link from "next/link";
import { requireUserSession } from "@/app/proxy";
import { createClient } from "@/lib/supabase/server";
import { evaluateAcademicRisk, GradeRecord } from "@/lib/academic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await requireUserSession();
  const supabase = await createClient();

  // 1. Fetch grades to compute academic risk
  const { data: gradesData } = await supabase
    .from("grade_records")
    .select("*")
    .eq("student_id", session.id);

  const grades: GradeRecord[] = (gradesData as GradeRecord[]) || [
    { id: "1", student_id: session.id, discipline: "Алгоритмы и структуры данных", semester: "2024/2025-2", grade: "5", points: 95, teacher: "Иванов И.И." },
    { id: "2", student_id: session.id, discipline: "Базы данных и SQL", semester: "2024/2025-2", grade: "5", points: 92, teacher: "Петров П.П." },
    { id: "3", student_id: session.id, discipline: "Дискретная математика", semester: "2024/2025-2", grade: "4", points: 84, teacher: "Сидоров С.С." },
  ];

  const risk = evaluateAcademicRisk(grades);

  // 2. Fetch today's next lesson
  const todayWeekday = new Date().getDay() || 1; // 1-6
  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("*")
    .order("start_time", { ascending: true })
    .limit(1);

  const nextLesson = lessonsData?.[0] || {
    discipline: "Базы данных и SQL",
    kind: "lab",
    start_time: "10:45",
    end_time: "12:15",
    room: "ауд. 410",
    teacher: "Петров П.П.",
  };

  // 3. Fetch notifications
  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const notifications = notificationsData || [
    {
      id: "1",
      title: "График ликвидации академических задолженностей",
      body: "Комиссионные пересдачи за прошедший семестр проводятся с 18 по 28 ноября.",
      kind: "deadline",
    },
    {
      id: "2",
      title: "Перенос занятий по Базам данных",
      body: "Лабораторная работа перенесена в ауд. 410.",
      kind: "schedule_change",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Здравствуйте, {session.fullName.split(" ")[1] || session.fullName}!</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Сегодня учебный день. Вот сводка главных событий.
        </p>
      </div>

      {/* Next Lesson Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-primary uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Ближайшая пара
            </span>
            <Badge variant="outline" className="text-[10px] bg-background">
              {nextLesson.kind === "lab" ? "Лабораторная" : nextLesson.kind === "lecture" ? "Лекция" : "Семинар"}
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg mt-1">
            {nextLesson.discipline}
          </CardTitle>
          <CardDescription className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {nextLesson.start_time.slice(0, 5)} – {nextLesson.end_time.slice(0, 5)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {nextLesson.room}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border/50 pt-2.5 mt-1">
            <span>Преподаватель: {nextLesson.teacher}</span>
            <Link href="/schedule" className="text-primary font-medium flex items-center gap-1 hover:underline text-xs">
              Все пары <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Path to Diploma & Academic Risk Simulator Preview */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              Путь к диплому и риски
            </span>
            <Badge
              variant={risk.level === "low" ? "success" : risk.level === "medium" ? "warning" : "destructive"}
            >
              {risk.level === "low" ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Риск: {risk.label}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Риск: {risk.label}
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-muted/60">
              <div className="text-xs text-muted-foreground">Средний балл (GPA)</div>
              <div className="text-lg font-bold mt-0.5">{risk.averageGrade || "5.0"}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60">
              <div className="text-xs text-muted-foreground">Задолженностей</div>
              <div className="text-lg font-bold mt-0.5 text-foreground">
                {risk.debtsCount}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {risk.recommendations[0]}
          </p>
          <div className="pt-1">
            <Link
              href="/grades"
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs h-9" })}
            >
              Открыть зачётную книжку и симулятор
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/requests"
          className={buttonVariants({
            variant: "secondary",
            className: "h-14 flex flex-col items-center justify-center gap-1 text-xs",
          })}
        >
          <FileText className="w-4 h-4 text-primary" />
          <span>Заказать справку</span>
        </Link>
        <Link
          href="/ai"
          className={buttonVariants({
            variant: "secondary",
            className: "h-14 flex flex-col items-center justify-center gap-1 text-xs",
          })}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI Ассистент деканата</span>
        </Link>
      </div>

      {/* Notifications Feed */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-primary" />
            Оповещения и сроки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold leading-tight">{item.title}</span>
                <Badge variant={item.kind === "deadline" ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                  {item.kind === "deadline" ? "Срок" : item.kind === "schedule_change" ? "Перенос" : "Новость"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
