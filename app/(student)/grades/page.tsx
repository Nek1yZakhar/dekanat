"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  evaluateAcademicRisk,
  calculateGPA,
  calculateProgress,
  GradeRecord,
} from "@/lib/academic";
import {
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_GRADES: GradeRecord[] = [
  // Semester 2
  { id: "1", student_id: "s1", discipline: "Алгоритмы и структуры данных", semester: "2 семестр", grade: "5", points: 95, teacher: "Иванов И.И." },
  { id: "2", student_id: "s1", discipline: "Базы данных и SQL", semester: "2 семестр", grade: "5", points: 92, teacher: "Петров П.П." },
  { id: "3", student_id: "s1", discipline: "Дискретная математика", semester: "2 семестр", grade: "4", points: 84, teacher: "Сидоров С.С." },
  { id: "4", student_id: "s1", discipline: "Физическая культура", semester: "2 семестр", grade: "зачёт", points: 100, teacher: "Кузнецов К.К." },
  // Semester 1
  { id: "5", student_id: "s1", discipline: "Линейная алгебра", semester: "1 семестр", grade: "5", points: 98, teacher: "Морозов А.В." },
  { id: "6", student_id: "s1", discipline: "Иностранный язык", semester: "1 семестр", grade: "5", points: 91, teacher: "Браун Э.В." },
  { id: "7", student_id: "s1", discipline: "Основы российской государственности", semester: "1 семестр", grade: "зачёт", points: 88, teacher: "Орлов О.О." },
  { id: "8", student_id: "s1", discipline: "История России", semester: "1 семестр", grade: "4", points: 79, teacher: "Никитина А.С." },
];

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [selectedSemester, setSelectedSemester] = useState<string>("все");

  const risk = evaluateAcademicRisk(grades);
  const totalRequired = 24; // 24 disciplines for Bachelor program
  const progressPercent = calculateProgress(risk.completedCount, totalRequired);

  const filteredGrades =
    selectedSemester === "все"
      ? grades
      : grades.filter((g) => g.semester === selectedSemester);

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Зачётная книжка</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Успеваемость, БРС и интерактивный симулятор пути к диплому
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <div className="text-[11px] text-muted-foreground">Средний балл (GPA)</div>
              <div className="text-lg font-bold mt-0.5">{risk.averageGrade}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60">
              <div className="text-[11px] text-muted-foreground">Задолженностей</div>
              <div className="text-lg font-bold mt-0.5">{risk.debtsCount}</div>
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border/60 pt-2.5">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Рекомендации деканата:</span>
            </div>
            {risk.recommendations.map((rec, idx) => (
              <p key={idx} className="text-xs text-muted-foreground leading-relaxed">
                • {rec}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Semester Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["все", "2 семестр", "1 семестр"].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
              selectedSemester === sem
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {sem === "все" ? "Все семестры" : sem}
          </button>
        ))}
      </div>

      {/* Grade Records List */}
      <div className="space-y-2.5">
        {filteredGrades.map((g) => (
          <Card key={g.id} className="border-border">
            <CardContent className="p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-1 overflow-hidden">
                <div className="text-xs font-semibold leading-tight truncate">
                  {g.discipline}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>{g.semester}</span>
                  <span>•</span>
                  <span>{g.teacher}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {getGradeBadge(g.grade)}
                {g.points !== null && g.points !== undefined && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    БРС: {g.points}/100
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
