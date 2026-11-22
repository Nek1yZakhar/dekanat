import { describe, it, expect } from "vitest";
import { SCHEDULE_GROUPS, getLessonsByGroup } from "@/lib/schedule-data";
import { INITIAL_GRADES } from "@/app/(student)/grades/page";

describe("TICKET-07.5: Schedule & Data Consistency SSoT", () => {
  it("has IT group CD-23-1 as default (first index in SCHEDULE_GROUPS)", () => {
    expect(SCHEDULE_GROUPS.length).toBeGreaterThanOrEqual(2);
    const defaultGroup = SCHEDULE_GROUPS[0];
    expect(defaultGroup.id).toBe("CD-23-1");
    expect(defaultGroup.shortName).toContain("ЦД-23-1");
    expect(defaultGroup.faculty).toBe(
      "Факультет прикладной цифровизации и анализа данных, 1 курс"
    );
  });

  it("retains official ISU group 07131-DB as secondary option", () => {
    const historyGroup = SCHEDULE_GROUPS[1];
    expect(historyGroup.id).toBe("07131-DB");
    expect(historyGroup.shortName).toContain("07131-ДБ");
    expect(historyGroup.faculty).toContain("Исторический факультет ИГУ");
  });

  it("loads valid lessons for both groups across weekdays", () => {
    const itLessonsMonday = getLessonsByGroup("CD-23-1", 1);
    expect(itLessonsMonday.length).toBeGreaterThan(0);
    expect(itLessonsMonday[0].discipline).toBeDefined();

    const isuLessonsMonday = getLessonsByGroup("07131-DB", 1);
    expect(isuLessonsMonday.length).toBeGreaterThan(0);
    expect(isuLessonsMonday[0].discipline).toBeDefined();
  });

  it("removes historical faculty dean Zubkov/Zulyar from IT student grade records", () => {
    const orgRecord = INITIAL_GRADES.find(
      (g) => g.discipline === "Основы российской государственности"
    );
    expect(orgRecord).toBeDefined();
    expect(orgRecord?.teacher).not.toContain("Зуляр");
    expect(orgRecord?.teacher).toBe("доц. Шмидт С.Ф.");
    expect(orgRecord?.room).toBe("ауд. 307");
  });
});
