"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  User,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CertificateModal } from "@/components/certificate-modal";

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

const TYPE_TITLES: Record<string, string> = {
  certificate: "Справка об обучении (с гербовой печатью)",
  reference: "Академическая справка с выпиской оценок",
  application: "Заявление на повторную аттестацию (пересдачу)",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Новая",
  in_review: "В работе",
  ready: "Готово",
  rejected: "Отклонено",
};

export default function StaffPage() {
  const [requests, setRequests] = useState<StaffRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [previewRequestId, setPreviewRequestId] = useState<string | null>(null);

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
      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          type,
          payload,
          status,
          created_at,
          student_id,
          profiles:student_id (
            full_name,
            groups:group_id (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Staff requests load error:", error.message);
        return;
      }

      if (data) {
        const formatted: StaffRequest[] = data.map((item: any) => {
          const profile = item.profiles;
          const group = profile?.groups;
          const studentName = profile?.full_name || "Студент ИГУ";
          const groupName = group?.name || "ЦД-23-1";

          const title = item.payload?.title || TYPE_TITLES[item.type] || "Электронная заявка";
          const purpose = item.payload?.purpose || item.payload?.discipline || "По месту требования";
          const copies = item.payload?.copies ? ` (${item.payload.copies} экз.)` : "";

          return {
            id: item.id,
            studentName,
            groupName,
            type: item.type === "application" ? "Заявление" : "Справка",
            title,
            details: `Назначение / Предмет: ${purpose}${copies}`,
            status: item.status,
            created_at: formatDateTime(item.created_at),
          };
        });

        setRequests(formatted);
      }
    } catch (err) {
      console.warn("Failed to load staff requests:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadRequests();

    // Subscribe to incoming student requests and updates via Supabase Realtime
    const channel = supabase
      .channel("staff-requests-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newId = (payload.new as any).id;
            setHighlightedId(newId);
            setTimeout(() => {
              setHighlightedId((curr) => (curr === newId ? null : curr));
            }, 4000);

            const title = (payload.new as any)?.payload?.title || "Электронное обращение";
            toast.info("Поступило новое обращение в деканат", {
              description: title,
              duration: 5000,
            });
            loadRequests();
          } else if (payload.eventType === "UPDATE") {
            loadRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadRequests]);

  const handleUpdateStatus = async (id: string, newStatus: StaffRequest["status"]) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Ошибка обновления статуса: " + error.message);
        return;
      }

      const comments: Record<string, string> = {
        in_review: "Принято в обработку сотрудником деканата",
        ready: "Документ оформлен и подписан. Готов к выдаче в к. 201",
        rejected: "Заявка отклонена деканатом",
      };

      await supabase.from("request_events").insert({
        request_id: id,
        status: newStatus,
        actor: "Сотрудник деканата",
        comment: comments[newStatus] || "Статус заявки обновлен",
      });

      // Optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      toast.success(`Статус заявки изменен на «${STATUS_LABELS[newStatus]}»`);
    } catch (err: any) {
      toast.error("Не удалось изменить статус: " + (err?.message || "Ошибка"));
    }
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Очередь заявок студентов</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Обработка поступающих электронных обращений и справок в реальном времени
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && requests.length === 0 && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs">Загрузка очереди заявок...</span>
        </div>
      )}

      {/* Requests Queue */}
      <div className="space-y-3">
        {!loading && filteredRequests.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Нет заявок с данным статусом</p>
          </Card>
        ) : (
          filteredRequests.map((req) => {
            const isHighlighted = highlightedId === req.id;
            return (
              <Card
                key={req.id}
                className={cn(
                  "border-border transition-all duration-500",
                  isHighlighted && "ring-2 ring-primary bg-primary/5 shadow-md"
                )}
              >
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
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewRequestId(req.id)}
                          className="text-xs h-8 gap-1 border-primary/40 hover:bg-primary/10 text-primary font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Бланк справки (PDF)</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateStatus(req.id, "ready")}
                          className="text-xs h-8 gap-1 flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Готово к выдаче</span>
                        </Button>
                      </>
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
                      <div className="flex items-center justify-between w-full gap-2 flex-wrap">
                        <div className="text-[11px] text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Документ подписан и ожидает студента</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewRequestId(req.id)}
                          className="text-xs h-8 gap-1 border-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-500/10 font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Открыть справку (PDF)</span>
                        </Button>
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
            );
          })
        )}
      </div>

      <CertificateModal
        requestId={previewRequestId}
        isOpen={Boolean(previewRequestId)}
        onClose={() => setPreviewRequestId(null)}
      />
    </div>
  );
}
