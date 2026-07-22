'use client';

import type { BackendBootstrap, BackendStudent } from './backendData';

export const CURRENT_TEACHER_NAME = 'Sarah Jenkins';
export const DEFAULT_TEACHER_CLASS = { className: 'Class 4', sectionName: 'A' };

export function getCurrentTeacherAssignment(data: Pick<BackendBootstrap, 'teachers'>) {
  const teacher = data.teachers.find(item => item.full_name === CURRENT_TEACHER_NAME);
  const assignment = teacher?.assignments.find(item =>
    item.assignmentType === 'primary_incharge' || item.assignmentType === 'assistant_incharge'
  ) ?? teacher?.assignments[0];

  return {
    className: assignment?.className || DEFAULT_TEACHER_CLASS.className,
    sectionName: assignment?.sectionName || DEFAULT_TEACHER_CLASS.sectionName,
    teacher,
  };
}

export function uniqueStudents(students: BackendStudent[]) {
  const seen = new Set<string>();
  return students.filter(student => {
    const key = student.id || student.student_code;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function studentsForAssignment(students: BackendStudent[], className: string, sectionName: string) {
  return uniqueStudents(students).filter(student =>
    student.class_name === className && student.section_name === sectionName
  );
}
