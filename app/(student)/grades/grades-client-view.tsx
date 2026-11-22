"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  evaluateAcademicRisk,
  calculateProgress,
  GradeRecord,
} from "@/lib/academic";
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubjectSheet } from "@/components/subject-sheet";
import { LessonItem } from "@/lib/schedule-data";
import {
  ExtendedGradeRecord,
  INITIAL_GRADES,
  STUDENT2_DEFAULT_GRADES,
  STUDENT3_DEFAULT_GRADES,
} from "@/lib/grades-data";

export {
  type ExtendedGradeRecord,
  INITIAL_GRADES,
  STUDENT2_DEFAULT_GRADES,
  STUDENT3_DEFAULT_GRADES,
};

interface GradesClientViewProps {
  initialGrades: ExtendedGradeRecord[];
  studentFullName: string;
}

export function GradesClientView({ initialGrades, studentFullName }: GradesClientViewProps) {
  const [grades, setGrades] = useState<ExtendedGradeRecord[]>(initialGrades);
  const [selectedSemester, setSelectedSemester] = useState<string>("все");
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);

  const risk = evaluateAcademicRisk(grades);
  const totalRequired = 24; // 24 disciplines for Bachelor program
  const progressPercent = calculateProgress(risk.completedCount, totalRequired);

  const filteredGrades =
    selectedSemester === "все"
      ? grades
      : grades.filter((g) => g.semester === selectedSemester || (g.semester.includes("1") && selectedSemester.includes("1")) || (g.semester.includes("2") && selectedSemester.includes("2")));

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case "5":
        return <Badge variant="success">5 (Отлично)</Badge>;
      case "4":
        return <Badge variant="default">4 (Хорошо)</Badge>;
      case "3":
        return <Badge variant="warning">3 (Удовл.)</Badge>;
      case "2":
        return <Badge variant="destructive">2 (Неуд.)</Badge>;
      case "зачёт":
        return <Badge variant="secondary">Зачёт</Badge>;
      case "незачёт":
        return <Badge variant="destructive">Незачёт</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  const openDetails = (g: ExtendedGradeRecord) => {
    const lessonItem: LessonItem = {
      id: g.id,
      discipline: g.discipline,
      kind: g.kind || "seminar",
      weekday: 1,
      start_time: "10:10",
      end_time: "11:40",
      room: g.room || "ауд. 320",
      teacher: g.teacher,
      brs_points: g.points ?? 90,
      teacher_info: {
        name: g.teacher,
        title: "Преподаватель ИГУ",
        department: "Учебная кафедра",
        email: "deanery@isu.ru",
        consultation: "По графику учебного расписания",
      },
      homework: {
        task: `Подготовка к промежуточной аттестации по дисциплине «${g.discipline}».`,
        deadline: "до 28 ноября 23:59",
        literature: "Учебный план направления, рабочая программа дисциплины ИГУ",
      },
    };
    setActiveLesson(lessonItem);
  };

  // Interactive retake simulator
  const handleSimulateRetake = (id: string, newGrade: "4" | "5") => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, grade: newGrade, points: newGrade === "5" ? 90 : 75 } : g
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Зачётная книжка</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {studentFullName} • Успеваемость, БРС и интерактивный симулятор пути к диплому
        </p>
      </div>

      {/* Top B2B Analytics: Diploma Progress & Academic Risk in 2 Columns on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Path to Diploma Progress Bar */}
        <Card className="border-border bg-gradient-to-br from-card to-muted/30 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                Прогресс диплома бакалавра
              </span>
              <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            </div>
            <CardDescription className="text-xs">
              Освоено {risk.completedCount} из {totalRequired} зачётных единиц учебного плана
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 mt-auto">
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Risk Early-Warning Indicator Card */}
        <Card className="border-border flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <Award className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  Индикатор академического риска
                </CardTitle>
              </div>
              <Badge
                variant={
                  risk.level === "low"
                    ? "success"
                    : risk.level === "medium"
                    ? "warning"
                    : "destructive"
                }
                className="shrink-0"
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
              <div
                className="p-2 rounded-xl bg-muted/60"
                title={`Средний балл GPA ${risk.averageGrade}. Рассчитан по зачетным оценкам.`}
              >
                <div className="text-[11px] text-muted-foreground">Средний балл (GPA)</div>
                <div className="text-base font-bold mt-0.5 text-foreground font-mono">
                  {risk.averageGrade || "—"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-muted/60">
                <div className="text-[11px] text-muted-foreground">Задолженностей</div>
                <div className="text-base font-bold mt-0.5 text-foreground font-mono">
                  {risk.debtsCount}
                </div>
              </div>
            </div>

            <div className="space-y-1 border-t border-border/60 pt-2 text-[11px]">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>Рекомендация деканата:</span>
              </div>
              {risk.recommendations.length > 0 ? (
                <p className="text-muted-foreground leading-snug">
                  • {risk.recommendations[0]}
                </p>
              ) : (
                <p className="text-muted-foreground leading-snug">
                  • Академическая успеваемость стабильна. Задолженностей нет.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BRS and ZET Informational Banner */}
      <div className="p-3.5 rounded-2xl bg-card border border-primary/20 text-xs flex items-start gap-2.5 shadow-2xs">
        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
          <div>
            <span className="font-semibold text-foreground">Балльно-рейтинговая система (БРС): </span>
            шкала от 0 до 100 баллов, отражающая работу студента в семестре (посещаемость, тесты, коллоквиумы). Для допуска к сессии необходимо набрать не менее 60 баллов.
          </div>
          <div>
            <span className="font-semibold text-foreground">Зачётная единица трудоёмкости (ЗЕТ): </span>
            академический «вес» дисциплины (1 ЗЕТ = 36 академических часов общей нагрузки студента, включая аудиторные пары, домашние задания и экзамен). Программа бакалавриата составляет 240 ЗЕТ (по 30 ЗЕТ в семестр).
          </div>
        </div>
      </div>

      {/* Semester Filter Tabs (SSoT Highlighting) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["все", "2 семестр", "1 семестр"].map((sem) => (
          <button
            key={sem}
            type="button"
            onClick={() => setSelectedSemester(sem)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 border select-none cursor-pointer",
              selectedSemester === sem
                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground active:scale-[0.94]"
            )}
          >
            {sem === "все" ? "Все семестры" : sem}
          </button>
        ))}
      </div>

      {/* Grade Records List (Responsive 2-Column Grid on md+ with smooth animation) */}
      <div key={selectedSemester} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
        {filteredGrades.map((g) => (
          <Card
            key={g.id}
            onClick={() => openDetails(g)}
            className="card-interactive border-border cursor-pointer flex flex-col justify-between"
          >
            <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-3">
              <div>
                {/* Top Row: Subject Title and Grade Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug">
                    {g.discipline}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getGradeBadge(g.grade)}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Metadata Row: Semester and Teacher with Icons */}
                <div className="flex items-center flex-wrap gap-2.5 text-xs text-muted-foreground mt-2 mb-1">
                  <span className="flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md text-foreground shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{g.semester}</span>
                  </span>
                  <span className="flex items-center gap-1.5 truncate min-w-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{g.teacher}</span>
                  </span>
                </div>
              </div>

              {/* Symmetric Bottom Row: BRS and ZET with Retake Simulator */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground gap-2">
                <div className="font-mono text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-lg text-xs">
                  {g.points !== null && g.points !== undefined ? `БРС: ${g.points}/100` : "БРС: —"}
                </div>

                <div className="flex items-center gap-2">
                  {(g.grade === "2" || g.grade === "незачёт") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateRetake(g.id, "4");
                      }}
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer transition-all active:scale-95"
                      title="Интерактивный симулятор: примерить пересдачу на 4"
                    >
                      [Симулировать пересдачу]
                    </button>
                  )}
                  <span
                    className="bg-muted px-2.5 py-1 rounded-lg font-medium text-foreground cursor-help"
                    title={`${g.zet} ЗЕТ (Зачётных Единиц Трудоёмкости) = ${g.zet * 36} академических часов нагрузки. 1 ЗЕТ = 36 часов.`}
                  >
                    {g.zet} ЗЕТ
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject Details Sheet */}
      <SubjectSheet
        lesson={activeLesson}
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
      />
    </div>
  );
}
