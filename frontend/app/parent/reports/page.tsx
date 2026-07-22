'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBackendBootstrap } from '@/lib/backendData';

export default function ParentReportsPage() {
  const { data, loading, error } = useBackendBootstrap();
  const parentChildren = useMemo(() => data.students.filter(student => student.guardian_name === 'Sarah Thompson'), [data.students]);
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');
  const [showReport, setShowReport] = useState(false);
  useEffect(() => { if (!studentId && parentChildren[0]) setStudentId(parentChildren[0].id); }, [studentId, parentChildren]);
  const student = parentChildren.find(item => item.id === studentId);
  const exams = useMemo(() => data.academicResults.exams.filter(exam => exam.class_name === student?.class_name && exam.section_name === student?.section_name && exam.active), [data.academicResults.exams, student]);
  useEffect(() => { if (!exams.some(exam => exam.id === examId)) setExamId(exams[0]?.id ?? ''); }, [examId, exams]);
  const components = useMemo(() => data.academicResults.components.filter(component => component.exam_id === examId), [data.academicResults.components, examId]);
  const subjects = useMemo(() => Array.from(new Set(components.map(component => component.subject))).map(subject => {
    const rows = components.filter(component => component.subject === subject);
    const total = rows.reduce((sum, component) => sum + Number(component.maximum_marks), 0);
    const achieved = rows.reduce((sum, component) => sum + Number(data.academicResults.marks.find(mark => mark.student_id === studentId && mark.result_component_id === component.id)?.marks_obtained ?? 0), 0);
    return { subject, total, achieved, rows };
  }), [components, data.academicResults.marks, studentId]);
  const total = subjects.reduce((sum, item) => sum + item.total, 0);
  const achieved = subjects.reduce((sum, item) => sum + item.achieved, 0);
  const exam = exams.find(item => item.id === examId);
  if (loading) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-on-surface-variant">Loading stored results...</div>;
  if (error) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-error">Stored result data is unavailable: {error}</div>;
  return <div className="space-y-5 px-container-padding-mobile py-stack-lg md:px-container-padding-desktop">
    <section className="rounded-xl border border-outline-variant bg-surface p-4 shadow-sm"><h1 className="text-headline-lg font-bold text-primary">Results</h1><div className="mt-4 grid gap-3 md:grid-cols-3"><label className="font-bold">Child<select value={studentId} onChange={event => { setStudentId(event.target.value); setExamId(''); setShowReport(false); }} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">{parentChildren.map(child => <option value={child.id} key={child.id}>{child.full_name} - {child.class_name} {child.section_name}</option>)}</select></label><label className="font-bold">Current Class<input readOnly value={student ? `${student.class_name} - Section ${student.section_name}` : ''} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal" /></label><label className="font-bold">Exam<div className="mt-1 flex gap-2"><select value={examId} onChange={event => { setExamId(event.target.value); setShowReport(false); }} className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">{exams.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button onClick={() => setShowReport(true)} className="rounded-lg bg-primary px-4 font-bold text-on-primary">View</button></div></label></div></section>
    {showReport && exam ? <><section className="rounded-xl bg-primary p-5 text-on-primary shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-headline-md font-bold">{exam.name} Results</h2><p className="text-on-primary/80">{student?.full_name}</p></div><div className="text-right"><p className="text-2xl font-bold">{achieved}/{total}</p><p className="text-on-primary/80">{total ? Math.round((achieved / total) * 100) : 0}% overall</p></div></div></section><section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[620px]"><thead className="bg-surface-container-low"><tr><th className="p-3 text-left">Subject</th>{Array.from(new Set(components.map(component => component.label))).map(label => <th className="p-3 text-center" key={label}>{label}</th>)}<th className="p-3 text-center">Total</th></tr></thead><tbody>{subjects.map(item => <tr key={item.subject} className="border-t border-outline-variant"><td className="p-3 font-bold">{item.subject}</td>{Array.from(new Set(components.map(component => component.label))).map(label => { const row = item.rows.find(component => component.label === label); const mark = row ? data.academicResults.marks.find(value => value.student_id === studentId && value.result_component_id === row.id)?.marks_obtained : null; return <td className="p-3 text-center" key={label}>{row ? `${mark ?? '—'}/${Number(row.maximum_marks)}` : '—'}</td>; })}<td className="p-3 text-center font-bold text-primary">{item.achieved}/{item.total}</td></tr>)}</tbody></table></div></section></> : <div className="rounded-xl border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">Choose a child and exam, then select View to display stored marks.</div>}
  </div>;
}
