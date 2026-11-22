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

      {/* Path to Diploma Progress Bar */}
      <Card className="border-border bg-gradient-to-br from-card to-muted/30">
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
        <CardContent className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Risk Early-Warning Indicator Card */}
      <Card className="border-border">
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
              className="p-2.5 rounded-xl bg-muted/60"
              title={`Средний балл GPA ${risk.averageGrade}. Рассчитан по зачетным оценкам.`}
            >
              <div className="text-[11px] text-muted-foreground">Средний балл (GPA)</div>
              <div className="text-lg font-bold mt-0.5 text-foreground font-mono">
                {risk.averageGrade || "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60">
              <div className="text-[11px] text-muted-foreground">Задолженностей</div>
              <div className="text-lg font-bold mt-0.5 text-foreground font-mono">
                {risk.debtsCount}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border/60 pt-2.5">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Рекомендация деканата:</span>
            </div>
            {risk.recommendations.length > 0 ? (
              <div className="space-y-1">
                {risk.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground leading-relaxed">
                    • {rec}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                • Академическая успеваемость стабильна. Задолженностей нет.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BRS Informational Banner */}
      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-muted-foreground text-[11px] leading-relaxed">
          <span className="font-semibold text-foreground">Балльно-рейтинговая система (БРС): </span>
          шкала от 0 до 100 баллов, отражающая работу студента в семестре (посещаемость, тесты, коллоквиумы). Для допуска к сессии необходимо набрать не менее 60 баллов.
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
              "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors duration-150 border select-none cursor-pointer",
              selectedSemester === sem
                ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted active:scale-95"
            )}
          >
            {sem === "все" ? "Все семестры" : sem}
          </button>
        ))}
      </div>

      {/* Grade Records List (Symmetric Layout) */}
      <div className="space-y-2.5">
        {filteredGrades.map((g) => (
          <Card
            key={g.id}
            onClick={() => openDetails(g)}
            className="border-border transition-all cursor-pointer hover:border-primary/50 hover:shadow-xs active:scale-[0.99]"
          >
            <CardContent className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold leading-snug text-foreground truncate">
                    {g.discipline}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span>{g.semester}</span>
                    <span>•</span>
                    <span className="truncate">{g.teacher}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {getGradeBadge(g.grade)}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Symmetric Bottom Row: BRS and ZET */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                <span className="font-mono text-primary font-medium">
                  {g.points !== null && g.points !== undefined ? `БРС: ${g.points}/100` : "БРС: —"}
                </span>

                <div className="flex items-center gap-2">
                  {(g.grade === "2" || g.grade === "незачёт") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateRetake(g.id, "4");
                      }}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                      title="Интерактивный симулятор: примерить пересдачу на 4"
                    >
                      [Симулировать пересдачу]
                    </button>
                  )}
                  <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-foreground">
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
