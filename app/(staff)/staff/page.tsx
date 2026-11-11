"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  User,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffRequest {
  id: string;
  studentName: string;
  groupName: string;
  type: string;
  title: string;
  details: string;
  status: "submitted" | "in_review" | "ready" | "rejected";
  created_at: string;
}

const INITIAL_STAFF_REQUESTS: StaffRequest[] = [
  {
    id: "sr-1",
    studentName: "Кузнецова Мария Сергеевна",
    groupName: "ЦД-23-2",
    type: "Заявление",
    title: "Заявление на повторную аттестацию (пересдачу)",
    details: "Дисциплина: Математический анализ (Осенний семестр)",
    status: "submitted",
    created_at: "10 ноя, 09:40",
  },
  {
    id: "sr-2",
    studentName: "Смирнов Алексей Владимирович",
    groupName: "ЦД-23-1",
    type: "Справка",
    title: "Справка об обучении с гербовой печатью",
    details: "Назначение: Для оформления визы (2 экз.)",
    status: "in_review",
    created_at: "09 ноя, 14:15",
  },
  {
    id: "sr-3",
    studentName: "Федорова Анна Дмитриевна",
    groupName: "ЦД-24-1",
    type: "Справка",
    title: "Академическая справка с выпиской баллов",
    details: "Назначение: По месту требования (1 экз.)",
    status: "ready",
    created_at: "08 ноя, 11:20",
  },
];

export default function StaffPage() {
  const [requests, setRequests] = useState<StaffRequest[]>(INITIAL_STAFF_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleUpdateStatus = (id: string, newStatus: StaffRequest["status"]) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const getStatusBadge = (status: StaffRequest["status"]) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary">Новая</Badge>;
      case "in_review":
        return <Badge variant="warning">В работе</Badge>;
      case "ready":
        return <Badge variant="success">Готово</Badge>;
      case "rejected":
        return <Badge variant="destructive">Отклонено</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Очередь заявок студентов</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Обработка поступающих электронных обращений и справок
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Все заявки" },
          { key: "submitted", label: "Новые" },
          { key: "in_review", label: "В работе" },
          { key: "ready", label: "Готовые" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Queue */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-muted-foreground">
            <p className="text-sm font-medium">Нет заявок с данным статусом</p>
          </Card>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.created_at}</span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                <CardTitle className="text-sm font-semibold mt-1">
                  {req.title}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 text-foreground font-medium">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{req.studentName}</span>
                  <span className="text-muted-foreground font-normal">({req.groupName})</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="p-2.5 rounded-xl bg-muted/60 text-muted-foreground">
                  {req.details}
                </div>

                {/* Staff Actions Bar */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  {req.status === "submitted" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(req.id, "in_review")}
                      className="text-xs h-8 gap-1 flex-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Взять в работу</span>
                    </Button>
                  )}

                  {req.status === "in_review" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleUpdateStatus(req.id, "ready")}
                      className="text-xs h-8 gap-1 flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Готово к выдаче</span>
                    </Button>
                  )}

                  {req.status !== "rejected" && req.status !== "ready" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(req.id, "rejected")}
                      className="text-xs h-8 gap-1 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Отклонить</span>
                    </Button>
                  )}

                  {req.status === "ready" && (
                    <div className="text-[11px] text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Документ подписан и ожидает студента</span>
                    </div>
                  )}

                  {req.status === "rejected" && (
                    <div className="text-[11px] text-destructive font-medium flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Заявка отклонена</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
