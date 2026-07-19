'use client';

import Link from '@/src/next-link';
import { useMemo, useState } from 'react';
import { useBackendBootstrap } from '@/lib/backendData';
import LoadingRing from '@/components/LoadingRing';

export default function AdminDashboardPage() {
  const { data, loading, error } = useBackendBootstrap();
  const [assignmentNotice, setAssignmentNotice] = useState('');
  const [inchargeAssignments, setInchargeAssignments] = useState<Record<string, { primary: string; assistant: string }>>({});
  const stats = useMemo(() => {
    const present = data.attendance.filter(item => item.status === 'present').length;
    const absent = data.attendance.filter(item => item.status === 'absent').length;
    return {
      students: data.students.length,
      present,
      pendingReviews: data.incidents.filter(item => item.status === 'pending').length,
      alerts: data.incidents.filter(item => ['critical', 'high'].includes(item.level.toLowerCase())).length,
      absent,
    };
  }, [data]);

  const classAssignmentRows = useMemo(() => data.classes.flatMap(item => item.sections.map(section => {
    const key = `${item.class_name}|${section.name}`;
    const storedPrimary = data.teachers.find(teacher => teacher.assignments?.some(assignment => assignment.className === item.class_name && assignment.sectionName === section.name && assignment.assignmentType.toLowerCase().includes('primary')));
    const storedAssistant = data.teachers.find(teacher => teacher.assignments?.some(assignment => assignment.className === item.class_name && assignment.sectionName === section.name && assignment.assignmentType.toLowerCase().includes('assistant')));
    const selected = inchargeAssignments[key] ?? { primary: storedPrimary?.id ?? '', assistant: storedAssistant?.id ?? '' };
    return { key, className: item.class_name, sectionName: section.name, primary: selected.primary, assistant: selected.assistant };
  })), [data.classes, data.teachers, inchargeAssignments]);
  const assignedTeacherIds = classAssignmentRows.flatMap(row => [row.primary, row.assistant]).filter(Boolean);
  const hasDuplicateTeacher = new Set(assignedTeacherIds).size !== assignedTeacherIds.length;
  const allClassesCovered = classAssignmentRows.length > 0 && classAssignmentRows.every(row => row.primary && row.assistant && row.primary !== row.assistant);
  const canSaveAssignments = allClassesCovered && !hasDuplicateTeacher;

  function updateAssignment(key: string, field: 'primary' | 'assistant', value: string) {
    setInchargeAssignments(current => ({
      ...current,
      [key]: {
        primary: current[key]?.primary ?? classAssignmentRows.find(row => row.key === key)?.primary ?? '',
        assistant: current[key]?.assistant ?? classAssignmentRows.find(row => row.key === key)?.assistant ?? '',
        [field]: value,
      },
    }));
    setAssignmentNotice('');
  }

  return (
    <div className="p-container-padding-mobile md:p-container-padding-desktop">
      {loading && <LoadingRing size="lg" />}
      {error && <div className="rounded-xl bg-error-container border border-error/20 p-stack-md text-error font-bold">Backend data unavailable: {error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-stack-lg">
        {[
          { label: 'Stored Students', value: String(stats.students), icon: 'groups', c: 'text-primary', bg: 'bg-primary-fixed' },
          { label: 'Present Today', value: String(stats.present), icon: 'task_alt', c: 'text-green-700', bg: 'bg-green-100' },
          { label: 'Pending Reviews', value: String(stats.pendingReviews), icon: 'pending_actions', c: 'text-secondary', bg: 'bg-secondary-container' },
          { label: 'Active Alerts', value: String(stats.alerts), icon: 'emergency_home', c: 'text-error', bg: 'bg-error-container border-l-4 border-error' },
        ].map(card => (
          <div key={card.label} className={`bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 ${card.bg.includes('border') ? card.bg : ''}`}>
            <div className={`w-10 h-10 rounded-full ${card.bg.includes('border') ? 'bg-error-container' : card.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${card.c}`}>{card.icon}</span>
            </div>
            <div><p className="text-label-md text-on-surface-variant">{card.label}</p><p className={`text-headline-md font-bold ${card.c}`}>{card.value}</p></div>
          </div>
        ))}
      </div>

      <section className="mx-auto w-full max-w-5xl bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-stack-md">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-headline-md text-on-surface">Class Records</h3>
            <Link href="/admin/students/edit-class?mode=new" title="Add class" aria-label="Add class" className="group relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm transition hover:bg-primary-container focus-visible:z-50">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Add Class</span>
            </Link>
          </div>
          <div className="class-record-grid grid grid-cols-1 justify-items-center sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.classes.map(item => {
              const classStudents = data.students.filter(student => student.class_name === item.class_name);
              const studentCount = classStudents.length;
              const presentCount = classStudents.filter(student => student.attendance_status === 'present').length;
              const safetyPercent = studentCount ? Math.round((presentCount / studentCount) * 100) : 0;
              const section = item.sections[0]?.name ?? '';
              return (
                <div
                  key={item.id}
                  className="class-record-card class-record-font relative w-full max-w-[180px] rounded-[22px] border border-outline-variant/70 bg-surface-container-low px-5 py-4 shadow-[3px_4px_0_rgba(25,28,30,0.18)] hover:border-primary hover:bg-primary/5"
                >
                  <Link href={`/admin/students/class-view?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(section)}`} className="block rounded-[18px] pr-7" aria-label={`Open ${item.class_name} Section ${section}`}>
                    <p className="text-[24px] leading-none font-extrabold text-on-surface">{item.class_name}</p>
                    <p className="mt-1 text-[16px] leading-none font-bold text-outline">Section {section || '-'}</p>
                    <p className="mt-5 text-[16px] leading-none font-extrabold text-primary-container">Students: {String(studentCount).padStart(2, '0')}</p>
                    <p className="mt-2 text-[16px] leading-none font-extrabold text-green-700">SafeReach: {safetyPercent}%</p>
                  </Link>
                  <Link href={`/admin/students/edit-class?class=${encodeURIComponent(item.class_name)}&section=${encodeURIComponent(section)}&mode=edit`} title="Edit class" aria-label={`Edit ${item.class_name} Section ${section}`} className="group absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-outline-variant/50 transition hover:bg-primary hover:text-on-primary focus-visible:z-50">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Edit Class</span>
                  </Link>
                </div>
              );
            })}
            {data.classes.length === 0 && <div className="rounded-xl border border-dashed border-outline-variant p-6 text-on-surface-variant">No class records found.</div>}
          </div>
      </section>

      <section className="mx-auto mt-stack-lg w-full max-w-5xl rounded-xl bg-white p-stack-md shadow-[0px_4px_12px_rgba(0,0,0,0.12)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-headline-md text-on-surface">Class Incharge Assignment</h3>
          <button
            type="button"
            disabled={!canSaveAssignments}
            onClick={() => setAssignmentNotice('Class incharge assignments prepared for backend save. Each teacher is assigned to one incharge role only.')}
            title="Save class assignments"
            aria-label="Save class assignments"
            className="group relative z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary disabled:bg-surface-container-high disabled:text-on-surface-variant focus-visible:z-50"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span role="tooltip" className="safe-tooltip pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-outline-variant bg-white px-2 py-1 text-xs font-bold text-on-surface shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Save Assignments</span>
          </button>
        </div>
        {assignmentNotice && <p className="mb-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-label-md font-bold text-primary">{assignmentNotice}</p>}
        {!canSaveAssignments && (
          <p className="mb-3 rounded-lg border border-tertiary/20 bg-tertiary/5 px-4 py-3 text-label-md font-bold text-tertiary">
            Select one primary and one assistant incharge for every class. A staff member cannot be assigned to more than one incharge role.
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border border-outline-variant/40">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-surface-container">
              <tr>{['S No', 'Class', 'Section', 'Primary Incharge', 'Assistant Incharge'].map(header => <th key={header} className="px-4 py-3 text-label-md text-on-surface-variant">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {classAssignmentRows.map((row, index) => (
                <tr key={row.key}>
                  <td className="px-4 py-3 font-bold text-primary">{String(index + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3 font-bold">{row.className}</td>
                  <td className="px-4 py-3">{row.sectionName}</td>
                  <td className="px-4 py-3">
                    <select value={row.primary} onChange={event => updateAssignment(row.key, 'primary', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2">
                      <option value="">Select teacher</option>
                      {data.teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={row.assistant} onChange={event => updateAssignment(row.key, 'assistant', event.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2">
                      <option value="">Select teacher</option>
                      {data.teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {classAssignmentRows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No stored classes are available for incharge assignment.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
