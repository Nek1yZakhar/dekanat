"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export default function SchedulePage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("CD-23-1");
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);

  const currentGroup =
    SCHEDULE_GROUPS.find((g) => g.id === selectedGroupId) || SCHEDULE_GROUPS[0];
  const currentLessons = getLessonsByGroup(selectedGroupId, selectedDay);

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
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Расписание занятий</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {currentGroup.faculty} • {currentGroup.semester}
        </p>
      </div>

      {/* Segmented Group Switcher */}
      <div className="p-1 rounded-2xl bg-muted/60 border border-border grid grid-cols-1 sm:grid-cols-2 gap-1">
        {SCHEDULE_GROUPS.map((g) => {
          const isSelected = selectedGroupId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroupId(g.id)}
              className={cn(
                "py-2 px-3 rounded-xl text-xs font-semibold transition-colors duration-150 text-center select-none cursor-pointer",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-98"
              )}
            >
              {g.shortName}
            </button>
          );
        })}
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
          <span>{WEEKDAYS.find((w) => w.day === selectedDay)?.full}</span>
        </div>
        <span className="text-[11px] text-muted-foreground font-normal">
          Нажмите на пару для просмотра ДЗ
        </span>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {currentLessons.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-muted-foreground">
            <p className="text-sm font-medium">В этот день аудиторных занятий нет</p>
            <p className="text-xs mt-1">День самостоятельной работы и подготовки к промежуточным аттестациям.</p>
          </Card>
        ) : (
          currentLessons.map((item) => {
            const isCancelled = item.change?.cancelled;
            return (
              <Card
                key={item.id}
                onClick={() => setActiveLesson(item)}
                className={cn(
                  "border-border transition-all cursor-pointer hover:border-primary/50 hover:shadow-xs active:scale-[0.99]",
                  isCancelled && "opacity-75 bg-destructive/5 border-destructive/20"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {item.start_time} – {item.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isCancelled ? (
                        <Badge variant="destructive">Пара отменена</Badge>
                      ) : (
                        getKindBadge(item.kind)
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 mt-1">
                    <CardTitle
                      className={cn(
                        "text-base leading-snug",
                        isCancelled && "line-through text-muted-foreground"
                      )}
                    >
                      {item.discipline}
                    </CardTitle>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className={item.change?.new_room ? "font-semibold text-primary" : ""}>
                        {item.change?.new_room
                          ? `${item.change.new_room} (вместо ${item.room})`
                          : item.room}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[190px]">{item.teacher}</span>
                    </div>
                  </div>

                  {item.homework && (
                    <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/60">
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">ДЗ: {item.homework.task}</span>
                    </div>
                  )}

                  {item.change && (
                    <div
                      title={
                        item.change.reason
                          ? `Причина: ${item.change.reason}. Аудитория: ${item.change.new_room || item.room}`
                          : "Изменение в расписании"
                      }
                      className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 text-[11px] flex items-start gap-1.5 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <span className="leading-snug">{item.change.reason || "Изменение в расписании"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Interactive Subject Details Sheet */}
      <SubjectSheet
        lesson={activeLesson}
        isOpen={Boolean(activeLesson)}
        onClose={() => setActiveLesson(null)}
      />
    </div>
  );
}
