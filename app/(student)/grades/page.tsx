import React from "react";
import { requireUserSession } from "@/app/proxy";
import { createClient } from "@/lib/supabase/server";
import {
  GradesClientView,
  ExtendedGradeRecord,
  INITIAL_GRADES,
  STUDENT2_DEFAULT_GRADES,
  STUDENT3_DEFAULT_GRADES,
} from "./grades-client-view";

export { INITIAL_GRADES };

export default async function GradesPage() {
  const session = await requireUserSession();
  const supabase = await createClient();

  const { data: dbGrades } = await supabase
    .from("grade_records")
    .select("*")
    .eq("student_id", session.id)
    .order("semester", { ascending: false });

  let grades: ExtendedGradeRecord[] = [];

  if (dbGrades && dbGrades.length > 0) {
    grades = dbGrades.map((g, idx) => {
      // Retain authentic details for known student 1 records
      const match = INITIAL_GRADES.find((ig) => ig.discipline === g.discipline);
      return {
        id: g.id || `g-${idx}`,
        student_id: g.student_id,
        discipline: g.discipline,
        semester: g.semester.includes("1") ? "1 семестр" : "2 семестр",
        grade: g.grade,
        points: g.points ?? 85,
        zet: match?.zet ?? 3,
        teacher: g.teacher || match?.teacher || "Преподаватель кафедры",
        kind: match?.kind || "lecture",
        room: match?.room || "ауд. 302",
      };
    });
  } else {
    // Fallback based on active student session
    if (session.email.includes("student2") || session.fullName.includes("Кузнецова")) {
      grades = STUDENT2_DEFAULT_GRADES;
    } else if (session.email.includes("student3") || session.fullName.includes("Иванова")) {
      grades = STUDENT3_DEFAULT_GRADES;
    } else {
      grades = INITIAL_GRADES;
    }
  }

  return (
    <GradesClientView initialGrades={grades} studentFullName={session.fullName} />
  );
}
