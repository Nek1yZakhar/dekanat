import React from "react";
import { requireUserSession } from "@/app/proxy";
import { AiClientView } from "./ai-client-view";

export default async function AiAssistantPage() {
  const session = await requireUserSession();
  const nameParts = session.fullName.trim().split(/\s+/);
  const studentName = nameParts.length > 1 ? nameParts[1] : session.fullName;

  return <AiClientView userId={session.id} studentName={studentName} />;
}
