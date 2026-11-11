"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestEvent {
  status: string;
  actor: string;
  comment?: string;
  time: string;
}

interface RequestItem {
  id: string;
  type: "certificate" | "reference" | "application";
  title: string;
  status: "submitted" | "in_review" | "ready" | "rejected";
  created_at: string;
  payload: Record<string, any>;
  events: RequestEvent[];
}

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: "req-1",
    type: "certificate",
    title: "Справка об обучении (с гербовой печатью)",
    status: "ready",
    created_at: "08 ноября 2026",
    payload: { purpose: "Для оформления визы / по месту требования", copies: 2 },
    events: [
      { status: "submitted", actor: "Студент", comment: "Заявка сформирована онлайн", time: "08 ноя, 10:15" },
      { status: "in_review", actor: "Сотрудник деканата", comment: "Принято в работу, проверка данных", time: "08 ноя, 14:30" },
      { status: "ready", actor: "Сотрудник деканата", comment: "Справка подписана деканом. Ожидает в к. 201", time: "09 ноя, 11:00" },
    ],
  },
  {
    id: "req-2",
    type: "application",
    title: "Заявление на повторную аттестацию (пересдачу)",
    status: "in_review",
    created_at: "10 ноября 2026",
    payload: { discipline: "Математический анализ", term: "Осенняя ликвидация задолженностей" },
    events: [
      { status: "submitted", actor: "Студент", comment: "Заявление отправлено на рассмотрение", time: "10 ноя, 09:40" },
      { status: "in_review", actor: "Сотрудник деканата", comment: "Назначена дата комиссионной пересдачи: 24 ноября", time: "10 ноя, 12:10" },
    ],
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("req-1");

  // Form State
  const [docType, setDocType] = useState<"certificate" | "reference" | "application">("certificate");
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState("1");

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const typeTitles = {
      certificate: "Справка об обучении",
      reference: "Академическая справка с выпиской оценок",
      application: "Заявление на пересдачу дисциплины",
    };

    const newReq: RequestItem = {
      id: `req-${Date.now()}`,
      type: docType,
      title: typeTitles[docType],
      status: "submitted",
      created_at: "Только что",
      payload: { purpose: purpose || "По месту требования", copies: parseInt(copies, 10) || 1 },
      events: [
        {
          status: "submitted",
          actor: "Студент",
          comment: "Заявка зарегистрирована в системе",
          time: "Только что",
        },
      ],
    };

    setRequests([newReq, ...requests]);
    setShowNewForm(false);
    setPurpose("");
    setExpandedId(newReq.id);
  };

  const getStatusBadge = (status: RequestItem["status"]) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary">Подано</Badge>;
      case "in_review":
        return <Badge variant="warning">В обработке</Badge>;
      case "ready":
        return <Badge variant="success">Готово к выдаче</Badge>;
      case "rejected":
        return <Badge variant="destructive">Отклонено</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Заявки и справки</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Заказ документов и трекинг статуса онлайн
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowNewForm(!showNewForm)}
          className="text-xs h-9 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новая заявка</span>
        </Button>
      </div>

      {/* New Request Modal/Inline Form */}
      {showNewForm && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Оформление заявки на документ</CardTitle>
            <CardDescription className="text-xs">
              Срок подготовки справки — до 3 рабочих дней
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Тип документа</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="certificate">Справка об обучении (гербовая)</option>
                  <option value="reference">Академическая справка (с оценками)</option>
                  <option value="application">Заявление на пересдачу дисциплины</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Цель / Место требования</label>
                <Input
                  placeholder="Например: Для оформления визы, Соцзащита, Работа"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Количество экземпляров</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" className="flex-1 text-xs">
                  Отправить заявку
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewForm(false)}
                  className="text-xs"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <Card key={item.id} className="border-border">
              <CardHeader
                className="cursor-pointer pb-2"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.created_at}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-3 pt-0 border-t border-border/50 mt-2 text-xs">
                  <div className="text-muted-foreground pt-2">
                    <div>
                      <strong>Назначение:</strong> {item.payload.purpose || item.payload.discipline}
                    </div>
                    {item.payload.copies && (
                      <div>
                        <strong>Количество:</strong> {item.payload.copies} экз.
                      </div>
                    )}
                  </div>

                  {/* Parcel Delivery Style Status Timeline */}
                  <div className="space-y-2 border-l-2 border-primary/30 pl-3 ml-1 mt-2">
                    <div className="text-[11px] font-semibold text-foreground">
                      История обработки:
                    </div>
                    {item.events.map((evt, idx) => (
                      <div key={idx} className="relative pb-1">
                        <div className="text-xs font-medium text-foreground flex items-center justify-between">
                          <span>{evt.actor}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {evt.time}
                          </span>
                        </div>
                        {evt.comment && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {evt.comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {item.status === "ready" && (
                    <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-900 dark:text-green-200 text-xs flex items-center gap-2">
                      <FileCheck className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
                      <span>Документ готов к выдаче. Ждём вас в деканате (кабинет 201) с 10:00 до 17:00.</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
