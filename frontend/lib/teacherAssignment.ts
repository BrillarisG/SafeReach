'use client';

import type { BackendBootstrap, BackendStudent } from './backendData';

export const CURRENT_TEACHER_NAME = 'Sarah Jenkins';
export const DEFAULT_TEACHER_CLASS = { className: 'Class 4', sectionName: 'B' };

type TeacherAssignmentData = Pick<BackendBootstrap, 'teachers' | 'students' | 'timetable'>;

function isClassAccessAssignment(assignment: { assignmentType: string }) {
  return assignment.assignmentType === 'primary_incharge' || assignment.assignmentType === 'assistant_incharge';
}

function hasStudents(students: BackendStudent[], className?: string, sectionName?: string) {
  return students.some(student => student.class_name === className && student.section_name === sectionName);
}

export function getCurrentTeacherAssignment(data: TeacherAssignmentData) {
  const preferredTeacher = data.teachers.find(item => item.full_name === CURRENT_TEACHER_NAME);
  const preferredAssignment = preferredTeacher?.assignments.find(item =>
    isClassAccessAssignment(item) && hasStudents(data.students, item.className, item.sectionName)
  ) ?? preferredTeacher?.assignments.find(item => hasStudents(data.students, item.className, item.sectionName));

  if (preferredAssignment) {
    return {
      className: preferredAssignment.className,
      sectionName: preferredAssignment.sectionName,
      teacher: preferredTeacher,
    };
  }

  for (const teacher of data.teachers) {
    const assignment = teacher.assignments.find(item =>
      isClassAccessAssignment(item) && hasStudents(data.students, item.className, item.sectionName)
    ) ?? teacher.assignments.find(item => hasStudents(data.students, item.className, item.sectionName));
    if (assignment) {
      return {
        className: assignment.className,
        sectionName: assignment.sectionName,
        teacher,
      };
    }
  }

  const timetableHasStudents = hasStudents(data.students, data.timetable.className, data.timetable.section);
  if (timetableHasStudents) {
    return {
      className: data.timetable.className,
      sectionName: data.timetable.section,
      teacher: preferredTeacher,
    };
  }

  const firstStudent = uniqueStudents(data.students)[0];
  if (firstStudent) {
    return {
      className: firstStudent.class_name,
      sectionName: firstStudent.section_name,
      teacher: preferredTeacher,
    };
  }

  return {
    className: DEFAULT_TEACHER_CLASS.className,
    sectionName: DEFAULT_TEACHER_CLASS.sectionName,
    teacher: preferredTeacher,
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
