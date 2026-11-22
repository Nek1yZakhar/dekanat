"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  User,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SCHEDULE_GROUPS,
  getLessonsByGroup,
  LessonItem,
  GroupConfig,
} from "@/lib/schedule-data";
import { SubjectSheet } from "@/components/subject-sheet";

const WEEKDAYS = [
  { day: 1, short: "Пн", full: "Понедельник" },
  { day: 2, short: "Вт", full: "Вторник" },
  { day: 3, short: "Ср", full: "Среда" },
  { day: 4, short: "Чт", full: "Четверг" },
  { day: 5, short: "Пт", full: "Пятница" },
  { day: 6, short: "Сб", full: "Суббота" },
];

interface ScheduleClientViewProps {
  groupId: string;
  groupConfig: GroupConfig;
}

export function ScheduleClientView({ groupId, groupConfig }: ScheduleClientViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);

  const currentLessons = getLessonsByGroup(groupId, selectedDay);

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

  return (
    <div className="space-y-4">
      {/* Page Header (Clean SSoT for active student) */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Расписание занятий</h1>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Badge variant="outline" className="text-[11px] font-semibold bg-muted/50 border-primary/30 text-primary">
            {groupConfig.shortName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {groupConfig.faculty} • {groupConfig.semester}
          </span>
        </div>
      </div>

      {/* Weekday Selector (SSoT Highlighting) */}
      <div className="grid grid-cols-6 gap-1 bg-muted/60 p-1.5 rounded-2xl border border-border">
        {WEEKDAYS.map((w) => {
          const isSelected = selectedDay === w.day;
          return (
            <button
              key={w.day}
              type="button"
              onClick={() => setSelectedDay(w.day)}
              className={cn(
                "py-2.5 rounded-xl text-center text-xs font-semibold transition-all duration-150 select-none cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/70 active:scale-[0.94]"
              )}
            >
              <div>{w.short}</div>
            </button>
          );
        })}
      </div>

      {/* Current Day Label & Quick Info */}
      <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
          <span>
            {WEEKDAYS.find((w) => w.day === selectedDay)?.full} • 1 курс
          </span>
        </div>
        <span className="text-[11px] bg-muted px-2.5 py-0.5 rounded-md font-mono font-medium">
          {currentLessons.length}{" "}
          {currentLessons.length === 1
            ? "пара"
            : currentLessons.length > 1 && currentLessons.length < 5
            ? "пары"
            : "пар"}
        </span>
      </div>

      {/* Lessons List for Selected Day (with smooth entrance animation) */}
      {currentLessons.length === 0 ? (
        <Card className="border-dashed border-border py-12 text-center bg-muted/10 animate-fade-in-up">
          <CardContent className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              В этот день занятий по расписанию нет
            </p>
            <p className="text-xs text-muted-foreground">
              Используйте свободное время для подготовки к семинарам и выполнения домашних заданий
            </p>
          </CardContent>
        </Card>
      ) : (
        <div key={selectedDay} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
          {currentLessons.map((lesson) => {
            const hasChange = Boolean(lesson.change);
            const isCancelled = lesson.change?.cancelled;

            return (
              <Card
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={cn(
                  "card-interactive border-border cursor-pointer",
                  hasChange && "border-amber-500/40 bg-amber-500/5",
                  isCancelled && "opacity-60 bg-muted/40 line-through"
                )}
              >
                <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-3">
                  <div>
                    {/* Top Row: Lesson Kind Badge & Room Change + Clear Time Window */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getKindBadge(lesson.kind)}
                        {lesson.parity && (
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium">
                            {lesson.parity === "odd"
                              ? "Нечётная"
                              : lesson.parity === "even"
                              ? "Чётная"
                              : "Все недели"}
                          </span>
                        )}
                        {hasChange && !isCancelled && (
                          <Badge variant="warning" className="text-[11px]">
                            Изменение ауд.
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge variant="destructive" className="text-[11px]">
                            Отменена
                          </Badge>
                        )}
                      </div>

                      {/* Clean Inlined Time Range (like Dashboard Next Lesson) */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg font-mono shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {lesson.start_time} – {lesson.end_time}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Subject Title */}
                    <div className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-3 mb-1.5 leading-snug">
                      {lesson.discipline}
                    </div>

                    {/* Metadata Row: Teacher and Room with Icons */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{lesson.teacher}</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{lesson.change?.new_room || lesson.room}</span>
                      </div>
                    </div>
                  </div>

                  {/* Homework & Details Trigger Footer */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground gap-3">
                    <div className="flex items-center gap-1.5 truncate text-primary font-medium min-w-0">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {lesson.homework?.task || "Подготовка к занятию и литература"}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-foreground font-semibold shrink-0 hover:text-primary transition-colors">
                      <span>ДЗ и БРС</span>
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Subject Details Bottom Sheet */}
      <SubjectSheet
        lesson={activeLesson}
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
      />
    </div>
  );
}
