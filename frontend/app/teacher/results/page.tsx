'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/src/next-link';
import { useBackendBootstrap } from '@/lib/backendData';
import { safereachRealtime } from '@/lib/realtimeApi';
import { getCurrentTeacherAssignment, studentsForAssignment } from '@/lib/teacherAssignment';

export default function TeacherResultsPage() {
  const { data, loading, error } = useBackendBootstrap();
  const assignment = useMemo(() => getCurrentTeacherAssignment(data), [data]);
  const assignedClass = `${assignment.className}-${assignment.sectionName}`;
  const students = useMemo(() => studentsForAssignment(data.students, assignment.className, assignment.sectionName), [assignment.className, assignment.sectionName, data.students]);
  const exams = useMemo(() => data.academicResults.exams.filter(exam => exam.class_name === assignment.className && exam.section_name === assignment.sectionName && exam.active), [assignment.className, assignment.sectionName, data.academicResults.exams]);
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!studentId && students[0]) setStudentId(students[0].id);
  }, [studentId, students]);
  useEffect(() => {
    if (!examId && exams[0]) setExamId(exams[0].id);
  }, [examId, exams]);

  const components = useMemo(() => data.academicResults.components.filter(component => component.exam_id === examId), [data.academicResults.components, examId]);
  const subjects = useMemo(() => Array.from(new Set(components.map(component => component.subject))), [components]);
  const selectedStudent = students.find(student => student.id === studentId);
  const teacherActorId = assignment.teacher?.user_id;

  useEffect(() => {
    const existing = new Map(data.academicResults.marks.filter(mark => mark.student_id === studentId).map(mark => [mark.result_component_id, String(mark.marks_obtained)]));
    setMarks(Object.fromEntries(components.map(component => [component.id, existing.get(component.id) ?? ''])));
  }, [studentId, components, data.academicResults.marks]);

  async function saveMarks() {
    if (!studentId || !examId) return;
    const incomplete = components.some(component => marks[component.id] === '' || Number.isNaN(Number(marks[component.id])));
    if (incomplete) { setNotice('Enter a valid mark for every configured assessment component.'); return; }
    setSaving(true);
    try {
      await safereachRealtime.request('academic-results.marks.save', {
        studentId,
        examId,
        actorUserId: teacherActorId,
        marks: components.map(component => ({ componentId: component.id, marksObtained: Number(marks[component.id]) })),
      });
      setNotice(`Results saved for ${selectedStudent?.full_name ?? 'the selected student'}.`);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Could not save student results.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-on-surface-variant">Loading stored results...</div>;
  if (error) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-error">Stored result data is unavailable: {error}</div>;

  return <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-5">
    <section className="rounded-xl border border-outline-variant bg-surface p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><h1 className="text-headline-lg font-bold text-primary">Student Results</h1><p className="text-on-surface-variant">Enter and update marks only for your assigned {assignedClass} students.</p></div>
        <Link href="/teacher/results/edit" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 font-bold text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">edit_note</span>Edit Results</Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-label-md font-bold text-on-surface">Student
          <select value={studentId} onChange={event => setStudentId(event.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">
            {students.map(student => <option key={student.id} value={student.id}>{student.full_name} ({student.student_code})</option>)}
          </select>
        </label>
        <label className="text-label-md font-bold text-on-surface">Exam
          <select value={examId} onChange={event => setExamId(event.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">
            {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
        </label>
      </div>
    </section>

    {components.length === 0 ? <div className="rounded-xl border border-outline-variant bg-surface p-6 text-on-surface-variant">No mark format is configured for this class yet. Ask the school administrator to configure the exam.</div> : <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-primary text-on-primary"><tr><th className="px-4 py-3">Subject</th>{Array.from(new Set(components.map(component => component.label))).map(label => <th key={label} className="px-4 py-3 text-center">{label}</th>)}<th className="px-4 py-3 text-center">Total</th></tr></thead><tbody>
        {subjects.map(subject => {
          const subjectComponents = components.filter(component => component.subject === subject).sort((a, b) => a.sort_order - b.sort_order);
          const total = subjectComponents.reduce((sum, component) => sum + (Number(marks[component.id]) || 0), 0);
          const maximum = subjectComponents.reduce((sum, component) => sum + Number(component.maximum_marks), 0);
          return <tr key={subject} className="border-t border-outline-variant"><td className="px-4 py-3 font-bold">{subject}</td>{Array.from(new Set(components.map(component => component.label))).map(label => { const component = subjectComponents.find(item => item.label === label); return <td key={label} className="px-4 py-3 text-center">{component ? <label className="inline-flex items-center gap-1"><input type="number" min="0" max={Number(component.maximum_marks)} value={marks[component.id] ?? ''} onChange={event => setMarks(current => ({ ...current, [component.id]: event.target.value }))} className="w-20 rounded-md border border-outline-variant bg-surface-container px-2 py-1.5 text-center" /><span className="text-xs text-on-surface-variant">/{Number(component.maximum_marks)}</span></label> : '—'}</td>; })}<td className="px-4 py-3 text-center font-bold text-primary">{total}/{maximum}</td></tr>;
        })}
      </tbody></table></div>
      <div className="flex flex-col gap-3 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-label-md text-on-surface-variant">Totals are calculated automatically from the saved component marks.</p><button onClick={saveMarks} disabled={saving || !studentId || !examId} className="rounded-lg bg-primary px-5 py-2.5 font-bold text-on-primary disabled:opacity-50">{saving ? 'Saving...' : 'Submit Results'}</button></div>
    </section>}
    {notice && <p className="rounded-lg bg-secondary-container/30 px-4 py-3 font-label-md text-on-surface">{notice}</p>}
  </div>;
}
