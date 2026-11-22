import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import fs from "node:fs";
import path from "node:path";

const STATE_FILE =
  process.platform === "win32"
    ? path.join(process.cwd(), ".activity_state.json")
    : "/tmp/dekanat_activity_state.json";

export async function POST() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Students
    const { data: users } = await supabase.auth.admin.listUsers();
    const student1 = users?.users?.find((u) => u.email === "student1@dekanat.fake");
    const student2 = users?.users?.find((u) => u.email === "student2@dekanat.fake");
    const student3 = users?.users?.find((u) => u.email === "student3@dekanat.fake");

    if (student1 && student2) {
      // 2. Clean up dynamic requests
      await supabase.from("request_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // 3. Re-seed canonical student requests
      const { data: req1 } = await supabase
        .from("requests")
        .insert({
          student_id: student1.id,
          type: "certificate",
          payload: { purpose: "Для оформления визы / по месту требования", copies: 2 },
          status: "ready",
        })
        .select()
        .single();

      if (req1) {
        await supabase.from("request_events").insert([
          { request_id: req1.id, status: "submitted", actor: "Студент", comment: "Заявка сформирована в мобильном приложении" },
          { request_id: req1.id, status: "in_review", actor: "Сотрудник деканата", comment: "Принято в обработку. Формирование документа" },
          { request_id: req1.id, status: "ready", actor: "Сотрудник деканата", comment: "Справка с гербовой печатью готова к выдаче в к. 201" },
        ]);
      }

      const { data: req2 } = await supabase
        .from("requests")
        .insert({
          student_id: student2.id,
          type: "application",
          payload: {
            subject: "Повторная промежуточная аттестация",
            discipline: "Математический анализ",
            term: "Осенний семестр 2026",
          },
          status: "in_review",
        })
        .select()
        .single();

      if (req2) {
        await supabase.from("request_events").insert([
          { request_id: req2.id, status: "submitted", actor: "Студент", comment: "Заявление подано на рассмотрение аттестационной комиссии" },
          { request_id: req2.id, status: "in_review", actor: "Сотрудник деканата", comment: "Назначена дата комиссионной пересдачи: 24 ноября" },
        ]);
      }

      // 4. Reset grade_records for Student 2 (guaranteeing 1 open debt: grade "2" in Math Analysis)
      await supabase.from("grade_records").delete().eq("student_id", student2.id);
      await supabase.from("grade_records").insert([
        { student_id: student2.id, discipline: "Математический анализ", semester: "2024/2025-2", grade: "2", points: 42, teacher: "Смирнов А.А." },
        { student_id: student2.id, discipline: "Проектирование веб-систем", semester: "2024/2025-2", grade: "4", points: 76, teacher: "Волков В.В." },
        { student_id: student2.id, discipline: "Архитектура ИС", semester: "2024/2025-2", grade: "3", points: 64, teacher: "Федоров Д.А." },
        { student_id: student2.id, discipline: "Безопасность жизнедеятельности", semester: "2024/2025-2", grade: "зачёт", points: 80, teacher: "Попов В.Г." },
        { student_id: student2.id, discipline: "Линейная алгебра", semester: "2024/2025-1", grade: "4", points: 78, teacher: "Морозов А.В." },
      ]);

      // 5. Reset grade_records for Student 1 (GPA 4.8)
      await supabase.from("grade_records").delete().eq("student_id", student1.id);
      await supabase.from("grade_records").insert([
        { student_id: student1.id, discipline: "Алгоритмы и структуры данных", semester: "2024/2025-2", grade: "5", points: 95, teacher: "Иванов И.И." },
        { student_id: student1.id, discipline: "Базы данных и SQL", semester: "2024/2025-2", grade: "5", points: 92, teacher: "Петров П.П." },
        { student_id: student1.id, discipline: "Дискретная математика", semester: "2024/2025-2", grade: "4", points: 84, teacher: "Сидоров С.С." },
        { student_id: student1.id, discipline: "Физическая культура", semester: "2024/2025-2", grade: "зачёт", points: 100, teacher: "Кузнецов К.К." },
        { student_id: student1.id, discipline: "Линейная алгебра", semester: "2024/2025-1", grade: "5", points: 98, teacher: "Морозов А.В." },
        { student_id: student1.id, discipline: "Иностранный язык", semester: "2024/2025-1", grade: "5", points: 91, teacher: "Браун Э.В." },
      ]);

      // 6. Reset Student 3 if present
      if (student3) {
        await supabase.from("grade_records").delete().eq("student_id", student3.id);
        await supabase.from("grade_records").insert([
          { student_id: student3.id, discipline: "Новая история стран Европы и Америки", semester: "2024/2025-1", grade: "5", points: 94, teacher: "проф. Костров А.В." },
          { student_id: student3.id, discipline: "История международных отношений", semester: "2024/2025-1", grade: "5", points: 91, teacher: "доц. Матвеева Е.А." },
          { student_id: student3.id, discipline: "Иностранный язык (английский)", semester: "2024/2025-1", grade: "4", points: 85, teacher: "ст.преп. Алексеева Е.Е." },
          { student_id: student3.id, discipline: "Введение в специальность", semester: "2024/2025-1", grade: "зачёт", points: 90, teacher: "доц. Елохина Ю.В." },
          { student_id: student3.id, discipline: "Основы российской государственности", semester: "2024/2025-1", grade: "зачёт", points: 88, teacher: "доц. Шмидт С.Ф." },
        ]);
      }
    }

    // 7. Update activity state file
    try {
      const now = Date.now();
      const updatedState = {
        last_activity_at: now,
        last_reset_at: now,
        pending_reset: false,
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(updatedState, null, 2), "utf-8");
    } catch {
      // Ignore write errors
    }

    return NextResponse.json({
      success: true,
      message: "Демо-данные успешно возвращены к исходному состоянию",
    });
  } catch (err: unknown) {
    console.error("Demo reset error:", err);
    return NextResponse.json(
      { error: "Ошибка при сбросе демо-данных" },
      { status: 500 }
    );
  }
}
