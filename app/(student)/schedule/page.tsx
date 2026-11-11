"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonItem {
  id: string;
  discipline: string;
  kind: "lecture" | "seminar" | "lab" | "exam";
  weekday: number;
  start_time: string;
  end_time: string;
  room: string;
  teacher: string;
  change?: {
    cancelled?: boolean;
    new_room?: string;
    new_time?: string;
    reason?: string;
  };
}

const WEEKDAYS = [
  { day: 1, short: "Пн", full: "Понедельник" },
  { day: 2, short: "Вт", full: "Вторник" },
  { day: 3, short: "Ср", full: "Среда" },
  { day: 4, short: "Чт", full: "Четверг" },
  { day: 5, short: "Пт", full: "Пятница" },
  { day: 6, short: "Сб", full: "Суббота" },
];

const MOCK_LESSONS: LessonItem[] = [
  {
    id: "l1",
    discipline: "Математический анализ",
    kind: "lecture",
    weekday: 1,
    start_time: "09:00",
    end_time: "10:30",
    room: "ауд. 302",
    teacher: "Смирнов А.А.",
  },
  {
    id: "l2",
    discipline: "Базы данных и SQL",
    kind: "lab",
    weekday: 1,
    start_time: "10:45",
    end_time: "12:15",
    room: "комп. класс 2",
    teacher: "Петров П.П.",
    change: {
      new_room: "ауд. 410",
      reason: "Плановая профилактика компьютерного класса",
    },
  },
  {
    id: "l3",
    discipline: "Проектирование веб-систем",
    kind: "seminar",
    weekday: 2,
    start_time: "13:00",
    end_time: "14:30",
    room: "ауд. 415",
    teacher: "Волков В.В.",
  },
  {
    id: "l4",
    discipline: "Алгоритмы и структуры данных",
    kind: "lecture",
    weekday: 3,
    start_time: "09:00",
    end_time: "10:30",
    room: "ауд. 210",
    teacher: "Иванов И.И.",
    change: {
      cancelled: true,
      reason: "Участие преподавателя в конференции МГИМО",
    },
  },
  {
    id: "l5",
    discipline: "Машинное обучение",
    kind: "seminar",
    weekday: 4,
    start_time: "10:45",
    end_time: "12:15",
    room: "ауд. 305",
    teacher: "Ковалева Н.С.",
  },
  {
    id: "l6",
    discipline: "Информационная безопасность",
    kind: "lecture",
    weekday: 5,
    start_time: "12:30",
    end_time: "14:00",
    room: "ауд. 101",
    teacher: "Сергеев С.С.",
  },
];

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(1);

  const currentLessons = MOCK_LESSONS.filter((l) => l.weekday === selectedDay);

  const getKindBadge = (kind: LessonItem["kind"]) => {
    switch (kind) {
      case "lecture":
        return <Badge variant="secondary">Лекция</Badge>;
      case "seminar":
        return <Badge variant="outline">Семинар</Badge>;
      case "lab":
        return <Badge variant="default">Лабораторная</Badge>;
      case "exam":
        return <Badge variant="destructive">Экзамен</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Расписание занятий</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Группа ЦД-23-1 • 1 семестр 2026/2027
        </p>
      </div>

      {/* Weekday Selector */}
      <div className="grid grid-cols-6 gap-1 bg-muted/60 p-1 rounded-2xl border border-border">
        {WEEKDAYS.map((w) => {
          const isSelected = selectedDay === w.day;
          return (
            <button
              key={w.day}
              onClick={() => setSelectedDay(w.day)}
              className={cn(
                "py-2 rounded-xl text-center text-xs font-semibold transition-all select-none",
                isSelected
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div>{w.short}</div>
            </button>
          );
        })}
      </div>

      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
        <span>{WEEKDAYS.find((w) => w.day === selectedDay)?.full}</span>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {currentLessons.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-muted-foreground">
            <p className="text-sm font-medium">В этот день занятий нет</p>
            <p className="text-xs mt-1">Отличное время для подготовки к сессии или отдыха!</p>
          </Card>
        ) : (
          currentLessons.map((item) => {
            const isCancelled = item.change?.cancelled;
            return (
              <Card
                key={item.id}
                className={cn(
                  "border-border transition-all",
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

                  <CardTitle className={cn("text-base mt-1", isCancelled && "line-through text-muted-foreground")}>
                    {item.discipline}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className={item.change?.new_room ? "font-semibold text-primary" : ""}>
                        {item.change?.new_room ? `${item.change.new_room} (вместо ${item.room})` : item.room}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{item.teacher}</span>
                    </div>
                  </div>

                  {item.change && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <span>{item.change.reason || "Изменение в расписании"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
