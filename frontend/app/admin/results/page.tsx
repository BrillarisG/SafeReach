'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBackendBootstrap } from '@/lib/backendData';
import { safereachRealtime } from '@/lib/realtimeApi';
import { apiBaseUrl } from '@/lib/runtimeConfig';

type DraftComponent = { subject: string; label: string; maximumMarks: string };

export default function AdminResultsPage() {
  const { data, loading, error } = useBackendBootstrap();
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [examId, setExamId] = useState('');
  const [examName, setExamName] = useState('Quarterly');
  const [components, setComponents] = useState<DraftComponent[]>([]);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const currentClass = data.classes.find(item => item.id === classId) ?? data.classes[0];
  const availableSections = currentClass?.sections ?? [];
  const currentExams = useMemo(() => data.academicResults.exams.filter(exam => exam.class_id === classId && exam.section_id === sectionId), [data.academicResults.exams, classId, sectionId]);
  const timetableSubjects = useMemo(() => Array.from(new Set(data.timetable.days.flatMap(day => day.periods))).filter(subject => subject && subject !== '-'), [data.timetable.days]);

  useEffect(() => { if (!classId && data.classes[0]) setClassId(data.classes[0].id); }, [classId, data.classes]);
  useEffect(() => { if (availableSections[0] && !availableSections.some(section => section.id === sectionId)) setSectionId(availableSections[0].id); }, [availableSections, sectionId]);
  useEffect(() => { if (!currentExams.some(exam => exam.id === examId)) setExamId(currentExams[0]?.id ?? ''); }, [examId, currentExams]);
  useEffect(() => {
    const chosen = currentExams.find(exam => exam.id === examId);
    if (chosen) {
      setExamName(chosen.name);
      setComponents(data.academicResults.components.filter(component => component.exam_id === chosen.id).map(component => ({ subject: component.subject, label: component.label, maximumMarks: String(component.maximum_marks) })));
    } else if (!components.length && timetableSubjects.length) {
      setComponents(timetableSubjects.flatMap(subject => [{ subject, label: 'Internal 1', maximumMarks: '25' }, { subject, label: 'Internal 2', maximumMarks: '25' }, { subject, label: 'Exam', maximumMarks: '50' }]));
    }
  }, [examId, currentExams, data.academicResults.components, timetableSubjects]);

  async function save() {
    if (!classId || !sectionId) return;
    setSaving(true);
    const payload = { examId: examId || undefined, classId, sectionId, name: examName, components };
    try {
      await saveExamPayload(payload);
      window.dispatchEvent(new Event('safereach-results-updated'));
      setNotice('Result format saved. Teachers can now enter marks for this class exam.');
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Could not save the result format.'); } finally { setSaving(false); }
  }
  function updateComponent(index: number, key: keyof DraftComponent, value: string) { setComponents(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)); }
  if (loading) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-on-surface-variant">Loading result configuration...</div>;
  if (error) return <div className="p-container-padding-mobile md:p-container-padding-desktop text-error">Stored result configuration is unavailable: {error}</div>;
  return <div className="p-container-padding-mobile md:p-container-padding-desktop space-y-5">
    <section className="rounded-xl border border-outline-variant bg-surface p-4 shadow-sm md:p-6"><h1 className="text-headline-lg font-bold text-primary">Result Analysis and Setup</h1><p className="mt-1 text-on-surface-variant">School administrators define exams, subjects, and mark limits. Teacher totals are calculated from this format.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><label className="font-bold">Class<select value={classId} onChange={event => { setClassId(event.target.value); setSectionId(''); setExamId(''); setComponents([]); }} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">{data.classes.map(item => <option value={item.id} key={item.id}>{item.class_name}</option>)}</select></label><label className="font-bold">Section<select value={sectionId} onChange={event => { setSectionId(event.target.value); setExamId(''); setComponents([]); }} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal">{availableSections.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="font-bold">Existing Exam<select value={examId} onChange={event => setExamId(event.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal"><option value="">Create new exam</option>{currentExams.map(exam => <option value={exam.id} key={exam.id}>{exam.name}</option>)}</select></label></div></section>
    <section className="rounded-xl border border-outline-variant bg-surface p-4 shadow-sm md:p-6"><div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><label className="block min-w-[220px] font-bold">Exam name<input value={examName} onChange={event => setExamName(event.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-normal" placeholder="Quarterly" /></label><button onClick={() => setComponents(items => [...items, { subject: timetableSubjects[0] ?? 'Subject', label: 'Internal', maximumMarks: '25' }])} className="rounded-lg border border-primary px-4 py-2.5 font-bold text-primary">Add Mark Field</button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px]"><thead className="bg-surface-container-low text-left"><tr><th className="p-3">Subject</th><th className="p-3">Field</th><th className="p-3">Maximum Mark</th><th className="p-3"></th></tr></thead><tbody>{components.map((component, index) => <tr key={`${component.subject}-${component.label}-${index}`} className="border-t border-outline-variant"><td className="p-3"><select value={component.subject} onChange={event => updateComponent(index, 'subject', event.target.value)} className="w-full rounded-md border border-outline-variant bg-surface-container px-2 py-2">{(timetableSubjects.length ? timetableSubjects : [component.subject]).map(subject => <option key={subject}>{subject}</option>)}</select></td><td className="p-3"><input value={component.label} onChange={event => updateComponent(index, 'label', event.target.value)} className="w-full rounded-md border border-outline-variant bg-surface-container px-2 py-2" /></td><td className="p-3"><input type="number" min="1" value={component.maximumMarks} onChange={event => updateComponent(index, 'maximumMarks', event.target.value)} className="w-28 rounded-md border border-outline-variant bg-surface-container px-2 py-2" /></td><td className="p-3 text-right"><button onClick={() => setComponents(items => items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md p-2 text-error" title="Remove field"><span className="material-symbols-outlined">delete</span></button></td></tr>)}</tbody></table></div><div className="mt-5 flex justify-end"><button onClick={save} disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 font-bold text-on-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Result Format'}</button></div></section>
    {notice && <p className="rounded-lg bg-secondary-container/30 px-4 py-3 font-label-md">{notice}</p>}
  </div>;
}

async function saveExamPayload(payload: {
  examId?: string;
  classId: string;
  sectionId: string;
  name: string;
  components: DraftComponent[];
}) {
  try {
    return await safereachRealtime.request('academic-results.exam.save', payload);
  } catch {
    const response = await fetch(`${apiBaseUrl}/academic-results/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message ?? 'Could not save the result format.');
    return body;
  }
}
