export type GradeValue = '5' | '4' | '3' | '2' | 'зачёт' | 'незачёт' | '—';

export interface GradeRecord {
  id: string;
  student_id: string;
  discipline: string;
  semester: string;
  grade: GradeValue;
  points?: number | null;
  teacher: string;
  updated_at?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AcademicRiskResult {
  level: RiskLevel;
  label: 'Низкий' | 'Средний' | 'Высокий';
  color: 'success' | 'warning' | 'destructive';
  debtsCount: number;
  averageGrade: number;
  completedCount: number;
  recommendations: string[];
}

/**
 * Calculates the Grade Point Average (GPA) for numeric grades (5, 4, 3, 2).
 * Graded pass/fail ('зачёт', 'незачёт') and unassigned ('—') are excluded from numeric GPA.
 */
export function calculateGPA(grades: GradeRecord[]): number {
  const numericGrades = grades
    .map((g) => {
      const parsed = parseInt(g.grade, 10);
      return isNaN(parsed) ? null : parsed;
    })
    .filter((g): g is number => g !== null);

  if (numericGrades.length === 0) return 0;
  const sum = numericGrades.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / numericGrades.length) * 100) / 100;
}

/**
 * Calculates progress percentage toward diploma requirements.
 */
export function calculateProgress(completedCount: number, totalRequired: number): number {
  if (totalRequired <= 0) return 0;
  const percentage = Math.round((completedCount / totalRequired) * 100);
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Evaluates academic risk based on open debts ('2', 'незачёт') and GPA.
 * Early-warning heuristic based on university retention analytics.
 */
export function evaluateAcademicRisk(grades: GradeRecord[]): AcademicRiskResult {
  const debts = grades.filter((g) => g.grade === '2' || g.grade === 'незачёт');
  const debtsCount = debts.length;
  const averageGrade = calculateGPA(grades);
  const completedCount = grades.filter(
    (g) => g.grade === '5' || g.grade === '4' || g.grade === '3' || g.grade === 'зачёт'
  ).length;

  const recommendations: string[] = [];

  if (debtsCount >= 2) {
    recommendations.push(
      `У вас ${debtsCount} академические задолженности. Срочно согласуйте индивидуальный график ликвидации задолженностей в деканате.`
    );
    recommendations.push('Запишитесь на консультацию к преподавателям до окончания расписания комиссионных пересдач.');
    return {
      level: 'high',
      label: 'Высокий',
      color: 'destructive',
      debtsCount,
      averageGrade,
      completedCount,
      recommendations,
    };
  }

  if (debtsCount === 1) {
    recommendations.push(
      `Имеется 1 задолженность по предмету "${debts[0].discipline}". Подайте заявление на пересдачу в разделе "Заявки".`
    );
    if (averageGrade > 0 && averageGrade < 3.5) {
      recommendations.push('Средний балл находится в пограничной зоне. Рекомендуется подтянуть текущие баллы БРС.');
    }
    return {
      level: 'medium',
      label: 'Средний',
      color: 'warning',
      debtsCount,
      averageGrade,
      completedCount,
      recommendations,
    };
  }

  if (averageGrade > 0 && averageGrade < 3.5) {
    recommendations.push('Задолженностей нет, но средний балл ниже 3.5. Обратите внимание на промежуточные аттестации.');
    return {
      level: 'medium',
      label: 'Средний',
      color: 'warning',
      debtsCount: 0,
      averageGrade,
      completedCount,
      recommendations,
    };
  }

  recommendations.push('Академических задолженностей нет. Вы уверенно движетесь по графику учебного плана.');
  if (averageGrade >= 4.75) {
    recommendations.push('Отличные результаты! Вы претендуете на диплом с отличием и повышенную академическую стипендию.');
  }

  return {
    level: 'low',
    label: 'Низкий',
    color: 'success',
    debtsCount: 0,
    averageGrade,
    completedCount,
    recommendations,
  };
}
