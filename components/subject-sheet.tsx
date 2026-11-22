"use client";

import React, { useEffect } from "react";
import { LessonItem } from "@/lib/schedule-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  Mail,
  GraduationCap,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectSheetProps {
  lesson: LessonItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubjectSheet({ lesson, isOpen, onClose }: SubjectSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lesson) return null;

  const getKindBadge = (kind: LessonItem["kind"]) => {
    switch (kind) {
      case "lecture":
        return <Badge variant="secondary">Лекция</Badge>;
      case "seminar":
        return <Badge variant="outline">Семинар</Badge>;
      case "practice":
        return <Badge variant="outline">Практика</Badge>;
      case "lab":
        return <Badge variant="default">Лабораторная</Badge>;
      case "exam":
        return <Badge variant="destructive">Экзамен</Badge>;
      default:
        return <Badge variant="secondary">Занятие</Badge>;
    }
  };

  const brs = lesson.brs_points ?? 92;
  const isQualified = brs >= 60;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-sheet-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-lg bg-white text-card-foreground shadow-2xl border border-slate-200",
          "rounded-t-3xl md:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom duration-200"
        )}
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="flex md:hidden justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {getKindBadge(lesson.kind)}
              {lesson.parity && (
                <Badge variant="outline" className="text-[10px]">
                  {lesson.parity === "odd" ? "Нечетная неделя" : lesson.parity === "even" ? "Четная неделя" : "Все недели"}
                </Badge>
              )}
              {lesson.change?.cancelled && (
                <Badge variant="destructive">Пара отменена</Badge>
              )}
            </div>
            <h2
              id="subject-sheet-title"
              className={cn(
                "text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug",
                lesson.change?.cancelled && "line-through text-muted-foreground"
              )}
            >
              {lesson.discipline}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {lesson.start_time} – {lesson.end_time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {lesson.change?.new_room ? (
                  <span className="font-semibold text-primary">{lesson.change.new_room} (вместо {lesson.room})</span>
                ) : (
                  lesson.room
                )}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer"
            aria-label="Закрыть шторку"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Change Alert if Present */}
          {lesson.change && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-semibold text-xs">Особый регламент проведения:</div>
                <div className="text-[11px] leading-relaxed">
                  {lesson.change.reason || "Изменения в проведении пары"}
                </div>
              </div>
            </div>
          )}

          {/* Current Homework (ДЗ) Card */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-primary text-xs">
                <BookOpen className="w-4 h-4" />
                <span>Текущее домашнее задание (ДЗ)</span>
              </div>
              {lesson.homework?.deadline && (
                <Badge variant="outline" className="text-[10px] bg-white border-slate-200 font-medium">
                  {lesson.homework.deadline}
                </Badge>
              )}
            </div>

            <p className="text-foreground font-medium leading-relaxed">
              {lesson.homework?.task || "Подготовить конспект лекционного материала и повторить ключевые термины к семинарскому занятию."}
            </p>

            {lesson.homework?.literature && (
              <div className="text-[11px] text-muted-foreground border-t border-slate-200/80 pt-2 flex items-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span><strong>Литература:</strong> {lesson.homework.literature}</span>
              </div>
            )}
          </div>

          {/* Teacher Information Card */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
              <User className="w-4 h-4 text-primary" />
              <span>Преподаватель и кафедра</span>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-xs text-foreground">
                {lesson.teacher_info?.name || lesson.teacher}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {lesson.teacher_info?.title || "Преподаватель"} • {lesson.teacher_info?.department || "Исторический факультет ИГУ"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/60 text-[11px]">
              {lesson.teacher_info?.email && (
                <a
                  href={`mailto:${lesson.teacher_info.email}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lesson.teacher_info.email}</span>
                </a>
              )}
              {lesson.teacher_info?.consultation && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{lesson.teacher_info.consultation}</span>
                </div>
              )}
            </div>
          </div>

          {/* BRS & Session Admission Card */}
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <Award className="w-4 h-4 text-primary" />
                <span>Балльно-рейтинговая система (БРС)</span>
              </div>
              <Badge variant={isQualified ? "success" : "warning"} className="text-[10px]">
                {isQualified ? "Допуск получен" : "Требуется добор"}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-muted-foreground">Текущий семестровый рейтинг:</span>
              <span className="text-sm font-bold text-foreground font-mono">{brs} / 100 баллов</span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  brs >= 85 ? "bg-emerald-500" : brs >= 60 ? "bg-primary" : "bg-amber-500"
                )}
                style={{ width: `${Math.min(100, brs)}%` }}
              />
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              {isQualified
                ? "Вы набрали более 60 баллов БРС и автоматически допущены к промежуточной аттестации по дисциплине."
                : "Для автоматического допуска к зачету/экзамену необходимо набрать не менее 60 баллов БРС."}
            </p>
          </div>
        </div>

        {/* Sheet Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 px-4 cursor-pointer"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}
