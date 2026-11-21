"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CertificateModal } from "@/components/certificate-modal";

interface RequestEvent {
  id?: string;
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

const TYPE_TITLES: Record<string, string> = {
  certificate: "Справка об обучении (с гербовой печатью)",
  reference: "Академическая справка с выпиской оценок",
  application: "Заявление на повторную аттестацию (пересдачу)",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Подано",
  in_review: "В обработке",
  ready: "Готово к выдаче",
  rejected: "Отклонено",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [certificateModalId, setCertificateModalId] = useState<string | null>(null);

  // Form State
  const [docType, setDocType] = useState<"certificate" | "reference" | "application">("certificate");
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState("1");

  const supabase = createClient();

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const loadRequests = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          type,
          payload,
          status,
          created_at,
          request_events (
            id,
            status,
            actor,
            comment,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Requests load error:", error.message);
        return;
      }

      if (data) {
        const formatted: RequestItem[] = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.payload?.title || TYPE_TITLES[item.type] || "Электронное обращение",
          status: item.status,
          created_at: formatDateTime(item.created_at),
          payload: item.payload || {},
          events: (item.request_events || [])
            .sort(
              (a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            .map((evt: any) => ({
              id: evt.id,
              status: evt.status,
              actor: evt.actor,
              comment: evt.comment,
              time: formatDateTime(evt.created_at),
            })),
        }));

        setRequests(formatted);
        if (formatted.length > 0 && !expandedId) {
          setExpandedId(formatted[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, expandedId]);

  useEffect(() => {
    loadRequests();

    // Setup Supabase Realtime channel for live updates
    const channel = supabase
      .channel("student-requests-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            const newStatusLabel = STATUS_LABELS[updated.status] || updated.status;
            toast.success(`Статус заявки обновлен: ${newStatusLabel}`, {
              duration: 4000,
            });
            loadRequests();
          } else if (payload.eventType === "INSERT") {
            loadRequests();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "request_events",
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const studentId = user?.id || "00000000-0000-0000-0000-000000000001";
      const title = TYPE_TITLES[docType];
      const payloadData = {
        title,
        purpose: purpose || "По месту требования",
        copies: parseInt(copies, 10) || 1,
      };

      const { data: newRow, error } = await supabase
        .from("requests")
        .insert({
          student_id: studentId,
          type: docType,
          payload: payloadData,
          status: "submitted",
        })
        .select()
        .single();

      if (error) {
        toast.error("Ошибка при создании заявки: " + error.message);
        return;
      }

      if (newRow) {
        // Insert initial history event
        await supabase.from("request_events").insert({
          request_id: newRow.id,
          status: "submitted",
          actor: "Студент",
          comment: "Заявка зарегистрирована в системе онлайн",
        });

        toast.success("Заявка успешно отправлена в деканат");
        setShowNewForm(false);
        setPurpose("");
        setCopies("1");
        await loadRequests();
        setExpandedId(newRow.id);
      }
    } catch (err: any) {
      toast.error("Не удалось отправить заявку: " + (err?.message || "Неизвестная ошибка"));
    } finally {
      setSubmitting(false);
    }
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Заявки и справки</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Заказ документов и трекинг статуса в реальном времени
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

      {/* New Request Inline Form */}
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
                  <option value="certificate">Справка об обучении (гербовая печать)</option>
                  <option value="reference">Академическая справка (с оценками)</option>
                  <option value="application">Заявление на пересдачу дисциплины</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {docType === "application" ? "Дисциплина" : "Цель / Место требования"}
                </label>
                <Input
                  placeholder={
                    docType === "application"
                      ? "Например: Математический анализ"
                      : "Например: Для оформления визы, Соцзащита, Работа"
                  }
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              {docType !== "application" && (
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
              )}

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={submitting} className="flex-1 text-xs">
                  {submitting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Отправка...
                    </span>
                  ) : (
                    "Отправить заявку"
                  )}
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

      {/* Loading State */}
      {loading && requests.length === 0 && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs">Загрузка истории заявок...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <Card className="border-dashed p-6 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold">Заявок пока нет</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Нажмите «Новая заявка», чтобы заказать справку об обучении или подать заявление онлайн.
          </p>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <Card key={item.id} className="border-border transition-all">
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
                      <strong>Назначение:</strong> {item.payload.purpose || item.payload.discipline || "По месту требования"}
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
                    <div className="mt-3 p-3.5 rounded-xl bg-card/75 backdrop-blur-xs border border-emerald-500/30 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-xs text-foreground leading-relaxed">
                          Справка оформлена и заверена электронной подписью деканата. Вы можете открыть и скачать официальный электронный документ прямо сейчас либо забрать оригинал с печатью в кабинете 201.
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setCertificateModalId(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 gap-1.5 h-9 px-3.5 shadow-sm cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-white" />
                        Открыть и скачать справку (PDF)
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <CertificateModal
        requestId={certificateModalId}
        isOpen={Boolean(certificateModalId)}
        onClose={() => setCertificateModalId(null)}
      />
    </div>
  );
}
