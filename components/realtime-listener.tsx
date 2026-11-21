"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function RealtimeListener({ userId }: { userId?: string }) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`student-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notification = payload.new as {
            title?: string;
            body?: string;
            student_id?: string;
            audience?: string;
          };

          if (
            notification.audience === "all" ||
            notification.student_id === userId
          ) {
            toast.info(notification.title || "Новое уведомление", {
              description: notification.body,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
