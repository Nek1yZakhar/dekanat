import { describe, it, expect } from 'vitest';
import {
  calculateGPA,
  calculateProgress,
  evaluateAcademicRisk,
  GradeRecord,
} from '@/lib/academic';

describe('Academic Analytics & Risk Heuristic', () => {
  const mockExcellentGrades: GradeRecord[] = [
    { id: '1', student_id: 's1', discipline: 'Алгоритмы', semester: '2025-1', grade: '5', teacher: 'Иванов И.И.' },
    { id: '2', student_id: 's1', discipline: 'Базы данных', semester: '2025-1', grade: '5', teacher: 'Петров П.П.' },
    { id: '3', student_id: 's1', discipline: 'Дискретная математика', semester: '2025-1', grade: '4', teacher: 'Сидоров С.С.' },
    { id: '4', student_id: 's1', discipline: 'Физкультура', semester: '2025-1', grade: 'зачёт', teacher: 'Кузнецов К.К.' },
  ];

  const mockAtRiskGrades: GradeRecord[] = [
    { id: '1', student_id: 's2', discipline: 'Математический анализ', semester: '2025-1', grade: '2', teacher: 'Смирнов А.А.' },
    { id: '2', student_id: 's2', discipline: 'Физика', semester: '2025-1', grade: 'незачёт', teacher: 'Белов Б.Б.' },
    { id: '3', student_id: 's2', discipline: 'История', semester: '2025-1', grade: '3', teacher: 'Орлов О.О.' },
  ];

  const mockBorderlineGrades: GradeRecord[] = [
    { id: '1', student_id: 's3', discipline: 'Математический анализ', semester: '2025-1', grade: '2', teacher: 'Смирнов А.А.' },
    { id: '2', student_id: 's3', discipline: 'Программирование', semester: '2025-1', grade: '4', teacher: 'Белов Б.Б.' },
    { id: '3', student_id: 's3', discipline: 'Философия', semester: '2025-1', grade: '5', teacher: 'Орлов О.О.' },
  ];

  it('correctly computes GPA ignoring pass/fail subjects', () => {
    // (5 + 5 + 4) / 3 = 14 / 3 = 4.67
    const gpa = calculateGPA(mockExcellentGrades);
    expect(gpa).toBe(4.67);
  });

  it('returns 0 GPA if only non-numeric grades exist', () => {
    const passOnly: GradeRecord[] = [
      { id: '1', student_id: 's1', discipline: 'БЖД', semester: '2025-1', grade: 'зачёт', teacher: 'Тест' },
    ];
    expect(calculateGPA(passOnly)).toBe(0);
  });

  it('calculates diploma progress percentage correctly', () => {
    expect(calculateProgress(10, 40)).toBe(25);
    expect(calculateProgress(40, 40)).toBe(100);
    expect(calculateProgress(50, 40)).toBe(100);
    expect(calculateProgress(0, 40)).toBe(0);
  });

  it('evaluates low risk for an excellent student with zero debts', () => {
    const risk = evaluateAcademicRisk(mockExcellentGrades);
    expect(risk.level).toBe('low');
    expect(risk.label).toBe('Низкий');
    expect(risk.debtsCount).toBe(0);
    expect(risk.completedCount).toBe(4);
    expect(risk.recommendations.length).toBeGreaterThan(0);
  });

  it('evaluates high risk for student with 2 debts (grade 2 and незачёт)', () => {
    const risk = evaluateAcademicRisk(mockAtRiskGrades);
    expect(risk.level).toBe('high');
    expect(risk.label).toBe('Высокий');
    expect(risk.debtsCount).toBe(2);
    expect(risk.recommendations.some((r) => r.includes('академические задолженности'))).toBe(true);
  });

  it('evaluates medium risk for student with exactly 1 debt', () => {
    const risk = evaluateAcademicRisk(mockBorderlineGrades);
    expect(risk.level).toBe('medium');
    expect(risk.label).toBe('Средний');
    expect(risk.debtsCount).toBe(1);
    expect(risk.recommendations.some((r) => r.includes('Математический анализ'))).toBe(true);
  });
});
