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
      <div className="grid grid-cols-6 gap-1 bg-muted/60 p-1 rounded-2xl border border-border">
        {WEEKDAYS.map((w) => {
          const isSelected = selectedDay === w.day;
          return (
            <button
              key={w.day}
              type="button"
              onClick={() => setSelectedDay(w.day)}
              className={cn(
                "py-2 rounded-xl text-center text-xs font-semibold transition-colors duration-150 select-none cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border active:scale-95"
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
        <span className="text-[11px] bg-muted px-2 py-0.5 rounded-md font-mono">
          {currentLessons.length}{" "}
          {currentLessons.length === 1
            ? "пара"
            : currentLessons.length > 1 && currentLessons.length < 5
            ? "пары"
            : "пар"}
        </span>
      </div>

      {/* Lessons List for Selected Day */}
      {currentLessons.length === 0 ? (
        <Card className="border-dashed border-border py-8 text-center bg-muted/10">
          <CardContent className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              В этот день занятий по расписанию нет
            </p>
            <p className="text-[11px] text-muted-foreground">
              Используйте время для подготовки к семинарам и выполнения домашних заданий
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentLessons.map((lesson) => {
            const hasChange = Boolean(lesson.change);
            const isCancelled = lesson.change?.cancelled;

            return (
              <Card
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={cn(
                  "border-border transition-all cursor-pointer hover:border-primary/50 hover:shadow-xs active:scale-[0.99]",
                  hasChange && "border-amber-500/30 bg-amber-500/5",
                  isCancelled && "opacity-60 bg-muted/40 line-through"
                )}
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getKindBadge(lesson.kind)}
                        {lesson.parity && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                            {lesson.parity === "odd"
                              ? "Нечетная"
                              : lesson.parity === "even"
                              ? "Четная"
                              : "Все недели"}
                          </span>
                        )}
                        {hasChange && !isCancelled && (
                          <Badge variant="warning" className="text-[10px]">
                            Изменение ауд.
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge variant="destructive" className="text-[10px]">
                            Отменена
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs font-semibold leading-snug text-foreground">
                        {lesson.discipline}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{lesson.teacher}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-xs font-bold text-foreground font-mono flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{lesson.start_time}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        до {lesson.end_time}
                      </div>
                      <div className="text-[11px] font-semibold text-primary flex items-center justify-end gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {lesson.change?.new_room || lesson.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Homework & Details Trigger Banner */}
                  <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1 truncate text-primary font-medium">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {lesson.homework?.task || "Подготовка к занятию и литература"}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-foreground font-semibold shrink-0">
                      <span>ДЗ и БРС</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
