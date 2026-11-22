import React from "react";
import { requireUserSession } from "@/app/proxy";
import { SCHEDULE_GROUPS } from "@/lib/schedule-data";
import { ScheduleClientView } from "./schedule-client-view";

export default async function SchedulePage() {
  const session = await requireUserSession();

  // Determine student group: if International Relations student -> 07131-DB, otherwise IT group CD-23-1
  const isHistoryStudent =
    Boolean(session.faculty && session.faculty.includes("Исторический")) ||
    Boolean(session.email && session.email.includes("student3")) ||
    Boolean(session.fullName && session.fullName.includes("Иванова"));

  const groupId = isHistoryStudent ? "07131-DB" : "CD-23-1";
  const groupConfig =
    SCHEDULE_GROUPS.find((g) => g.id === groupId) || SCHEDULE_GROUPS[0];

  return <ScheduleClientView groupId={groupId} groupConfig={groupConfig} />;
}
