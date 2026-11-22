import { describe, it, expect } from "vitest";
import {
  INITIAL_GRADES,
  STUDENT2_DEFAULT_GRADES,
  STUDENT3_DEFAULT_GRADES,
} from "@/app/(student)/grades/grades-client-view";
import { evaluateAcademicRisk } from "@/lib/academic";
import { getLessonsByGroup } from "@/lib/schedule-data";

describe("TICKET-07.7: Student Data Isolation & SSoT", () => {
  it("Student 1 (Alexey Smirnov) has honors GPA 4.8 and 0 academic debts", () => {
    const risk = evaluateAcademicRisk(INITIAL_GRADES);
    expect(risk.averageGrade).toBe(4.8);
    expect(risk.debtsCount).toBe(0);
    expect(risk.level).toBe("low");
    expect(risk.recommendations.some((r) => r.includes("повышенную академическую стипендию"))).toBe(true);
  });

  it("Student 2 (Maria Kuznetsova) has GPA 3.25 and 1 debt in Math Analysis", () => {
    const risk = evaluateAcademicRisk(STUDENT2_DEFAULT_GRADES);
    expect(risk.averageGrade).toBe(3.25);
    expect(risk.debtsCount).toBe(1);
    expect(risk.level).toBe("medium");
    expect(risk.recommendations.some((r) => r.includes("Математический анализ"))).toBe(true);

    const debtSubject = STUDENT2_DEFAULT_GRADES.find((g) => g.discipline === "Математический анализ");
    expect(debtSubject).toBeDefined();
    expect(debtSubject?.grade).toBe("2");
  });

  it("Student 3 (Anna Ivanova) has GPA 4.67 and IR disciplines in group 07131-DB", () => {
    const risk = evaluateAcademicRisk(STUDENT3_DEFAULT_GRADES);
    expect(risk.averageGrade).toBe(4.67);
    expect(risk.debtsCount).toBe(0);
    expect(risk.level).toBe("low");

    const irSubject = STUDENT3_DEFAULT_GRADES.find((g) =>
      g.discipline.includes("международных отношений")
    );
    expect(irSubject).toBeDefined();
  });

  it("Schedule isolation: CD-23-1 only has IT disciplines, 07131-DB has History/Humanities", () => {
    const itLessons = [1, 2, 3, 4, 5].flatMap((day) => getLessonsByGroup("CD-23-1", day));
    const historyLessons = [1, 2, 3, 4, 5].flatMap((day) => getLessonsByGroup("07131-DB", day));

    // IT schedule contains IT/CS, never Political Science or World History
    const itHasPolitics = itLessons.some((l) => l.discipline.includes("Политология") || l.discipline.includes("Мировая история"));
    expect(itHasPolitics).toBe(false);

    // 07131-DB contains Political Science and World History, never Machine Learning or Databases
    const historyHasPolitics = historyLessons.some((l) => l.discipline.includes("Политология") || l.discipline.includes("Мировая история"));
    expect(historyHasPolitics).toBe(true);

    const historyHasMachineLearning = historyLessons.some((l) => l.discipline.includes("Машинное обучение"));
    expect(historyHasMachineLearning).toBe(false);
  });
});
